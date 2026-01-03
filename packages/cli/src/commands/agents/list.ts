/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { YamlAgentLoader, SubagentRegistry } from '@google/gemini-cli-core';

/**
 * サブエージェント一覧表示コマンド
 */
export async function listAgentsCommand(): Promise<void> {
  try {
    // サブエージェントを読み込む
    const loader = new YamlAgentLoader();
    await loader.loadAllAgents();

    const registry = SubagentRegistry.getInstance();
    const subagents = registry.getAllSubagents();

    if (subagents.length === 0) {
      // No subagents registered
      return;
    }

    // List subagents available
  } catch (error) {
    console.error(`❌ サブエージェント一覧の取得に失敗しました:`, error);
    process.exit(1);
  }
}
