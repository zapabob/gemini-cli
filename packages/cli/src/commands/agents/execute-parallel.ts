/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {
  YamlAgentLoader,
  SubagentRegistry,
  SubagentExecutor,
} from '@google/gemini-cli-core';

/**
 * サブエージェント並列実行コマンド
 */
export async function executeParallelAgentsCommand(
  args: string[],
): Promise<void> {
  const argv = await yargs(hideBin(args))
    .option('task', {
      type: 'string',
      description: '実行するタスク',
      demandOption: true,
    })
    .option('agents', {
      type: 'array',
      description:
        '実行するサブエージェント名（指定しない場合は全サブエージェント）',
      default: [],
    })
    .option('max-concurrent', {
      type: 'number',
      description: '最大同時実行数',
      default: 5,
    })
    .option('timeout', {
      type: 'number',
      description: 'タイムアウト時間（秒）',
      default: 300,
    })
    .help().argv;

  try {
    // サブエージェントを読み込む
    const loader = new YamlAgentLoader();
    await loader.loadAllAgents();

    const registry = SubagentRegistry.getInstance();
    let targetAgents = registry.getAllSubagents();

    // 特定のサブエージェントが指定された場合はフィルタリング
    if (argv.agents && argv.agents.length > 0) {
      targetAgents = targetAgents.filter((agent) =>
        argv.agents.includes(agent.name),
      );

      if (targetAgents.length === 0) {
        console.log(
          `❌ 指定されたサブエージェントが見つかりません: ${argv.agents.join(', ')}`,
        );
        console.log(
          '利用可能なサブエージェントを確認するには: gemini agents list',
        );
        process.exit(1);
      }
    }

    if (targetAgents.length === 0) {
      console.log('❌ 実行可能なサブエージェントがありません');
      console.log('サブエージェントを作成するには: gemini agents create');
      process.exit(1);
    }

    console.log(`🚀 並列実行を開始します`);
    console.log(`📋 タスク: ${argv.task}`);
    console.log(`🤖 実行サブエージェント数: ${targetAgents.length}`);
    console.log(`⚡ 最大同時実行数: ${argv['max-concurrent']}`);
    console.log(`⏱️ タイムアウト: ${argv.timeout}秒`);
    console.log('');

    // 並列実行の開始
    const startTime = Date.now();
    const results = await executeParallelTasks(targetAgents, argv.task, {
      maxConcurrent: argv['max-concurrent'],
      timeout: argv.timeout * 1000,
    });

    const executionTime = Date.now() - startTime;

    // 結果の表示
    console.log(`✅ 並列実行完了`);
    console.log(`⏱️ 総実行時間: ${executionTime}ms`);
    console.log('');

    results.forEach((result, index) => {
      const agent = targetAgents[index];
      console.log(`🤖 ${agent.name} (${agent.specialty}):`);
      console.log(`   📊 実行時間: ${result.executionTime}ms`);
      console.log(`   ✅ 結果: ${result.success ? '成功' : '失敗'}`);
      if (result.error) {
        console.log(`   ❌ エラー: ${result.error}`);
      } else {
        console.log(
          `   📝 出力: ${result.result?.substring(0, 100)}${result.result && result.result.length > 100 ? '...' : ''}`,
        );
      }
      console.log('');
    });
  } catch (error) {
    console.error(`❌ 並列実行に失敗しました:`, error);
    process.exit(1);
  }
}

/**
 * サブエージェントを並列実行する関数
 */
async function executeParallelTasks(
  agents: Array<{ name: string; specialty: string; model?: string }>,
  task: string,
  options: { maxConcurrent: number; timeout: number },
): Promise<
  Array<{
    success: boolean;
    result?: string;
    error?: string;
    executionTime: number;
  }>
> {
  const results: Array<{
    success: boolean;
    result?: string;
    error?: string;
    executionTime: number;
  }> = [];
  const semaphore = new Semaphore(options.maxConcurrent);

  // すべてのサブエージェントを並列実行
  const promises = agents.map(async (agent, index) => {
    await semaphore.acquire();

    try {
      console.log(`🔄 ${agent.name} を実行中...`);

      const executor = new SubagentExecutor({
        apiKey: process.env.GOOGLE_GENAI_API_KEY || '',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        defaultModel: agent.model || 'gemini-2.5-pro',
        defaultTemperature: 0.7,
        defaultMaxTokens: 4096,
      });

      const startTime = Date.now();
      const result = await Promise.race([
        executor.executeTask({
          task,
          context: '',
          specialty: agent.specialty,
          agentName: agent.name,
        }),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error(`タイムアウト: ${options.timeout}ms`)),
            options.timeout,
          ),
        ),
      ]);

      const executionTime = Date.now() - startTime;
      results[index] = { ...result, executionTime, success: true };
    } catch (error) {
      results[index] = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: 0,
      };
    } finally {
      semaphore.release();
    }
  });

  await Promise.all(promises);
  return results;
}

/**
 * セマフォの実装（並列実行数を制限）
 */
class Semaphore {
  private permits: number;
  private waiting: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    return new Promise((resolve) => {
      this.waiting.push(resolve);
    });
  }

  release(): void {
    this.permits++;
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift()!;
      this.permits--;
      resolve();
    }
  }
}
