/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  readSubagentsConfig, 
  getSubagentsBySpecialty,
  SubagentSpecialtySchema,
  SubagentExecutor,
  Subagent
} from '@google/gemini-cli-core';

/**
 * 自然言語プロンプトからサブエージェント並列起動を検出・実行するプロセッサー
 */
export class NaturalLanguageSubagentProcessor {
  private readonly subagentKeywords = {
    'code_review': ['コードレビュー', 'レビュー', 'code review', 'review', 'コード確認', 'コードチェック'],
    'debugging': ['デバッグ', 'debug', 'バグ修正', 'エラー修正', 'トラブルシューティング', 'troubleshooting'],
    'data_analysis': ['データ分析', 'data analysis', '分析', 'analytics', '統計', 'statistics'],
    'security_audit': ['セキュリティ', 'security', '監査', 'audit', '脆弱性', 'vulnerability'],
    'performance_optimization': ['パフォーマンス', 'performance', '最適化', 'optimization', '高速化'],
    'documentation': ['ドキュメント', 'documentation', '文書', '説明書', 'manual'],
    'testing': ['テスト', 'test', 'テスト作成', 'test creation', '品質保証', 'QA'],
    'architecture_design': ['アーキテクチャ', 'architecture', '設計', 'design', '構造', 'structure'],
    'api_design': ['API', 'api', 'インターフェース', 'interface', 'エンドポイント', 'endpoint'],
    'machine_learning': ['機械学習', 'machine learning', 'ML', 'ml', 'AI', 'ai', '学習', 'learning']
  };

  private readonly parallelKeywords = [
    '並列', 'parallel', '同時', 'simultaneous', '複数', 'multiple',
    'チーム', 'team', '複数の', 'several', '複数で', 'with multiple',
    '並行', 'concurrent', '同時実行', 'concurrent execution'
  ];

  // リアルタイム表示用コールバック
  private onProgressUpdate?: (message: string, type: 'info' | 'success' | 'error' | 'progress') => void;

  /**
   * リアルタイム表示コールバックを設定
   */
  setProgressCallback(callback: (message: string, type: 'info' | 'success' | 'error' | 'progress') => void) {
    this.onProgressUpdate = callback;
  }

  /**
   * 進捗メッセージを送信
   */
  private sendProgress(message: string, type: 'info' | 'success' | 'error' | 'progress' = 'info') {
    if (this.onProgressUpdate) {
      this.onProgressUpdate(message, type);
    }
  }

  /**
   * 自然言語プロンプトを解析してサブエージェント並列起動を検出
   */
  async processNaturalLanguagePrompt(prompt: string): Promise<{
    shouldExecute: boolean;
    specialty?: string;
    task?: string;
    subagents?: Subagent[];
  }> {
    const lowerPrompt = prompt.toLowerCase();
    
    this.sendProgress('🔍 自然言語プロンプトを解析中...', 'progress');
    
    // 並列実行キーワードをチェック
    const hasParallelKeywords = this.parallelKeywords.some(keyword => 
      lowerPrompt.includes(keyword.toLowerCase())
    );

    if (!hasParallelKeywords) {
      this.sendProgress('❌ 並列実行キーワードが検出されませんでした', 'error');
      return { shouldExecute: false };
    }

    this.sendProgress('✅ 並列実行キーワードを検出しました', 'success');

    // 専門分野を特定
    let detectedSpecialty: string | undefined;
    for (const [specialty, keywords] of Object.entries(this.subagentKeywords)) {
      const hasSpecialtyKeywords = keywords.some(keyword => 
        lowerPrompt.includes(keyword.toLowerCase())
      );
      if (hasSpecialtyKeywords) {
        detectedSpecialty = specialty;
        break;
      }
    }

    if (!detectedSpecialty) {
      this.sendProgress('❌ 専門分野が特定できませんでした', 'error');
      return { shouldExecute: false };
    }

    this.sendProgress(`🎯 専門分野を検出: ${detectedSpecialty}`, 'success');

    // タスク内容を抽出（専門分野キーワード以降の部分）
    const specialtyKeywords = this.subagentKeywords[detectedSpecialty as keyof typeof this.subagentKeywords];
    let taskStartIndex = -1;
    
    for (const keyword of specialtyKeywords) {
      const index = lowerPrompt.indexOf(keyword.toLowerCase());
      if (index !== -1) {
        taskStartIndex = index + keyword.length;
        break;
      }
    }

    let task = '';
    if (taskStartIndex !== -1) {
      task = prompt.substring(taskStartIndex).trim();
      // 句読点や接続詞で区切る
      const taskParts = task.split(/[。、，,]/);
      task = taskParts[0].trim();
    }

    this.sendProgress(`📝 タスク内容を抽出: ${task || '指定されたタスクを実行してください'}`, 'info');

    // サブエージェントを取得
    try {
      this.sendProgress('🔍 サブエージェントを検索中...', 'progress');
      const subagents = await getSubagentsBySpecialty(detectedSpecialty as any);
      
      if (subagents.length === 0) {
        this.sendProgress('❌ 該当するサブエージェントが見つかりませんでした', 'error');
        return { shouldExecute: false };
      }

      this.sendProgress(`✅ ${subagents.length}個のサブエージェントを発見しました`, 'success');
      
      return {
        shouldExecute: subagents.length > 0,
        specialty: detectedSpecialty,
        task: task || '指定されたタスクを実行してください',
        subagents
      };
    } catch (error) {
      this.sendProgress(`❌ サブエージェント取得エラー: ${error instanceof Error ? error.message : String(error)}`, 'error');
      console.error('サブエージェント取得エラー:', error);
      return { shouldExecute: false };
    }
  }

