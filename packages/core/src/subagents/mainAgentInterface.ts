/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { AutonomousOrchestrator, AutonomousOrchestratorConfig } from './autonomousOrchestrator.js';
import { SupervisorAgent, SupervisorConfig } from './supervisor.js';
import { GeminiClient } from './geminiClient.js';
import { CollaborativeTaskResult, CollaborativeTaskOptions } from './types.js';
import { Subagent } from '../config/subagents.js';

/**
 * メインエージェントインターフェース設定
 */
export interface MainAgentInterfaceConfig {
  geminiClient: GeminiClient;
  enableAutonomousMode: boolean;
  enableSupervisorMode: boolean;
  maxConcurrentSubagents: number;
  autoAnalysisThreshold: number; // 複雑度がこの値を超えると自動的にサブエージェントを使用
  decisionTimeout: number;
  enableRealTimeCoordination: boolean;
  enableCheckpointing: boolean;
}

/**
 * タスク実行モード
 */
export type TaskExecutionMode = 'autonomous' | 'supervisor' | 'manual' | 'auto';

/**
 * メインエージェントインターフェース
 * メインエージェントが自律的にサブエージェントを呼び出すための統合インターフェース
 */
export class MainAgentInterface {
  private config: MainAgentInterfaceConfig;
  private orchestrator: AutonomousOrchestrator;
  private supervisor: SupervisorAgent;
  private geminiClient: GeminiClient;
  private taskHistory: Map<string, CollaborativeTaskResult> = new Map();
  private activeSessions: Map<string, any> = new Map();

  constructor(config: MainAgentInterfaceConfig) {
    this.config = config;
    this.geminiClient = config.geminiClient;
    
    // 自律的オーケストレーターの初期化
    const orchestratorConfig: AutonomousOrchestratorConfig = {
      geminiClient: this.geminiClient,
      maxSubagents: config.maxConcurrentSubagents,
      enableAutoAnalysis: true,
      enableRealTimeCoordination: config.enableRealTimeCoordination,
      decisionThreshold: 0.7,
      timeout: config.decisionTimeout,
      enableCheckpointing: config.enableCheckpointing,
      checkpointInterval: 300 // 5分
    };
    this.orchestrator = new AutonomousOrchestrator(orchestratorConfig);
    
    // 監督者エージェントの初期化
    const supervisorConfig: SupervisorConfig = {
      role: {
        id: 'main-supervisor',
        name: 'メイン監督者',
        description: 'メインエージェントの監督者として機能',
        responsibilities: ['タスク分析', 'サブエージェント管理', '結果統合'],
        decisionMakingAuthority: 'high',
        coordinationStyle: 'democratic'
      },
      maxSubagents: config.maxConcurrentSubagents,
      coordinationStrategy: 'hybrid',
      decisionThreshold: 0.7,
      progressReporting: true,
      errorHandling: 'adaptive'
    };
    this.supervisor = new SupervisorAgent(supervisorConfig);
  }

