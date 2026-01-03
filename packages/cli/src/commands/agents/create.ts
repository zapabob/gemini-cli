/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { YamlAgentLoader } from '@google/gemini-cli-core';

/**
 * サブエージェント作成コマンド
 */
export async function createAgentCommand(args: string[]): Promise<void> {
  const argv = await yargs(hideBin(args))
    .option('name', {
      type: 'string',
      description: 'サブエージェント名',
      demandOption: true,
    })
    .option('specialty', {
      type: 'string',
      description: '専門分野',
      demandOption: true,
    })
    .option('description', {
      type: 'string',
      description: '説明',
      demandOption: true,
    })
    .option('model', {
      type: 'string',
      description: '使用モデル',
      default: 'gemini-1.5-flash',
    })
    .option('color', {
      type: 'string',
      description: '表示色',
      default: 'blue',
    })
    .help().argv;

  try {
    const loader = new YamlAgentLoader();
    await loader.createAgentDefinition(
      argv.name,
      argv.specialty,
      argv.description,
    );
    // Agent creation completed successfully
  } catch (error) {
    process.stderr.write(`❌ サブエージェントの作成に失敗しました: ${error}\n`);
    process.exit(1);
  }
}