  /**
   * サブエージェント並列実行を実行（リアルタイム表示付き）
   */
  async executeParallelSubagents(
    subagents: Subagent[], 
    task: string
  ): Promise<{
    success: boolean;
    results: Array<{
      subagentId: string;
      subagentName: string;
      result: string;
      executionTime: number;
    }>;
    error?: string;
  }> {
    try {
      this.sendProgress('🚀 メインエージェントがサブエージェントを起動中...', 'progress');
      
      const executor = new SubagentExecutor({
        onProgress: (message: string, type: 'info' | 'success' | 'error' | 'progress') => {
          this.sendProgress(message, type);
        }
      });
      
      // 各サブエージェントの起動状況を表示
      for (const subagent of subagents) {
        this.sendProgress(`🤖 ${subagent.name} (${subagent.specialty}) を起動中...`, 'progress');
      }

      this.sendProgress('⚡ サブエージェント並列実行開始...', 'info');
      
      const results = await executor.executeParallel(subagents, {
        id: `task-${Date.now()}`,
        task,
        priority: 'medium',
        timeout: 30000
      });

      this.sendProgress('✅ 並列実行完了、結果を統合中...', 'success');

      const formattedResults = results.map(r => ({
        subagentId: r.subagentId,
        subagentName: subagents.find(s => s.id === r.subagentId)?.name || 'Unknown',
        result: r.result,
        executionTime: r.executionTime
      }));

      // 各サブエージェントの結果を個別に表示
      for (const result of formattedResults) {
        this.sendProgress(`📊 ${result.subagentName} の結果: ${result.result.substring(0, 100)}${result.result.length > 100 ? '...' : ''}`, 'info');
      }

      this.sendProgress('🎯 メインエージェントが最終結果を統合完了', 'success');

      return {
        success: true,
        results: formattedResults
      };
    } catch (error) {
      this.sendProgress(`❌ 並列実行エラー: ${error instanceof Error ? error.message : String(error)}`, 'error');
      return {
        success: false,
        results: [],
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 自然言語プロンプトをサブエージェントコマンドに変換
   */
  convertToSubagentCommand(specialty: string, task: string): string {
    return `/subagents execute-parallel ${specialty} "${task}"`;
  }

  /**
   * 利用可能な専門分野の説明を生成
   */
  getAvailableSpecialtiesDescription(): string {
    const descriptions = Object.entries(this.subagentKeywords).map(([specialty, keywords]) => {
      const japaneseKeywords = keywords.filter(k => /[\u3040-\u309F\u30A0-\u30FF]/.test(k));
      const englishKeywords = keywords.filter(k => !/[\u3040-\u309F\u30A0-\u30FF]/.test(k));
      
      return `- **${specialty}**: ${japaneseKeywords.join(', ')} ${englishKeywords.length > 0 ? `(${englishKeywords.join(', ')})` : ''}`;
    });

    return descriptions.join('\n');
  }

  /**
   * メインエージェントの動作を表示
   */
  displayMainAgentAction(action: string, details?: string) {
    this.sendProgress(`🎯 メインエージェント: ${action}${details ? ` - ${details}` : ''}`, 'info');
  }

  /**
   * サブエージェントの動作を表示
   */
  displaySubagentAction(subagentName: string, action: string, details?: string) {
    this.sendProgress(`🤖 ${subagentName}: ${action}${details ? ` - ${details}` : ''}`, 'progress');
  }

  /**
   * 協調作業の進行状況を表示
   */
  displayCollaborationProgress(step: number, totalSteps: number, description: string) {
    const progress = Math.round((step / totalSteps) * 100);
    this.sendProgress(`🔄 協調作業進行中 (${step}/${totalSteps}) ${progress}%: ${description}`, 'progress');
  }
} 