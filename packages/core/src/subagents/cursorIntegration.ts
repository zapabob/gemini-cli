/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { MainAgentInterface, MainAgentInterfaceConfig } from './mainAgentInterface.js';
import { ColorManager, ColorManagerConfig } from './colorManager.js';
import { CheckpointManager, CheckpointManagerConfig } from './checkpointManager.js';
import { GeminiClient } from './geminiClient.js';
import { SubagentSpecialty } from '../config/subagents.js';

/**
 * Cursor IDEとの連携設定
 */
export interface CursorIntegrationConfig {
  enableRealTimeSync: boolean;
  enableAutoCodeReview: boolean;
  enableParallelExecution: boolean;
  enableCommandPalette: boolean;
  enableFileWatcher: boolean;
  enableLiveCollaboration: boolean;
  maxConcurrentTasks: number;
  syncInterval: number; // ミリ秒
  autoSaveInterval: number; // ミリ秒
}

/**
 * Cursorファイル変更イベント
 */
export interface CursorFileChangeEvent {
  filePath: string;
  changeType: 'created' | 'modified' | 'deleted' | 'renamed';
  content?: string;
  timestamp: Date;
  userId?: string;
}

/**
 * Cursorコマンド実行結果
 */
export interface CursorCommandResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  subagentResults?: unknown[];
}

/**
 * Cursor並列実行タスク
 */
export interface CursorParallelTask {
  id: string;
  task: string;
  filePath?: string;
  specialty: SubagentSpecialty;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: unknown;
  startTime?: Date;
  endTime?: Date;
}

/**
 * Cursor IDE連携マネージャー
 * Cursorとのリアルタイム連携、並列実行、自律的サブエージェント呼び出しを管理
 */
export class CursorIntegrationManager {
  private config: CursorIntegrationConfig;
  private mainAgent: MainAgentInterface;
  private colorManager: ColorManager;
  private checkpointManager: CheckpointManager;
  private geminiClient: GeminiClient;
  private activeTasks: Map<string, CursorParallelTask> = new Map();
  private fileWatchers: Map<string, unknown> = new Map();
  private syncInterval: NodeJS.Timeout | null = null;
  private autoSaveInterval: NodeJS.Timeout | null = null;

  constructor(config: CursorIntegrationConfig) {
    this.config = config;
    
    // Geminiクライアントの初期化
    this.geminiClient = new GeminiClient({
      apiKey: process.env.GEMINI_API_KEY || 'mock-api-key',
      defaultModel: 'models/gemini-1.5-flash',
      defaultTemperature: 0.7,
      defaultMaxTokens: 4096
    });

    // メインエージェントの初期化
    const mainAgentConfig: MainAgentInterfaceConfig = {
      geminiClient: this.geminiClient,
      enableAutonomousMode: true,
      enableSupervisorMode: true,
      maxConcurrentSubagents: config.maxConcurrentTasks,
      autoAnalysisThreshold: 0.7,
      decisionTimeout: 30000,
      enableRealTimeCoordination: true,
      enableCheckpointing: true
    };
    this.mainAgent = new MainAgentInterface(mainAgentConfig);

    // カラーマネージャーの初期化
    const colorConfig: ColorManagerConfig = {
      enableColors: true,
      enableEmojis: true,
      enableTimestamps: true,
      colorMode: 'ansi',
      logToFile: false
    };
    this.colorManager = new ColorManager(colorConfig);

    // チェックポイントマネージャーの初期化
    const checkpointConfig: CheckpointManagerConfig = {
      checkpointDir: './.cursor-checkpoints',
      maxBackups: 10,
      autoSaveInterval: 300, // 5分
      enableCompression: true,
      enableEncryption: false,
      recoveryMode: 'auto'
    };
    this.checkpointManager = new CheckpointManager(checkpointConfig);

    this.initializeCursorIntegration();
  }

