#!/usr/bin/env node
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * バージョン管理クラス
 */
class VersionManager {
  constructor() {
    this.packageJsonPath = path.join(projectRoot, 'package.json');
    this.cliPackageJsonPath = path.join(projectRoot, 'packages/cli/package.json');
    this.corePackageJsonPath = path.join(projectRoot, 'packages/core/package.json');
  }

  /**
   * 現在のバージョンを取得
   */
  getCurrentVersion() {
    const packageJson = JSON.parse(readFileSync(this.packageJsonPath, 'utf-8'));
    return packageJson.version;
  }

  /**
   * セマンティックバージョニングでバージョンを更新
   */
  updateVersion(type) {
    const currentVersion = this.getCurrentVersion();
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    
    let newVersion;
    switch (type) {
      case 'major':
        newVersion = `${major + 1}.0.0`;
        break;
      case 'minor':
        newVersion = `${major}.${minor + 1}.0`;
        break;
      case 'patch':
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
      default:
        throw new Error(`無効なバージョンタイプ: ${type}`);
    }

    this.updateAllPackageVersions(newVersion);
    return newVersion;
  }

  /**
   * すべてのパッケージのバージョンを更新
   */
  updateAllPackageVersions(newVersion) {
    const packages = [
      this.packageJsonPath,
      this.cliPackageJsonPath,
      this.corePackageJsonPath
    ];

    packages.forEach(pkgPath => {
      if (existsSync(pkgPath)) {
        const packageJson = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        packageJson.version = newVersion;
        writeFileSync(pkgPath, JSON.stringify(packageJson, null, 2) + '\n');
        console.log(`✅ ${path.basename(path.dirname(pkgPath))}: ${newVersion}`);
      }
    });
  }

  /**
   * バージョン情報を表示
   */
  showVersionInfo() {
    const currentVersion = this.getCurrentVersion();
    const gitHash = this.getGitHash();
    const buildDate = new Date().toISOString();

    console.log('📦 バージョン情報:');
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🆔 バージョン: ${currentVersion}`);
    console.log(`🔗 Git Hash: ${gitHash}`);
    console.log(`📅 ビルド日時: ${buildDate}`);
    console.log(`📁 プロジェクトルート: ${projectRoot}`);
  }

  /**
   * Gitハッシュを取得
   */
  getGitHash() {
    try {
      return execSync('git rev-parse --short HEAD', { 
        cwd: projectRoot, 
        encoding: 'utf-8' 
      }).trim();
    } catch {
      return 'unknown';
    }
  }

  /**
   * バージョンチェック機能
   */
  checkForUpdates() {
    try {
      console.log('🔍 最新バージョンをチェック中...');
      const currentVersion = this.getCurrentVersion();
      
      // npmレジストリから最新バージョンを取得
      const latestVersion = execSync('npm view @google/gemini-cli version', { 
        encoding: 'utf-8' 
      }).trim();

      if (this.compareVersions(currentVersion, latestVersion) < 0) {
        console.log(`🆕 新しいバージョンが利用可能です: ${latestVersion}`);
        console.log(`📦 現在のバージョン: ${currentVersion}`);
        console.log('\n💡 更新方法:');
        console.log('  npm run install:global');
      } else {
        console.log('✅ 最新バージョンを使用しています');
      }
    } catch (error) {
      console.log('⚠️  バージョンチェックに失敗しました');
    }
  }

  /**
   * バージョン比較
   */
  compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      
      if (part1 < part2) return -1;
      if (part1 > part2) return 1;
    }
    
    return 0;
  }

  /**
   * バージョン履歴を生成
   */
  generateChangelog() {
    try {
      console.log('📝 バージョン履歴を生成中...');
      const changelog = execSync('git log --oneline --since="1 month ago"', { 
        cwd: projectRoot, 
        encoding: 'utf-8' 
      });

      const changelogPath = path.join(projectRoot, 'CHANGELOG.md');
      const currentVersion = this.getCurrentVersion();
      const date = new Date().toISOString().split('T')[0];

      const newChangelogEntry = `## [${currentVersion}] - ${date}

### 変更点
${changelog.split('\n').slice(0, 10).map(line => `- ${line}`).join('\n')}

---

`;

      // 既存のCHANGELOGに追加
      const existingChangelog = existsSync(changelogPath) 
        ? readFileSync(changelogPath, 'utf-8') 
        : '# Changelog\n\n';

      writeFileSync(changelogPath, newChangelogEntry + existingChangelog);
      console.log('✅ バージョン履歴を生成しました');
    } catch (error) {
      console.log('⚠️  バージョン履歴の生成に失敗しました');
    }
  }
}

/**
 * メイン実行関数
 */
async function main() {
  const argv = await yargs(hideBin(process.argv))
    .usage('$0 <command> [options]')
    .command('current', '現在のバージョンを表示', {}, () => {
      const vm = new VersionManager();
      vm.showVersionInfo();
    })
    .command('update <type>', 'バージョンを更新', (yargs) => {
      return yargs
        .positional('type', {
          describe: '更新タイプ',
          type: 'string',
          choices: ['major', 'minor', 'patch'],
          demandOption: true
        });
    }, (argv) => {
      const vm = new VersionManager();
      const newVersion = vm.updateVersion(argv.type);
      console.log(`✅ バージョンを更新しました: ${newVersion}`);
    })
    .command('check', '最新バージョンをチェック', {}, () => {
      const vm = new VersionManager();
      vm.checkForUpdates();
    })
    .command('changelog', 'バージョン履歴を生成', {}, () => {
      const vm = new VersionManager();
      vm.generateChangelog();
    })
    .help()
    .alias('h', 'help')
    .argv;

  if (argv._.length === 0) {
    const vm = new VersionManager();
    vm.showVersionInfo();
  }
}

main().catch((error) => {
  console.error('❌ バージョン管理エラー:', error.message);
  process.exit(1);
}); 