/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Subagent } from '../config/subagents.js';
import { GeminiClient } from './geminiClient.js';

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
  metadata?: Record<string, any>;
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
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * サブエージェント実行オプション
 */
export interface SubagentExecutorOptions {
  geminiClient?: GeminiClient;
  maxConcurrent?: number;
  timeout?: number;
  onProgress?: (message: string, type: 'info' | 'success' | 'error' | 'progress') => void;
}

/**
 * サブエージェント実行器
 */
export class SubagentExecutor {
  private geminiClient: GeminiClient;
  private maxConcurrent: number;
  private timeout: number;
  private onProgress?: (message: string, type: 'info' | 'success' | 'error' | 'progress') => void;

  constructor(options: SubagentExecutorOptions = {}) {
    this.geminiClient = options.geminiClient || new GeminiClient({
      apiKey: process.env.GEMINI_API_KEY || 'mock-api-key',
      defaultModel: 'models/gemini-1.5-flash',
      defaultTemperature: 0.7,
      defaultMaxTokens: 4096
    });
    this.maxConcurrent = options.maxConcurrent || 5;
    this.timeout = options.timeout || 300000; // 5分
    this.onProgress = options.onProgress;
  }

  /**
   * 進捗メッセージを送信
   */
  private sendProgress(message: string, type: 'info' | 'success' | 'error' | 'progress' = 'info') {
    if (this.onProgress) {
      this.onProgress(message, type);
    }
  }

  /**
   * 単一サブエージェントタスク実行
   */
  async executeTask(
    subagent: Subagent, 
    task: SubagentTask
  ): Promise<SubagentResult> {
    const startTime = Date.now();
    
    try {
      this.sendProgress(`🚀 ${subagent.name} のタスク実行開始: ${task.task}`, 'progress');
      
      // サブエージェントの状態を更新
      subagent.status = 'running';
      
      // Gemini APIを使用してタスクを実行
      const response = await this.geminiClient.generateText({
        prompt: this.generateTaskPrompt(subagent, task),
        maxTokens: subagent.maxTokens,
        temperature: subagent.temperature
      });

      const executionTime = Date.now() - startTime;
      
      // タスク履歴に追加
      subagent.taskHistory.push({
        taskId: task.id,
        task: task.task,
        result: response.text,
        timestamp: new Date().toISOString(),
        status: 'success'
      });

      // 最終使用日時を更新
      subagent.lastUsed = new Date().toISOString();
      subagent.status = 'idle';

      this.sendProgress(`✅ ${subagent.name} のタスク実行完了 (${executionTime}ms)`, 'success');

      return {
        subagentId: subagent.id,
        result: response.text,
        executionTime,
        tokensUsed: response.tokensUsed,
        status: 'success'
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
        status: 'failed'
      });

      this.sendProgress(`❌ ${subagent.name} のタスク実行失敗: ${error instanceof Error ? error.message : String(error)}`, 'error');

      return {
        subagentId: subagent.id,
        result: error instanceof Error ? error.message : String(error),
        executionTime,
        status: 'failed'
      };
    }
  }

  /**
   * サブエージェント並列実行
   */
  async executeParallel(
    subagents: Subagent[], 
    task: SubagentTask
  ): Promise<SubagentResult[]> {
    this.sendProgress(`⚡ ${subagents.length}個のサブエージェントで並列実行開始`, 'info');
    
    const startTime = Date.now();
    const results: SubagentResult[] = [];
    const activeSubagents = new Set<string>();

    // 並列実行の制御
    const executeWithLimit = async (subagent: Subagent): Promise<SubagentResult> => {
      activeSubagents.add(subagent.id);
      this.sendProgress(`🤖 ${subagent.name} が実行中... (${activeSubagents.size}/${this.maxConcurrent})`, 'progress');
      
      try {
        const result = await this.executeTask(subagent, task);
        activeSubagents.delete(subagent.id);
        this.sendProgress(`✅ ${subagent.name} 完了 (残り: ${subagents.length - results.length - 1})`, 'success');
        return result;
      } catch (error) {
        activeSubagents.delete(subagent.id);
        this.sendProgress(`❌ ${subagent.name} 失敗: ${error instanceof Error ? error.message : String(error)}`, 'error');
        throw error;
      }
    };

    // 並列実行を制限付きで実行
    const chunks = this.chunkArray(subagents, this.maxConcurrent);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      this.sendProgress(`🔄 バッチ ${i + 1}/${chunks.length} 実行中 (${chunk.length}個のサブエージェント)`, 'progress');
      
      const chunkResults = await Promise.allSettled(
        chunk.map(subagent => executeWithLimit(subagent))
      );
      
      // 結果を処理
      chunkResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          const subagent = chunk[index];
          results.push({
            subagentId: subagent.id,
            result: result.reason instanceof Error ? result.reason.message : String(result.reason),
            executionTime: Date.now() - startTime,
            status: 'failed'
          });
        }
      });
    }

    const totalTime = Date.now() - startTime;
    this.sendProgress(`🎯 並列実行完了: ${results.length}個のサブエージェント (総実行時間: ${totalTime}ms)`, 'success');

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
  displayExecutionStatus(subagents: Subagent[], activeCount: number, completedCount: number): void {
    const progress = Math.round((completedCount / subagents.length) * 100);
    this.sendProgress(`📊 実行状況: ${completedCount}/${subagents.length} 完了 (${progress}%) - アクティブ: ${activeCount}`, 'info');
  }
} 