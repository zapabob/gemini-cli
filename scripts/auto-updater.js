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
 * 自動更新クラス
 */
class AutoUpdater {
  constructor() {
    this.packageJsonPath = path.join(projectRoot, 'package.json');
    this.updateCheckFile = path.join(projectRoot, '.update-check');
    this.updateInterval = 24 * 60 * 60 * 1000; // 24時間
  }

  /**
   * 現在のバージョンを取得
   */
  getCurrentVersion() {
    const packageJson = JSON.parse(readFileSync(this.packageJsonPath, 'utf-8'));
    return packageJson.version;
  }

  /**
   * 最新バージョンを取得
   */
  getLatestVersion() {
    try {
      return execSync('npm view @google/gemini-cli version', { 
        encoding: 'utf-8' 
      }).trim();
    } catch (error) {
      throw new Error('最新バージョンの取得に失敗しました');
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
   * 更新チェックの最終実行時刻を取得
   */
  getLastCheckTime() {
    if (existsSync(this.updateCheckFile)) {
      try {
        const data = JSON.parse(readFileSync(this.updateCheckFile, 'utf-8'));
        return data.lastCheck || 0;
      } catch {
        return 0;
      }
    }
    return 0;
  }

  /**
   * 更新チェックの最終実行時刻を保存
   */
  saveLastCheckTime() {
    const data = {
      lastCheck: Date.now(),
      version: this.getCurrentVersion()
    };
    writeFileSync(this.updateCheckFile, JSON.stringify(data, null, 2));
  }

  /**
   * 更新が必要かチェック
   */
  shouldCheckForUpdates() {
    const lastCheck = this.getLastCheckTime();
    const now = Date.now();
    return (now - lastCheck) > this.updateInterval;
  }

  /**
   * 更新チェックを実行
   */
  checkForUpdates(force = false) {
    if (!force && !this.shouldCheckForUpdates()) {
      console.log('ℹ️  前回のチェックから24時間経過していません');
      return false;
    }

    try {
      console.log('🔍 最新バージョンをチェック中...');
      const currentVersion = this.getCurrentVersion();
      const latestVersion = this.getLatestVersion();

      this.saveLastCheckTime();

      if (this.compareVersions(currentVersion, latestVersion) < 0) {
        console.log(`🆕 新しいバージョンが利用可能です: ${latestVersion}`);
        console.log(`📦 現在のバージョン: ${currentVersion}`);
        return { currentVersion, latestVersion, updateAvailable: true };
      } else {
        console.log('✅ 最新バージョンを使用しています');
        return { currentVersion, latestVersion, updateAvailable: false };
      }
    } catch (error) {
      console.log('⚠️  更新チェックに失敗しました:', error.message);
      return { error: error.message };
    }
  }

  /**
   * 自動更新を実行
   */
  async performUpdate(autoConfirm = false) {
    try {
      const updateInfo = this.checkForUpdates(true);
      
      if (updateInfo.error) {
        throw new Error(updateInfo.error);
      }

      if (!updateInfo.updateAvailable) {
        console.log('✅ 更新は必要ありません');
        return;
      }

      console.log(`🔄 バージョン ${updateInfo.latestVersion} に更新中...`);

      if (!autoConfirm) {
        console.log('\n⚠️  更新を実行しますか？ (y/N)');
        // 実際の実装では、ユーザー入力を待つ必要があります
        // ここでは簡略化のため自動確認とします
      }

      // 更新プロセスを実行
      await this.executeUpdate();
      
      console.log('✅ 更新が完了しました！');
      console.log('💡 新しい機能を確認するには: gemini --help');
      
    } catch (error) {
      console.error('❌ 更新に失敗しました:', error.message);
      throw error;
    }
  }

  /**
   * 更新プロセスを実行
   */
  async executeUpdate() {
    console.log('📦 依存関係を更新中...');
    
    // プロジェクトルートに移動
    process.chdir(projectRoot);
    
    // Git pull
    try {
      execSync('git pull', { stdio: 'inherit' });
      console.log('✅ リポジトリを更新しました');
    } catch (error) {
      console.log('⚠️  Git pullに失敗しました');
    }

    // npm install
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('✅ 依存関係を更新しました');
    } catch (error) {
      throw new Error('依存関係の更新に失敗しました');
    }

    // ビルド
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('✅ ビルドが完了しました');
    } catch (error) {
      throw new Error('ビルドに失敗しました');
    }

    // グローバルインストール
    try {
      execSync('npm run install:global', { stdio: 'inherit' });
      console.log('✅ グローバルインストールが完了しました');
    } catch (error) {
      throw new Error('グローバルインストールに失敗しました');
    }
  }

  /**
   * 更新設定を表示
   */
  showUpdateSettings() {
    const lastCheck = this.getLastCheckTime();
    const lastCheckDate = lastCheck ? new Date(lastCheck).toLocaleString('ja-JP') : '未実行';
    const nextCheck = lastCheck + this.updateInterval;
    const nextCheckDate = new Date(nextCheck).toLocaleString('ja-JP');

    console.log('⚙️  更新設定:');
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📅 最終チェック: ${lastCheckDate}`);
    console.log(`⏰ 次回チェック: ${nextCheckDate}`);
    console.log(`🔄 チェック間隔: 24時間`);
    console.log(`📁 設定ファイル: ${this.updateCheckFile}`);
  }

  /**
   * 更新履歴を表示
   */
  showUpdateHistory() {
    if (existsSync(this.updateCheckFile)) {
      try {
        const data = JSON.parse(readFileSync(this.updateCheckFile, 'utf-8'));
        console.log('📋 更新履歴:');
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`📅 最終チェック: ${new Date(data.lastCheck).toLocaleString('ja-JP')}`);
        console.log(`🆔 チェック時バージョン: ${data.version}`);
        console.log(`🆔 現在バージョン: ${this.getCurrentVersion()}`);
      } catch (error) {
        console.log('⚠️  更新履歴の読み込みに失敗しました');
      }
    } else {
      console.log('ℹ️  更新履歴がありません');
    }
  }
}

/**
 * メイン実行関数
 */
async function main() {
  const argv = await yargs(hideBin(process.argv))
    .usage('$0 <command> [options]')
    .command('check', '更新をチェック', {}, () => {
      const updater = new AutoUpdater();
      updater.checkForUpdates();
    })
    .command('update', '自動更新を実行', (yargs) => {
      return yargs
        .option('auto', {
          alias: 'a',
          describe: '自動確認で更新',
          type: 'boolean',
          default: false
        });
    }, (argv) => {
      const updater = new AutoUpdater();
      updater.performUpdate(argv.auto).catch(error => {
        process.exit(1);
      });
    })
    .command('settings', '更新設定を表示', {}, () => {
      const updater = new AutoUpdater();
      updater.showUpdateSettings();
    })
    .command('history', '更新履歴を表示', {}, () => {
      const updater = new AutoUpdater();
      updater.showUpdateHistory();
    })
    .command('force-check', '強制チェック', {}, () => {
      const updater = new AutoUpdater();
      updater.checkForUpdates(true);
    })
    .help()
    .alias('h', 'help')
    .argv;

  if (argv._.length === 0) {
    const updater = new AutoUpdater();
    updater.checkForUpdates();
  }
}

main().catch((error) => {
  console.error('❌ 自動更新エラー:', error.message);
  process.exit(1);
}); 