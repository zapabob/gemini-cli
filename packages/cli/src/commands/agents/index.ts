/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { createAgentCommand } from './create.js';
import { listAgentsCommand } from './list.js';
import { deleteAgentCommand } from './delete.js';
import { executeAgentCommand } from './execute.js';
import { createNaturalLanguageAgentCommand } from './create-natural.js';
import { executeParallelAgentsCommand } from './execute-parallel.js';

/**
 * サブエージェント管理コマンドのメインエントリーポイント
 */
export async function agentsCommand(args: string[]): Promise<void> {
  const _argv = await yargs(hideBin(args))
    .scriptName('gemini agents')
    .usage('$0 <cmd> [args]')
    .command(
      'create',
      '新しいサブエージェントを作成',
      (yargs) => yargs
          .option('name', {
            type: 'string',
            demandOption: true,
            describe: 'サブエージェント名',
          })
          .option('specialty', {
            type: 'string',
            demandOption: true,
            describe: '専門分野',
          })
          .option('description', {
            type: 'string',
            demandOption: true,
            describe: '説明',
          })
          .help(),
      async (argv) => {
        await createAgentCommand([
          '--name',
          argv.name!,
          '--specialty',
          argv.specialty!,
          '--description',
          argv.description!,
        ]);
      },
    )
    .command('list', '登録済みサブエージェントの一覧を表示', {}, async () => {
      await listAgentsCommand();
    })
    .command(
      'delete',
      'サブエージェントを削除',
      (yargs) => yargs
          .option('name', {
            type: 'string',
            demandOption: true,
            describe: '削除するサブエージェント名',
          })
          .option('force', {
            type: 'boolean',
            default: false,
            describe: '確認なしで削除',
          })
          .help(),
      async (argv) => {
        await deleteAgentCommand([
          '--name',
          argv.name!,
          '--force',
          argv.force.toString(),
        ]);
      },
    )
    .command(
      'execute',
      'サブエージェントを実行',
      (yargs) => yargs
          .option('name', {
            type: 'string',
            demandOption: true,
            describe: '実行するサブエージェント名',
          })
          .option('task', {
            type: 'string',
            demandOption: true,
            describe: '実行するタスク',
          })
          .option('context', {
            type: 'string',
            describe: '追加のコンテキスト情報',
          })
          .help(),
      async (argv) => {
        await executeAgentCommand([
          '--name',
          argv.name!,
          '--task',
          argv.task!,
          '--context',
          argv.context || '',
        ]);
      },
    )
    .command(
      'create-natural',
      '自然言語プロンプトからサブエージェントを作成',
      (yargs) => yargs
          .positional('prompt', {
            describe: 'サブエージェントの説明を自然言語で記述',
            type: 'string',
            demandOption: true,
          })
          .help(),
      async (argv) => {
        await createNaturalLanguageAgentCommand([argv.prompt!]);
      },
    )
    .command(
      'execute-parallel',
      '複数のサブエージェントを並列実行',
      (yargs) => yargs
          .option('task', {
            type: 'string',
            demandOption: true,
            describe: '実行するタスク',
          })
          .option('agents', {
            type: 'array',
            describe:
              '実行するサブエージェント名（指定なしで全サブエージェント）',
          })
          .option('max-concurrent', {
            type: 'number',
            default: 5,
            describe: '最大同時実行数',
          })
          .option('timeout', {
            type: 'number',
            default: 300,
            describe: 'タイムアウト時間（秒）',
          })
          .help(),
      async (argv) => {
        await executeParallelAgentsCommand([
          '--task',
          argv.task!,
          '--agents',
          (argv.agents || []).join(','),
          '--max-concurrent',
          argv['max-concurrent'].toString(),
          '--timeout',
          argv.timeout.toString(),
        ]);
      },
    )
    .demandCommand(1, 'サブコマンドを指定してください')
    .help().argv;
}
