/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 協調エージェントシステム用の型定義
 */

import { SubagentResult } from './executor.js';

export interface CollaborativeTaskOptions {
  maxSubagents?: number;
  timeout?: number;
  resultAggregation?: 'first' | 'best' | 'all' | 'consensus';
}

export interface CollaborativeTaskResult {
  taskId: string;
  success: boolean;
  mainAgentAnalysis?: TaskAnalysis;
  subagentResults?: SubagentResult[];
  finalResult?: IntegratedResult;
  executionTime: number;
  collaborationMetrics?: CollaborationMetrics;
  error?: string;
}

export interface RealTimeCollaborationOptions {
  maxSteps?: number;
  timeout?: number;
  enableRealTimeFeedback?: boolean;
}

export interface RealTimeCollaborationResult {
  sessionId: string;
  success: boolean;
  initialAnalysis?: TaskAnalysis;
  collaborationSteps?: CollaborationStep[];
  finalResult?: string;
  executionTime: number;
  metrics?: CollaborationMetrics;
  error?: string;
}

export interface TaskAnalysis {
  originalTask: string;
  requiredSpecialties: string[];
  complexity: number;
  estimatedTime: number;
  requiredSteps: number;
  riskFactors: string[];
  successCriteria: string[];
}

export interface IntegratedResult {
  finalResult: string;
  qualityScore: number;
  confidenceLevel: number;
  recommendations: string[];
}

export interface Subtask {
  id: string;
  subagentId: string;
  task: string;
  priority: 'low' | 'medium' | 'high';
  dependencies: string[];
}

export interface CollaborationStep {
  stepNumber: number;
  action: CollaborationAction;
  result: CollaborationActionResult;
  executionTime: number;
  timestamp: string;
}

export interface CollaborationAction {
  type: 'execute_subagent' | 'integrate_results' | 'analyze_further';
  subagentId?: string;
  task?: string;
  data?: unknown;
  focus?: string;
}

export interface CollaborationActionResult {
  success: boolean;
  data: string;
  subagentId?: string;
  executionTime?: number;
  tokensUsed?: number;
  integrationData?: IntegratedResult;
  analysisData?: TaskAnalysis;
}

export interface CollaborationMetrics {
  totalSteps: number;
  successfulSteps: number;
  totalTokensUsed: number;
  averageResponseTime: number;
  subagentsUsed?: number;
  subtasksCreated?: number;
  totalMessages?: number;
  successfulMessages?: number;
  errorRate?: number;
}

export interface CollaborationSessionResult {
  steps: CollaborationStep[];
  finalResult: string;
  metrics: CollaborationMetrics;
}

/**
 * 協調セッション
 */
export interface CollaborationSession {
  sessionId: string;
  status: 'active' | 'paused' | 'completed' | 'error';
  startTime: string;
  endTime?: string;
  participants: string[];
  task: string;
  steps: CollaborationStep[];
  metrics: CollaborationMetrics;
  terminate(): Promise<void>;
}

export interface SituationAnalysis {
  needsSubagent: boolean;
  recommendedSubagentId?: string;
  subtask?: string;
  needsIntegration: boolean;
  integrationData?: unknown;
  analysisFocus?: string;
}

// ===== リアルタイム通信システム用の新しい型定義 =====

/**
 * リアルタイム通信メッセージの基本型
 */
export interface RealTimeMessage {
  id: string;
  type: RealTimeMessageType;
  timestamp: string;
  sender: string;
  receiver?: string;
  sessionId: string;
  data: unknown;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, unknown>;
}

/**
 * リアルタイムメッセージタイプ
 */
export type RealTimeMessageType = 
  | 'task_assignment'
  | 'task_progress'
  | 'task_completion'
  | 'task_error'
  | 'coordination_request'
  | 'coordination_response'
  | 'status_update'
  | 'heartbeat'
  | 'emergency_stop'
  | 'checkpoint_save'
  | 'checkpoint_restore'
  | 'subagent_ready'
  | 'subagent_busy'
  | 'main_agent_directive'
  | 'subagent_report'
  | 'integration_request'
  | 'integration_result'
  | 'error_report'
  | 'performance_metrics'
  | 'session_control';

/**
 * リアルタイム通信セッション設定
 */
