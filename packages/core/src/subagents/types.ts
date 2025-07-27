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
  data?: any;
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
}

export interface CollaborationSessionResult {
  steps: CollaborationStep[];
  finalResult: string;
  metrics: CollaborationMetrics;
}

export interface SituationAnalysis {
  needsSubagent: boolean;
  recommendedSubagentId?: string;
  subtask?: string;
  needsIntegration: boolean;
  integrationData?: any;
  analysisFocus?: string;
} 