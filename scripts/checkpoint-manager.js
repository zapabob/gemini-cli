#!/usr/bin/env node

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 電源断保護機能付きチェックポイントマネージャー
 * RTX3080対応の高性能セッション管理システム
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class CheckpointManager {
  constructor() {
    this.checkpointDir = path.join(__dirname, '../.checkpoints');
    this.maxBackups = 10;
    this.autoSaveInterval = 5 * 60 * 1000; // 5分間隔
    this.sessionId = this.generateSessionId();
    this.autoSaveTimer = null;
    this.isShuttingDown = false;
    
    this.setupSignalHandlers();
    this.ensureCheckpointDir();
    this.loadPreviousSession();
  }

  /**
   * セッションID生成
   */
  generateSessionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `session_${timestamp}_${random}`;
  }

  /**
   * チェックポイントディレクトリの確保
   */
  ensureCheckpointDir() {
    if (!fs.existsSync(this.checkpointDir)) {
      fs.mkdirSync(this.checkpointDir, { recursive: true });
      console.log('✅ チェックポイントディレクトリを作成しました');
    }
  }

  /**
   * シグナルハンドラーの設定
   */
  setupSignalHandlers() {
    const signals = ['SIGINT', 'SIGTERM', 'SIGBREAK'];
    
    signals.forEach(signal => {
      process.on(signal, () => {
        console.log(`\n🛡️ ${signal}を受信しました。緊急保存を実行中...`);
        this.emergencySave();
        process.exit(0);
      });
    });

    // 未処理の例外ハンドラー
    process.on('uncaughtException', (error) => {
      console.error('🚨 未処理の例外が発生しました。緊急保存を実行中...', error);
      this.emergencySave();
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('🚨 未処理のPromise拒否が発生しました。緊急保存を実行中...', reason);
      this.emergencySave();
      process.exit(1);
    });
  }

  /**
   * 前回セッションからの復旧
   */
  loadPreviousSession() {
    try {
      const sessionFiles = fs.readdirSync(this.checkpointDir)
        .filter(file => file.endsWith('.json'))
        .sort()
        .reverse();

      if (sessionFiles.length > 0) {
        const latestSession = path.join(this.checkpointDir, sessionFiles[0]);
        const sessionData = JSON.parse(fs.readFileSync(latestSession, 'utf8'));
        
        console.log('🔄 前回セッションから復旧中...');
        console.log(`📅 セッション日時: ${new Date(sessionData.timestamp).toLocaleString('ja-JP')}`);
        console.log(`💾 保存データ数: ${Object.keys(sessionData.data).length}`);
        
        return sessionData.data;
      }
    } catch (error) {
      console.warn('⚠️ 前回セッションの読み込みに失敗しました:', error.message);
    }
    
    return {};
  }

  /**
   * 自動保存の開始
   */
  startAutoSave() {
    this.autoSaveTimer = setInterval(() => {
      if (!this.isShuttingDown) {
        this.saveCheckpoint('auto');
      }
    }, this.autoSaveInterval);
    
    console.log('⏰ 自動保存を開始しました（5分間隔）');
  }

  /**
   * 自動保存の停止
   */
  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
      console.log('⏹️ 自動保存を停止しました');
    }
  }

  /**
   * チェックポイント保存
   */
  saveCheckpoint(type = 'manual') {
    try {
      const checkpointData = {
        sessionId: this.sessionId,
        timestamp: Date.now(),
        type: type,
        data: this.getCurrentState()
      };

      const filename = `checkpoint_${this.sessionId}_${Date.now()}.json`;
      const filepath = path.join(this.checkpointDir, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(checkpointData, null, 2));
      
      // バックアップローテーション
      this.rotateBackups();
      
      console.log(`💾 チェックポイントを保存しました (${type}): ${filename}`);
      return filepath;
    } catch (error) {
      console.error('❌ チェックポイント保存に失敗しました:', error.message);
      return null;
    }
  }

  /**
   * 緊急保存
   */
  emergencySave() {
    this.isShuttingDown = true;
    this.stopAutoSave();
    
    const savedPath = this.saveCheckpoint('emergency');
    if (savedPath) {
      console.log('🛡️ 緊急保存が完了しました');
    } else {
      console.error('🚨 緊急保存に失敗しました');
    }
  }

  /**
   * バックアップローテーション
   */
  rotateBackups() {
    try {
      const files = fs.readdirSync(this.checkpointDir)
        .filter(file => file.endsWith('.json'))
        .map(file => ({
          name: file,
          path: path.join(this.checkpointDir, file),
          time: fs.statSync(path.join(this.checkpointDir, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);

      // 最大バックアップ数を超えた古いファイルを削除
      if (files.length > this.maxBackups) {
        const filesToDelete = files.slice(this.maxBackups);
        filesToDelete.forEach(file => {
          fs.unlinkSync(file.path);
          console.log(`🗑️ 古いバックアップを削除: ${file.name}`);
        });
      }
    } catch (error) {
      console.warn('⚠️ バックアップローテーションに失敗しました:', error.message);
    }
  }

  /**
   * 現在の状態を取得
   */
  getCurrentState() {
    return {
      timestamp: Date.now(),
      processId: process.pid,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      // プロジェクト固有の状態をここに追加
      projectState: {
        buildStatus: this.getBuildStatus(),
        testStatus: this.getTestStatus(),
        gitStatus: this.getGitStatus()
      }
    };
  }

  /**
   * ビルド状態の取得
   */
  getBuildStatus() {
    try {
      const packageJsonPath = path.join(__dirname, '../package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        return {
          version: packageJson.version,
          lastModified: fs.statSync(packageJsonPath).mtime
        };
      }
    } catch (error) {
      console.warn('⚠️ ビルド状態の取得に失敗:', error.message);
    }
    return null;
  }

  /**
   * テスト状態の取得
   */
  getTestStatus() {
    try {
      const testResultsPath = path.join(__dirname, '../test-results');
      if (fs.existsSync(testResultsPath)) {
        const files = fs.readdirSync(testResultsPath);
        return {
          resultFiles: files.length,
          lastTestRun: files.length > 0 ? fs.statSync(path.join(testResultsPath, files[0])).mtime : null
        };
      }
    } catch (error) {
      console.warn('⚠️ テスト状態の取得に失敗:', error.message);
    }
    return null;
  }

  /**
   * Git状態の取得
   */
  async getGitStatus() {
    try {
      const { execSync } = await import('child_process');
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
      const gitBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      
      return {
        branch: gitBranch,
        modifiedFiles: gitStatus.split('\n').filter(line => line.trim()).length,
        status: gitStatus
      };
    } catch (error) {
      console.warn('⚠️ Git状態の取得に失敗:', error.message);
    }
    return null;
  }

  /**
   * セッション情報の表示
   */
  showSessionInfo() {
    console.log('\n📊 セッション情報');
    console.log(`🆔 セッションID: ${this.sessionId}`);
    console.log(`⏰ 開始時刻: ${new Date().toLocaleString('ja-JP')}`);
    console.log(`💾 チェックポイントディレクトリ: ${this.checkpointDir}`);
    console.log(`🔄 自動保存間隔: ${this.autoSaveInterval / 1000}秒`);
    console.log(`📦 最大バックアップ数: ${this.maxBackups}`);
  }

  /**
   * クリーンアップ
   */
  cleanup() {
    this.stopAutoSave();
    this.saveCheckpoint('cleanup');
    console.log('🧹 セッションをクリーンアップしました');
  }
}

// メイン実行
if (import.meta.url === `file://${process.argv[1]}`) {
  const checkpointManager = new CheckpointManager();
  
  checkpointManager.showSessionInfo();
  checkpointManager.startAutoSave();
  
  // プロセス終了時のクリーンアップ
  process.on('exit', () => {
    checkpointManager.cleanup();
  });
  
  console.log('🚀 電源断保護機能付きチェックポイントマネージャーを起動しました');
}

export default CheckpointManager; 