/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { GeminiClient } from './geminiClient.js';
import { Subagent, SubagentSpecialty } from '../config/subagents.js';
import { CollaborativeTaskOptions, CollaborativeTaskResult } from './types.js';
import { AutonomousOrchestrator } from './autonomousOrchestrator.js';
import { DeepResearchTool } from '../tools/deep-research.js';
import { Config } from '../config/config.js';
import fs from 'node:fs';
import path from 'node:path';

/**
 * 自然言語プロンプト解析結果
 */
export interface NaturalLanguageAnalysis {
  originalPrompt: string;
  mainTask: string;
  subtasks: string[];
  requiredSpecialties: SubagentSpecialty[];
  parallelizable: boolean;
  estimatedComplexity: number;
  requiresResearch: boolean;
  researchQuery?: string;
  executionStrategy: 'parallel' | 'sequential' | 'hybrid';
  priority: 'low' | 'medium' | 'high';
  estimatedTime: number;
  dependencies: string[];
}

/**
 * タスク分割結果
 */
export interface TaskBreakdown {
  mainTask: string;
  subtasks: Map<string, string>;
  subagentAssignments: Map<string, Subagent>;
  coordinationPlan: string;
  executionOrder: string[];
  parallelGroups: string[][];
}

/**
 * 自然言語プロンプトプロセッサー設定
 */
export interface NaturalLanguageProcessorConfig {
  geminiClient: GeminiClient;
  config: Config;
  enableAutoResearch: boolean;
  enableParallelExecution: boolean;
  maxConcurrentTasks: number;
  researchOutputPath: string;
  enableCheckpointing: boolean;
  autoSaveInterval: number; // 秒
}

/**
 * 自然言語プロンプトプロセッサー
 * 自然言語のプロンプトを解析して並列作業を自律的に分担する
 */
export class NaturalLanguageProcessor {
  private config: NaturalLanguageProcessorConfig;
  private orchestrator: AutonomousOrchestrator;
  private deepResearchTool: DeepResearchTool;
  private geminiClient: GeminiClient;
  private activeTasks: Map<string, unknown> = new Map();
  private checkpointData: Map<string, unknown> = new Map();

  constructor(config: NaturalLanguageProcessorConfig) {
    this.config = config;
    this.geminiClient = config.geminiClient;
    this.deepResearchTool = new DeepResearchTool(config.config);
    
    // 自律的オーケストレーターの初期化
    this.orchestrator = new AutonomousOrchestrator({
      geminiClient: this.geminiClient,
      maxSubagents: config.maxConcurrentTasks,
      enableAutoAnalysis: true,
      enableRealTimeCoordination: true,
      decisionThreshold: 0.7,
      timeout: 300,
      enableCheckpointing: config.enableCheckpointing,
      checkpointInterval: config.autoSaveInterval
    });
  }

