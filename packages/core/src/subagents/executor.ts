/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Subagent } from '../config/subagents.js';
import { GeminiClient } from './geminiClient.js';
import type { ColorManagerConfig } from './colorManager.js';
import { ColorManager } from './colorManager.js';

/**
 * サブエージェントタスク定義
 */
export interface SubagentTask {
  id: string;
  task: string;
  context?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timeout?: number;
  dependencies?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * サブエージェント実行結果
 */
export interface SubagentResult {
  subagentId: string;
  result: string;
  status: 'success' | 'failed' | 'partial';
  executionTime: number;
  tokensUsed?: number;
  qualityScore?: number;
  confidenceLevel?: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * サブエージェント実行オプション
 */
export interface SubagentExecutorOptions {
  geminiClient?: GeminiClient;
  maxConcurrent?: number;
  timeout?: number;
  onProgress?: (
    message: string,
    type: 'info' | 'success' | 'error' | 'progress',
  ) => void;
}

/**
 * サブエージェント実行器
 */
/**
 * サブエージェント定義のYAML設定を読み込むためのインターフェース
 */
export interface SubagentDefinition {
  name: string;
  description: string;
  model?: string;
  color?: string;
  specialty: string;
  triggers?: string[];
  capabilities?: string[];
  config?: Record<string, unknown>;
}

/**
 * サブエージェントの自動登録システム
 */
export class SubagentRegistry {
  private static instance: SubagentRegistry;
  private subagents: Map<string, SubagentDefinition> = new Map();

  static getInstance(): SubagentRegistry {
    if (!SubagentRegistry.instance) {
      SubagentRegistry.instance = new SubagentRegistry();
    }
    return SubagentRegistry.instance;
  }

  register(definition: SubagentDefinition): void {
    this.subagents.set(definition.name, definition);
  }

  getSubagent(name: string): SubagentDefinition | undefined {
    return this.subagents.get(name);
  }

  getAllSubagents(): SubagentDefinition[] {
    return Array.from(this.subagents.values());
  }

  getSubagentsBySpecialty(specialty: string): SubagentDefinition[] {
    return this.getAllSubagents().filter((sa) => sa.specialty === specialty);
  }
}

export class SubagentExecutor {
  private geminiClient: GeminiClient;
  private maxConcurrent: number;
  private timeout: number;
  private onProgress?: (
    message: string,
    type: 'info' | 'success' | 'error' | 'progress',
  ) => void;
  private colorManager: ColorManager;

  constructor(options: SubagentExecutorOptions = {}) {
    this.geminiClient =
      options.geminiClient ||
      new GeminiClient({
        apiKey: process.env['GEMINI_API_KEY'] || 'mock-api-key',
        defaultModel: 'models/gemini-2.5-flash',
        defaultTemperature: 0.7,
        defaultMaxTokens: 4096,
      });
    this.maxConcurrent = options.maxConcurrent || 5;
    this.timeout = options.timeout || 300000; // 5分
    this.onProgress = options.onProgress;

    // カラーマネージャーの初期化
    const colorConfig: ColorManagerConfig = {
      enableColors: true,
      enableEmojis: true,
      enableTimestamps: true,
      logToFile: false,
      colorMode: 'ansi',
    };
    this.colorManager = new ColorManager(colorConfig);
  }

  /**
   * 進捗メッセージを送信
   */
  private sendProgress(
    message: string,
    type: 'info' | 'success' | 'error' | 'progress' = 'info',
    agentId?: string,
    agentName?: string,
  ) {
    if (this.onProgress) {
      // 色分けされたメッセージを生成
      const coloredMessage = this.colorManager.createColoredMessage(
        message,
        agentId,
        agentName,
        undefined,
        type,
      );
      const formattedMessage = this.colorManager.formatMessage(coloredMessage);
      this.onProgress(formattedMessage, type);
    }
  }

