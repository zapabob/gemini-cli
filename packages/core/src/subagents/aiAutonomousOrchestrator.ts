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
 * AI自律的オーケストレーター設定
 */
export interface AIAutonomousOrchestratorConfig {
  geminiClient: GeminiClient;
  maxSubagents: number;
  enableAutoAnalysis: boolean;
  enableRealTimeCoordination: boolean;
  decisionThreshold: number;
  timeout: number;
  enableCheckpointing: boolean;
  checkpointInterval: number; // 秒
  enableAutoSubagentSelection: boolean;
  enableDynamicTaskBreakdown: boolean;
  enableIntelligentCoordination: boolean;
}

/**
 * AI自律的タスク分析結果
 */
export interface AIAutonomousTaskAnalysis {
  originalTask: string;
  complexity: number;
  requiredSpecialties: SubagentSpecialty[];
  estimatedSubagents: number;
  parallelizable: boolean;
  dependencies: string[];
  riskLevel: 'low' | 'medium' | 'high';
  estimatedTime: number;
  subtasks: string[];
  coordinationStrategy: 'parallel' | 'sequential' | 'hybrid' | 'adaptive';
  priority: 'low' | 'medium' | 'high';
  autoResearchRequired: boolean;
  researchQuery?: string;
}

/**
 * AI自律的サブエージェント選択結果
 */
export interface AIAutonomousSubagentSelection {
  selectedSubagents: Subagent[];
  assignmentStrategy: 'parallel' | 'sequential' | 'hybrid' | 'adaptive';
  taskBreakdown: Map<string, string>;
  coordinationPlan: string;
  executionOrder: string[];
  parallelGroups: string[][];
  fallbackPlan: string;
}

/**
 * AI自律的オーケストレーター
 * AI側でサブエージェントを自律的に呼び出して作業を分担させる
 */
export class AIAutonomousOrchestrator {
  private config: AIAutonomousOrchestratorConfig;
  private executor: SubagentExecutor;
  private geminiClient: GeminiClient;
  private activeSessions: Map<string, unknown> = new Map();
  private checkpointData: Map<string, unknown> = new Map();
  private taskHistory: Map<string, AIAutonomousTaskAnalysis> = new Map();

