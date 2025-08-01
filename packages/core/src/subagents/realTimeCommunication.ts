/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { EventEmitter } from 'events';
import { 
  RealTimeMessage,
  RealTimeMessageType,
  RealTimeSessionConfig,
  RealTimeConnectionState,
  RealTimeCommunicationStats,
  TaskAssignmentMessage,
  TaskProgressMessage,
  TaskCompletionMessage,
  CoordinationRequestMessage,
  MainAgentDirectiveMessage,
  PerformanceMetricsMessage,
  SessionControlMessage
} from './types.js';

/**
 * WebSocketベースのリアルタイム通信システム
 * メインエージェントとサブエージェント間の協調的リアルタイム通信を管理
 */
export class RealTimeCommunicationSystem extends EventEmitter {
  private config: RealTimeSessionConfig;
  private connections: Map<string, WebSocket> = new Map();
  private connectionStates: Map<string, RealTimeConnectionState> = new Map();
  private messageQueue: Map<string, RealTimeMessage[]> = new Map();
  private stats: RealTimeCommunicationStats;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private checkpointInterval: NodeJS.Timeout | null = null;
  private retryCounts: Map<string, number> = new Map();
  private messageHandlers: Map<RealTimeMessageType, ((message: RealTimeMessage) => void)[]> = new Map();

  constructor(config: RealTimeSessionConfig) {
    super();
    this.config = config;
    
    // 統計情報の初期化
    this.stats = {
      sessionId: config.sessionId,
      totalMessages: 0,
      successfulMessages: 0,
      failedMessages: 0,
      averageLatency: 0,
      totalDataTransferred: 0,
      startTime: new Date().toISOString(),
      activeConnections: 0,
      errorRate: 0
    };

    // メッセージハンドラーの初期化
    this.initializeMessageHandlers();
    
    // ハートビートとチェックポイントの開始
    if (config.enableHeartbeat) {
      this.startHeartbeat();
    }
    if (config.enableCheckpointing) {
      this.startCheckpointing();
    }

    console.log(`🚀 リアルタイム通信システム初期化完了 - セッションID: ${config.sessionId}`);
  }

  /**
   * メッセージハンドラーの初期化
   */
  private initializeMessageHandlers(): void {
    const messageTypes: RealTimeMessageType[] = [
      'task_assignment', 'task_progress', 'task_completion', 'task_error',
      'coordination_request', 'coordination_response', 'status_update',
      'heartbeat', 'emergency_stop', 'checkpoint_save', 'checkpoint_restore',
      'subagent_ready', 'subagent_busy', 'main_agent_directive',
      'subagent_report', 'integration_request', 'integration_result',
      'error_report', 'performance_metrics', 'session_control'
    ];

    for (const type of messageTypes) {
      this.messageHandlers.set(type, []);
    }
  }

  /**
   * WebSocket接続を確立
   */
  async connect(agentId: string, url: string): Promise<boolean> {
    try {
      console.log(`🔌 接続開始: ${agentId} -> ${url}`);

      const ws = new WebSocket(url);
      
      // 接続状態の初期化
      const connectionState: RealTimeConnectionState = {
        sessionId: this.config.sessionId,
        agentId,
        status: 'connecting',
        lastHeartbeat: new Date().toISOString(),
        messageCount: 0,
        errorCount: 0,
        latency: 0,
        bandwidth: 0
      };
      this.connectionStates.set(agentId, connectionState);

      // WebSocketイベントハンドラー
      ws.onopen = () => {
        console.log(`✅ 接続確立: ${agentId}`);
        connectionState.status = 'connected';
        this.stats.activeConnections++;
        this.emit('connection_established', { agentId, timestamp: new Date().toISOString() });
      };

      ws.onmessage = (event) => {
        this.handleIncomingMessage(agentId, event.data);
      };

      ws.onerror = (error) => {
        console.error(`❌ WebSocketエラー (${agentId}):`, error);
        connectionState.status = 'error';
        connectionState.errorCount++;
        this.emit('connection_error', { agentId, error, timestamp: new Date().toISOString() });
      };

      ws.onclose = (event) => {
        console.log(`🔌 接続終了: ${agentId} (${event.code}: ${event.reason})`);
        connectionState.status = 'disconnected';
        this.stats.activeConnections--;
        this.emit('connection_closed', { agentId, code: event.code, reason: event.reason });
      };

      this.connections.set(agentId, ws);
      return true;

    } catch (error) {
      console.error(`❌ 接続失敗 (${agentId}):`, error);
      return false;
    }
  }

