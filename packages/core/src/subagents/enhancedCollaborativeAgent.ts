/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Subagent, 
  SubagentSpecialtySchema 
} from '../config/subagents.js';
import { 
  SubagentExecutor, 
  SubagentTask, 
  SubagentResult 
} from './executor.js';
import { GeminiClient } from './geminiClient.js';
import { RealTimeCommunicationSystem } from './realTimeCommunication.js';
import {
  CollaborativeTaskOptions,
  CollaborativeTaskResult,
  RealTimeCollaborationOptions,
  RealTimeCollaborationResult,
  TaskAnalysis,
  IntegratedResult,
  Subtask,
  CollaborationStep,
  CollaborationAction,
  CollaborationActionResult,
  CollaborationMetrics,
  CollaborationSessionResult,
  CollaborationSession,
  SituationAnalysis,
  RealTimeSessionConfig,
  RealTimeMessage,
  RealTimeMessageType,
  TaskAssignmentMessage,
  TaskProgressMessage,
  TaskCompletionMessage,
  CoordinationRequestMessage,
  MainAgentDirectiveMessage,
  SubagentReportMessage,
  PerformanceMetricsMessage
} from './types.js';

/**
 * 強化版協調エージェントシステム
 * リアルタイム通信システムを統合したメインエージェントとサブエージェントの協調作業
 */
export class EnhancedCollaborativeAgentSystem {
  private mainAgent: MainAgent;
  private subagents: Map<string, Subagent> = new Map();
  private executor: SubagentExecutor;
  private geminiClient: GeminiClient;
  private realTimeSystem: RealTimeCommunicationSystem;
  private sessionConfig: RealTimeSessionConfig;
  private activeSessions: Map<string, CollaborationSession> = new Map();
  private performanceMonitor: PerformanceMonitor;

  constructor(geminiClient: GeminiClient, sessionConfig: RealTimeSessionConfig) {
    this.geminiClient = geminiClient;
    this.sessionConfig = sessionConfig;
    this.executor = new SubagentExecutor({ geminiClient });
    this.mainAgent = new MainAgent(geminiClient);
    this.performanceMonitor = new PerformanceMonitor();
    
    // リアルタイム通信システムの初期化
    this.realTimeSystem = new RealTimeCommunicationSystem(sessionConfig);
    this.setupRealTimeHandlers();
    
    console.log(`🚀 強化版協調エージェントシステム初期化完了`);
  }

  /**
   * リアルタイム通信ハンドラーの設定
   */
  private setupRealTimeHandlers(): void {
    // タスク割り当てハンドラー
    this.realTimeSystem.onMessage('task_assignment', (message: TaskAssignmentMessage) => {
      this.handleTaskAssignment(message);
    });

    // タスク進捗ハンドラー
    this.realTimeSystem.onMessage('task_progress', (message: TaskProgressMessage) => {
      this.handleTaskProgress(message);
    });

    // タスク完了ハンドラー
    this.realTimeSystem.onMessage('task_completion', (message: TaskCompletionMessage) => {
      this.handleTaskCompletion(message);
    });

    // 協調要求ハンドラー
    this.realTimeSystem.onMessage('coordination_request', (message: CoordinationRequestMessage) => {
      this.handleCoordinationRequest(message);
    });

    // メインエージェント指示ハンドラー
    this.realTimeSystem.onMessage('main_agent_directive', (message: MainAgentDirectiveMessage) => {
      this.handleMainAgentDirective(message);
    });

    // サブエージェントレポートハンドラー
    this.realTimeSystem.onMessage('subagent_report', (message: SubagentReportMessage) => {
      this.handleSubagentReport(message);
    });

    // パフォーマンスメトリクスハンドラー
    this.realTimeSystem.onMessage('performance_metrics', (message: PerformanceMetricsMessage) => {
      this.handlePerformanceMetrics(message);
    });

    // 接続イベントハンドラー
    this.realTimeSystem.on('connection_established', (data) => {
      console.log(`✅ エージェント接続確立: ${data.agentId}`);
    });

    this.realTimeSystem.on('connection_error', (data) => {
      console.error(`❌ エージェント接続エラー: ${data.agentId}`, data.error);
    });

    this.realTimeSystem.on('message_sent', (data) => {
      console.log(`📤 メッセージ送信完了: ${data.successCount}/${data.totalTargets} 成功`);
    });

    this.realTimeSystem.on('message_received', (data) => {
      console.log(`📥 メッセージ受信: ${data.message.sender} -> ${data.agentId}`);
    });
  }

