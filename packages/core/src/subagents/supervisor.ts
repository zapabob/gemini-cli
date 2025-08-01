/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Subagent, SubagentSpecialty } from '../config/subagents.js';
import { SubagentExecutor, SubagentTask, SubagentResult } from './executor.js';
import { GeminiClient } from './geminiClient.js';

/**
 * 監督者エージェントの役割定義
 */
export interface SupervisorRole {
  id: string;
  name: string;
  description: string;
  responsibilities: string[];
  decisionMakingAuthority: 'high' | 'medium' | 'low';
  coordinationStyle: 'autocratic' | 'democratic' | 'laissez-faire';
}

/**
 * サブエージェントタスクの依存関係
 */
export interface TaskDependency {
  taskId: string;
  dependsOn: string[];
  requiredOutputs: string[];
  blocking: boolean;
}

/**
 * 監督者エージェントの設定
 */
export interface SupervisorConfig {
  role: SupervisorRole;
  maxSubagents: number;
  coordinationStrategy: 'sequential' | 'parallel' | 'hybrid';
  decisionThreshold: number;
  progressReporting: boolean;
  errorHandling: 'strict' | 'flexible' | 'adaptive';
}

/**
 * 監督者エージェントの実行結果
 */
export interface SupervisorResult {
  success: boolean;
  finalOutput: string;
  subagentResults: SubagentResult[];
  coordinationLog: string[];
  executionTime: number;
  decisions: DecisionLog[];
  errors: string[];
}

/**
 * 決定ログ
 */
export interface DecisionLog {
  timestamp: Date;
  decision: string;
  reasoning: string;
  subagentId?: string;
  impact: 'high' | 'medium' | 'low';
}

/**
 * 監督者エージェント
 * メインエージェントが監督者として機能し、サブエージェントが専門的なタスクを分担
 */
export class SupervisorAgent {
  private config: SupervisorConfig;
  private executor: SubagentExecutor;
  private geminiClient: GeminiClient;
  private decisionLog: DecisionLog[] = [];
  private coordinationLog: string[] = [];

  constructor(config: SupervisorConfig) {
    this.config = config;
    this.geminiClient = new GeminiClient({
      apiKey: process.env.GEMINI_API_KEY || 'mock-api-key',
      defaultModel: 'models/gemini-1.5-flash',
      defaultTemperature: 0.7,
      defaultMaxTokens: 4096
    });
    this.executor = new SubagentExecutor({
      geminiClient: this.geminiClient,
      maxConcurrent: config.maxSubagents,
      onProgress: this.handleProgress.bind(this)
    });
  }