  constructor(config: AIAutonomousOrchestratorConfig) {
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
   * AI側からの自律的タスク実行
   */
  async executeAIAutonomousTask(
    task: string,
    context?: string,
    options?: CollaborativeTaskOptions
  ): Promise<CollaborativeTaskResult> {
    const taskId = this.generateTaskId();
    const startTime = Date.now();
    
    try {
      console.log(`🤖 AI自律的タスク実行開始: ${task}`);
      
      // 1. AI自律的タスク分析
      const analysis = await this.analyzeAITask(task, context);
      console.log(`📊 AIタスク分析完了: 複雑度 ${analysis.complexity}, 必要専門分野 ${analysis.requiredSpecialties.length}個`);
      
      // 2. AI自律的サブエージェント選択
      const selection = await this.selectAISubagents(analysis, task);
      console.log(`👥 AIサブエージェント選択完了: ${selection.selectedSubagents.length}個のエージェントを選択`);
      
      // 3. AI自律的タスク分割と実行
      const results = await this.executeWithAISubagents(selection, task, context, options);
      console.log(`⚡ AI自律的タスク実行完了: ${results.length}個の結果を統合`);
      
      // 4. AI自律的結果統合
      const integratedResult = await this.integrateAIResults(results, task, analysis);
      console.log(`🔗 AI結果統合完了`);
      
      // 5. メトリクス計算
      const executionTime = Date.now() - startTime;
      const metrics = this.calculateAIMetrics(results, executionTime, selection.selectedSubagents.length);
      
      // 6. 実装ログ保存
      await this.saveAIImplementationLog(taskId, task, analysis, selection, results, integratedResult);
      
      return {
        success: true,
        finalResult: integratedResult,
        mainAgentAnalysis: this.convertToTaskAnalysis(analysis),
        subagentResults: results,
        executionTime,
        collaborationMetrics: metrics,
        taskId
      };
      
    } catch (error) {
      console.error(`❌ AI自律的タスク実行エラー: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        taskId,
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * AI自律的タスク分析
   */
  private async analyzeAITask(task: string, context?: string): Promise<AIAutonomousTaskAnalysis> {
    const prompt = `
以下のタスクを分析して、AI自律的実行に必要な情報を抽出してください：

タスク: ${task}
コンテキスト: ${context || 'なし'}

以下の項目を分析してください：
1. タスクの複雑度（1-10）
2. 必要な専門分野
3. 推定サブエージェント数
4. 並列実行可能性
5. 依存関係
6. リスクレベル
7. 推定実行時間
8. サブタスク分割
9. 協調戦略
10. 優先度
11. 自動リサーチ必要性
12. リサーチクエリ（必要な場合）

JSON形式で回答してください。
`;

    try {
      const response = await this.geminiClient.generateText({ prompt });
      const analysis = JSON.parse(response.text);
      
      return {
        originalTask: task,
        complexity: analysis.complexity || 5,
        requiredSpecialties: analysis.requiredSpecialties || [],
        estimatedSubagents: analysis.estimatedSubagents || 1,
        parallelizable: analysis.parallelizable || false,
        dependencies: analysis.dependencies || [],
        riskLevel: analysis.riskLevel || 'medium',
        estimatedTime: analysis.estimatedTime || 300,
        subtasks: analysis.subtasks || [task],
        coordinationStrategy: analysis.coordinationStrategy || 'adaptive',
        priority: analysis.priority || 'medium',
        autoResearchRequired: analysis.autoResearchRequired || false,
        researchQuery: analysis.researchQuery
      };
    } catch (error) {
      console.warn(`⚠️ AIタスク分析エラー、フォールバック分析を使用: ${error}`);
      return this.fallbackAIAnalysis(task);
    }
  }

  /**
   * AI自律的サブエージェント選択
   */
  private async selectAISubagents(analysis: AIAutonomousTaskAnalysis, task: string): Promise<AIAutonomousSubagentSelection> {
    const availableSubagents = await this.getAvailableSubagents();
    
    const prompt = `
以下のタスクと分析結果に基づいて、最適なサブエージェントを選択してください：

タスク: ${task}
分析結果: ${JSON.stringify(analysis, null, 2)}
利用可能なサブエージェント: ${JSON.stringify(availableSubagents.map(s => ({ id: s.id, name: s.name, specialty: s.specialty })), null, 2)}

以下の項目を決定してください：
1. 選択するサブエージェント
2. 割り当て戦略（parallel/sequential/hybrid/adaptive）
3. タスク分割
4. 協調計画
5. 実行順序
6. 並列グループ
7. フォールバック計画

JSON形式で回答してください。
`;

    try {
      const response = await this.geminiClient.generateContent(prompt);
      const selection = JSON.parse(response);
      
      const selectedSubagents = availableSubagents.filter(s => 
        selection.selectedSubagents.includes(s.id)
      );
      
      return {
        selectedSubagents,
        assignmentStrategy: selection.assignmentStrategy || 'adaptive',
        taskBreakdown: new Map(Object.entries(selection.taskBreakdown || {})),
        coordinationPlan: selection.coordinationPlan || '',
        executionOrder: selection.executionOrder || [],
        parallelGroups: selection.parallelGroups || [],
        fallbackPlan: selection.fallbackPlan || ''
      };
    } catch (error) {
      console.warn(`⚠️ AIサブエージェント選択エラー、フォールバック選択を使用: ${error}`);
      return this.fallbackAISubagentSelection(analysis, availableSubagents);
    }
  }

  /**
   * AI自律的タスク分割と実行
   */
  private async executeWithAISubagents(
    selection: AIAutonomousSubagentSelection,
    originalTask: string,
    context?: string,
    options?: CollaborativeTaskOptions
  ): Promise<SubagentResult[]> {
    const results: SubagentResult[] = [];
    
    try {
      // 適応的実行戦略
      if (selection.assignmentStrategy === 'adaptive') {
        return await this.executeAdaptiveStrategy(selection, originalTask, context, options);
      }
      
      // 並列実行
      if (selection.assignmentStrategy === 'parallel') {
        const parallelTasks = Array.from(selection.taskBreakdown.entries()).map(([subagentId, subtask]) => ({
          subagentId,
          task: subtask,
          context
        }));
        
        return await this.executor.executeParallel(selection.selectedSubagents, {
          tasks: parallelTasks,
          coordinationPlan: selection.coordinationPlan,
          timeout: this.config.timeout,
          onProgress: this.handleProgress.bind(this)
        });
      }
      
      // 順次実行
      if (selection.assignmentStrategy === 'sequential') {
        for (const [subagentId, subtask] of selection.taskBreakdown) {
          const subagent = selection.selectedSubagents.find(s => s.id === subagentId);
          if (subagent) {
            const result = await this.executor.executeSequential([subagent], {
              task: subtask,
              context,
              timeout: this.config.timeout,
              onProgress: this.handleProgress.bind(this)
            });
            results.push(...result);
          }
        }
        return results;
      }
      
      // ハイブリッド実行
      if (selection.assignmentStrategy === 'hybrid') {
        return await this.executeHybridStrategy(selection, originalTask, context, options);
      }
      
      // デフォルトは適応的実行
      return await this.executeAdaptiveStrategy(selection, originalTask, context, options);
      
    } catch (error) {
      console.error(`❌ AI自律的タスク実行エラー: ${error}`);
      throw error;
    }
  }

  /**
   * 適応的実行戦略
   */
  private async executeAdaptiveStrategy(
    selection: AIAutonomousSubagentSelection,
    originalTask: string,
    context?: string,
    options?: CollaborativeTaskOptions
  ): Promise<SubagentResult[]> {
    const results: SubagentResult[] = [];
    
    // 動的に実行戦略を決定
    const strategy = await this.determineAdaptiveStrategy(selection, originalTask);
    
    if (strategy === 'parallel') {
      const parallelTasks = Array.from(selection.taskBreakdown.entries()).map(([subagentId, subtask]) => ({
        subagentId,
        task: subtask,
        context
      }));
      
      return await this.executor.executeParallel(selection.selectedSubagents, {
        tasks: parallelTasks,
        coordinationPlan: selection.coordinationPlan,
        timeout: this.config.timeout,
        onProgress: this.handleProgress.bind(this)
      });
    }
    
    if (strategy === 'sequential') {
      for (const [subagentId, subtask] of selection.taskBreakdown) {
        const subagent = selection.selectedSubagents.find(s => s.id === subagentId);
        if (subagent) {
          const result = await this.executor.executeSequential([subagent], {
            task: subtask,
            context,
            timeout: this.config.timeout,
            onProgress: this.handleProgress.bind(this)
          });
          results.push(...result);
        }
      }
      return results;
    }
    
    // デフォルトはハイブリッド
    return await this.executeHybridStrategy(selection, originalTask, context, options);
  }

  /**
   * ハイブリッド実行戦略
   */
  private async executeHybridStrategy(
    selection: AIAutonomousSubagentSelection,
    originalTask: string,
    context?: string,
    options?: CollaborativeTaskOptions
  ): Promise<SubagentResult[]> {
    const results: SubagentResult[] = [];
    
    // 並列グループごとに実行
    for (const group of selection.parallelGroups) {
      const groupSubagents = selection.selectedSubagents.filter(s => 
        group.includes(s.id)
      );
      
      const groupTasks = group.map(subagentId => {
        const subtask = selection.taskBreakdown.get(subagentId);
        return { subagentId, task: subtask || originalTask, context };
      });
      
      const groupResults = await this.executor.executeParallel(groupSubagents, {
        tasks: groupTasks,
        coordinationPlan: selection.coordinationPlan,
        timeout: this.config.timeout,
        onProgress: this.handleProgress.bind(this)
      });
      
      results.push(...groupResults);
    }
    
    return results;
  }

  /**
   * 適応的戦略決定
   */
  private async determineAdaptiveStrategy(
    selection: AIAutonomousSubagentSelection,
    originalTask: string
  ): Promise<'parallel' | 'sequential' | 'hybrid'> {
    const prompt = `
以下の条件に基づいて、最適な実行戦略を決定してください：

タスク: ${originalTask}
サブエージェント数: ${selection.selectedSubagents.length}
タスク分割: ${JSON.stringify(Array.from(selection.taskBreakdown.entries()))}
並列グループ: ${JSON.stringify(selection.parallelGroups)}

実行戦略の選択基準：
- parallel: 独立したタスクで並列実行可能
- sequential: 依存関係があるタスク
- hybrid: 部分的に並列実行可能

戦略を選択してください（parallel/sequential/hybrid）
`;

    try {
      const response = await this.geminiClient.generateContent(prompt);
      const strategy = response.trim().toLowerCase();
      
      if (['parallel', 'sequential', 'hybrid'].includes(strategy)) {
        return strategy as 'parallel' | 'sequential' | 'hybrid';
      }
      
      return 'hybrid'; // デフォルト
    } catch (error) {
      console.warn(`⚠️ 適応的戦略決定エラー、ハイブリッド戦略を使用: ${error}`);
      return 'hybrid';
    }
  }

  /**
   * AI自律的結果統合
   */
  private async integrateAIResults(
    results: SubagentResult[],
    originalTask: string,
    analysis: AIAutonomousTaskAnalysis
  ): Promise<IntegratedResult> {
    const prompt = `
以下の結果を統合して、元のタスクに対する完全な回答を作成してください：

元のタスク: ${originalTask}
分析結果: ${JSON.stringify(analysis, null, 2)}
サブエージェント結果: ${JSON.stringify(results, null, 2)}

統合の際は以下を考慮してください：
1. 結果の一貫性
2. 重複の除去
3. 矛盾の解決
4. 優先度の考慮
5. 元のタスクとの整合性

統合された結果を返してください。
`;

    try {
      const integratedContent = await this.geminiClient.generateContent(prompt);
      
      return {
        content: integratedContent,
        metadata: {
          originalTask,
          subagentCount: results.length,
          analysis: analysis,
          integrationMethod: 'AI_autonomous'
        }
      };
    } catch (error) {
      console.error(`❌ AI結果統合エラー: ${error}`);
      throw error;
    }
  }

  /**
   * AIメトリクス計算
   */
  private calculateAIMetrics(
    results: SubagentResult[],
    executionTime: number,
    subagentsUsed: number
  ): CollaborationMetrics {
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    const successRate = totalCount > 0 ? (successCount / totalCount) * 100 : 0;
    
    return {
      totalSubagents: subagentsUsed,
      successfulSubagents: successCount,
      failedSubagents: totalCount - successCount,
      successRate,
      averageExecutionTime: executionTime / totalCount,
      totalExecutionTime: executionTime,
      coordinationEfficiency: this.calculateCoordinationEfficiency(results),
      resourceUtilization: this.calculateResourceUtilization(results, executionTime)
    };
  }

  /**
   * 協調効率計算
   */
  private calculateCoordinationEfficiency(results: SubagentResult[]): number {
    if (results.length === 0) return 0;
    
    const successfulResults = results.filter(r => r.success);
    const coordinationScore = successfulResults.reduce((score, result) => {
      // 結果の品質と協調度を評価
      const qualityScore = result.quality || 0.5;
      const coordinationScore = result.coordination || 0.5;
      return score + (qualityScore + coordinationScore) / 2;
    }, 0);
    
    return coordinationScore / results.length;
  }

  /**
   * リソース利用率計算
   */
  private calculateResourceUtilization(results: SubagentResult[], executionTime: number): number {
    if (results.length === 0) return 0;
    
    const totalWorkTime = results.reduce((total, result) => {
      return total + (result.executionTime || 0);
    }, 0);
    
    const maxPossibleTime = results.length * executionTime;
    return maxPossibleTime > 0 ? (totalWorkTime / maxPossibleTime) * 100 : 0;
  }

  /**
   * 利用可能なサブエージェント取得
   */
  private async getAvailableSubagents(): Promise<Subagent[]> {
    // 実際のサブエージェント設定から取得
    return [
      {
        id: 'code_reviewer',
        name: 'コードレビュアー',
        specialty: 'code_review' as SubagentSpecialty,
        description: 'コードレビュー専門家',
        isActive: true
      },
      {
        id: 'debugger',
        name: 'デバッガー',
        specialty: 'debugging' as SubagentSpecialty,
        description: 'デバッグ専門家',
        isActive: true
      },
      {
        id: 'data_analyst',
        name: 'データアナリスト',
        specialty: 'data_analysis' as SubagentSpecialty,
        description: 'データ分析専門家',
        isActive: true
      },
      {
        id: 'security_auditor',
        name: 'セキュリティ監査官',
        specialty: 'security_audit' as SubagentSpecialty,
        description: 'セキュリティ監査専門家',
        isActive: true
      },
      {
        id: 'performance_optimizer',
        name: 'パフォーマンス最適化者',
        specialty: 'performance_optimization' as SubagentSpecialty,
        description: 'パフォーマンス最適化専門家',
        isActive: true
      },
      {
        id: 'documentation_writer',
        name: 'ドキュメント作成者',
        specialty: 'documentation' as SubagentSpecialty,
        description: 'ドキュメント作成専門家',
        isActive: true
      },
      {
        id: 'tester',
        name: 'テスター',
        specialty: 'testing' as SubagentSpecialty,
        description: 'テスト専門家',
        isActive: true
      },
      {
        id: 'architect',
        name: 'アーキテクト',
        specialty: 'architecture_design' as SubagentSpecialty,
        description: 'アーキテクチャ設計専門家',
        isActive: true
      }
    ];
  }

  /**
   * フォールバックAI分析
   */
  private fallbackAIAnalysis(task: string): AIAutonomousTaskAnalysis {
    return {
      originalTask: task,
      complexity: 5,
      requiredSpecialties: ['custom' as SubagentSpecialty],
      estimatedSubagents: 1,
      parallelizable: false,
      dependencies: [],
      riskLevel: 'medium',
      estimatedTime: 300,
      subtasks: [task],
      coordinationStrategy: 'sequential',
      priority: 'medium',
      autoResearchRequired: false
    };
  }

  /**
   * フォールバックAIサブエージェント選択
   */
  private async fallbackAISubagentSelection(
    analysis: AIAutonomousTaskAnalysis,
    availableSubagents: Subagent[]
  ): Promise<AIAutonomousSubagentSelection> {
    const selectedSubagents = availableSubagents.slice(0, Math.min(analysis.estimatedSubagents, availableSubagents.length));
    
    return {
      selectedSubagents,
      assignmentStrategy: 'sequential',
      taskBreakdown: new Map([[selectedSubagents[0]?.id || 'default', analysis.originalTask]]),
      coordinationPlan: 'シーケンシャル実行',
      executionOrder: [selectedSubagents[0]?.id || 'default'],
      parallelGroups: [],
      fallbackPlan: '単一サブエージェントで実行'
    };
  }

  /**
   * 進捗ハンドラー
   */
  private handleProgress(message: string, type: 'info' | 'success' | 'error' | 'progress') {
    console.log(`🤖 AI自律的オーケストレーター: ${message}`);
  }

  /**
   * タスクID生成
   */
  private generateTaskId(): string {
    return `ai_autonomous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * AI実装ログ保存
   */
  private async saveAIImplementationLog(
    taskId: string,
    task: string,
    analysis: AIAutonomousTaskAnalysis,
    selection: AIAutonomousSubagentSelection,
    results: SubagentResult[],
    integratedResult: IntegratedResult
  ): Promise<void> {
    const logData = {
      taskId,
      timestamp: new Date().toISOString(),
      task,
      analysis,
      selection,
      results,
      integratedResult
    };
    
    // 実装ログを保存
    this.taskHistory.set(taskId, analysis);
    
    console.log(`📝 AI実装ログ保存完了: ${taskId}`);
  }

  /**
   * TaskAnalysis変換
   */
  private convertToTaskAnalysis(analysis: AIAutonomousTaskAnalysis): TaskAnalysis {
    return {
      complexity: analysis.complexity,
      requiredSpecialties: analysis.requiredSpecialties,
      estimatedSubagents: analysis.estimatedSubagents,
      parallelizable: analysis.parallelizable,
      dependencies: analysis.dependencies,
      riskLevel: analysis.riskLevel,
      estimatedTime: analysis.estimatedTime
    };
  }
} 