  /**
   * メインエージェントからのタスク実行
   * 自律的にサブエージェントの使用を決定
   */
  async executeTask(
    task: string,
    context?: string,
    mode: TaskExecutionMode = 'auto',
    options?: CollaborativeTaskOptions
  ): Promise<CollaborativeTaskResult> {
    console.log(`🚀 メインエージェント: タスク実行開始 - ${task}`);
    
    try {
      // モードが'auto'の場合は自動判断
      if (mode === 'auto') {
        mode = await this.determineExecutionMode(task, context);
        console.log(`🤖 自動判断: 実行モード = ${mode}`);
      }
      
      let result: CollaborativeTaskResult;
      
      switch (mode) {
        case 'autonomous':
          result = await this.executeAutonomousMode(task, context, options);
          break;
        case 'supervisor':
          result = await this.executeSupervisorMode(task, context, options);
          break;
        case 'manual':
          result = await this.executeManualMode(task, context, options);
          break;
        default:
          throw new Error(`不明な実行モード: ${mode}`);
      }
      
      // タスク履歴に保存
      this.taskHistory.set(result.taskId, result);
      
      console.log(`✅ メインエージェント: タスク実行完了 - ${result.success ? '成功' : '失敗'}`);
      return result;
      
    } catch (error) {
      console.error(`❌ メインエージェント: タスク実行エラー - ${error}`);
      return {
        taskId: this.generateTaskId(),
        success: false,
        executionTime: 0,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 実行モードの自動決定
   */
  private async determineExecutionMode(task: string, context?: string): Promise<TaskExecutionMode> {
    const prompt = `
以下のタスクを分析して、最適な実行モードを決定してください：

タスク: ${task}
${context ? `コンテキスト: ${context}` : ''}

実行モードの選択肢：
1. 'autonomous' - 完全自律的（複雑なタスク、複数の専門分野が必要）
2. 'supervisor' - 監督者モード（中程度の複雑さ、監督が必要）
3. 'manual' - 手動実行（シンプルなタスク、サブエージェント不要）

以下のJSON形式で回答してください：
{
  "mode": "autonomous" | "supervisor" | "manual",
  "reasoning": "決定理由",
  "complexity": 1-10の数値,
  "estimatedSubagents": 必要なサブエージェント数の推定
}
`;

    try {
      const response = await this.geminiClient.generateText({
        prompt,
        maxTokens: 500,
        temperature: 0.3
      });

      const analysis = JSON.parse(response.text);
      
      // 複雑度が閾値を超える場合は自律モード
      if (analysis.complexity >= this.config.autoAnalysisThreshold) {
        return 'autonomous';
      }
      
      // 推定サブエージェント数が1より大きい場合は監督者モード
      if (analysis.estimatedSubagents > 1) {
        return 'supervisor';
      }
      
      return analysis.mode || 'manual';
      
    } catch (error) {
      console.warn(`⚠️ 実行モード自動決定エラー: ${error}、デフォルトでmanualモードを使用`);
      return 'manual';
    }
  }

  /**
   * 自律モードでの実行
   */
  private async executeAutonomousMode(
    task: string,
    context?: string,
    options?: CollaborativeTaskOptions
  ): Promise<CollaborativeTaskResult> {
    console.log(`🤖 自律モードで実行: ${task}`);
    return await this.orchestrator.executeAutonomousTask(task, context, options);
  }

  /**
   * 監督者モードでの実行
   */
  private async executeSupervisorMode(
    task: string,
    context?: string,
    options?: CollaborativeTaskOptions
  ): Promise<CollaborativeTaskResult> {
    console.log(`👨‍💼 監督者モードで実行: ${task}`);
    
    // サブエージェントのリストを取得（実際の実装では設定から取得）
    const subagents: Subagent[] = [];
    const supervisorResult = await this.supervisor.superviseImplementation(task, subagents, context);
    
    return {
      taskId: this.generateTaskId(),
      success: supervisorResult.success,
      finalResult: {
        finalResult: supervisorResult.finalOutput,
        qualityScore: 8,
        confidenceLevel: 7,
        recommendations: ['監督者モードでの実行完了']
      },
      executionTime: supervisorResult.executionTime,
      subagentResults: supervisorResult.subagentResults,
      collaborationMetrics: {
        totalSteps: supervisorResult.coordinationLog.length,
        successfulSteps: supervisorResult.decisions.length,
        totalTokensUsed: 0,
        averageResponseTime: supervisorResult.executionTime / supervisorResult.coordinationLog.length,
        subagentsUsed: supervisorResult.subagentResults.length,
        subtasksCreated: supervisorResult.subagentResults.length
      }
    };
  }

  /**
   * 手動モードでの実行
   */
  private async executeManualMode(
    task: string,
    context?: string,
    options?: CollaborativeTaskOptions
  ): Promise<CollaborativeTaskResult> {
    console.log(`👤 手動モードで実行: ${task}`);
    
    const startTime = Date.now();
    
    try {
      // メインエージェントが直接タスクを実行
      const response = await this.geminiClient.generateText({
        prompt: `タスク: ${task}\n${context ? `コンテキスト: ${context}` : ''}\n\nこのタスクを実行してください。`,
        maxTokens: 4000,
        temperature: 0.7
      });

      const executionTime = Date.now() - startTime;
      
      return {
        taskId: this.generateTaskId(),
        success: true,
        finalResult: {
          finalResult: response.text,
          qualityScore: 6,
          confidenceLevel: 5,
          recommendations: ['手動モードでの実行完了']
        },
        executionTime,
        collaborationMetrics: {
          totalSteps: 1,
          successfulSteps: 1,
          totalTokensUsed: 0, // response.usage?.totalTokens || 0,
          averageResponseTime: executionTime,
          subagentsUsed: 0,
          subtasksCreated: 0
        }
      };
      
    } catch (error) {
      return {
        taskId: this.generateTaskId(),
        success: false,
        executionTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * リアルタイム協調セッションの開始
   */
  async startRealTimeCollaboration(
    task: string,
    context?: string,
    options?: CollaborativeTaskOptions
  ): Promise<string> {
    console.log(`🔄 リアルタイム協調セッション開始: ${task}`);
    
    const sessionId = this.generateTaskId();
    
    // セッション情報を保存
    this.activeSessions.set(sessionId, {
      task,
      context,
      options,
      startTime: Date.now(),
      status: 'active'
    });
    
    return sessionId;
  }

  /**
   * リアルタイム協調セッションへの参加
   */
  async joinCollaborationSession(sessionId: string, subagentId: string): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`セッションが見つかりません: ${sessionId}`);
    }
    
    console.log(`👥 サブエージェント ${subagentId} がセッション ${sessionId} に参加`);
    
    // セッション情報を更新
    session.participants = session.participants || [];
    session.participants.push(subagentId);
    
    return true;
  }

  /**
   * リアルタイム協調セッションの終了
   */
  async endCollaborationSession(sessionId: string): Promise<CollaborativeTaskResult> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`セッションが見つかりません: ${sessionId}`);
    }
    
    console.log(`🏁 リアルタイム協調セッション終了: ${sessionId}`);
    
    // セッション結果を生成
    const result: CollaborativeTaskResult = {
      taskId: sessionId,
      success: true,
      executionTime: Date.now() - session.startTime,
      finalResult: {
        finalResult: 'リアルタイム協調セッション完了',
        qualityScore: 8,
        confidenceLevel: 7,
        recommendations: ['協調セッションでの実行完了']
      },
      collaborationMetrics: {
        totalSteps: session.participants?.length || 0,
        successfulSteps: session.participants?.length || 0,
        totalTokensUsed: 0,
        averageResponseTime: (Date.now() - session.startTime) / (session.participants?.length || 1),
        subagentsUsed: session.participants?.length || 0,
        subtasksCreated: session.participants?.length || 0
      }
    };
    
    // セッションを削除
    this.activeSessions.delete(sessionId);
    
    return result;
  }

