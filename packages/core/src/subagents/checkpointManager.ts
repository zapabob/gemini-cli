/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * チェックポイントデータ構造
 */
export interface CheckpointData {
  sessionId: string;
  taskId: string;
  timestamp: number;
  data: unknown;
  metadata: {
    version: string;
    checksum: string;
    backupCount: number;
  };
}

/**
 * セッション状態
 */
export interface SessionState {
  sessionId: string;
  status: 'active' | 'paused' | 'completed' | 'failed';
  startTime: number;
  lastActivity: number;
  participants: string[];
  taskProgress: number;
  data: unknown;
}

/**
 * チェックポイントマネージャー設定
 */
export interface CheckpointManagerConfig {
  checkpointDir: string;
  maxBackups: number;
  autoSaveInterval: number; // 秒
  enableCompression: boolean;
  enableEncryption: boolean;
  encryptionKey?: string;
  recoveryMode: 'auto' | 'manual' | 'disabled';
}

/**
 * リカバリー情報
 */
export interface RecoveryInfo {
  sessionId: string;
  lastCheckpoint: number;
  recoveryData: unknown;
  canRecover: boolean;
  estimatedRecoveryTime: number;
}

/**
 * 電源断保護機能付きチェックポイントマネージャー
 * 自動チェックポイント保存、緊急保存、バックアップローテーション、セッション管理を提供
 */
export class CheckpointManager {
  private config: CheckpointManagerConfig;
  private activeSessions: Map<string, SessionState> = new Map();
  private checkpointData: Map<string, CheckpointData> = new Map();
  private autoSaveTimer?: NodeJS.Timeout;
  private isShuttingDown = false;

  constructor(config: CheckpointManagerConfig) {
    this.config = config;
    this.setupSignalHandlers();
    this.initializeCheckpointDirectory();
  }

  /**
   * シグナルハンドラーの設定
   */
  private setupSignalHandlers(): void {
    // SIGINT (Ctrl+C)
    process.on('SIGINT', async () => {
      console.log('\n🛡️ SIGINT検出: 緊急チェックポイント保存を実行中...');
      await this.emergencySave();
      process.exit(0);
    });

    // SIGTERM
    process.on('SIGTERM', async () => {
      console.log('\n🛡️ SIGTERM検出: 緊急チェックポイント保存を実行中...');
      await this.emergencySave();
      process.exit(0);
    });

    // SIGBREAK (Windows)
    process.on('SIGBREAK', async () => {
      console.log('\n🛡️ SIGBREAK検出: 緊急チェックポイント保存を実行中...');
      await this.emergencySave();
      process.exit(0);
    });

    // 未処理の例外
    process.on('uncaughtException', async (error) => {
      console.error('\n🛡️ 未処理例外検出:', error);
      await this.emergencySave();
      process.exit(1);
    });

    // 未処理のPromise拒否
    process.on('unhandledRejection', async (reason, _promise) => {
      console.error('\n🛡️ 未処理Promise拒否検出:', reason);
      await this.emergencySave();
      process.exit(1);
    });

    // プロセス終了前
    process.on('beforeExit', async () => {
      if (!this.isShuttingDown) {
        console.log('\n🛡️ プロセス終了前: 最終チェックポイント保存を実行中...');
        await this.emergencySave();
      }
    });
  }