  /**
   * 自然言語プロンプトを処理して並列作業を実行
   */
  async processNaturalLanguagePrompt(
    prompt: string,
    context?: string,
    options?: CollaborativeTaskOptions
  ): Promise<CollaborativeTaskResult> {
    const taskId = this.generateTaskId();
    const startTime = Date.now();
    
    try {
      console.log(`🤖 自然言語プロンプト処理開始: ${prompt.substring(0, 100)}...`);
      
      // 1. 自然言語プロンプトの解析
      const analysis = await this.analyzeNaturalLanguagePrompt(prompt, context);
      console.log(`📊 プロンプト解析完了: ${analysis.subtasks.length}個のサブタスク, 並列化可能: ${analysis.parallelizable}`);
      
      // 2. リサーチが必要な場合は実行
      let researchResult: string | undefined;
      if (analysis.requiresResearch && analysis.researchQuery) {
        console.log(`🔍 リサーチ実行開始: ${analysis.researchQuery}`);
        researchResult = await this.executeResearch(analysis.researchQuery, taskId);
        console.log(`✅ リサーチ完了: ${researchResult ? '成功' : '失敗'}`);
      }
      
      // 3. タスク分割とサブエージェント割り当て
      const breakdown = await this.breakdownTasks(analysis, researchResult);
      console.log(`📋 タスク分割完了: ${breakdown.subtasks.size}個のサブタスク, ${breakdown.parallelGroups.length}個の並列グループ`);
      
      // 4. 並列実行
      const results = await this.executeParallelTasks(breakdown, analysis, options);
      console.log(`🚀 並列実行完了: ${results.length}個のタスク完了`);
      
      // 5. 結果統合
      const integratedResult = await this.integrateResults(results, analysis, researchResult);
      console.log(`🔗 結果統合完了`);
      
      // 6. 実装ログの保存
      await this.saveImplementationLog(taskId, prompt, analysis, breakdown, results, integratedResult);
      
      const executionTime = Date.now() - startTime;
      
      return {
        taskId,
        success: true,
        finalResult: {
          finalResult: integratedResult,
          qualityScore: 0.8,
          confidenceLevel: 0.7,
          recommendations: []
        },
        executionTime,
        collaborationMetrics: {
          totalSteps: results.length,
          successfulSteps: results.filter(r => r.success).length,
          averageResponseTime: executionTime / results.length,
          totalTokensUsed: 0,
          subagentsUsed: results.length
        }
      };
      
    } catch (error) {
      console.error(`❌ 自然言語プロンプト処理エラー:`, error);
      return {
        taskId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * 自然言語プロンプトを解析
   */
  private async analyzeNaturalLanguagePrompt(
    prompt: string,
    context?: string
  ): Promise<NaturalLanguageAnalysis> {
    const analysisPrompt = `
以下の自然言語プロンプトを解析して、タスクの構造と実行戦略を決定してください。

プロンプト: ${prompt}
${context ? `コンテキスト: ${context}` : ''}

利用可能なサブエージェント専門分野:
- code_review: コードレビューと品質保証
- debugging: デバッグとトラブルシューティング
- data_analysis: データ分析と統計
- security_audit: セキュリティ監査
- performance_optimization: パフォーマンス最適化
- documentation: ドキュメント作成
- testing: テスト戦略と品質保証
- architecture_design: システム設計
- api_design: API設計
- database_optimization: データベース最適化
- frontend_development: フロントエンド開発
- backend_development: バックエンド開発
- devops: DevOpsとインフラ管理
- machine_learning: 機械学習

以下のJSON形式で回答してください:
{
  "mainTask": "メインタスクの要約",
  "subtasks": ["サブタスク1", "サブタスク2", ...],
  "requiredSpecialties": ["必要な専門分野1", "必要な専門分野2", ...],
  "parallelizable": true/false,
  "estimatedComplexity": 1-10,
  "requiresResearch": true/false,
  "researchQuery": "リサーチクエリ（必要な場合）",
  "executionStrategy": "parallel/sequential/hybrid",
  "priority": "low/medium/high",
  "estimatedTime": 推定時間（分）,
  "dependencies": ["依存関係1", "依存関係2", ...]
}
`;

    try {
      const response = await this.geminiClient.generateText({
        prompt: analysisPrompt,
        temperature: 0.3,
        maxTokens: 2048
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('プロンプト解析に失敗しました');
      }

      // JSONの抽出と解析
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('JSON形式の回答が見つかりませんでした');
      }

      const analysis = JSON.parse(jsonMatch[0]) as NaturalLanguageAnalysis;
      analysis.originalPrompt = prompt;
      
      return analysis;
    } catch (error) {
      console.error('プロンプト解析エラー:', error);
      // フォールバック解析
      return this.fallbackAnalysis(prompt);
    }
  }

  /**
   * フォールバック解析（AI解析が失敗した場合）
   */
  private fallbackAnalysis(prompt: string): NaturalLanguageAnalysis {
    const keywords = prompt.toLowerCase();
    const subtasks: string[] = [];
    const requiredSpecialties: SubagentSpecialty[] = [];
    
    // キーワードベースの簡易解析
    if (keywords.includes('コード') || keywords.includes('実装') || keywords.includes('開発')) {
      requiredSpecialties.push('code_review');
      subtasks.push('コード実装');
    }
    
    if (keywords.includes('調査') || keywords.includes('リサーチ') || keywords.includes('分析')) {
      requiredSpecialties.push('data_analysis');
      subtasks.push('調査・分析');
    }
    
    if (keywords.includes('テスト') || keywords.includes('品質')) {
      requiredSpecialties.push('testing');
      subtasks.push('テスト実行');
    }
    
    if (keywords.includes('ドキュメント') || keywords.includes('文書')) {
      requiredSpecialties.push('documentation');
      subtasks.push('ドキュメント作成');
    }

    return {
      originalPrompt: prompt,
      mainTask: prompt,
      subtasks: subtasks.length > 0 ? subtasks : [prompt],
      requiredSpecialties,
      parallelizable: subtasks.length > 1,
      estimatedComplexity: 5,
      requiresResearch: keywords.includes('調査') || keywords.includes('リサーチ'),
      researchQuery: keywords.includes('調査') || keywords.includes('リサーチ') ? prompt : undefined,
      executionStrategy: subtasks.length > 1 ? 'parallel' : 'sequential',
      priority: 'medium',
      estimatedTime: 30,
      dependencies: []
    };
  }

  /**
   * リサーチ実行
   */
  private async executeResearch(query: string, taskId: string): Promise<string | undefined> {
    try {
      const result = await this.deepResearchTool.execute({
        query,
        max_depth: 3,
        max_sources: 10,
        strategy: 'comprehensive',
        include_academic: true,
        recent_years: 5
      }, new AbortController().signal);

      if (result.llmContent) {
        // リサーチ結果を_docsに保存
        await this.saveResearchResult(taskId, query, result);
        return result.llmContent;
      }
    } catch (error) {
      console.error('リサーチ実行エラー:', error);
    }
    return undefined;
  }

  /**
   * リサーチ結果の保存
   */
  private async saveResearchResult(taskId: string, query: string, result: any): Promise<void> {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${timestamp}_research_${taskId}.md`;
      const filepath = path.join(this.config.researchOutputPath, filename);
      
      const content = `# リサーチ結果: ${query}

## 実行日時
${new Date().toLocaleString('ja-JP')}

## クエリ
${query}

## 結果
${result.llmContent}

## メタデータ
- 分析されたソース数: ${result.metadata?.sources_analyzed || 'N/A'}
- リサーチ深度: ${result.metadata?.research_depth || 'N/A'}
- 使用戦略: ${result.metadata?.strategy_used || 'N/A'}
- 実行時間: ${result.metadata?.time_taken_ms || 'N/A'}ms
- 探索トピック: ${result.metadata?.topics_explored?.join(', ') || 'N/A'}

---
*このファイルは自動生成されました*
`;

      await fs.promises.writeFile(filepath, content, 'utf-8');
      console.log(`📄 リサーチ結果を保存: ${filepath}`);
    } catch (error) {
      console.error('リサーチ結果保存エラー:', error);
    }
  }

  /**
   * タスク分割とサブエージェント割り当て
   */
  private async breakdownTasks(
    analysis: NaturalLanguageAnalysis,
    researchResult?: string
  ): Promise<TaskBreakdown> {
    const subtasks = new Map<string, string>();
    const subagentAssignments = new Map<string, Subagent>();
    const executionOrder: string[] = [];
    const parallelGroups: string[][] = [];

    // サブタスクの詳細化
    for (let i = 0; i < analysis.subtasks.length; i++) {
      const subtaskId = `subtask_${i + 1}`;
      const subtask = analysis.subtasks[i];
      
      // リサーチ結果がある場合は統合
      const enhancedSubtask = researchResult 
        ? `${subtask}\n\nリサーチ結果を参考にしてください:\n${researchResult}`
        : subtask;
      
      subtasks.set(subtaskId, enhancedSubtask);
      executionOrder.push(subtaskId);
    }

    // 並列グループの作成
    if (analysis.parallelizable && analysis.subtasks.length > 1) {
      const groupSize = Math.ceil(analysis.subtasks.length / 2);
      for (let i = 0; i < analysis.subtasks.length; i += groupSize) {
        const group = executionOrder.slice(i, i + groupSize);
        parallelGroups.push(group);
      }
    } else {
      parallelGroups.push(executionOrder);
    }

    // サブエージェントの割り当て
    const availableSubagents = await this.getAvailableSubagents();
    for (const [subtaskId, subtask] of subtasks) {
      const bestSubagent = this.findBestSubagent(subtask, availableSubagents, analysis.requiredSpecialties);
      if (bestSubagent) {
        subagentAssignments.set(subtaskId, bestSubagent);
      }
    }

    const coordinationPlan = this.generateCoordinationPlan(parallelGroups, analysis);

    return {
      mainTask: analysis.mainTask,
      subtasks,
      subagentAssignments,
      coordinationPlan,
      executionOrder,
      parallelGroups
    };
  }

  /**
   * 利用可能なサブエージェントの取得
   */
  private async getAvailableSubagents(): Promise<Subagent[]> {
    // 実際の実装では設定からサブエージェントを取得
    return [
      {
        id: 'code_assistant',
        name: 'コードアシスタント',
        specialty: 'code_review',
        description: 'コード作成・修正・最適化を担当',
        prompt: 'コードレビューと品質保証の専門家として、高品質なコードを提供します。',
        systemPrompt: 'あなたはコードレビューと品質保証の専門家です。',
        maxTokens: 4000,
        temperature: 0.7,
        status: 'idle',
        createdAt: new Date().toISOString(),
        taskHistory: [],
        customTools: [],
        isActive: true
      },
      {
        id: 'research_assistant',
        name: 'リサーチアシスタント',
        specialty: 'data_analysis',
        description: '調査・分析・情報収集を担当',
        prompt: 'データ分析と統計の専門家として、包括的な調査と分析を提供します。',
        systemPrompt: 'あなたはデータ分析と統計の専門家です。',
        maxTokens: 4000,
        temperature: 0.7,
        status: 'idle',
        createdAt: new Date().toISOString(),
        taskHistory: [],
        customTools: [],
        isActive: true
      },
      {
        id: 'test_assistant',
        name: 'テストアシスタント',
        specialty: 'testing',
        description: 'テスト作成・実行・品質保証を担当',
        prompt: 'テスト戦略と品質保証の専門家として、包括的なテスト計画を提供します。',
        systemPrompt: 'あなたはテスト戦略と品質保証の専門家です。',
        maxTokens: 4000,
        temperature: 0.7,
        status: 'idle',
        createdAt: new Date().toISOString(),
        taskHistory: [],
        customTools: [],
        isActive: true
      },
      {
        id: 'doc_assistant',
        name: 'ドキュメントアシスタント',
        specialty: 'documentation',
        description: 'ドキュメント作成・整理を担当',
        prompt: 'ドキュメント作成の専門家として、明確で包括的な文書を提供します。',
        systemPrompt: 'あなたはドキュメント作成の専門家です。',
        maxTokens: 4000,
        temperature: 0.7,
        status: 'idle',
        createdAt: new Date().toISOString(),
        taskHistory: [],
        customTools: [],
        isActive: true
      }
    ];
  }

  /**
   * 最適なサブエージェントの選択
   */
  private findBestSubagent(
    subtask: string,
    availableSubagents: Subagent[],
    requiredSpecialties: SubagentSpecialty[]
  ): Subagent | null {
    const keywords = subtask.toLowerCase();
    
    // 専門分野に基づく選択
    for (const specialty of requiredSpecialties) {
      const matchingSubagent = availableSubagents.find(s => s.specialty === specialty);
      if (matchingSubagent) {
        return matchingSubagent;
      }
    }
    
    // キーワードベースの選択
    if (keywords.includes('コード') || keywords.includes('実装') || keywords.includes('開発')) {
      return availableSubagents.find(s => s.specialty === 'code_review') || null;
    }
    
    if (keywords.includes('調査') || keywords.includes('リサーチ') || keywords.includes('分析')) {
      return availableSubagents.find(s => s.specialty === 'data_analysis') || null;
    }
    
    if (keywords.includes('テスト') || keywords.includes('品質')) {
      return availableSubagents.find(s => s.specialty === 'testing') || null;
    }
    
    if (keywords.includes('ドキュメント') || keywords.includes('文書')) {
      return availableSubagents.find(s => s.specialty === 'documentation') || null;
    }
    
    // デフォルト
    return availableSubagents[0] || null;
  }

  /**
   * 協調計画の生成
   */
  private generateCoordinationPlan(parallelGroups: string[][], analysis: NaturalLanguageAnalysis): string {
    let plan = `# 協調実行計画\n\n`;
    plan += `**メインタスク**: ${analysis.mainTask}\n`;
    plan += `**実行戦略**: ${analysis.executionStrategy}\n`;
    plan += `**並列グループ数**: ${parallelGroups.length}\n\n`;
    
    for (let i = 0; i < parallelGroups.length; i++) {
      plan += `## グループ ${i + 1} (並列実行)\n`;
      plan += `- サブタスク: ${parallelGroups[i].join(', ')}\n`;
      plan += `- 実行順序: 並列\n\n`;
    }
    
    return plan;
  }

  /**
   * 並列タスク実行
   */
  private async executeParallelTasks(
    breakdown: TaskBreakdown,
    analysis: NaturalLanguageAnalysis,
    options?: CollaborativeTaskOptions
  ): Promise<any[]> {
    const results: any[] = [];
    
    // 並列グループごとに実行
    for (const group of breakdown.parallelGroups) {
      const groupPromises = group.map(async (subtaskId) => {
        const subtask = breakdown.subtasks.get(subtaskId);
        const subagent = breakdown.subagentAssignments.get(subtaskId);
        
        if (!subtask || !subagent) {
          return { subtaskId, success: false, error: 'サブタスクまたはサブエージェントが見つかりません' };
        }
        
        try {
          console.log(`🚀 サブタスク実行開始: ${subtaskId} (${subagent.name})`);
          
          // 自律的オーケストレーターを使用してタスク実行
          const result = await this.orchestrator.executeAutonomousTask(
            subtask,
            `サブエージェント: ${subagent.name}, 専門分野: ${subagent.specialty}`,
            options
          );
          
          console.log(`✅ サブタスク完了: ${subtaskId}`);
          return { subtaskId, success: true, result };
        } catch (error) {
          console.error(`❌ サブタスクエラー: ${subtaskId}`, error);
          return { subtaskId, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      });
      
      // グループ内のタスクを並列実行
      const groupResults = await Promise.all(groupPromises);
      results.push(...groupResults);
    }
    
    return results;
  }

  /**
   * 結果統合
   */
  private async integrateResults(
    results: any[],
    analysis: NaturalLanguageAnalysis,
    researchResult?: string
  ): Promise<string> {
    const successfulResults = results.filter(r => r.success);
    const failedResults = results.filter(r => !r.success);
    
    let integratedResult = `# 統合実行結果\n\n`;
    integratedResult += `**元のプロンプト**: ${analysis.originalPrompt}\n`;
    integratedResult += `**メインタスク**: ${analysis.mainTask}\n`;
    integratedResult += `**実行戦略**: ${analysis.executionStrategy}\n`;
    integratedResult += `**成功タスク数**: ${successfulResults.length}/${results.length}\n\n`;
    
    if (researchResult) {
      integratedResult += `## リサーチ結果\n${researchResult}\n\n`;
    }
    
    integratedResult += `## 実行結果\n\n`;
    
    for (const result of successfulResults) {
      integratedResult += `### ${result.subtaskId}\n`;
      integratedResult += `${result.result.result}\n\n`;
    }
    
    if (failedResults.length > 0) {
      integratedResult += `## 失敗したタスク\n\n`;
      for (const result of failedResults) {
        integratedResult += `### ${result.subtaskId}\n`;
        integratedResult += `エラー: ${result.error}\n\n`;
      }
    }
    
    return integratedResult;
  }

  /**
   * 実装ログの保存
   */
  private async saveImplementationLog(
    taskId: string,
    prompt: string,
    analysis: NaturalLanguageAnalysis,
    breakdown: TaskBreakdown,
    results: any[],
    integratedResult: string
  ): Promise<void> {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${timestamp}_natural_language_parallel_${taskId}.md`;
      const filepath = path.join(this.config.researchOutputPath, filename);
      
      const content = `# 自然言語並列処理実装ログ

## 実行日時
${new Date().toLocaleString('ja-JP')}

## 元のプロンプト
${prompt}

## 解析結果
- メインタスク: ${analysis.mainTask}
- サブタスク数: ${analysis.subtasks.length}
- 必要専門分野: ${analysis.requiredSpecialties.join(', ')}
- 並列化可能: ${analysis.parallelizable}
- 推定複雑度: ${analysis.estimatedComplexity}/10
- リサーチ必要: ${analysis.requiresResearch}
- 実行戦略: ${analysis.executionStrategy}
- 優先度: ${analysis.priority}
- 推定時間: ${analysis.estimatedTime}分

## タスク分割
- サブタスク数: ${breakdown.subtasks.size}
- 並列グループ数: ${breakdown.parallelGroups.length}
- 協調計画: ${breakdown.coordinationPlan}

## 実行結果
- 成功タスク数: ${results.filter(r => r.success).length}/${results.length}
- 失敗タスク数: ${results.filter(r => !r.success).length}

## 統合結果
${integratedResult}

---
*このファイルは自動生成されました*
`;

      await fs.promises.writeFile(filepath, content, 'utf-8');
      console.log(`📄 実装ログを保存: ${filepath}`);
    } catch (error) {
      console.error('実装ログ保存エラー:', error);
    }
  }

  /**
   * タスクID生成
   */
  private generateTaskId(): string {
    return `nlp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 