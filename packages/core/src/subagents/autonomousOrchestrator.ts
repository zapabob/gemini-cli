/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Subagent, SubagentSpecialty } from '../config/subagents.js';
import { SubagentExecutor, SubagentTask, SubagentResult } from './executor.js';
import { GeminiClient } from './geminiClient.js';
import { 
  CollaborativeTaskOptions, 
  CollaborativeTaskResult, 
  TaskAnalysis,
  IntegratedResult,
  CollaborationMetrics 
} from './types.js';

/**
 * 自律的オーケストレーター設定
 */
export interface AutonomousOrchestratorConfig {
  geminiClient: GeminiClient;
  maxSubagents: number;
  enableAutoAnalysis: boolean;
  enableRealTimeCoordination: boolean;
  decisionThreshold: number;
  timeout: number;
  enableCheckpointing: boolean;
  checkpointInterval: number; // 秒
}

/**
 * タスク分析結果
 */
export interface TaskAnalysisResult {
  complexity: number;
  requiredSpecialties: SubagentSpecialty[];
  estimatedSubagents: number;
  parallelizable: boolean;
  dependencies: string[];
  riskLevel: 'low' | 'medium' | 'high';
  estimatedTime: number;
}

/**
 * サブエージェント選択結果
 */
export interface SubagentSelectionResult {
  selectedSubagents: Subagent[];
  assignmentStrategy: 'parallel' | 'sequential' | 'hybrid';
  taskBreakdown: Map<string, string>;
  coordinationPlan: string;
}

/**
 * 自律的オーケストレーター
 * メインエージェントが自律的にサブエージェントを選択・呼び出し・協調させる
 */
export class AutonomousOrchestrator {
  private config: AutonomousOrchestratorConfig;
  private executor: SubagentExecutor;
  private geminiClient: GeminiClient;
  private activeSessions: Map<string, unknown> = new Map();
  private checkpointData: Map<string, unknown> = new Map();

  constructor(config: AutonomousOrchestratorConfig) {
    this.config = config;
    this.geminiClient = config.geminiClient;
    this.executor = new SubagentExecutor({
      geminiClient: this.geminiClient,
      maxConcurrent: config.maxSubagents,
      timeout: config.timeout,
      onProgress: this.handleProgress.bind(this)
    });
  }

  /**
   * メインエージェントからの自律的タスク実行
   */
  async executeAutonomousTask(
    task: string,
    context?: string,
    _options?: CollaborativeTaskOptions
  ): Promise<CollaborativeTaskResult> {
    const taskId = this.generateTaskId();
    const startTime = Date.now();
    
    try {
      console.log(`🤖 自律的タスク実行開始: ${task}`);
      
      // 1. タスク分析
      const analysis = await this.analyzeTask(task, context);
      console.log(`📊 タスク分析完了: 複雑度 ${analysis.complexity}, 必要専門分野 ${analysis.requiredSpecialties.length}個`);
      
      // 2. サブエージェント選択
      const selection = await this.selectSubagents(analysis, task);
      console.log(`👥 サブエージェント選択完了: ${selection.selectedSubagents.length}個のエージェントを選択`);
      
      // 3. タスク分割と実行
      const results = await this.executeWithSubagents(selection, task, context);
      console.log(`✅ サブエージェント実行完了: ${results.length}個の結果を取得`);
      
      // 4. 結果統合
      const integratedResult = await this.integrateResults(results, task, analysis);
      console.log(`🔗 結果統合完了: 品質スコア ${integratedResult.qualityScore}`);
      
      const executionTime = Date.now() - startTime;
      
      return {
        taskId,
        success: true,
        mainAgentAnalysis: this.convertToTaskAnalysis(analysis),
        subagentResults: results,
        finalResult: integratedResult,
        executionTime,
        collaborationMetrics: this.calculateMetrics(results, executionTime, selection.selectedSubagents.length)
      };
      
    } catch (_error) {
      console.error(`❌ 自律的タスク実行エラー: ${_error}`);
      return {
        taskId,
        success: false,
        executionTime: Date.now() - startTime,
        error: _error instanceof Error ? _error.message : String(_error)
      };
    }
  }

