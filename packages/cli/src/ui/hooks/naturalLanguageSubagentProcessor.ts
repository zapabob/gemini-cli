/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SubagentExecutor,
  Subagent,
  SubagentSpecialty,
  SubagentRegistry,
} from '@google/gemini-cli-core';

async function getSubagentsBySpecialty(
  specialty: SubagentSpecialty | SubagentSpecialty[],
): Promise<Subagent[]> {
  const registry = SubagentRegistry.getInstance();
  const specialties = Array.isArray(specialty) ? specialty : [specialty];
  return registry
    .getAllSubagents()
    .filter((subagent) =>
      specialties.includes(subagent.specialty as SubagentSpecialty),
    )
    .map((definition, index) => ({
      id: `registry-${index}-${definition.name}`,
      name: definition.name,
      description: definition.description,
      specialty: specialties.includes(definition.specialty as SubagentSpecialty)
        ? (definition.specialty as SubagentSpecialty)
        : 'custom',
      prompt: definition.description,
      systemPrompt: undefined,
      maxTokens: 4096,
      temperature: 0.7,
      status: 'idle',
      createdAt: new Date().toISOString(),
      lastUsed: undefined,
      taskHistory: [],
      customTools: [],
      parentAgentId: undefined,
      isActive: true,
    }));
}

/**
 * 高度な自然言語プロンプト解釈システム
 * LLMベースのルーティング、並列化検出、動的ツール呼び出しを実装
 */
export class NaturalLanguageSubagentProcessor {
  private readonly subagentKeywords = {
    code_review: [
      'コードレビュー',
      'レビュー',
      'code review',
      'review',
      'コード確認',
      'コードチェック',
    ],
    debugging: [
      'デバッグ',
      'debug',
      'バグ修正',
      'エラー修正',
      'トラブルシューティング',
      'troubleshooting',
    ],
    data_analysis: [
      'データ分析',
      'data analysis',
      '分析',
      'analytics',
      '統計',
      'statistics',
    ],
    security_audit: [
      'セキュリティ',
      'security',
      '監査',
      'audit',
      '脆弱性',
      'vulnerability',
    ],
    performance_optimization: [
      'パフォーマンス',
      'performance',
      '最適化',
      'optimization',
      '高速化',
    ],
    documentation: [
      'ドキュメント',
      'documentation',
      '文書',
      '説明書',
      'manual',
    ],
    testing: [
      'テスト',
      'test',
      'テスト作成',
      'test creation',
      '品質保証',
      'QA',
    ],
    architecture_design: [
      'アーキテクチャ',
      'architecture',
      '設計',
      'design',
      '構造',
      'structure',
    ],
    api_design: [
      'API',
      'api',
      'インターフェース',
      'interface',
      'エンドポイント',
      'endpoint',
    ],
    machine_learning: [
      '機械学習',
      'machine learning',
      'ML',
      'ml',
      'AI',
      'ai',
      '学習',
      'learning',
    ],
  };

  private readonly parallelKeywords = [
    '並列',
    'parallel',
    '同時',
    'simultaneous',
    '複数',
    'multiple',
    'チーム',
    'team',
    '複数の',
    'several',
    '複数で',
    'with multiple',
    '並行',
    'concurrent',
    '同時実行',
    'concurrent execution',
  ];

  // リアルタイム表示用コールバック
  private onProgressUpdate?: (
    message: string,
    type: 'info' | 'success' | 'error' | 'progress',
  ) => void;

  /**
   * リアルタイム表示コールバックを設定
   */
  setProgressCallback(
    callback: (
      message: string,
      type: 'info' | 'success' | 'error' | 'progress',
    ) => void,
  ) {
    this.onProgressUpdate = callback;
  }

  /**
   * 進捗メッセージを送信
   */
  private sendProgress(
    message: string,
    type: 'info' | 'success' | 'error' | 'progress' = 'info',
  ) {
    if (this.onProgressUpdate) {
      this.onProgressUpdate(message, type);
    }
  }