  /**
   * メッセージ送信
   */
  async sendMessage(message: RealTimeMessage): Promise<boolean> {
    try {
      const { sender, receiver, type, data } = message;
      
      console.log(`📤 メッセージ送信: ${sender} -> ${receiver || 'broadcast'} (${type})`);

      // メッセージの検証
      if (!this.validateMessage(message)) {
        throw new Error('無効なメッセージ形式');
      }

      // 送信先の決定
      const targets = receiver ? [receiver] : this.config.subagentIds;
      
      let successCount = 0;
      for (const target of targets) {
        const ws = this.connections.get(target);
        if (ws && ws.readyState === WebSocket.OPEN) {
          const messageStr = JSON.stringify(message);
          ws.send(messageStr);
          
          // 統計情報の更新
          this.stats.totalMessages++;
          this.stats.totalDataTransferred += messageStr.length;
          
          // 接続状態の更新
          const state = this.connectionStates.get(target);
          if (state) {
            state.messageCount++;
          }
          
          successCount++;
        } else {
          // 接続が利用できない場合はキューに追加
          this.queueMessage(target, message);
        }
      }

      this.stats.successfulMessages += successCount;
      this.stats.failedMessages += targets.length - successCount;
      this.updateErrorRate();

      // イベント発火
      this.emit('message_sent', { message, successCount, totalTargets: targets.length });

      return successCount > 0;

    } catch (error) {
      console.error(`❌ メッセージ送信エラー:`, error);
      this.stats.failedMessages++;
      this.updateErrorRate();
      return false;
    }
  }

  /**
   * 受信メッセージの処理
   */
  private handleIncomingMessage(_agentId: string, _data: string): void {
    try {
      console.log(`📨 メッセージ受信: ${_agentId}`);
      
      // メッセージの解析（実際の実装ではJSON.parse等）
      const message: RealTimeMessage = {
        id: this.generateMessageId(),
        sessionId: this.config.sessionId,
        sender: _agentId,
        receiver: 'main-agent',
        type: 'status_update',
        timestamp: new Date().toISOString(),
        priority: 'medium',
        data: { content: _data }
      };

      // メッセージの検証
      if (!this.validateMessage(message)) {
        console.error(`❌ 無効なメッセージ: ${_agentId}`);
        return;
      }

      // メッセージハンドラーの実行
      this.executeMessageHandlers(message);
      
      // イベント発火
      this.emit('message_received', { message, agentId: _agentId, timestamp: new Date().toISOString() });
      
      // 統計情報の更新
      this.stats.totalMessages++;
      this.stats.successfulMessages++;
      
    } catch (error) {
      console.error(`❌ メッセージ処理エラー: ${_agentId}`, error);
      this.stats.failedMessages++;
      this.updateErrorRate();
    }
  }