export interface RealTimeSessionConfig {
  sessionId: string;
  mainAgentId: string;
  subagentIds: string[];
  enableHeartbeat: boolean;
  heartbeatInterval: number; // ミリ秒
  enableCheckpointing: boolean;
  checkpointInterval: number; // ミリ秒
  maxMessageRetries: number;
  messageTimeout: number; // ミリ秒
  enableEncryption: boolean;
  enableCompression: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * リアルタイム通信接続状態
 */
export interface RealTimeConnectionState {
  sessionId: string;
  agentId: string;
  status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';
  lastHeartbeat: string;
  messageCount: number;
  errorCount: number;
  latency: number; // ミリ秒
  bandwidth: number; // bytes/sec
}

/**
 * リアルタイム通信統計
 */
export interface RealTimeCommunicationStats {
  sessionId: string;
  totalMessages: number;
  successfulMessages: number;
  failedMessages: number;
  averageLatency: number;
  totalDataTransferred: number;
  startTime: string;
  endTime?: string;
  activeConnections: number;
  errorRate: number;
}

/**
 * タスク割り当てメッセージ
 */
export interface TaskAssignmentMessage extends RealTimeMessage {
  type: 'task_assignment';
  data: {
    taskId: string;
    task: string;
    subagentId: string;
    context?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    deadline?: string;
    dependencies?: string[];
    expectedDuration?: number;
    requiredCapabilities?: string[];
  };
}

/**
 * タスク進捗メッセージ
 */
export interface TaskProgressMessage extends RealTimeMessage {
  type: 'task_progress';
  data: {
    taskId: string;
    progress: number; // 0-100
    status: 'started' | 'in_progress' | 'paused' | 'resumed' | 'completed' | 'failed';
    currentStep?: string;
    estimatedTimeRemaining?: number;
    partialResult?: unknown;
    issues?: string[];
  };
}

/**
 * タスク完了メッセージ
 */
export interface TaskCompletionMessage extends RealTimeMessage {
  type: 'task_completion';
  data: {
    taskId: string;
    result: unknown;
    executionTime: number;
    tokensUsed: number;
    qualityScore: number;
    confidenceLevel: number;
    recommendations?: string[];
    metadata?: Record<string, unknown>;
  };
}

/**
 * 協調要求メッセージ
 */
export interface CoordinationRequestMessage extends RealTimeMessage {
  type: 'coordination_request';
  data: {
    requestType: 'help' | 'review' | 'integration' | 'validation' | 'optimization';
    taskId: string;
    description: string;
    urgency: 'low' | 'medium' | 'high' | 'urgent';
    senderId: string;
    requiredCapabilities?: string[];
    context?: unknown;
  };
}

/**
 * メインエージェント指示メッセージ
 */
export interface MainAgentDirectiveMessage extends RealTimeMessage {
  type: 'main_agent_directive';
  data: {
    directiveType: 'pause' | 'resume' | 'redirect' | 'optimize' | 'validate' | 'integrate';
    targetSubagentId?: string;
    taskId?: string;
    instruction: string;
    parameters?: Record<string, unknown>;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  };
}

/**
 * サブエージェントレポートメッセージ
 */
export interface SubagentReportMessage extends RealTimeMessage {
  type: 'subagent_report';
  data: {
    reportType: 'status' | 'performance' | 'error' | 'suggestion' | 'completion';
    taskId?: string;
    content: string;
    metrics?: Record<string, unknown>;
    timestamp: string;
  };
}

/**
 * 統合要求メッセージ
 */
export interface IntegrationRequestMessage extends RealTimeMessage {
  type: 'integration_request';
  data: {
    taskId: string;
    results: unknown[];
    integrationStrategy: 'merge' | 'consensus' | 'best' | 'weighted';
    qualityThreshold: number;
    deadline?: string;
  };
}

/**
 * パフォーマンスメトリクスメッセージ
 */
export interface PerformanceMetricsMessage extends RealTimeMessage {
  type: 'performance_metrics';
  data: {
    agentId: string;
    cpuUsage: number;
    memoryUsage: number;
    responseTime: number;
    throughput: number;
    errorRate: number;
    activeTasks: number;
    timestamp: string;
  };
}

/**
 * セッション制御メッセージ
 */
export interface SessionControlMessage extends RealTimeMessage {
  type: 'session_control';
  data: {
    action: 'start' | 'pause' | 'resume' | 'stop' | 'restart' | 'checkpoint' | 'restore';
    sessionId: string;
    reason?: string;
    parameters?: Record<string, unknown>;
  };
} 