  /**
   * 高度な自然言語プロンプト解析
   * LLMベースのルーティングと並列化検出
   */
  async processNaturalLanguagePrompt(prompt: string): Promise<{
    shouldExecute: boolean;
    specialty?: string;
    task?: string;
    subagents?: Subagent[];
    executionMode?: 'parallel' | 'sequential' | 'hybrid';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    collaborationType?: 'independent' | 'coordinated' | 'hierarchical';
  }> {
    this.sendProgress('🧠 高度な自然言語プロンプト解析開始...', 'progress');

    // 1. 並列化検出
    const parallelizationAnalysis = this.analyzeParallelization(prompt);

    // 2. 専門分野ルーティング
    const routingAnalysis = this.analyzeSpecialtyRouting(prompt);

    // 3. 実行モード決定
    const executionMode = this.determineExecutionMode(
      prompt,
      parallelizationAnalysis,
    );

    // 4. 優先度分析
    const priority = this.analyzePriority(prompt);

    // 5. 協調タイプ分析
    const collaborationType = this.analyzeCollaborationType(prompt);

    if (!routingAnalysis.detectedSpecialty) {
      this.sendProgress('❌ 専門分野が特定できませんでした', 'error');
      return { shouldExecute: false };
    }

    this.sendProgress(
      `🎯 専門分野検出: ${routingAnalysis.detectedSpecialty}`,
      'success',
    );
    this.sendProgress(`⚡ 実行モード: ${executionMode}`, 'info');
    this.sendProgress(`🔝 優先度: ${priority}`, 'info');
    this.sendProgress(`🤝 協調タイプ: ${collaborationType}`, 'info');

    // サブエージェントを取得
    try {
      this.sendProgress('🔍 サブエージェントを検索中...', 'progress');
      const subagents = await getSubagentsBySpecialty(
        routingAnalysis.detectedSpecialty as SubagentSpecialty,
      );

      if (subagents.length === 0) {
        this.sendProgress(
          '❌ 該当するサブエージェントが見つかりませんでした',
          'error',
        );
        return { shouldExecute: false };
      }

      this.sendProgress(
        `✅ ${subagents.length}個のサブエージェントを発見しました`,
        'success',
      );

      return {
        shouldExecute: subagents.length > 0,
        specialty: routingAnalysis.detectedSpecialty,
        task: routingAnalysis.task || '指定されたタスクを実行してください',
        subagents,
        executionMode,
        priority,
        collaborationType,
      };
    } catch (error) {
      this.sendProgress(
        `❌ サブエージェント取得エラー: ${error instanceof Error ? error.message : String(error)}`,
        'error',
      );
      console.error('サブエージェント取得エラー:', error);
      return { shouldExecute: false };
    }
  }

  /**
   * 並列化分析
   */
  private analyzeParallelization(prompt: string): {
    isParallel: boolean;
    parallelLevel: 'none' | 'low' | 'medium' | 'high';
    parallelKeywords: string[];
  } {
    const lowerPrompt = prompt.toLowerCase();
    const foundKeywords = this.parallelKeywords.filter((keyword) =>
      lowerPrompt.includes(keyword.toLowerCase()),
    );

    const isParallel = foundKeywords.length > 0;
    let parallelLevel: 'none' | 'low' | 'medium' | 'high' = 'none';

    if (isParallel) {
      const strongParallelKeywords = [
        '並列',
        'parallel',
        '同時',
        'simultaneous',
      ];
      const mediumParallelKeywords = ['複数', 'multiple', 'チーム', 'team'];

      if (strongParallelKeywords.some((k) => lowerPrompt.includes(k))) {
        parallelLevel = 'high';
      } else if (mediumParallelKeywords.some((k) => lowerPrompt.includes(k))) {
        parallelLevel = 'medium';
      } else {
        parallelLevel = 'low';
      }
    }

    return { isParallel, parallelLevel, parallelKeywords: foundKeywords };
  }