  /**
   * 監督者としてのタスク実行
   * 例: Aという実装の監督
   */
  async superviseImplementation(
    implementationGoal: string,
    subagents: Subagent[],
    context?: string
  ): Promise<SupervisorResult> {
    const startTime = Date.now();
    this.coordinationLog = [];
    this.decisionLog = [];

    try {
      // 1. 初期分析と計画立案
      this.logCoordination('🎯 実装目標の分析開始');
      const _analysis = await this.analyzeImplementationGoal(implementationGoal, context);
      
      // 2. サブエージェントの役割割り当て
      this.logCoordination('👥 サブエージェントの役割割り当て');
      const taskAssignments = await this.assignSubagentRoles(subagents, _analysis);
      
      // 3. 並列実行の調整
      this.logCoordination('⚡ 並列実行の開始');
      const results = await this.coordinateParallelExecution(taskAssignments);
      
      // 4. 結果の統合と最終決定
      this.logCoordination('🔍 結果の統合と最終決定');
      const finalOutput = await this.integrateResults(results, implementationGoal);
      
      const executionTime = Date.now() - startTime;
      
      return {
        success: true,
        finalOutput,
        subagentResults: results,
        coordinationLog: this.coordinationLog,
        executionTime,
        decisions: this.decisionLog,
        errors: []
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        finalOutput: '',
        subagentResults: [],
        coordinationLog: this.coordinationLog,
        executionTime,
        decisions: this.decisionLog,
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * 実装目標の分析
   */
  private async analyzeImplementationGoal(
    goal: string, 
    context?: string
  ): Promise<{
    requirements: string[];
    constraints: string[];
    dependencies: string[];
    successCriteria: string[];
    riskFactors: string[];
  }> {
    const prompt = `
あなたは優秀なプロジェクト監督者です。以下の実装目標を分析してください：

**実装目標**: ${goal}
${context ? `**コンテキスト**: ${context}` : ''}

以下の観点で分析してください：
1. 必要な要件
2. 制約条件
3. 依存関係
4. 成功基準
5. リスク要因

分析結果を構造化して返してください。
    `;

    const _response = await this.geminiClient.generateText({ prompt });
    this.logDecision('実装目標の分析完了', '分析結果を基にサブエージェントの役割を決定', 'high');
    
    // 実際の実装では、レスポンスをパースして構造化データを返す
    return {
      requirements: ['要件1', '要件2'],
      constraints: ['制約1', '制約2'],
      dependencies: ['依存1', '依存2'],
      successCriteria: ['基準1', '基準2'],
      riskFactors: ['リスク1', 'リスク2']
    };
  }

  /**
   * サブエージェントの役割割り当て
   */
  private async assignSubagentRoles(
    subagents: Subagent[],
    _analysis: unknown
  ): Promise<Map<string, SubagentTask>> {
    const taskAssignments = new Map<string, SubagentTask>();
    
    // サブエージェントの専門性に基づいてタスクを割り当て
    for (const subagent of subagents) {
      let task: SubagentTask;
      
      switch (subagent.specialty) {
        case 'documentation':
          // サブエージェント1: DeepResearchで最新ドキュメンテーション
          task = {
            id: `task-${subagent.id}-research`,
            task: `最新のドキュメンテーションを調査し、実装に必要な情報を収集してください。
            特に以下の点に注目してください：
            - 最新の技術仕様
            - ベストプラクティス
            - 関連するライブラリやフレームワーク
            - セキュリティ要件
            - パフォーマンス要件`,
            priority: 'high',
            dependencies: [],
            metadata: { type: 'research', target: 'documentation' }
          };
          break;
          
        case 'architecture_design':
          // メインエージェント: 実装の指針を立てる
          task = {
            id: `task-${subagent.id}-planning`,
            task: `収集された情報を基に、実装の指針を立ててください。
            以下の点を含めてください：
            - アーキテクチャ設計
            - 技術スタックの選択
            - 実装順序の決定
            - リスク対策
            - 品質基準`,
            priority: 'urgent',
            dependencies: ['task-*-research'],
            metadata: { type: 'planning', target: 'architecture' }
          };
          break;
          
        case 'frontend_development':
        case 'backend_development':
          // サブエージェント3: 実際の実装
          task = {
            id: `task-${subagent.id}-implementation`,
            task: `設計された指針に基づいて、実際の実装を行ってください。
            以下の点に注意してください：
            - コードの品質
            - パフォーマンス
            - セキュリティ
            - テスト可能性
            - 保守性`,
            priority: 'high',
            dependencies: ['task-*-planning'],
            metadata: { type: 'implementation', target: 'development' }
          };
          break;
          
        default:
          // その他の専門性
          task = {
            id: `task-${subagent.id}-support`,
            task: `実装プロセスをサポートしてください。
            専門性を活かして、必要に応じて支援を行ってください。`,
            priority: 'medium',
            dependencies: [],
            metadata: { type: 'support', target: 'general' }
          };
      }
      
      taskAssignments.set(subagent.id, task);
    }
    
    this.logDecision('サブエージェントの役割割り当て完了', `${subagents.length}個のサブエージェントにタスクを割り当て`, 'high');
    return taskAssignments;
  }

  /**
   * 並列実行の調整
   */
  private async coordinateParallelExecution(
    taskAssignments: Map<string, SubagentTask>
  ): Promise<SubagentResult[]> {
    const subagents = await this.getSubagentsByIds(Array.from(taskAssignments.keys()));
    const tasks = Array.from(taskAssignments.values());
    
    // 依存関係を考慮した並列実行
    const results: SubagentResult[] = [];
    
    // 依存関係のないタスクを最初に実行
    const independentTasks = tasks.filter(task => !task.dependencies || task.dependencies.length === 0);
    const dependentTasks = tasks.filter(task => task.dependencies && task.dependencies.length > 0);
    
    // 独立タスクの並列実行
    if (independentTasks.length > 0) {
      this.logCoordination('🚀 独立タスクの並列実行開始');
      const independentSubagents = subagents.filter(subagent => 
        independentTasks.some(task => task.id.includes(subagent.id))
      );
      const independentResults = await this.executor.executeParallel(
        independentSubagents,
        independentTasks[0] // 簡略化のため
      );
      results.push(...independentResults);
    }
    
    // 依存タスクの順次実行
    for (const task of dependentTasks) {
      this.logCoordination(`⏳ 依存タスクの実行: ${task.id}`);
      const dependentSubagent = subagents.find(subagent => task.id.includes(subagent.id));
      if (dependentSubagent) {
        const result = await this.executor.executeTask(dependentSubagent, task);
        results.push(result);
      }
    }
    
    return results;
  }

  /**
   * 結果の統合と最終決定
   */
  private async integrateResults(
    results: SubagentResult[],
    originalGoal: string
  ): Promise<string> {
    const prompt = `
以下のサブエージェントの結果を統合し、最終的な実装計画を作成してください：

**元の目標**: ${originalGoal}

**サブエージェントの結果**:
${results.map(result => `
- ${result.subagentId}: ${result.result}
`).join('')}

統合された結果を構造化して返してください。
    `;

    const _response = await this.geminiClient.generateText({ prompt });
    this.logDecision('結果の統合完了', 'サブエージェントの結果を統合して最終計画を作成', 'high');
    
    return _response.text || _response.toString();
  }

  /**
   * 進捗の処理
   */
  private handleProgress(message: string, type: 'info' | 'success' | 'error' | 'progress') {
    this.logCoordination(`${type === 'progress' ? '🔄' : type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} ${message}`);
  }

  /**
   * 調整ログの記録
   */
  private logCoordination(message: string) {
    this.coordinationLog.push(`[${new Date().toISOString()}] ${message}`);
    if (this.config.progressReporting) {
      console.log(`[Supervisor] ${message}`);
    }
  }

  /**
   * 決定ログの記録
   */
  private logDecision(decision: string, reasoning: string, impact: 'high' | 'medium' | 'low') {
    this.decisionLog.push({
      timestamp: new Date(),
      decision,
      reasoning,
      impact
    });
  }

  /**
   * サブエージェントの取得（簡略化）
   */
  private async getSubagentsByIds(ids: string[]): Promise<Subagent[]> {
    // 実際の実装では、SubagentConfigから取得
    return ids.map(id => ({
      id,
      name: `Subagent-${id}`,
      description: 'Specialized subagent',
      specialty: 'custom' as SubagentSpecialty,
      prompt: 'You are a specialized subagent.',
      maxTokens: 4000,
      temperature: 0.7,
      status: 'idle',
      createdAt: new Date().toISOString(),
      taskHistory: [],
      customTools: [],
      isActive: true
    }));
  }
} 