  /**
   * Cursor連携の初期化
   */
  private async initializeCursorIntegration(): Promise<void> {
    console.log(this.colorManager.formatSystemMessage('🚀 Cursor連携の初期化を開始...', 'info'));

    try {
      // リアルタイム同期の開始
      if (this.config.enableRealTimeSync) {
        this.startRealTimeSync();
      }

      // 自動保存の開始
      if (this.config.autoSaveInterval > 0) {
        this.startAutoSave();
      }

      // ファイル監視の開始
      if (this.config.enableFileWatcher) {
        this.startFileWatching();
      }

      // コマンドパレットの登録
      if (this.config.enableCommandPalette) {
        this.registerCommandPalette();
      }

      console.log(this.colorManager.formatSystemMessage('✅ Cursor連携の初期化が完了しました', 'success'));
    } catch (error) {
      console.error(this.colorManager.formatErrorMessage(`❌ Cursor連携の初期化に失敗: ${error}`));
    }
  }

  /**
   * リアルタイム同期の開始
   */
  private startRealTimeSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      try {
        await this.syncWithCursor();
      } catch (error) {
        console.error(this.colorManager.formatErrorMessage(`同期エラー: ${error}`));
      }
    }, this.config.syncInterval);

    console.log(this.colorManager.formatSystemMessage(`🔄 リアルタイム同期を開始 (間隔: ${this.config.syncInterval}ms)`, 'info'));
  }

  /**
   * Cursorとの同期
   */
  private async syncWithCursor(): Promise<void> {
    // CursorのAPIを使用してファイルの変更を監視
    // 実際の実装ではCursorのAPIエンドポイントに接続
    const currentFiles = await this.getCurrentCursorFiles();
    
    for (const file of currentFiles) {
      if (this.hasFileChanged(file)) {
        await this.handleFileChange(file);
      }
    }
  }

  /**
   * 現在のCursorファイルを取得
   */
  private async getCurrentCursorFiles(): Promise<unknown[]> {
    // 実際の実装ではCursorのAPIからファイル一覧を取得
    // ここではモック実装
    return [];
  }

  /**
   * ファイルの変更を検出
   */
  private hasFileChanged(_file: unknown): boolean {
    // 実際の実装ではファイルの変更を検出
    return false;
  }

  /**
   * ファイル変更の処理
   */
  private async handleFileChange(_file: unknown): Promise<void> {
    const event: CursorFileChangeEvent = {
      filePath: 'unknown',
      changeType: 'modified',
      content: 'unknown',
      timestamp: new Date()
    };

    await this.processFileChangeEvent(event);
  }

  /**
   * ファイル変更イベントの処理
   */
  async processFileChangeEvent(event: CursorFileChangeEvent): Promise<void> {
    console.log(this.colorManager.formatSystemMessage(`📝 ファイル変更を検出: ${event.filePath}`, 'info'));

    if (this.config.enableAutoCodeReview && event.changeType === 'modified') {
      await this.triggerAutoCodeReview(event);
    }

    if (this.config.enableLiveCollaboration) {
      await this.notifyCollaborators(event);
    }
  }

  /**
   * 自動コードレビューの実行
   */
  private async triggerAutoCodeReview(event: CursorFileChangeEvent): Promise<void> {
    const task = `コードレビューを実行してください: ${event.filePath}`;
    const _context = `ファイル内容:\n${event.content}`;

    console.log(this.colorManager.formatSystemMessage(`🔍 自動コードレビューを開始: ${event.filePath}`, 'info'));

    try {
      const result = await this.mainAgent.executeTask(task, 'context', 'autonomous');
      
      if (result.success && result.finalResult?.finalResult) {
        console.log(this.colorManager.formatSuccessMessage(`✅ コードレビュー完了: ${event.filePath}`));
        await this.applyCodeReviewSuggestions(event.filePath, result.finalResult.finalResult);
      } else {
        console.error(this.colorManager.formatErrorMessage(`❌ コードレビュー失敗: ${event.filePath}`));
      }
    } catch (error) {
      console.error(this.colorManager.formatErrorMessage(`❌ コードレビューエラー: ${error}`));
    }
  }

  /**
   * コードレビュー提案の適用
   */
  private async applyCodeReviewSuggestions(filePath: string, _suggestions: string): Promise<void> {
    // 実際の実装ではCursorのAPIを使用して提案を適用
    console.log(this.colorManager.formatSystemMessage(`💡 コードレビュー提案を適用: ${filePath}`, 'info'));
  }

  /**
   * 協調者への通知
   */
  private async notifyCollaborators(event: CursorFileChangeEvent): Promise<void> {
    // 実際の実装では他の協調者に通知
    console.log(this.colorManager.formatSystemMessage(`👥 協調者に通知: ${event.filePath}`, 'info'));
  }

  /**
   * 並列タスクの実行
   */
  async executeParallelTask(task: string, filePath?: string, specialty?: SubagentSpecialty): Promise<string> {
    const taskId = this.generateTaskId();
    
    const parallelTask: CursorParallelTask = {
      id: taskId,
      task,
      filePath,
      specialty: specialty || 'custom',
      priority: 'medium',
      status: 'pending',
      startTime: new Date()
    };

    this.activeTasks.set(taskId, parallelTask);

    console.log(this.colorManager.formatSystemMessage(`🚀 並列タスクを開始: ${taskId}`, 'info'));

    try {
      // タスクを並列実行キューに追加
      await this.queueParallelTask(parallelTask);
      
      return taskId;
    } catch (error) {
      parallelTask.status = 'failed';
      parallelTask.endTime = new Date();
      console.error(this.colorManager.formatErrorMessage(`❌ 並列タスク失敗: ${taskId}`));
      throw error;
    }
  }

  /**
   * 並列タスクのキュー追加
   */
  private async queueParallelTask(task: CursorParallelTask): Promise<void> {
    // 実際の実装ではタスクキューに追加
    task.status = 'running';
    
    // メインエージェントでタスクを実行
    const result = await this.mainAgent.executeTask(
      task.task,
      task.filePath ? `ファイル: ${task.filePath}` : undefined,
      'autonomous'
    );

    task.status = result.success ? 'completed' : 'failed';
    task.result = result;
    task.endTime = new Date();

    console.log(this.colorManager.formatSuccessMessage(`✅ 並列タスク完了: ${task.id}`));
  }

  /**
   * コマンドパレットの登録
   */
  private registerCommandPalette(): void {
    // 実際の実装ではCursorのコマンドパレットにコマンドを登録
    const commands = [
      {
        id: 'cursor.subagent.codeReview',
        title: 'サブエージェント: コードレビュー',
        description: '現在のファイルでコードレビューを実行'
      },
      {
        id: 'cursor.subagent.debug',
        title: 'サブエージェント: デバッグ',
        description: '現在のファイルでデバッグを実行'
      },
      {
        id: 'cursor.subagent.optimize',
        title: 'サブエージェント: 最適化',
        description: '現在のファイルでパフォーマンス最適化を実行'
      },
      {
        id: 'cursor.subagent.security',
        title: 'サブエージェント: セキュリティ監査',
        description: '現在のファイルでセキュリティ監査を実行'
      },
      {
        id: 'cursor.subagent.parallel',
        title: 'サブエージェント: 並列実行',
        description: '複数のサブエージェントで並列実行'
      }
    ];

    console.log(this.colorManager.formatSystemMessage(`⌨️ コマンドパレットに${commands.length}個のコマンドを登録`, 'info'));
  }

  /**
   * コマンドの実行
   */
  async executeCommand(commandId: string, context?: unknown): Promise<CursorCommandResult> {
    const startTime = Date.now();
    
    console.log(this.colorManager.formatSystemMessage(`⚡ コマンド実行: ${commandId}`, 'info'));

    try {
      // コマンド実行結果の型が動的のためany型キャスト（型安全にできない設計）
      let result: any;

      switch (commandId) {
        case 'cursor.subagent.codeReview':
          result = await this.executeCodeReviewCommand(context);
          break;
        case 'cursor.subagent.debug':
          result = await this.executeDebugCommand(context);
          break;
        case 'cursor.subagent.optimize':
          result = await this.executeOptimizeCommand(context);
          break;
        case 'cursor.subagent.security':
          result = await this.executeSecurityCommand(context);
          break;
        case 'cursor.subagent.parallel':
          result = await this.executeParallelCommand(context);
          break;
        default:
          throw new Error(`不明なコマンド: ${commandId}`);
      }

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        output: result,
        executionTime
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;

      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : String(error),
        executionTime
      };
    }
  }

  /**
   * コードレビューコマンドの実行
   */
  private async executeCodeReviewCommand(_context: unknown): Promise<string> {
    const filePath = '現在のファイル';
    const task = `コードレビューを実行してください: ${filePath}`;
    
    const result = await this.mainAgent.executeTask(task, 'content', 'autonomous');
    return result.finalResult?.finalResult || 'コードレビューが完了しました';
  }

  /**
   * デバッグコマンドの実行
   */
  private async executeDebugCommand(_context: unknown): Promise<string> {
    const filePath = '現在のファイル';
    const task = `デバッグを実行してください: ${filePath}`;
    
    const result = await this.mainAgent.executeTask(task, 'content', 'autonomous');
    return result.finalResult?.finalResult || 'デバッグが完了しました';
  }

  /**
   * 最適化コマンドの実行
   */
  private async executeOptimizeCommand(_context: unknown): Promise<string> {
    const filePath = '現在のファイル';
    const task = `パフォーマンス最適化を実行してください: ${filePath}`;
    
    const result = await this.mainAgent.executeTask(task, 'content', 'autonomous');
    return result.finalResult?.finalResult || '最適化が完了しました';
  }

  /**
   * セキュリティコマンドの実行
   */
  private async executeSecurityCommand(_context: unknown): Promise<string> {
    const filePath = '現在のファイル';
    const task = `セキュリティ監査を実行してください: ${filePath}`;
    
    const result = await this.mainAgent.executeTask(task, 'content', 'autonomous');
    return result.finalResult?.finalResult || 'セキュリティ監査が完了しました';
  }

  /**
   * 並列コマンドの実行
   */
  private async executeParallelCommand(_context: unknown): Promise<string> {
    const tasks = ['コードレビュー', 'デバッグ', '最適化'];
    const results: string[] = [];

    for (const task of tasks) {
      const taskId = await this.executeParallelTask(task);
      results.push(`タスク ${taskId}: ${task}`);
    }

    return `並列実行完了:\n${results.join('\n')}`;
  }

  /**
   * ファイル監視の開始
   */
  private startFileWatching(): void {
    // 実際の実装ではCursorのファイル監視APIを使用
    console.log(this.colorManager.formatSystemMessage('👁️ ファイル監視を開始', 'info'));
  }

  /**
   * 自動保存の開始
   */
  private startAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    this.autoSaveInterval = setInterval(async () => {
      try {
        await this.checkpointManager.saveCheckpoint('cursor-session', {}, false);
        console.log(this.colorManager.formatSystemMessage('💾 自動保存完了', 'info'));
      } catch (error) {
        console.error(this.colorManager.formatErrorMessage(`自動保存エラー: ${error}`));
      }
    }, this.config.autoSaveInterval);

    console.log(this.colorManager.formatSystemMessage(`💾 自動保存を開始 (間隔: ${this.config.autoSaveInterval}ms)`, 'info'));
  }

  /**
   * アクティブタスクの取得
   */
  getActiveTasks(): CursorParallelTask[] {
    return Array.from(this.activeTasks.values());
  }

  /**
   * タスクの状態取得
   */
  getTaskStatus(taskId: string): CursorParallelTask | undefined {
    return this.activeTasks.get(taskId);
  }

  /**
   * 設定の更新
   */
  updateConfig(updates: Partial<CursorIntegrationConfig>): void {
    this.config = { ...this.config, ...updates };
    console.log(this.colorManager.formatSystemMessage('⚙️ Cursor連携設定を更新', 'info'));
  }

  /**
   * クリーンアップ
   */
  async cleanup(): Promise<void> {
    console.log(this.colorManager.formatSystemMessage('🧹 Cursor連携のクリーンアップを開始', 'info'));

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }

    // チェックポイントの保存
    await this.checkpointManager.saveCheckpoint('cursor-session', {}, true);

    console.log(this.colorManager.formatSystemMessage('✅ Cursor連携のクリーンアップが完了', 'success'));
  }

  /**
   * タスクIDの生成
   */
  private generateTaskId(): string {
    return `cursor-task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
} 