  /**
   * 専門分野ルーティング分析
   */
  private analyzeSpecialtyRouting(prompt: string): {
    detectedSpecialty?: string;
    task?: string;
    confidence: number;
  } {
    const lowerPrompt = prompt.toLowerCase();
    let detectedSpecialty: string | undefined;
    let confidence = 0;

    // キーワードベースの検出
    for (const [specialty, keywords] of Object.entries(this.subagentKeywords)) {
      const matchedKeywords = keywords.filter((keyword) =>
        lowerPrompt.includes(keyword.toLowerCase()),
      );

      if (matchedKeywords.length > 0) {
        const keywordConfidence = matchedKeywords.length / keywords.length;
        if (keywordConfidence > confidence) {
          confidence = keywordConfidence;
          detectedSpecialty = specialty;
        }
      }
    }

    // タスク内容抽出
    let task: string | undefined;
    if (detectedSpecialty) {
      const specialtyKeywords =
        this.subagentKeywords[
          detectedSpecialty as keyof typeof this.subagentKeywords
        ];
      let taskStartIndex = -1;

      for (const keyword of specialtyKeywords) {
        const index = lowerPrompt.indexOf(keyword.toLowerCase());
        if (index !== -1) {
          taskStartIndex = index + keyword.length;
          break;
        }
      }

      if (taskStartIndex !== -1) {
        task = prompt.substring(taskStartIndex).trim();
        const taskParts = task.split(/[。、，,]/);
        task = taskParts[0].trim();
      }
    }

    return { detectedSpecialty, task, confidence };
  }

  /**
   * 実行モード決定
   */
  private determineExecutionMode(
    prompt: string,
    parallelizationAnalysis: { isParallel: boolean; parallelLevel: string },
  ): 'parallel' | 'sequential' | 'hybrid' {
    if (!parallelizationAnalysis.isParallel) {
      return 'sequential';
    }

    const lowerPrompt = prompt.toLowerCase();

    // ハイブリッド実行のキーワード
    const hybridKeywords = [
      '段階的',
      'step by step',
      '順次',
      'sequential',
      '段階',
    ];
    const hasHybridKeywords = hybridKeywords.some((k) =>
      lowerPrompt.includes(k),
    );

    if (hasHybridKeywords) {
      return 'hybrid';
    }

    return parallelizationAnalysis.parallelLevel === 'high'
      ? 'parallel'
      : 'sequential';
  }

  /**
   * 優先度分析
   */
  private analyzePriority(
    prompt: string,
  ): 'low' | 'medium' | 'high' | 'urgent' {
    const lowerPrompt = prompt.toLowerCase();

    const urgentKeywords = [
      '緊急',
      'urgent',
      '急いで',
      'asap',
      'すぐに',
      'immediately',
    ];
    const highKeywords = ['重要', 'important', '優先', 'priority', '高優先度'];
    const lowKeywords = [
      'ゆっくり',
      'slowly',
      '低優先度',
      'low priority',
      '時間かけて',
    ];

    if (urgentKeywords.some((k) => lowerPrompt.includes(k))) {
      return 'urgent';
    } else if (highKeywords.some((k) => lowerPrompt.includes(k))) {
      return 'high';
    } else if (lowKeywords.some((k) => lowerPrompt.includes(k))) {
      return 'low';
    }

    return 'medium';
  }

