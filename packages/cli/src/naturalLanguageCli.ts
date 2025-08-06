/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { NaturalLanguageCommand } from './commands/naturalLanguageCommand.js';

/**
 * 自然言語プロンプト処理CLIのメインエントリーポイント
 */
export async function main() {
  try {
    const command = new NaturalLanguageCommand();
    await command.run(process.argv.slice(2));
  } catch (error) {
    console.error('❌ CLIエラー:', error);
    process.exit(1);
  }
}

// CLIが直接実行された場合の処理
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ 予期しないエラー:', error);
    process.exit(1);
  });
} 