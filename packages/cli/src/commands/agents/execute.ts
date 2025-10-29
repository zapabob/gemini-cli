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
 * サブエージェント実行コマンド
 */
export async function executeAgentCommand(args: string[]): Promise<void> {
  const argv = await yargs(hideBin(args))
    .option('name', {
      type: 'string',
      description: '実行するサブエージェント名',
      demandOption: true,
    })
    .option('task', {
      type: 'string',
      description: '実行するタスク',
      demandOption: true,
    })
    .option('context', {
      type: 'string',
      description: '追加のコンテキスト情報',
    })
    .help().argv;

  try {
    // サブエージェントを読み込む
    const loader = new YamlAgentLoader();
    await loader.loadAllAgents();

    const registry = SubagentRegistry.getInstance();
    const agentDefinition = registry.getSubagent(argv.name);

    if (!agentDefinition) {
      console.log(`❌ サブエージェント「${argv.name}」が見つかりません`);
      console.log(
        '利用可能なサブエージェントを確認するには: gemini agents list',
      );
      process.exit(1);
    }

    console.log(`🤖 サブエージェント「${agentDefinition.name}」を実行します`);
    console.log(`📋 タスク: ${argv.task}`);
    console.log(`🔧 専門分野: ${agentDefinition.specialty}`);

    // サブエージェントエグゼキュータを作成して実行
    const executor = new SubagentExecutor();

    // シンプルな実行（実際の実装ではより詳細なタスク実行ロジックが必要）
    const result = await executor.executeTask({
      id: `execute-${agentDefinition.name}-${Date.now()}`,
      task: argv.task,
      context: argv.context || '',
      priority: 'medium',
      specialty: agentDefinition.specialty,
      agentName: agentDefinition.name,
    });

    console.log(`✅ 実行完了`);
    console.log(`📊 実行時間: ${result.executionTime}ms`);
    console.log(`📝 結果:`);
    console.log(result);
  } catch (error) {
    console.error(`❌ サブエージェントの実行に失敗しました:`, error);
    process.exit(1);
  }
}