  /**
   * タスクの自動分析
   */
  private async analyzeTask(task: string, context?: string): Promise<TaskAnalysisResult> {
    const prompt = `
タスクを分析して、以下の情報を提供してください：

タスク: ${task}
${context ? `コンテキスト: ${context}` : ''}

以下のJSON形式で回答してください：
{
  "complexity": 1-10の数値（10が最も複雑）,
  "requiredSpecialties": ["code_review", "debugging", "data_analysis", "security_audit", "performance_optimization", "documentation", "testing", "architecture_design", "api_design", "database_optimization", "frontend_development", "backend_development", "devops", "machine_learning"]から必要な専門分野,
  "estimatedSubagents": 必要なサブエージェント数の推定,
  "parallelizable": true/false（並列実行可能か）,
  "dependencies": ["依存関係1", "依存関係2"],
  "riskLevel": "low" | "medium" | "high",
  "estimatedTime": 推定実行時間（分）
}
`;

    const response = await this.geminiClient.generateText({
      prompt,
      maxTokens: 1000,
      temperature: 0.3
    });

    try {
      return JSON.parse(response.text);
    } catch (_error) {
      // フォールバック: デフォルト分析
      return {
        complexity: 5,
        requiredSpecialties: ['code_review'],
        estimatedSubagents: 2,
        parallelizable: true,
        dependencies: [],
        riskLevel: 'medium',
        estimatedTime: 30
      };
    }
  }

  /**
   * サブエージェントの自動選択
   */
  private async selectSubagents(analysis: TaskAnalysisResult, task: string): Promise<SubagentSelectionResult> {
    // 利用可能なサブエージェントを取得
    const availableSubagents = await this.getAvailableSubagents();
    
    // 専門分野に基づいてフィルタリング
    const matchingSubagents = availableSubagents.filter(subagent => 
      analysis.requiredSpecialties.includes(subagent.specialty)
    );
    
    // 必要数に基づいて選択
    const selectedCount = Math.min(analysis.estimatedSubagents, matchingSubagents.length, this.config.maxSubagents);
    const selectedSubagents = matchingSubagents.slice(0, selectedCount);
    
    // タスク分割戦略を決定
    const assignmentStrategy = analysis.parallelizable ? 'parallel' : 'sequential';
    
    // タスク分割
    const taskBreakdown = await this.breakdownTask(task, selectedSubagents, analysis);
    
    // 協調計画を生成
    const coordinationPlan = await this.generateCoordinationPlan(selectedSubagents, taskBreakdown, analysis);
    
    return {
      selectedSubagents,
      assignmentStrategy,
      taskBreakdown,
      coordinationPlan
    };
  }

  /**
   * サブエージェントとの実行
   */
  private async executeWithSubagents(
    selection: SubagentSelectionResult, 
    originalTask: string, 
    context?: string
  ): Promise<SubagentResult[]> {
    const tasks: SubagentTask[] = [];
    
    // タスクをサブエージェントに割り当て
    for (const [subagentId, subtask] of selection.taskBreakdown.entries()) {
      const subagent = selection.selectedSubagents.find(s => s.id === subagentId);
      if (subagent) {
        tasks.push({
          id: this.generateTaskId(),
          task: subtask,
          context: context || originalTask,
          priority: 'high',
          metadata: { originalTask, subagentId }
        });
      }
    }
    
    // 実行戦略に基づいて実行
    if (selection.assignmentStrategy === 'parallel') {
      return await this.executor.executeParallel(selection.selectedSubagents, tasks[0]);
    } else {
      const results: SubagentResult[] = [];
      for (let i = 0; i < selection.selectedSubagents.length; i++) {
        const result = await this.executor.executeTask(selection.selectedSubagents[i], tasks[i]);
        results.push(result);
      }
      return results;
    }
  }

  /**
   * 結果の統合
   */
  private async integrateResults(
    results: SubagentResult[], 
    originalTask: string, 
    analysis: TaskAnalysisResult
  ): Promise<IntegratedResult> {
    const prompt = `
以下のサブエージェントの結果を統合して、最終的な結果を生成してください：

元のタスク: ${originalTask}
タスク分析: ${JSON.stringify(analysis, null, 2)}

サブエージェント結果:
${results.map((result, index) => `
エージェント ${index + 1} (${result.subagentId}):
${result.result}
`).join('\n')}

以下のJSON形式で回答してください：
{
  "finalResult": "統合された最終結果",
  "qualityScore": 1-10の数値（10が最高品質）,
  "confidenceLevel": 1-10の数値（10が最高信頼度）,
  "recommendations": ["推奨事項1", "推奨事項2"]
}
`;

    const response = await this.geminiClient.generateText({
      prompt,
      maxTokens: 2000,
      temperature: 0.5
    });

    try {
      return JSON.parse(response.text);
    } catch (_error) {
      // フォールバック: シンプルな統合
      return {
        finalResult: results.map(r => r.result).join('\n\n'),
        qualityScore: 7,
        confidenceLevel: 6,
        recommendations: ['結果の手動確認を推奨']
      };
    }
  }