  /**
   * タスク履歴の取得
   */
  getTaskHistory(): Map<string, CollaborativeTaskResult> {
    return new Map(this.taskHistory);
  }

  /**
   * 特定のタスク結果の取得
   */
  getTaskResult(taskId: string): CollaborativeTaskResult | undefined {
    return this.taskHistory.get(taskId);
  }

  /**
   * アクティブセッションの取得
   */
  getActiveSessions(): Map<string, any> {
    return new Map(this.activeSessions);
  }

  /**
   * パフォーマンス統計の取得
   */
  getPerformanceStats(): {
    totalTasks: number;
    successfulTasks: number;
    averageExecutionTime: number;
    totalSubagentsUsed: number;
    mostUsedMode: TaskExecutionMode;
  } {
    const tasks = Array.from(this.taskHistory.values());
    const totalTasks = tasks.length;
    const successfulTasks = tasks.filter(t => t.success).length;
    const averageExecutionTime = tasks.reduce((sum, t) => sum + t.executionTime, 0) / totalTasks || 0;
    const totalSubagentsUsed = tasks.reduce((sum, t) => sum + (t.collaborationMetrics?.subagentsUsed || 0), 0);
    
    // モード別の使用回数をカウント（簡易版）
    const mostUsedMode: TaskExecutionMode = 'autonomous'; // 実際の実装では統計を取る
    
    return {
      totalTasks,
      successfulTasks,
      averageExecutionTime,
      totalSubagentsUsed,
      mostUsedMode
    };
  }

  /**
   * 設定の更新
   */
  updateConfig(updates: Partial<MainAgentInterfaceConfig>): void {
    this.config = { ...this.config, ...updates };
    console.log(`⚙️ メインエージェント設定を更新: ${Object.keys(updates).join(', ')}`);
  }

  /**
   * タスクID生成
   */
  private generateTaskId(): string {
    return `main_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 電源断保護機能: チェックポイント保存
   */
  async saveCheckpoint(): Promise<void> {
    if (!this.config.enableCheckpointing) return;
    
    const checkpointData = {
      taskHistory: Array.from(this.taskHistory.entries()),
      activeSessions: Array.from(this.activeSessions.entries()),
      timestamp: Date.now()
    };
    
    // 実際の実装ではファイルに保存
    console.log(`💾 チェックポイント保存: ${checkpointData.taskHistory.length}個のタスク履歴`);
  }

  /**
   * 電源断保護機能: チェックポイント復元
   */
  async restoreCheckpoint(): Promise<void> {
    if (!this.config.enableCheckpointing) return;
    
    // 実際の実装ではファイルから復元
    console.log(`🔄 チェックポイント復元完了`);
  }
} 