  /**
   * チェックポイントディレクトリの初期化
   */
  private async initializeCheckpointDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.config.checkpointDir, { recursive: true });
      console.log(`📁 チェックポイントディレクトリ初期化: ${this.config.checkpointDir}`);
    } catch (_error) {
      console.error(`❌ チェックポイントディレクトリ初期化エラー: ${_error}`);
    }
  }

  /**
   * セッション開始
   */
  async startSession(sessionId: string, initialData: unknown): Promise<void> {
    const sessionState: SessionState = {
      sessionId,
      status: 'active',
      startTime: Date.now(),
      lastActivity: Date.now(),
      participants: [],
      taskProgress: 0,
      data: initialData
    };

    this.activeSessions.set(sessionId, sessionState);
    
    // 初期チェックポイント保存
    await this.saveCheckpoint(sessionId, initialData);
    
    // 自動保存タイマー開始
    this.startAutoSave();
    
    console.log(`🔄 セッション開始: ${sessionId}`);
  }

  /**
   * セッション更新
   */
  async updateSession(sessionId: string, updates: Partial<SessionState>): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`セッションが見つかりません: ${sessionId}`);
    }

    // セッション状態を更新
    Object.assign(session, updates, { lastActivity: Date.now() });
    
    // 定期的なチェックポイント保存
    if (this.shouldSaveCheckpoint(session)) {
      await this.saveCheckpoint(sessionId, session.data);
    }
  }

  /**
   * セッション終了
   */
  async endSession(sessionId: string, finalData: unknown): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`セッションが見つかりません: ${sessionId}`);
    }

    // 最終チェックポイント保存
    await this.saveCheckpoint(sessionId, finalData, true);
    
    // セッション状態を完了に更新
    session.status = 'completed';
    session.data = finalData;
    
    // セッションを削除
    this.activeSessions.delete(sessionId);
    
    console.log(`🏁 セッション終了: ${sessionId}`);
  }

  /**
   * チェックポイント保存
   */
  async saveCheckpoint(sessionId: string, data: unknown, isFinal: boolean = false): Promise<void> {
    try {
      const timestamp = Date.now();
      const checksum = this.calculateChecksum(data);
      
      const checkpointData: CheckpointData = {
        sessionId,
        taskId: `${sessionId}_${timestamp}`,
        timestamp,
        data,
        metadata: {
          version: '1.0.0',
          checksum,
          backupCount: this.getBackupCount(sessionId)
        }
      };

      // メモリに保存
      this.checkpointData.set(checkpointData.taskId, checkpointData);
      
      // ファイルに保存
      await this.saveToFile(checkpointData);
      
      // バックアップローテーション
      await this.rotateBackups(sessionId);
      
      console.log(`💾 チェックポイント保存: ${checkpointData.taskId} (${isFinal ? '最終' : '定期'})`);
      
    } catch (_error) {
      console.error(`❌ チェックポイント保存エラー: ${_error}`);
      throw _error;
    }
  }

  /**
   * ファイルへの保存
   */
  private async saveToFile(checkpointData: CheckpointData): Promise<void> {
    const filename = `${checkpointData.taskId}.json`;
    const filepath = path.join(this.config.checkpointDir, filename);
    
    let dataToSave = JSON.stringify(checkpointData, null, 2);
    
    // 圧縮
    if (this.config.enableCompression) {
      dataToSave = await this.compressData(dataToSave);
    }
    
    // 暗号化
    if (this.config.enableEncryption && this.config.encryptionKey) {
      dataToSave = await this.encryptData(dataToSave, this.config.encryptionKey);
    }
    
    await fs.writeFile(filepath, dataToSave, 'utf8');
  }

  /**
   * チェックポイント復元
   */
  async restoreCheckpoint(taskId: string): Promise<unknown | null> {
    try {
      // メモリから復元を試行
      const memoryData = this.checkpointData.get(taskId);
      if (memoryData) {
        console.log(`🔄 メモリからチェックポイント復元: ${taskId}`);
        return memoryData.data;
      }
      
      // ファイルから復元を試行
      const fileData = await this.loadFromFile(taskId);
      if (fileData) {
        console.log(`🔄 ファイルからチェックポイント復元: ${taskId}`);
        return fileData;
      }
      
      console.warn(`⚠️ チェックポイントが見つかりません: ${taskId}`);
      return null;
      
    } catch (_error) {
      console.error(`❌ チェックポイント復元エラー: ${_error}`);
      return null;
    }
  }

  /**
   * ファイルからの読み込み
   */
  private async loadFromFile(taskId: string): Promise<unknown | null> {
    try {
      const filename = `${taskId}.json`;
      const filepath = path.join(this.config.checkpointDir, filename);
      
      let data = await fs.readFile(filepath, 'utf8');
      
      // 復号化
      if (this.config.enableEncryption && this.config.encryptionKey) {
        data = await this.decryptData(data, this.config.encryptionKey);
      }
      
      // 解凍
      if (this.config.enableCompression) {
        data = await this.decompressData(data);
      }
      
      const checkpointData: CheckpointData = JSON.parse(data);
      
      // チェックサム検証
      if (checkpointData.metadata.checksum !== this.calculateChecksum(checkpointData.data)) {
        throw new Error('チェックサム検証失敗');
      }
      
      return checkpointData.data;
      
    } catch (_error) {
      console.error(`❌ ファイル読み込みエラー: ${_error}`);
      return null;
    }
  }

  /**
   * リカバリー情報の取得
   */
  async getRecoveryInfo(sessionId: string): Promise<RecoveryInfo | null> {
    try {
      const checkpoints = await this.getSessionCheckpoints(sessionId);
      if (checkpoints.length === 0) {
        return null;
      }
      
      const lastCheckpoint = checkpoints[checkpoints.length - 1];
      const recoveryData = await this.restoreCheckpoint(lastCheckpoint.taskId);
      
      return {
        sessionId,
        lastCheckpoint: lastCheckpoint.timestamp,
        recoveryData,
        canRecover: recoveryData !== null,
        estimatedRecoveryTime: this.estimateRecoveryTime(checkpoints.length)
      };
      
    } catch (_error) {
      console.error(`❌ リカバリー情報取得エラー: ${_error}`);
      return null;
    }
  }

  /**
   * セッション復旧
   */
  async recoverSession(sessionId: string): Promise<boolean> {
    try {
      const recoveryInfo = await this.getRecoveryInfo(sessionId);
      if (!recoveryInfo || !recoveryInfo.canRecover) {
        return false;
      }
      
      // セッション状態を復元
      const sessionState: SessionState = {
        sessionId,
        status: 'active',
        startTime: recoveryInfo.lastCheckpoint,
        lastActivity: Date.now(),
        participants: [],
        taskProgress: 0,
        data: recoveryInfo.recoveryData
      };
      
      this.activeSessions.set(sessionId, sessionState);
      
      console.log(`🔄 セッション復旧完了: ${sessionId}`);
      return true;
      
    } catch (_error) {
      console.error(`❌ セッション復旧エラー: ${_error}`);
      return false;
    }
  }

  /**
   * 緊急保存
   */
  async emergencySave(): Promise<void> {
    console.log('🛡️ 緊急チェックポイント保存を開始...');
    
    this.isShuttingDown = true;
    
    try {
      // 全アクティブセッションの緊急保存
      const savePromises = Array.from(this.activeSessions.entries()).map(
        async ([sessionId, session]) => {
          try {
            await this.saveCheckpoint(sessionId, session.data, true);
          } catch (_error) {
            console.error(`❌ セッション ${sessionId} の緊急保存エラー: ${_error}`);
          }
        }
      );
      
      await Promise.allSettled(savePromises);
      
      console.log('🛡️ 緊急チェックポイント保存完了');
      
    } catch (_error) {
      console.error(`❌ 緊急保存エラー: ${_error}`);
    }
  }

  /**
   * 自動保存開始
   */
  private startAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    
    this.autoSaveTimer = setInterval(async () => {
      if (this.isShuttingDown) return;
      
      try {
        const savePromises = Array.from(this.activeSessions.entries()).map(
          async ([sessionId, session]) => {
            if (this.shouldSaveCheckpoint(session)) {
              await this.saveCheckpoint(sessionId, session.data);
            }
          }
        );
        
        await Promise.allSettled(savePromises);
        
      } catch (_error) {
        console.error(`❌ 自動保存エラー: ${_error}`);
      }
    }, this.config.autoSaveInterval * 1000);
  }

  /**
   * チェックポイント保存判定
   */
  private shouldSaveCheckpoint(session: SessionState): boolean {
    const timeSinceLastSave = Date.now() - session.lastActivity;
    return timeSinceLastSave >= this.config.autoSaveInterval * 1000;
  }

  /**
   * バックアップローテーション
   */
  private async rotateBackups(sessionId: string): Promise<void> {
    try {
      const checkpoints = await this.getSessionCheckpoints(sessionId);
      
      if (checkpoints.length > this.config.maxBackups) {
        const toDelete = checkpoints.slice(0, checkpoints.length - this.config.maxBackups);
        
        for (const checkpoint of toDelete) {
          await this.deleteCheckpoint(checkpoint.taskId);
        }
        
        console.log(`🗑️ バックアップローテーション: ${toDelete.length}個の古いチェックポイントを削除`);
      }
      
    } catch (_error) {
      console.error(`❌ バックアップローテーションエラー: ${_error}`);
    }
  }

  /**
   * セッションチェックポイント取得
   */
  private async getSessionCheckpoints(sessionId: string): Promise<CheckpointData[]> {
    try {
      const files = await fs.readdir(this.config.checkpointDir);
      const sessionFiles = files.filter(file => file.startsWith(sessionId));
      
      const checkpoints: CheckpointData[] = [];
      
      for (const file of sessionFiles) {
        try {
          const filepath = path.join(this.config.checkpointDir, file);
          const data = await fs.readFile(filepath, 'utf8');
          const checkpoint: CheckpointData = JSON.parse(data);
          checkpoints.push(checkpoint);
        } catch (_error) {
          console.warn(`⚠️ チェックポイントファイル読み込みエラー: ${file}`);
        }
      }
      
      return checkpoints.sort((a, b) => a.timestamp - b.timestamp);
      
    } catch (_error) {
      console.error(`❌ セッションチェックポイント取得エラー: ${_error}`);
      return [];
    }
  }

  /**
   * チェックポイント削除
   */
  private async deleteCheckpoint(taskId: string): Promise<void> {
    try {
      const filename = `${taskId}.json`;
      const filepath = path.join(this.config.checkpointDir, filename);
      await fs.unlink(filepath);
      
      // メモリからも削除
      this.checkpointData.delete(taskId);
      
    } catch (_error) {
      console.error(`❌ チェックポイント削除エラー: ${_error}`);
    }
  }

  /**
   * バックアップ数取得
   */
  private getBackupCount(sessionId: string): number {
    return Array.from(this.checkpointData.values())
      .filter(cp => cp.sessionId === sessionId).length;
  }

  /**
   * チェックサム計算
   */
  private calculateChecksum(data: unknown): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit整数に変換
    }
    return hash.toString(16);
  }

  /**
   * 復旧時間推定
   */
  private estimateRecoveryTime(checkpointCount: number): number {
    // チェックポイント数に基づいて復旧時間を推定（秒）
    return Math.min(checkpointCount * 2, 60);
  }

  /**
   * データ圧縮（簡易版）
   */
  private async compressData(data: string): Promise<string> {
    // 実際の実装ではzlib等を使用
    return data;
  }

  /**
   * データ解凍（簡易版）
   */
  private async decompressData(data: string): Promise<string> {
    // 実際の実装ではzlib等を使用
    return data;
  }

  /**
   * データ暗号化（簡易版）
   */
  private async encryptData(data: string, _key: string): Promise<string> {
    // 実際の実装ではcrypto等を使用
    return data;
  }

  /**
   * データ復号化（簡易版）
   */
  private async decryptData(data: string, _key: string): Promise<string> {
    // 実際の実装ではcrypto等を使用
    return data;
  }

  /**
   * クリーンアップ
   */
  async cleanup(): Promise<void> {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    
    await this.emergencySave();
    
    console.log('🧹 チェックポイントマネージャークリーンアップ完了');
  }
} 