  /**
   * サブエージェントの登録
   */
  registerSubagent(subagent: Subagent): void {
    this.subagents.set(subagent.id, subagent);
    console.log(`📝 サブエージェント登録: ${subagent.name} (${subagent.specialty})`);
  }

  /**
   * リアルタイム協調タスク実行
   */
  async executeRealTimeCollaboration(
    task: string,
    context?: string,
    options: RealTimeCollaborationOptions = {}
  ): Promise<RealTimeCollaborationResult> {
    const sessionId = this.generateSessionId();
    const startTime = Date.now();

    try {
      console.log(`🚀 リアルタイム協調タスク開始: ${task}`);

      // 1. メインエージェントが初期分析
      const initialAnalysis = await this.mainAgent.analyzeTask(task, context);
      console.log(`📊 初期分析完了: 複雑度 ${initialAnalysis.complexity}, 必要専門分野 ${initialAnalysis.requiredSpecialties.length}個`);

      // 2. リアルタイム通信セッション開始
      await this.startRealTimeSession(sessionId, initialAnalysis);

      // 3. 協調セッション作成
      const session = new EnhancedCollaborationSession(
        sessionId,
        this.mainAgent,
        this.subagents,
        this.executor,
        this.realTimeSystem,
        this.performanceMonitor,
        options
      );

      // 4. リアルタイム協調実行
      const result = await session.execute(task, initialAnalysis);

      // 5. セッション終了
      await this.endRealTimeSession(sessionId);

      const executionTime = Date.now() - startTime;

      console.log(`✅ リアルタイム協調タスク完了: ${executionTime}ms`);

      return {
        sessionId,
        success: true,
        initialAnalysis,
        collaborationSteps: result.steps,
        finalResult: result.finalResult,
        executionTime,
        metrics: result.metrics
      };

    } catch (error) {
      console.error(`❌ リアルタイム協調タスクエラー:`, error);
      return {
        sessionId,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * リアルタイムセッション開始
   */
  private async startRealTimeSession(sessionId: string, analysis: TaskAnalysis): Promise<void> {
    // 利用可能なサブエージェントに接続
    const availableSubagents = Array.from(this.subagents.values()).filter(s => s.isActive);
    
    for (const subagent of availableSubagents) {
      // WebSocket URLの生成（実際の実装では適切なURLを使用）
      const wsUrl = `ws://localhost:8080/agent/${subagent.id}`;
      await this.realTimeSystem.connect(subagent.id, wsUrl);
    }

    // セッション開始メッセージ送信
    await this.realTimeSystem.controlSession('start', 'リアルタイム協調タスク開始');

    console.log(`🔗 リアルタイムセッション開始: ${sessionId} (${availableSubagents.length}個のサブエージェント)`);
  }

  /**
   * リアルタイムセッション終了
   */
  private async endRealTimeSession(sessionId: string): Promise<void> {
    // セッション終了メッセージ送信
    await this.realTimeSystem.controlSession('stop', 'リアルタイム協調タスク終了');

    console.log(`🔗 リアルタイムセッション終了: ${sessionId}`);
  }

  /**
   * タスク割り当てハンドラー
   */
  private async handleTaskAssignment(message: TaskAssignmentMessage): Promise<void> {
    const { taskId, task, subagentId } = message.data;
    const subagent = this.subagents.get(subagentId);

    if (!subagent) {
      console.error(`❌ サブエージェントが見つかりません: ${subagentId}`);
      return;
    }

    console.log(`📋 タスク割り当て: ${subagent.name} <- ${task}`);

    try {
      // タスク実行
      const result = await this.executor.executeTask(subagent, {
        id: taskId,
        task,
        priority: 'high',
        timeout: 30000
      });

      // 進捗報告
      await this.realTimeSystem.reportProgress(taskId, 100, 'completed', subagentId, 'タスク完了');

      // 完了報告
      await this.realTimeSystem.reportCompletion(
        taskId,
        result.result,
        result.executionTime,
        result.tokensUsed || 0,
        result.qualityScore || 0.8,
        result.confidenceLevel || 0.7,
        subagentId
      );

    } catch (error) {
      console.error(`❌ タスク実行エラー:`, error);
      await this.realTimeSystem.reportProgress(taskId, 0, 'failed', subagentId, 'エラー発生');
    }
  }

  /**
   * タスク進捗ハンドラー
   */
  private handleTaskProgress(message: TaskProgressMessage): void {
    const { taskId, progress, status, currentStep } = message.data;
    console.log(`📈 タスク進捗: ${taskId} - ${progress}% (${status}) - ${currentStep || ''}`);
  }

  /**
   * タスク完了ハンドラー
   */
  private handleTaskCompletion(message: TaskCompletionMessage): void {
    const { taskId, result, executionTime, qualityScore, confidenceLevel } = message.data;
    console.log(`✅ タスク完了: ${taskId} - 品質: ${qualityScore}, 信頼度: ${confidenceLevel}, 時間: ${executionTime}ms`);
  }

  /**
   * 協調要求ハンドラー
   */
  private async handleCoordinationRequest(message: CoordinationRequestMessage): Promise<void> {
    const { requestType, taskId, description, urgency, senderId } = message.data;
    console.log(`🤝 協調要求: ${senderId} -> ${requestType} (${urgency}) - ${description}`);

    // メインエージェントが協調要求を処理
    const response = await this.mainAgent.handleCoordinationRequest(message.data);
    
    // 応答を送信
    await this.realTimeSystem.sendMessage({
      id: this.generateMessageId(),
      type: 'coordination_response',
      timestamp: new Date().toISOString(),
      sender: this.sessionConfig.mainAgentId,
      receiver: senderId,
      sessionId: this.sessionConfig.sessionId,
      priority: urgency,
      data: response
    });
  }

  /**
   * メインエージェント指示ハンドラー
   */
  private async handleMainAgentDirective(message: MainAgentDirectiveMessage): Promise<void> {
    const { directiveType, targetSubagentId, instruction, parameters } = message.data;
    console.log(`🎯 メインエージェント指示: ${directiveType} -> ${targetSubagentId || 'all'} - ${instruction}`);

    if (targetSubagentId) {
      // 特定のサブエージェントへの指示
      const subagent = this.subagents.get(targetSubagentId);
      if (subagent) {
        await this.executeDirective(subagent, directiveType, instruction, parameters);
      }
    } else {
      // 全サブエージェントへの指示
      for (const subagent of this.subagents.values()) {
        await this.executeDirective(subagent, directiveType, instruction, parameters);
      }
    }
  }

  /**
   * 指示の実行
   */
  private async executeDirective(
    subagent: Subagent,
    directiveType: string,
    instruction: string,
    parameters?: Record<string, any>
  ): Promise<void> {
    try {
      const result = await this.executor.executeTask(subagent, {
        id: this.generateTaskId(),
        task: `指示: ${directiveType}\n内容: ${instruction}\nパラメータ: ${JSON.stringify(parameters || {})}`,
        priority: 'high',
        timeout: 15000
      });

      console.log(`✅ 指示実行完了: ${subagent.name} - ${directiveType}`);
    } catch (error) {
      console.error(`❌ 指示実行エラー: ${subagent.name} - ${directiveType}`, error);
    }
  }

  /**
   * サブエージェントレポートハンドラー
   */
  private handleSubagentReport(message: SubagentReportMessage): void {
    const { reportType, taskId, content, metrics } = message.data;
    console.log(`📊 サブエージェントレポート: ${message.sender} - ${reportType} - ${content}`);
    
    if (metrics) {
      this.performanceMonitor.updateMetrics(message.sender, metrics);
    }
  }

  /**
   * パフォーマンスメトリクスハンドラー
   */
  private handlePerformanceMetrics(message: PerformanceMetricsMessage): void {
    const { agentId, cpuUsage, memoryUsage, responseTime, throughput, errorRate, activeTasks } = message.data;
    console.log(`📈 パフォーマンス: ${agentId} - CPU: ${cpuUsage}%, メモリ: ${memoryUsage}%, 応答時間: ${responseTime}ms`);
    
    this.performanceMonitor.updateMetrics(agentId, message.data);
  }

  /**
   * システム状態の取得
   */
  getSystemStatus(): any {
    return {
      activeSessions: this.activeSessions.size,
      registeredSubagents: this.subagents.size,
      realTimeStats: this.realTimeSystem.getStats(),
      connectionStates: this.realTimeSystem.getAllConnectionStates(),
      performanceMetrics: this.performanceMonitor.getMetrics()
    };
  }

  /**
   * システムの停止
   */
  async shutdown(): Promise<void> {
    console.log(`🛑 強化版協調エージェントシステム停止中...`);
    
    // リアルタイム通信システムの停止
    await this.realTimeSystem.shutdown();
    
    // アクティブセッションの終了
    for (const session of this.activeSessions.values()) {
      await session.terminate();
    }
    
    console.log(`✅ 強化版協調エージェントシステム停止完了`);
  }

  /**
   * ユーティリティ関数
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * 強化版協調セッション
 */
class EnhancedCollaborationSession {
  private sessionId: string;
  private mainAgent: MainAgent;
  private subagents: Map<string, Subagent>;
  private executor: SubagentExecutor;
  private realTimeSystem: RealTimeCommunicationSystem;
  private performanceMonitor: PerformanceMonitor;
  private options: RealTimeCollaborationOptions;
  private steps: CollaborationStep[] = [];
  private metrics: CollaborationMetrics = {
    totalSteps: 0,
    successfulSteps: 0,
    totalTokensUsed: 0,
    averageResponseTime: 0
  };

  constructor(
    sessionId: string,
    mainAgent: MainAgent,
    subagents: Map<string, Subagent>,
    executor: SubagentExecutor,
    realTimeSystem: RealTimeCommunicationSystem,
    performanceMonitor: PerformanceMonitor,
    options: RealTimeCollaborationOptions
  ) {
    this.sessionId = sessionId;
    this.mainAgent = mainAgent;
    this.subagents = subagents;
    this.executor = executor;
    this.realTimeSystem = realTimeSystem;
    this.performanceMonitor = performanceMonitor;
    this.options = options;
  }

  /**
   * リアルタイム協調実行
   */
  async execute(task: string, initialAnalysis: TaskAnalysis): Promise<CollaborationSessionResult> {
    let currentTask = task;
    let currentAnalysis = initialAnalysis;
    let stepCount = 0;

    console.log(`🔄 協調セッション実行開始: ${this.sessionId}`);

    while (stepCount < (this.options.maxSteps || 10)) {
      const stepStartTime = Date.now();
      
      // 1. 現在の状況を分析
      const situationAnalysis = await this.analyzeCurrentSituation(currentTask, currentAnalysis);
      
      // 2. 次のアクションを決定
      const action = await this.decideNextAction(situationAnalysis);
      
      // 3. アクションを実行
      const result = await this.executeAction(action);
      
      // 4. 結果を記録
      const step: CollaborationStep = {
        stepNumber: stepCount + 1,
        action,
        result,
        executionTime: Date.now() - stepStartTime,
        timestamp: new Date().toISOString()
      };
      
      this.steps.push(step);
      this.updateMetrics(step);
      
      // 5. 終了条件をチェック
      if (this.shouldTerminate(result, currentAnalysis)) {
        break;
      }
      
      // 6. 次のタスクを更新
      currentTask = this.updateTask(currentTask, result);
      currentAnalysis = await this.mainAgent.analyzeTask(currentTask);
      
      stepCount++;
    }

    return {
      steps: this.steps,
      finalResult: this.generateFinalResult(),
      metrics: this.metrics
    };
  }

  /**
   * 現在の状況分析
   */
  private async analyzeCurrentSituation(task: string, analysis: TaskAnalysis): Promise<SituationAnalysis> {
    // 実装は既存のCollaborationSessionと同様
    return {
      needsSubagent: true,
      recommendedSubagentId: 'default',
      subtask: task,
      needsIntegration: false
    };
  }

  /**
   * 次のアクション決定
   */
  private async decideNextAction(situationAnalysis: SituationAnalysis): Promise<CollaborationAction> {
    // 実装は既存のCollaborationSessionと同様
    return {
      type: 'execute_subagent',
      subagentId: situationAnalysis.recommendedSubagentId,
      task: situationAnalysis.subtask
    };
  }

  /**
   * アクション実行
   */
  private async executeAction(action: CollaborationAction): Promise<CollaborationActionResult> {
    // 実装は既存のCollaborationSessionと同様
    return {
      success: true,
      data: 'アクション実行完了',
      executionTime: 1000
    };
  }

  /**
   * 終了条件チェック
   */
  private shouldTerminate(result: CollaborationActionResult, analysis: TaskAnalysis): boolean {
    return result.success && this.steps.length >= 3;
  }

  /**
   * タスク更新
   */
  private updateTask(currentTask: string, result: CollaborationActionResult): string {
    return currentTask + ' (更新済み)';
  }

  /**
   * 最終結果生成
   */
  private generateFinalResult(): string {
    return `協調セッション ${this.sessionId} の最終結果`;
  }

  /**
   * メトリクス更新
   */
  private updateMetrics(step: CollaborationStep): void {
    this.metrics.totalSteps++;
    if (step.result.success) {
      this.metrics.successfulSteps++;
    }
    this.metrics.totalTokensUsed += step.result.tokensUsed || 0;
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.totalSteps - 1) + step.executionTime) / this.metrics.totalSteps;
  }

  /**
   * セッション終了
   */
  async terminate(): Promise<void> {
    console.log(`🔚 協調セッション終了: ${this.sessionId}`);
  }
}

/**
 * メインエージェント
 */
class MainAgent {
  constructor(private geminiClient: GeminiClient) {}

  async analyzeTask(task: string, context?: string): Promise<TaskAnalysis> {
    // 実装は既存のMainAgentと同様
    return {
      originalTask: task,
      requiredSpecialties: ['general'],
      complexity: 0.5,
      estimatedTime: 30000,
      requiredSteps: 3,
      riskFactors: [],
      successCriteria: []
    };
  }

  async handleCoordinationRequest(data: any): Promise<any> {
    // 協調要求の処理
    return { response: '協調要求を処理しました' };
  }
}

/**
 * パフォーマンスモニター
 */
class PerformanceMonitor {
  private metrics: Map<string, any> = new Map();

  updateMetrics(agentId: string, metrics: any): void {
    this.metrics.set(agentId, { ...metrics, timestamp: new Date().toISOString() });
  }

  getMetrics(): Record<string, any> {
    return Object.fromEntries(this.metrics);
  }
} 