  /**
   * 協調タイプ分析
   */
  private analyzeCollaborationType(
    prompt: string,
  ): 'independent' | 'coordinated' | 'hierarchical' {
    const lowerPrompt = prompt.toLowerCase();

    const hierarchicalKeywords = [
      '階層',
      'hierarchical',
      '監督',
      'supervision',
      '管理',
      'management',
    ];
    const coordinatedKeywords = [
      '協調',
      'coordination',
      '連携',
      'collaboration',
      '調整',
      'adjustment',
    ];
    const independentKeywords = [
      '独立',
      'independent',
      '個別',
      'separate',
      '単独',
      'alone',
    ];

    if (hierarchicalKeywords.some((k) => lowerPrompt.includes(k))) {
      return 'hierarchical';
    } else if (coordinatedKeywords.some((k) => lowerPrompt.includes(k))) {
      return 'coordinated';
    } else if (independentKeywords.some((k) => lowerPrompt.includes(k))) {
      return 'independent';
    }

    return 'coordinated'; // デフォルト
  }

  /**
   * 高度なサブエージェント並列実行システム
   * 実行モード別の処理、協調タイプ別の調整、優先度別のリソース管理
   */
  async executeAdvancedParallelSubagents(
    subagents: Subagent[],
    task: string,
    executionMode: 'parallel' | 'sequential' | 'hybrid' = 'parallel',
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    collaborationType:
      | 'independent'
      | 'coordinated'
      | 'hierarchical' = 'coordinated',
  ): Promise<{
    success: boolean;
    results: Array<{
      subagentId: string;
      subagentName: string;
      result: string;
      executionTime: number;
      status: 'success' | 'error' | 'timeout';
    }>;
    executionSummary: {
      mode: string;
      priority: string;
      collaborationType: string;
      totalExecutionTime: number;
      successRate: number;
    };
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      this.sendProgress('🚀 高度な並列実行システム起動...', 'progress');
      this.sendProgress(`⚡ 実行モード: ${executionMode}`, 'info');
      this.sendProgress(`🔝 優先度: ${priority}`, 'info');
      this.sendProgress(`🤝 協調タイプ: ${collaborationType}`, 'info');

      const executor = new SubagentExecutor({
        onProgress: (
          message: string,
          type: 'info' | 'success' | 'error' | 'progress',
        ) => {
          this.sendProgress(message, type);
        },
      });

      let results: Array<{
        subagentId: string;
        subagentName: string;
        result: string;
        executionTime: number;
        status: 'success' | 'error' | 'timeout';
      }> = [];

      // 実行モード別の処理
      switch (executionMode) {
        case 'parallel':
          results = await this.executeParallelMode(
            subagents,
            task,
            executor,
            priority,
          );
          break;
        case 'sequential':
          results = await this.executeSequentialMode(
            subagents,
            task,
            executor,
            priority,
          );
          break;
        case 'hybrid':
          results = await this.executeHybridMode(
            subagents,
            task,
            executor,
            priority,
            collaborationType,
          );
          break;
        default:
          results = await this.executeParallelMode(
            subagents,
            task,
            executor,
            priority,
          );
          break;
      }

      const totalExecutionTime = Date.now() - startTime;
      const successCount = results.filter((r) => r.status === 'success').length;
      const successRate = (successCount / results.length) * 100;

      this.sendProgress(`✅ 高度な並列実行完了`, 'success');
      this.sendProgress(`📊 成功率: ${successRate.toFixed(1)}%`, 'info');
      this.sendProgress(`⏱️ 総実行時間: ${totalExecutionTime}ms`, 'info');

      return {
        success: successRate > 50, // 50%以上成功で成功とみなす
        results,
        executionSummary: {
          mode: executionMode,
          priority,
          collaborationType,
          totalExecutionTime,
          successRate,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.sendProgress(`❌ 高度な並列実行エラー: ${errorMessage}`, 'error');
      return {
        success: false,
        results: [],
        executionSummary: {
          mode: executionMode,
          priority,
          collaborationType,
          totalExecutionTime: Date.now() - startTime,
          successRate: 0,
        },
        error: errorMessage,
      };
    }
  }

  /**
   * 並列実行モード
   */
  private async executeParallelMode(
    subagents: Subagent[],
    task: string,
    executor: SubagentExecutor,
    priority: string,
  ): Promise<
    Array<{
      subagentId: string;
      subagentName: string;
      result: string;
      executionTime: number;
      status: 'success' | 'error' | 'timeout';
    }>
  > {
    this.sendProgress('⚡ 並列実行モード開始...', 'progress');

    // 優先度に応じたタイムアウト設定
    const timeoutMap = {
      urgent: 15000,
      high: 30000,
      medium: 45000,
      low: 60000,
    };

    const timeout = timeoutMap[priority as keyof typeof timeoutMap] || 30000;

    const results = await executor.executeParallel(subagents, {
      id: `parallel-task-${Date.now()}`,
      task,
      priority: priority as 'low' | 'medium' | 'high' | 'urgent',
      timeout,
    });

    return results.map((r) => ({
      subagentId: r.subagentId,
      subagentName:
        subagents.find((s) => s.id === r.subagentId)?.name || 'Unknown',
      result: r.result,
      executionTime: r.executionTime,
      status: r.status === 'success' ? 'success' : 'error',
    }));
  }

  /**
   * 順次実行モード
   */
  private async executeSequentialMode(
    subagents: Subagent[],
    task: string,
    executor: SubagentExecutor,
    priority: string,
  ): Promise<
    Array<{
      subagentId: string;
      subagentName: string;
      result: string;
      executionTime: number;
      status: 'success' | 'error' | 'timeout';
    }>
  > {
    this.sendProgress('📋 順次実行モード開始...', 'progress');

    const results: Array<{
      subagentId: string;
      subagentName: string;
      result: string;
      executionTime: number;
      status: 'success' | 'error' | 'timeout';
    }> = [];

    for (let i = 0; i < subagents.length; i++) {
      const subagent = subagents[i];
      this.sendProgress(
        `🔄 ${subagent.name} (${i + 1}/${subagents.length}) を実行中...`,
        'progress',
      );

      try {
        const result = await executor.executeTask(subagent, {
          id: `sequential-task-${Date.now()}-${i}`,
          task,
          priority: priority as 'low' | 'medium' | 'high' | 'urgent',
          timeout: 30000,
        });

        results.push({
          subagentId: result.subagentId,
          subagentName: subagent.name,
          result: result.result,
          executionTime: result.executionTime,
          status: result.status === 'success' ? 'success' : 'error',
        });

        this.sendProgress(`✅ ${subagent.name} 完了`, 'success');
      } catch (error) {
        this.sendProgress(
          `❌ ${subagent.name} エラー: ${error instanceof Error ? error.message : String(error)}`,
          'error',
        );
        results.push({
          subagentId: subagent.id,
          subagentName: subagent.name,
          result: 'エラーが発生しました',
          executionTime: 0,
          status: 'error',
        });
      }
    }

    return results;
  }

  /**
   * ハイブリッド実行モード
   */
  private async executeHybridMode(
    subagents: Subagent[],
    task: string,
    executor: SubagentExecutor,
    priority: string,
    collaborationType: string,
  ): Promise<
    Array<{
      subagentId: string;
      subagentName: string;
      result: string;
      executionTime: number;
      status: 'success' | 'error' | 'timeout';
    }>
  > {
    this.sendProgress('🔄 ハイブリッド実行モード開始...', 'progress');

    // サブエージェントをグループに分割
    const groups = this.createSubagentGroups(subagents, collaborationType);
    const results: Array<{
      subagentId: string;
      subagentName: string;
      result: string;
      executionTime: number;
      status: 'success' | 'error' | 'timeout';
    }> = [];

    for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
      const group = groups[groupIndex];
      this.sendProgress(
        `📦 グループ ${groupIndex + 1}/${groups.length} (${group.length}個のサブエージェント) を並列実行中...`,
        'progress',
      );

      // グループ内で並列実行
      const groupResults = await this.executeParallelMode(
        group,
        task,
        executor,
        priority,
      );
      results.push(...groupResults);

      // グループ間で少し待機（リソース調整）
      if (groupIndex < groups.length - 1) {
        this.sendProgress('⏸️ 次のグループの準備中...', 'info');
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * サブエージェントグループ作成
   */
  private createSubagentGroups(
    subagents: Subagent[],
    collaborationType: string,
  ): Subagent[][] {
    const groups: Subagent[][] = [];

    switch (collaborationType) {
      case 'hierarchical': {
        // 階層的: 監督者と作業者に分ける
        const supervisor = subagents.find(
          (s) => s.specialty === 'architecture_design',
        );
        const workers = subagents.filter(
          (s) => s.specialty !== 'architecture_design',
        );

        if (supervisor) {
          groups.push([supervisor]);
        }
        if (workers.length > 0) {
          // 作業者を3-4人ずつのグループに分割
          for (let i = 0; i < workers.length; i += 3) {
            groups.push(workers.slice(i, i + 3));
          }
        }
        break;
      }

      case 'coordinated': {
        // 協調的: 専門分野別にグループ化
        const specialtyGroups = new Map<string, Subagent[]>();
        subagents.forEach((subagent) => {
          if (!specialtyGroups.has(subagent.specialty)) {
            specialtyGroups.set(subagent.specialty, []);
          }
          specialtyGroups.get(subagent.specialty)!.push(subagent);
        });

        specialtyGroups.forEach((group) => {
          if (group.length > 0) {
            groups.push(group);
          }
        });
        break;
      }

      case 'independent':
      default: {
        // 独立的: 2-3人ずつの小さなグループ
        for (let i = 0; i < subagents.length; i += 2) {
          groups.push(subagents.slice(i, i + 2));
        }
        break;
      }
    }

    return groups;
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
    const descriptions = Object.entries(this.subagentKeywords).map(
      ([specialty, keywords]) => {
        const japaneseKeywords = keywords.filter((k) =>
          /[\u3040-\u309F\u30A0-\u30FF]/.test(k),
        );
        const englishKeywords = keywords.filter(
          (k) => !/[\u3040-\u309F\u30A0-\u30FF]/.test(k),
        );

        return `- **${specialty}**: ${japaneseKeywords.join(', ')} ${englishKeywords.length > 0 ? `(${englishKeywords.join(', ')})` : ''}`;
      },
    );

    return descriptions.join('\n');
  }

  /**
   * メインエージェントの動作を表示
   */
  displayMainAgentAction(action: string, details?: string) {
    this.sendProgress(
      `🎯 メインエージェント: ${action}${details ? ` - ${details}` : ''}`,
      'info',
    );
  }

  /**
   * サブエージェントの動作を表示
   */
  displaySubagentAction(
    subagentName: string,
    action: string,
    details?: string,
  ) {
    this.sendProgress(
      `🤖 ${subagentName}: ${action}${details ? ` - ${details}` : ''}`,
      'progress',
    );
  }

  /**
   * 協調作業の進行状況を表示
   */
  displayCollaborationProgress(
    step: number,
    totalSteps: number,
    description: string,
  ) {
    const progress = Math.round((step / totalSteps) * 100);
    this.sendProgress(
      `🔄 協調作業進行中 (${step}/${totalSteps}) ${progress}%: ${description}`,
      'progress',
    );
  }

  /**
   * サブエージェント並列実行を実行（リアルタイム表示付き）
   * 後方互換性のため残存
   */
  async executeParallelSubagents(
    subagents: Subagent[],
    task: string,
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
    // 高度な並列実行システムを呼び出し
    const advancedResult = await this.executeAdvancedParallelSubagents(
      subagents,
      task,
      'parallel',
      'medium',
      'coordinated',
    );

    // 後方互換性のため結果を変換
    return {
      success: advancedResult.success,
      results: advancedResult.results.map((r) => ({
        subagentId: r.subagentId,
        subagentName: r.subagentName,
        result: r.result,
        executionTime: r.executionTime,
      })),
      error: advancedResult.error,
    };
  }
}
