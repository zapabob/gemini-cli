/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Subagent
} from '../config/subagents.js';
import { 
  SubagentExecutor, 
  SubagentResult 
} from './executor.js';
import { GeminiClient } from './geminiClient.js';
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
  SituationAnalysis
} from './types.js';

/**
 * 協調エージェントシステム - メインエージェントとサブエージェントの強調作業
 */
export class CollaborativeAgentSystem {
  private mainAgent: MainAgent;
  private subagents: Map<string, Subagent> = new Map();
  private executor: SubagentExecutor;
  private geminiClient: GeminiClient;

  constructor(geminiClient: GeminiClient) {
    this.geminiClient = geminiClient;
    this.executor = new SubagentExecutor({ geminiClient });
    this.mainAgent = new MainAgent(geminiClient);
  }

  /**
   * サブエージェントを追加
   */
  addSubagent(subagent: Subagent): void {
    this.subagents.set(subagent.id, subagent);
  }

  /**
   * 協調タスク実行 - メインエージェントがサブエージェントを指揮
   */
  async executeCollaborativeTask(
    task: string,
    context?: string,
    _options: CollaborativeTaskOptions = {}
  ): Promise<CollaborativeTaskResult> {
    const taskId = this.generateTaskId();
    const startTime = Date.now();

    try {
      // 1. メインエージェントがタスクを分析
      const taskAnalysis = await this.mainAgent.analyzeTask(task, context);
      
      // 2. 必要なサブエージェントを選択
      const selectedSubagents = await this.selectSubagents(taskAnalysis);
      
      // 3. タスクを分割・割り当て
      const subtasks = await this.divideTask(taskAnalysis, selectedSubagents);
      
      // 4. サブエージェント並列実行
      const subagentResults = await this.executeSubagents(subtasks);
      
      // 5. メインエージェントが結果を統合・検証
      const finalResult = await this.mainAgent.integrateResults(
        task,
        subagentResults,
        taskAnalysis
      );

      const executionTime = Date.now() - startTime;

      return {
        taskId,
        success: true,
        mainAgentAnalysis: taskAnalysis,
        subagentResults,
        finalResult,
        executionTime,
        collaborationMetrics: {
          totalSteps: 1,
          successfulSteps: 1,
          totalTokensUsed: this.calculateTotalTokens(subagentResults),
          averageResponseTime: executionTime,
          subagentsUsed: selectedSubagents.length,
          subtasksCreated: subtasks.length
        }
      };

    } catch (error) {
      return {
        taskId,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * リアルタイム協調実行 - メインエージェントがリアルタイムでサブエージェントを指揮
   */
  async executeRealTimeCollaboration(
    task: string,
    context?: string,
    options: RealTimeCollaborationOptions = {}
  ): Promise<RealTimeCollaborationResult> {
    const sessionId = this.generateSessionId();
    const startTime = Date.now();

    try {
      // 1. メインエージェントが初期分析
      const initialAnalysis = await this.mainAgent.analyzeTask(task, context);
      
      // 2. 協調セッション開始
      const session = new CollaborationSession(
        sessionId,
        this.mainAgent,
        this.subagents,
        this.executor,
        options
      );

      // 3. リアルタイム協調実行
      const result = await session.execute(task, initialAnalysis);

      return {
        sessionId,
        success: true,
        initialAnalysis,
        collaborationSteps: result.steps,
        finalResult: result.finalResult,
        executionTime: Date.now() - startTime,
        metrics: result.metrics
      };

    } catch (error) {
      return {
        sessionId,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * タスク分析
   */
  private async analyzeTask(task: string, context?: string): Promise<TaskAnalysis> {
    const prompt = `
タスク分析を行ってください:

**タスク**: ${task}
${context ? `**コンテキスト**: ${context}` : ''}

以下の観点で分析してください:
1. 必要な専門分野
2. タスクの複雑度
3. 必要なステップ数
4. 推定実行時間
5. リスク要因

分析結果をJSON形式で返してください。
`;

    const response = await this.geminiClient.generateText({ prompt });
    return JSON.parse(response.text);
  }

  /**
   * サブエージェント選択
   */
  private async selectSubagents(analysis: TaskAnalysis): Promise<Subagent[]> {
    const requiredSpecialties = analysis.requiredSpecialties || [];
    const selectedSubagents: Subagent[] = [];

    for (const specialty of requiredSpecialties) {
      const subagents = Array.from(this.subagents.values())
        .filter(s => s.specialty === specialty && s.isActive);
      
      if (subagents.length > 0) {
        // 最も適切なサブエージェントを選択
        const bestSubagent = this.selectBestSubagent(subagents, analysis);
        selectedSubagents.push(bestSubagent);
      }
    }

    return selectedSubagents;
  }

  /**
   * 最適なサブエージェント選択
   */
  private selectBestSubagent(subagents: Subagent[], analysis: TaskAnalysis): Subagent {
    // スコアリングシステム
    return subagents.reduce((best, current) => {
      const bestScore = this.calculateSubagentScore(best, analysis);
      const currentScore = this.calculateSubagentScore(current, analysis);
      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * サブエージェントスコア計算
   */
  private calculateSubagentScore(subagent: Subagent, analysis: TaskAnalysis): number {
    let score = 0;
    
    // 成功履歴によるスコア
    const successRate = this.calculateSuccessRate(subagent);
    score += successRate * 0.4;
    
    // 専門性によるスコア
    const specialtyMatch = analysis.requiredSpecialties?.includes(subagent.specialty) ? 1 : 0;
    score += specialtyMatch * 0.3;
    
    // 最近の使用頻度によるスコア
    const recencyScore = this.calculateRecencyScore(subagent);
    score += recencyScore * 0.2;
    
    // 設定によるスコア
    score += (subagent.temperature || 0.7) * 0.1;
    
    return score;
  }

  /**
   * 成功率計算
   */
  private calculateSuccessRate(subagent: Subagent): number {
    const history = subagent.taskHistory || [];
    if (history.length === 0) return 0.5; // デフォルト値
    
    const successCount = history.filter((h: unknown) => (h as Record<string, unknown>)['status'] === 'success').length;
    return successCount / history.length;
  }

  /**
   * 最近性スコア計算
   */
  private calculateRecencyScore(subagent: Subagent): number {
    if (!subagent.lastUsed) return 0.5;
    
    const lastUsed = new Date(subagent.lastUsed);
    const now = new Date();
    const daysSinceLastUse = (now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24);
    
    // 7日以内なら高スコア、それ以降は徐々に減少
    return Math.max(0, 1 - (daysSinceLastUse / 7));
  }

  /**
   * タスク分割
   */
  private async divideTask(analysis: TaskAnalysis, subagents: Subagent[]): Promise<Subtask[]> {
    const subtasks: Subtask[] = [];
    
    for (const subagent of subagents) {
      const subtask = await this.createSubtask(analysis, subagent);
      subtasks.push(subtask);
    }
    
    return subtasks;
  }

  /**
   * サブタスク作成
   */
  private async createSubtask(analysis: TaskAnalysis, subagent: Subagent): Promise<Subtask> {
    const prompt = `
以下のタスクを${subagent.specialty}専門のサブタスクに分割してください:

**メインタスク**: ${analysis.originalTask}
**サブエージェント**: ${subagent.name} (${subagent.specialty})
**専門性**: ${subagent.description}

サブタスクを具体的に定義してください。
`;

    const response = await this.geminiClient.generateText({ prompt });
    
    return {
      id: this.generateTaskId(),
      subagentId: subagent.id,
      task: response.text,
      priority: 'medium',
      dependencies: []
    };
  }

  /**
   * サブエージェント実行
   */
  private async executeSubagents(subtasks: Subtask[]): Promise<SubagentResult[]> {
    const results: SubagentResult[] = [];
    
    for (const subtask of subtasks) {
      const subagent = this.subagents.get(subtask.subagentId);
      if (!subagent) continue;
      
      const result = await this.executor.executeTask(subagent, {
        id: subtask.id,
        task: subtask.task,
        priority: 'medium',
        timeout: 30000
      });
      
      results.push(result);
    }
    
    return results;
  }

  /**
   * トークン使用量計算
   */
  private calculateTotalTokens(results: SubagentResult[]): number {
    return results.reduce((total, result) => total + (result.tokensUsed || 0), 0);
  }

  /**
   * タスクID生成
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * セッションID生成
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * メインエージェント - サブエージェントを指揮する中心エージェント
 */
class MainAgent {
  constructor(private geminiClient: GeminiClient) {}

  /**
   * タスク分析
   */
  async analyzeTask(task: string, context?: string): Promise<TaskAnalysis> {
    const prompt = `
以下のタスクを詳細に分析してください:

**タスク**: ${task}
${context ? `**コンテキスト**: ${context}` : ''}

分析項目:
1. 必要な専門分野 (code_review, debugging, data_analysis等)
2. タスクの複雑度 (1-10)
3. 推定実行時間 (分)
4. 必要なステップ数
5. リスク要因
6. 成功基準

JSON形式で返してください。
`;

    const response = await this.geminiClient.generateText({ prompt });
    return JSON.parse(response.text);
  }

  /**
   * 結果統合・検証
   */
  async integrateResults(
    originalTask: string,
    subagentResults: SubagentResult[],
    analysis: TaskAnalysis
  ): Promise<IntegratedResult> {
    const prompt = `
以下のサブエージェントの結果を統合・検証してください:

**元のタスク**: ${originalTask}
**タスク分析**: ${JSON.stringify(analysis, null, 2)}

**サブエージェント結果**:
${subagentResults.map((r, i) => `
${i + 1}. ${r.subagentId}:
   - 結果: ${r.result}
   - ステータス: ${r.status}
   - 実行時間: ${r.executionTime}ms
`).join('\n')}

統合された最終結果を提供してください。
`;

    const response = await this.geminiClient.generateText({ prompt });
    
    return {
      finalResult: response.text,
      qualityScore: this.calculateQualityScore(subagentResults),
      confidenceLevel: this.calculateConfidenceLevel(subagentResults),
      recommendations: this.generateRecommendations(subagentResults)
    };
  }

  /**
   * 品質スコア計算
   */
  private calculateQualityScore(results: SubagentResult[]): number {
    const successCount = results.filter(r => r.status === 'success').length;
    return successCount / results.length;
  }

  /**
   * 信頼度計算
   */
  private calculateConfidenceLevel(results: SubagentResult[]): number {
    const avgExecutionTime = results.reduce((sum, r) => sum + r.executionTime, 0) / results.length;
    const successRate = this.calculateQualityScore(results);
    
    // 実行時間と成功率から信頼度を計算
    return Math.min(1, successRate * (1 + Math.min(avgExecutionTime / 10000, 0.5)));
  }

  /**
   * 推奨事項生成
   */
  private generateRecommendations(results: SubagentResult[]): string[] {
    const recommendations: string[] = [];
    
    const failedResults = results.filter(r => r.status === 'failed');
    if (failedResults.length > 0) {
      recommendations.push(`${failedResults.length}個のサブタスクが失敗しました。再実行を検討してください。`);
    }
    
    const slowResults = results.filter(r => r.executionTime > 10000);
    if (slowResults.length > 0) {
      recommendations.push(`${slowResults.length}個のサブタスクが長時間実行されました。最適化を検討してください。`);
    }
    
    return recommendations;
  }

  /**
   * GeminiClientへのアクセス
   */
  getGeminiClient(): GeminiClient {
    return this.geminiClient;
  }
}

/**
 * 協調セッション - リアルタイム協調実行を管理
 */
class CollaborationSession {
  private steps: CollaborationStep[] = [];
  private metrics: CollaborationMetrics = {
    totalSteps: 0,
    successfulSteps: 0,
    totalTokensUsed: 0,
    averageResponseTime: 0
  };

  constructor(
    private sessionId: string,
    private mainAgent: MainAgent,
    private subagents: Map<string, Subagent>,
    private executor: SubagentExecutor,
    private options: RealTimeCollaborationOptions
  ) {}

  /**
   * リアルタイム協調実行
   */
  async execute(task: string, initialAnalysis: TaskAnalysis): Promise<CollaborationSessionResult> {
    let currentTask = task;
    let currentAnalysis = initialAnalysis;
    let stepCount = 0;

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
    const prompt = `
現在の協調セッションの状況を分析してください:

**現在のタスク**: ${task}
**実行済みステップ数**: ${this.steps.length}
**分析**: ${JSON.stringify(analysis, null, 2)}

状況を評価し、次のアクションを提案してください。
`;

    const response = await this.mainAgent.getGeminiClient().generateText({ prompt });
    return JSON.parse(response.text);
  }

  /**
   * 次のアクション決定
   */
  private async decideNextAction(situation: SituationAnalysis): Promise<CollaborationAction> {
    // 状況に基づいてアクションを決定
    if (situation.needsSubagent) {
      return {
        type: 'execute_subagent',
        subagentId: situation.recommendedSubagentId,
        task: situation.subtask
      };
    } else if (situation.needsIntegration) {
      return {
        type: 'integrate_results',
        data: situation.integrationData
      };
    } else {
      return {
        type: 'analyze_further',
        focus: situation.analysisFocus
      };
    }
  }

  /**
   * アクション実行
   */
  private async executeAction(action: CollaborationAction): Promise<CollaborationActionResult> {
    switch (action.type) {
      case 'execute_subagent':
        return await this.executeSubagentAction(action);
      case 'integrate_results':
        return await this.executeIntegrationAction(action);
      case 'analyze_further':
        return await this.executeAnalysisAction(action);
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * サブエージェントアクション実行
   */
  private async executeSubagentAction(action: CollaborationAction): Promise<CollaborationActionResult> {
    const subagent = this.subagents.get(action.subagentId!);
    if (!subagent) {
      throw new Error(`Subagent not found: ${action.subagentId}`);
    }

    const result = await this.executor.executeTask(subagent, {
      id: `task-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      task: action.task!,
      priority: 'medium',
      timeout: 30000
    });

    return {
      success: result.status === 'success',
      data: result.result,
      subagentId: action.subagentId,
      executionTime: result.executionTime
    };
  }

  /**
   * 統合アクション実行
   */
  private async executeIntegrationAction(_action: CollaborationAction): Promise<CollaborationActionResult> {
    const integratedResult = await this.mainAgent.integrateResults(
      'Current task',
      [], // 実際の結果を使用
      {} as TaskAnalysis
    );

    return {
      success: true,
      data: integratedResult.finalResult,
      integrationData: integratedResult
    };
  }

  /**
   * 分析アクション実行
   */
  private async executeAnalysisAction(action: CollaborationAction): Promise<CollaborationActionResult> {
    const analysis = await this.mainAgent.analyzeTask(action.focus || 'Current task');
    
    return {
      success: true,
      data: JSON.stringify(analysis),
      analysisData: analysis
    };
  }

  /**
   * 終了条件チェック
   */
  private shouldTerminate(result: CollaborationActionResult, analysis: TaskAnalysis): boolean {
    return result.success && analysis.complexity <= 2;
  }

  /**
   * タスク更新
   */
  private updateTask(currentTask: string, result: CollaborationActionResult): string {
    return `${currentTask}\n\n最新の結果: ${result.data}`;
  }

  /**
   * 最終結果生成
   */
  private generateFinalResult(): string {
    const successfulSteps = this.steps.filter(s => s.result.success);
    const results = successfulSteps.map(s => s.result.data).join('\n\n');
    
    return `協調セッション完了\n\n実行ステップ数: ${this.steps.length}\n成功ステップ数: ${successfulSteps.length}\n\n結果:\n${results}`;
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
} 