#!/usr/bin/env node

/**
 * 公式リポジトリとの同期スクリプト
 * 定期的に公式リポジトリの最新変更を取得し、独自機能を保護しながら統合する
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 設定
const CONFIG = {
  upstreamRemote: 'upstream',
  upstreamBranch: 'main',
  localBranch: 'main',
  backupBranch: 'backup-before-sync',
  logFile: '_docs/sync-logs.md',
  protectedFiles: [
    '_docs/',
    'scripts/sync-upstream.js',
    'package.json',
    'README.md'
  ]
};

/**
 * ログを記録する
 */
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}\n`;
  
  console.log(logEntry.trim());
  
  // ログファイルに記録
  const logDir = path.dirname(CONFIG.logFile);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  fs.appendFileSync(CONFIG.logFile, logEntry);
}

/**
 * Gitコマンドを実行する
 */
function runGitCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      ...options
    });
    return result.trim();
  } catch (error) {
    log(`Git command failed: ${command}`, 'ERROR');
    log(`Error: ${error.message}`, 'ERROR');
    throw error;
  }
}

/**
 * 現在のブランチを取得する
 */
function getCurrentBranch() {
  return runGitCommand('git branch --show-current');
}

/**
 * 変更があるかどうかをチェックする
 */
function hasChanges() {
  try {
    runGitCommand('git diff-index --quiet HEAD --');
    return false;
  } catch {
    return true;
  }
}

/**
 * バックアップブランチを作成する
 */
function createBackupBranch() {
  const currentBranch = getCurrentBranch();
  const backupBranchName = `${CONFIG.backupBranch}-${Date.now()}`;
  
  log(`Creating backup branch: ${backupBranchName}`);
  runGitCommand(`git checkout -b ${backupBranchName}`);
  runGitCommand(`git checkout ${currentBranch}`);
  
  return backupBranchName;
}

/**
 * 公式リポジトリの最新変更を取得する
 */
function fetchUpstream() {
  log('Fetching latest changes from upstream...');
  runGitCommand(`git fetch ${CONFIG.upstreamRemote}`);
}

/**
 * 変更の差分を確認する
 */
function checkUpstreamChanges() {
  const localCommit = runGitCommand(`git rev-parse ${CONFIG.localBranch}`);
  const upstreamCommit = runGitCommand(`git rev-parse ${CONFIG.upstreamRemote}/${CONFIG.upstreamBranch}`);
  
  log(`Local commit: ${localCommit.substring(0, 8)}`);
  log(`Upstream commit: ${upstreamCommit.substring(0, 8)}`);
  
  if (localCommit === upstreamCommit) {
    log('No new changes from upstream');
    return false;
  }
  
  return true;
}

/**
 * マージコンフリクトを解決する
 */
function resolveConflicts() {
  const status = runGitCommand('git status --porcelain');
  
  if (status.includes('UU') || status.includes('AA') || status.includes('DD')) {
    log('Merge conflicts detected, attempting to resolve...', 'WARN');
    
    // 保護されたファイルのコンフリクトを優先的に解決
    for (const protectedFile of CONFIG.protectedFiles) {
      if (status.includes(protectedFile)) {
        log(`Resolving conflict in protected file: ${protectedFile}`);
        try {
          runGitCommand(`git checkout --ours "${protectedFile}"`);
          runGitCommand(`git add "${protectedFile}"`);
        } catch (error) {
          log(`Failed to resolve conflict in ${protectedFile}: ${error.message}`, 'ERROR');
        }
      }
    }
    
    // 残りのコンフリクトを確認
    const remainingConflicts = runGitCommand('git status --porcelain');
    if (remainingConflicts.includes('UU') || remainingConflicts.includes('AA') || remainingConflicts.includes('DD')) {
      log('Manual conflict resolution required', 'ERROR');
      throw new Error('Manual conflict resolution required');
    }
  }
}

/**
 * テストを実行する
 */
function runTests() {
  log('Running tests...');
  try {
    runGitCommand('npm run test:ci', { stdio: 'inherit' });
    log('Tests passed');
  } catch (error) {
    log('Tests failed', 'ERROR');
    throw error;
  }
}

/**
 * ビルドを実行する
 */
function runBuild() {
  log('Running build...');
  try {
    runGitCommand('npm run build', { stdio: 'inherit' });
    log('Build successful');
  } catch (error) {
    log('Build failed', 'ERROR');
    throw error;
  }
}

/**
 * 同期を実行する
 */
async function syncUpstream() {
  log('Starting upstream synchronization...');
  
  try {
    // 1. 現在の状態をチェック
    if (hasChanges()) {
      log('Uncommitted changes detected, creating backup branch...', 'WARN');
      createBackupBranch();
    }
    
    // 2. 公式リポジトリの最新変更を取得
    fetchUpstream();
    
    // 3. 変更があるかチェック
    if (!checkUpstreamChanges()) {
      log('No new changes to sync');
      return;
    }
    
    // 4. マージを実行
    log('Merging upstream changes...');
    runGitCommand(`git merge ${CONFIG.upstreamRemote}/${CONFIG.upstreamBranch} --no-edit`);
    
    // 5. コンフリクトを解決
    resolveConflicts();
    
    // 6. テストを実行
    runTests();
    
    // 7. ビルドを実行
    runBuild();
    
    // 8. 変更をコミット
    if (hasChanges()) {
      log('Committing sync changes...');
      runGitCommand('git add .');
      runGitCommand('git commit -m "feat: sync with upstream - auto-merge and conflict resolution"');
    }
    
    log('Upstream synchronization completed successfully');
    
  } catch (error) {
    log(`Synchronization failed: ${error.message}`, 'ERROR');
    
    // ロールバック
    log('Rolling back changes...', 'WARN');
    try {
      runGitCommand('git merge --abort');
    } catch (rollbackError) {
      log(`Rollback failed: ${rollbackError.message}`, 'ERROR');
    }
    
    throw error;
  }
}

/**
 * メイン実行関数
 */
async function main() {
  try {
    await syncUpstream();
    process.exit(0);
  } catch (error) {
    log(`Sync failed: ${error.message}`, 'ERROR');
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみ実行
if (require.main === module) {
  main();
}

module.exports = {
  syncUpstream,
  CONFIG
}; 