/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import yargs, { type ArgumentsCamelCase } from 'yargs';
import { hideBin } from 'yargs/helpers';
import {
  YamlAgentLoader,
  SubagentRegistry,
  SubagentExecutor,
  type SubagentDefinition,
  type Subagent,
  type SubagentTask,
  type SubagentSpecialty,
  type SubagentResult,
} from '@google/gemini-cli-core';

type ExecuteParallelArgs = {
  task: string;
  agents: string[];
  maxConcurrent: number;
  timeout: number;
};

type ParallelExecutionResult = {
  success: boolean;
  result?: string;
  error?: string;
  executionTime: number;
};

/**
 * サブエージェント並列実行コマンド
 */
export async function executeParallelAgentsCommand(
  args: string[],
): Promise<void> {
  const argv = (await yargs(hideBin(args))
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
    .option('maxConcurrent', {
      alias: 'max-concurrent',
      type: 'number',
      description: '最大同時実行数',
      default: 5,
    })
    .option('timeout', {
      type: 'number',
      description: 'タイムアウト時間（秒）',
      default: 300,
    })
    .strict()
    .help().parseAsync()) as ArgumentsCamelCase<ExecuteParallelArgs>;

  try {
    // サブエージェントを読み込む
    const loader = new YamlAgentLoader();
    await loader.loadAllAgents();

    const registry = SubagentRegistry.getInstance();
    let targetAgents = registry.getAllSubagents();

    // 特定のサブエージェントが指定された場合はフィルタリング
    const requestedAgents = argv.agents ?? [];
    if (requestedAgents.length > 0) {
      targetAgents = targetAgents.filter((agent: SubagentDefinition) =>
        requestedAgents.includes(agent.name),
      );

      if (targetAgents.length === 0) {
        console.log(
          `❌ 指定されたサブエージェントが見つかりません: ${requestedAgents.join(', ')}`,
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
    console.log(`⚡ 最大同時実行数: ${argv.maxConcurrent}`);
    console.log(`⏱️ タイムアウト: ${argv.timeout}秒`);
    console.log('');

    // 並列実行の開始
    const startTime = Date.now();
    const results = await executeParallelTasks(targetAgents, argv.task, {
      maxConcurrent: argv.maxConcurrent,
      timeoutMs: argv.timeout * 1000,
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
  agents: SubagentDefinition[],
  task: string,
  options: { maxConcurrent: number; timeoutMs: number },
): Promise<ParallelExecutionResult[]> {
  const results: ParallelExecutionResult[] = [];
  const semaphore = new Semaphore(options.maxConcurrent);

  // すべてのサブエージェントを並列実行
  const promises = agents.map(async (agent, index) => {
    await semaphore.acquire();

    try {
      console.log(`🔄 ${agent.name} を実行中...`);

      const executor = new SubagentExecutor({
        maxConcurrent: options.maxConcurrent,
        timeout: options.timeoutMs,
      });

      const subagent = toSubagent(agent, index);
      const taskPayload: SubagentTask = {
        id: `${agent.name}-${Date.now()}-${index}`,
        task,
        context: '',
        priority: 'medium',
        timeout: options.timeoutMs,
        metadata: { model: agent.model },
      };

      const startTime = Date.now();
      const result = await Promise.race([
        executor.executeTask(subagent, taskPayload),
        new Promise((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(`タイムアウト: ${options.timeoutMs}ms`),
              ),
            options.timeoutMs,
          ),
        ),
      ]);

      const executionTime = Date.now() - startTime;
      const subagentResult = result as SubagentResult;
      results[index] = {
        success: subagentResult.status === 'success',
        result: subagentResult.result,
        error: subagentResult.error,
        executionTime,
      };
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
 * SubagentDefinition から Subagent インスタンスを生成するヘルパー。
 */
function toSubagent(
  definition: SubagentDefinition,
  index: number,
): Subagent {
  const allowedSpecialties: Set<SubagentSpecialty> = new Set([
    'code_review',
    'debugging',
    'data_analysis',
    'security_audit',
    'performance_optimization',
    'documentation',
    'testing',
    'architecture_design',
    'api_design',
    'database_optimization',
    'frontend_development',
    'backend_development',
    'devops',
    'machine_learning',
    'custom',
  ]);

  const specialty = allowedSpecialties.has(
    definition.specialty as SubagentSpecialty,
  )
    ? (definition.specialty as SubagentSpecialty)
    : 'custom';

  return {
    id: `yaml-${index}-${definition.name}`,
    name: definition.name,
    description: definition.description,
    specialty,
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
  };
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
