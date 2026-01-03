/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { YamlAgentLoader } from '@google/gemini-cli-core';

/**
 * サブエージェント削除コマンド
 */
export async function deleteAgentCommand(args: string[]): Promise<void> {
  const argv = await yargs(hideBin(args))
    .option('name', {
      type: 'string',
      description: '削除するサブエージェント名',
      demandOption: true,
    })
    .option('force', {
      type: 'boolean',
      description: '確認なしで削除',
      default: false,
    })
    .help().argv;

  try {
    const loader = new YamlAgentLoader();

    // 削除前に確認
    if (!argv.force) {
      console.log(`⚠️ サブエージェント「${argv.name}」を削除しますか？`);
      console.log('この操作は取り消すことができません。');
      console.log('続けるには「yes」と入力してください。');

      const readline = await import('node:readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await new Promise<string>((resolve) => {
        rl.question('> ', (input) => {
          rl.close();
          resolve(input.trim().toLowerCase());
        });
      });

      if (answer !== 'yes' && answer !== 'y') {
        // Deletion cancelled by user
        return;
      }
    }

    const deleted = await loader.deleteAgentDefinition(argv.name);

    if (deleted) {
      // Agent deleted successfully
    } else {
      process.stderr.write(`❌ サブエージェント「${argv.name}」が見つかりません\n`);
      process.exit(1);
    }
  } catch (error) {
    process.stderr.write(`❌ サブエージェントの削除に失敗しました: ${error}\n`);
    process.exit(1);
  }
}