  /**
   * 利用可能なサブエージェントを取得
   */
  private async getAvailableSubagents(): Promise<Subagent[]> {
    // 実際の実装では設定ファイルから読み込み
    // ここではモックデータを返す
    return [
      {
        id: 'code-review-1',
        name: 'コードレビューエージェント',
        description: 'コードの品質とセキュリティをチェック',
        specialty: 'code_review',
        prompt: 'コードレビューの専門家として、コードの品質、セキュリティ、ベストプラクティスをチェックしてください。',
        maxTokens: 4000,
        temperature: 0.3,
        status: 'idle',
        createdAt: new Date().toISOString(),
        taskHistory: [],
        customTools: [],
        isActive: true
      },
      {
        id: 'debug-1',
        name: 'デバッグエージェント',
        description: 'バグの特定と修正提案',
        specialty: 'debugging',
        prompt: 'デバッグの専門家として、エラーの原因を特定し、修正案を提案してください。',
        maxTokens: 4000,
        temperature: 0.4,
        status: 'idle',
        createdAt: new Date().toISOString(),
        taskHistory: [],
        customTools: [],
        isActive: true
      },
      {
        id: 'arch-1',
        name: 'アーキテクチャエージェント',
        description: 'システム設計とアーキテクチャ提案',
        specialty: 'architecture_design',
        prompt: 'アーキテクチャの専門家として、システム設計と最適化案を提案してください。',
        maxTokens: 4000,
        temperature: 0.6,
        status: 'idle',
        createdAt: new Date().toISOString(),
        taskHistory: [],
        customTools: [],
        isActive: true
      }
    ];
  }

  /**
   * タスクの分割
   */
  private async breakdownTask(
    task: string, 
    subagents: Subagent[], 
    analysis: TaskAnalysisResult
  ): Promise<Map<string, string>> {
    const breakdown = new Map<string, string>();
    
    if (subagents.length === 1) {
      breakdown.set(subagents[0].id, task);
      return breakdown;
    }
    
    // 専門分野に基づいてタスクを分割
    for (const subagent of subagents) {
      const subtask = await this.generateSubtask(task, subagent, analysis);
      breakdown.set(subagent.id, subtask);
    }
    
    return breakdown;
  }

  /**
   * サブタスク生成
   */
  private async generateSubtask(
    task: string, 
    subagent: Subagent, 
    analysis: TaskAnalysisResult
  ): Promise<string> {
    const prompt = `
以下のタスクを、${subagent.name}（専門分野: ${subagent.specialty}）の観点から実行するサブタスクに変換してください：

元のタスク: ${task}
タスク分析: ${JSON.stringify(analysis, null, 2)}

専門分野に特化した具体的なサブタスクを生成してください。
`;

    const response = await this.geminiClient.generateText({
      prompt,
      maxTokens: 500,
      temperature: 0.4
    });

    return response.text;
  }

  /**
   * 協調計画の生成
   */
  private async generateCoordinationPlan(
    subagents: Subagent[], 
    taskBreakdown: Map<string, string>, 
    analysis: TaskAnalysisResult
  ): Promise<string> {
    return `協調計画:
- 実行戦略: ${analysis.parallelizable ? '並列実行' : '順次実行'}
- 参加エージェント: ${subagents.map(s => s.name).join(', ')}
- リスクレベル: ${analysis.riskLevel}
- 推定時間: ${analysis.estimatedTime}分
- 依存関係: ${analysis.dependencies.join(', ') || 'なし'}`;
  }

  /**
   * メトリクス計算
   */
  private calculateMetrics(
    results: SubagentResult[], 
    executionTime: number, 
    subagentsUsed: number
  ): CollaborationMetrics {
    const successfulSteps = results.filter(r => r.status === 'success').length;
    const totalTokensUsed = results.reduce((sum, r) => sum + (r.tokensUsed || 0), 0);
    
    return {
      totalSteps: results.length,
      successfulSteps,
      totalTokensUsed,
      averageResponseTime: executionTime / results.length,
      subagentsUsed,
      subtasksCreated: results.length
    };
  }

  /**
   * 型変換ヘルパー
   */
  private convertToTaskAnalysis(analysis: TaskAnalysisResult): TaskAnalysis {
    return {
      originalTask: '', // 元のタスクは別途設定
      requiredSpecialties: analysis.requiredSpecialties,
      complexity: analysis.complexity,
      estimatedTime: analysis.estimatedTime,
      requiredSteps: analysis.estimatedSubagents,
      riskFactors: [analysis.riskLevel],
      successCriteria: ['すべてのサブエージェントが正常に完了']
    };
  }

  /**
   * 進捗ハンドラー
   */
  private handleProgress(message: string, type: 'info' | 'success' | 'error' | 'progress') {
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  /**
   * タスクID生成
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * チェックポイント保存
   */
  private async saveCheckpoint(taskId: string, data: unknown): Promise<void> {
    if (this.config.enableCheckpointing) {
      this.checkpointData.set(taskId, {
        data,
        timestamp: Date.now()
      });
    }
  }

  /**
   * チェックポイント復元
   */
  private async restoreCheckpoint(taskId: string): Promise<unknown | null> {
    return this.checkpointData.get(taskId) || null;
  }
} 