  /**
   * メッセージハンドラーの実行
   */
  private executeMessageHandlers(message: RealTimeMessage): void {
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(message);
        } catch (error) {
          console.error(`❌ メッセージハンドラーエラー (${message.type}):`, error);
        }
      }
    }
  }

  /**
   * メッセージハンドラーの登録
   */
  onMessage(type: RealTimeMessageType, handler: (message: RealTimeMessage) => void): void {
    const handlers = this.messageHandlers.get(type) || [];
    handlers.push(handler);
    this.messageHandlers.set(type, handlers);
  }

  /**
   * タスク割り当てメッセージの送信
   */
  async assignTask(
    taskId: string,
    task: string,
    subagentId: string,
    context?: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): Promise<boolean> {
    const message: TaskAssignmentMessage = {
      id: this.generateMessageId(),
      type: 'task_assignment',
      timestamp: new Date().toISOString(),
      sender: this.config.mainAgentId,
      receiver: subagentId,
      sessionId: this.config.sessionId,
      priority,
      data: {
        taskId,
        task,
        subagentId,
        context,
        priority,
        expectedDuration: 30000, // 30秒
        requiredCapabilities: []
      }
    };

    return await this.sendMessage(message);
  }

  /**
   * タスク進捗メッセージの送信
   */
  async reportProgress(
    taskId: string,
    progress: number,
    status: 'started' | 'in_progress' | 'paused' | 'resumed' | 'completed' | 'failed',
    agentId: string,
    currentStep?: string
  ): Promise<boolean> {
    const message: TaskProgressMessage = {
      id: this.generateMessageId(),
      type: 'task_progress',
      timestamp: new Date().toISOString(),
      sender: agentId,
      sessionId: this.config.sessionId,
      priority: 'medium',
      data: {
        taskId,
        progress,
        status,
        currentStep,
        estimatedTimeRemaining: 0
      }
    };

    return await this.sendMessage(message);
  }

  /**
   * タスク完了メッセージの送信
   */
  async reportCompletion(
    taskId: string,
    result: unknown,
    executionTime: number,
    tokensUsed: number,
    qualityScore: number,
    confidenceLevel: number,
    agentId: string
  ): Promise<boolean> {
    const message: TaskCompletionMessage = {
      id: this.generateMessageId(),
      type: 'task_completion',
      timestamp: new Date().toISOString(),
      sender: agentId,
      sessionId: this.config.sessionId,
      priority: 'high',
      data: {
        taskId,
        result,
        executionTime,
        tokensUsed,
        qualityScore,
        confidenceLevel,
        recommendations: []
      }
    };

    return await this.sendMessage(message);
  }

  /**
   * 協調要求メッセージの送信
   */
  async requestCoordination(
    requestType: 'help' | 'review' | 'integration' | 'validation' | 'optimization',
    taskId: string,
    description: string,
    urgency: 'low' | 'medium' | 'high' | 'urgent',
    senderId: string,
    targetId?: string
  ): Promise<boolean> {
    const message: CoordinationRequestMessage = {
      id: this.generateMessageId(),
      type: 'coordination_request',
      timestamp: new Date().toISOString(),
      sender: senderId,
      receiver: targetId,
      sessionId: this.config.sessionId,
      priority: urgency,
      data: {
        requestType,
        taskId,
        description,
        urgency,
        senderId,
        requiredCapabilities: []
      }
    };

    return await this.sendMessage(message);
  }

  /**
   * メインエージェント指示メッセージの送信
   */
  async sendDirective(
    directiveType: 'pause' | 'resume' | 'redirect' | 'optimize' | 'validate' | 'integrate',
    instruction: string,
    targetSubagentId?: string,
    taskId?: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): Promise<boolean> {
    const message: MainAgentDirectiveMessage = {
      id: this.generateMessageId(),
      type: 'main_agent_directive',
      timestamp: new Date().toISOString(),
      sender: this.config.mainAgentId,
      receiver: targetSubagentId,
      sessionId: this.config.sessionId,
      priority,
      data: {
        directiveType,
        targetSubagentId,
        taskId,
        instruction,
        parameters: {},
        priority
      }
    };

    return await this.sendMessage(message);
  }

  /**
   * パフォーマンスメトリクスの送信
   */
  async sendPerformanceMetrics(
    agentId: string,
    cpuUsage: number,
    memoryUsage: number,
    responseTime: number,
    throughput: number,
    errorRate: number,
    activeTasks: number
  ): Promise<boolean> {
    const message: PerformanceMetricsMessage = {
      id: this.generateMessageId(),
      type: 'performance_metrics',
      timestamp: new Date().toISOString(),
      sender: agentId,
      sessionId: this.config.sessionId,
      priority: 'low',
      data: {
        agentId,
        cpuUsage,
        memoryUsage,
        responseTime,
        throughput,
        errorRate,
        activeTasks,
        timestamp: new Date().toISOString()
      }
    };

    return await this.sendMessage(message);
  }

  /**
   * セッション制御メッセージの送信
   */
  async controlSession(
    action: 'start' | 'pause' | 'resume' | 'stop' | 'restart' | 'checkpoint' | 'restore',
    reason?: string
  ): Promise<boolean> {
    const message: SessionControlMessage = {
      id: this.generateMessageId(),
      type: 'session_control',
      timestamp: new Date().toISOString(),
      sender: this.config.mainAgentId,
      sessionId: this.config.sessionId,
      priority: 'high',
      data: {
        action,
        sessionId: this.config.sessionId,
        reason,
        parameters: {}
      }
    };

    return await this.sendMessage(message);
  }

  /**
   * ハートビートの開始
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, this.config.heartbeatInterval);
  }

  /**
   * ハートビートメッセージの送信
   */
  private async sendHeartbeat(): Promise<void> {
    const message: RealTimeMessage = {
      id: this.generateMessageId(),
      type: 'heartbeat',
      timestamp: new Date().toISOString(),
      sender: this.config.mainAgentId,
      sessionId: this.config.sessionId,
      priority: 'low',
      data: { timestamp: new Date().toISOString() }
    };

    await this.sendMessage(message);
  }

  /**
   * チェックポイントの開始
   */
  private startCheckpointing(): void {
    this.checkpointInterval = setInterval(() => {
      this.saveCheckpoint();
    }, this.config.checkpointInterval);
  }

  /**
   * チェックポイントの保存
   */
  private async saveCheckpoint(): Promise<void> {
    const message: RealTimeMessage = {
      id: this.generateMessageId(),
      type: 'checkpoint_save',
      timestamp: new Date().toISOString(),
      sender: this.config.mainAgentId,
      sessionId: this.config.sessionId,
      priority: 'medium',
      data: {
        sessionState: {
          connections: Array.from(this.connectionStates.values()),
          stats: this.stats,
          messageQueue: Array.from(this.messageQueue.entries())
        }
      }
    };

    await this.sendMessage(message);
    console.log(`💾 チェックポイント保存: ${this.config.sessionId}`);
  }

  /**
   * メッセージのキューイング
   */
  private queueMessage(agentId: string, message: RealTimeMessage): void {
    const queue = this.messageQueue.get(agentId) || [];
    queue.push(message);
    this.messageQueue.set(agentId, queue);
  }

  /**
   * キューされたメッセージの送信
   */
  private async sendQueuedMessages(agentId: string): Promise<void> {
    const queue = this.messageQueue.get(agentId);
    if (!queue || queue.length === 0) return;

    const ws = this.connections.get(agentId);
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const messages = [...queue];
    this.messageQueue.set(agentId, []);

    for (const message of messages) {
      try {
        const messageStr = JSON.stringify(message);
        ws.send(messageStr);
        console.log(`📤 キュー送信: ${agentId} <- ${message.sender} (${message.type})`);
      } catch (error) {
        console.error(`❌ キュー送信エラー:`, error);
        // 失敗したメッセージを再キュー
        const failedQueue = this.messageQueue.get(agentId) || [];
        failedQueue.push(message);
        this.messageQueue.set(agentId, failedQueue);
      }
    }
  }

  /**
   * メッセージの検証
   */
  private validateMessage(message: RealTimeMessage): boolean {
    return !!(
      message.id &&
      message.type &&
      message.timestamp &&
      message.sender &&
      message.sessionId &&
      message.data &&
      message.priority
    );
  }

  /**
   * エラー率の更新
   */
  private updateErrorRate(): void {
    if (this.stats.totalMessages > 0) {
      this.stats.errorRate = this.stats.failedMessages / this.stats.totalMessages;
    }
  }

  /**
   * メッセージIDの生成
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 接続状態の取得
   */
  getConnectionState(agentId: string): RealTimeConnectionState | undefined {
    return this.connectionStates.get(agentId);
  }

  /**
   * 全接続状態の取得
   */
  getAllConnectionStates(): RealTimeConnectionState[] {
    return Array.from(this.connectionStates.values());
  }

  /**
   * 通信統計の取得
   */
  getStats(): RealTimeCommunicationStats {
    return { ...this.stats };
  }

  /**
   * システムの停止
   */
  async shutdown(): Promise<void> {
    console.log(`🛑 リアルタイム通信システム停止中...`);

    // インターバルの停止
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.checkpointInterval) {
      clearInterval(this.checkpointInterval);
    }

    // 接続の閉じる
    for (const [_agentId, ws] of this.connections) {
      ws.close(1000, 'System shutdown');
    }

    // 統計情報の更新
    this.stats.endTime = new Date().toISOString();
    this.stats.activeConnections = 0;

    console.log(`✅ リアルタイム通信システム停止完了`);
  }
} 