  /**
   * 単一サブエージェントタスク実行
   */
  async executeTask(
    subagent: Subagent,
    task: SubagentTask,
  ): Promise<SubagentResult> {
    const startTime = Date.now();

    try {
      this.sendProgress(
        `🚀 ${subagent.name} のタスク実行開始: ${task.task}`,
        'progress',
        subagent.id,
        subagent.name,
      );

      // サブエージェントの状態を更新
      subagent.status = 'running';

      // Gemini APIを使用してタスクを実行
      const response = await this.geminiClient.generateText({
        prompt: this.generateTaskPrompt(subagent, task),
        maxTokens: subagent.maxTokens,
        temperature: subagent.temperature,
      });

      const executionTime = Date.now() - startTime;

      // サブエージェントの会話メッセージを色分けして表示
      const agentSpeech = this.colorManager.formatAgentSpeech(
        subagent.id,
        subagent.name,
        subagent.specialty,
        response.text,
      );
      console.log(agentSpeech);

      // タスク履歴に追加
      subagent.taskHistory.push({
        taskId: task.id,
        task: task.task,
        result: response.text,
        timestamp: new Date().toISOString(),
        status: 'success',
      });

      // 最終使用日時を更新
      subagent.lastUsed = new Date().toISOString();
      subagent.status = 'idle';

      this.sendProgress(
        `✅ ${subagent.name} のタスク実行完了 (${executionTime}ms)`,
        'success',
        subagent.id,
        subagent.name,
      );

      return {
        subagentId: subagent.id,
        result: response.text,
        executionTime,
        tokensUsed: response.tokensUsed,
        status: 'success',
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      subagent.status = 'idle';

      // エラーをタスク履歴に記録
      subagent.taskHistory.push({
        taskId: task.id,
        task: task.task,
        result: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        status: 'failed',
      });

      this.sendProgress(
        `❌ ${subagent.name} のタスク実行失敗: ${error instanceof Error ? error.message : String(error)}`,
        'error',
        subagent.id,
        subagent.name,
      );

      return {
        subagentId: subagent.id,
        result: error instanceof Error ? error.message : String(error),
        executionTime,
        status: 'failed',
      };
    }
  }

  /**
   * サブエージェント並列実行
   */
  async executeParallel(
    subagents: Subagent[],
    task: SubagentTask,
  ): Promise<SubagentResult[]> {
    this.sendProgress(
      `⚡ ${subagents.length}個のサブエージェントで並列実行開始`,
      'info',
    );

    const startTime = Date.now();
    const results: SubagentResult[] = [];
    const activeSubagents = new Set<string>();

    // 並列実行の制御
    const executeWithLimit = async (
      subagent: Subagent,
    ): Promise<SubagentResult> => {
      activeSubagents.add(subagent.id);
      this.sendProgress(
        `🤖 ${subagent.name} が実行中... (${activeSubagents.size}/${this.maxConcurrent})`,
        'progress',
      );

      try {
        const result = await this.executeTask(subagent, task);
        activeSubagents.delete(subagent.id);
        this.sendProgress(
          `✅ ${subagent.name} 完了 (残り: ${subagents.length - results.length - 1})`,
          'success',
        );
        return result;
      } catch (error) {
        activeSubagents.delete(subagent.id);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.sendProgress(`❌ ${subagent.name} 失敗: ${errorMessage}`, 'error');

        // 失敗した場合でも結果オブジェクトを返す
        return {
          subagentId: subagent.id,
          result: `エラー: ${errorMessage}`,
          status: 'failed',
          executionTime: Date.now() - startTime,
          error: errorMessage,
        };
      }
    };

    // 並列実行を制限付きで実行
    const chunks = this.chunkArray(subagents, this.maxConcurrent);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      this.sendProgress(
        `🔄 バッチ ${i + 1}/${chunks.length} 実行中 (${chunk.length}個のサブエージェント)`,
        'progress',
      );

      try {
        const chunkResults = await Promise.allSettled(
          chunk.map((subagent) => executeWithLimit(subagent)),
        );

        // 結果を処理
        chunkResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            const subagent = chunk[index];
            const errorMessage =
              result.reason instanceof Error
                ? result.reason.message
                : String(result.reason);
            results.push({
              subagentId: subagent.id,
              result: `並列実行エラー: ${errorMessage}`,
              executionTime: Date.now() - startTime,
              status: 'failed',
              error: errorMessage,
            });
          }
        });
      } catch (batchError) {
        // バッチ全体のエラーハンドリング
        this.sendProgress(
          `❌ バッチ ${i + 1} でエラーが発生: ${batchError instanceof Error ? batchError.message : String(batchError)}`,
          'error',
        );

        // バッチ内の各サブエージェントにエラー結果を追加
        chunk.forEach((subagent) => {
          results.push({
            subagentId: subagent.id,
            result: `バッチ実行エラー: ${batchError instanceof Error ? batchError.message : String(batchError)}`,
            executionTime: Date.now() - startTime,
            status: 'failed',
            error:
              batchError instanceof Error
                ? batchError.message
                : String(batchError),
          });
        });
      }
    }

    const totalTime = Date.now() - startTime;
    const successCount = results.filter((r) => r.status === 'success').length;
    const failedCount = results.filter((r) => r.status === 'failed').length;

    this.sendProgress(
      `🎯 並列実行完了: ${results.length}個のサブエージェント (成功: ${successCount}, 失敗: ${failedCount}, 総実行時間: ${totalTime}ms)`,
      'success',
    );

    return results;
  }

  /**
   * タスクプロンプト生成
   */
  private generateTaskPrompt(subagent: Subagent, task: SubagentTask): string {
    let prompt = `あなたは${subagent.name}という専門的なAIアシスタントです。

専門分野: ${subagent.specialty}
説明: ${subagent.description}

${subagent.systemPrompt ? `システムプロンプト: ${subagent.systemPrompt}\n\n` : ''}

タスク: ${task.task}

専門的な視点から回答してください。`;

    if (task.context) {
      prompt += `\n\nコンテキスト: ${task.context}`;
    }

    return prompt;
  }

  /**
   * 配列を指定サイズのチャンクに分割
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * 実行状況の詳細表示
   */
  displayExecutionStatus(
    subagents: Subagent[],
    activeCount: number,
    completedCount: number,
  ): void {
    const progress = Math.round((completedCount / subagents.length) * 100);
    this.sendProgress(
      `📊 実行状況: ${completedCount}/${subagents.length} 完了 (${progress}%) - アクティブ: ${activeCount}`,
      'info',
    );
  }
}
