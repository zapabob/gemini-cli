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
      console.log('📋 サブエージェントが登録されていません');
      console.log(
        '💡 サブエージェントを作成するには: gemini agents create --name <name> --specialty <specialty> --description <description>',
      );
      return;
    }

    console.log(`📋 登録済みサブエージェント一覧 (${subagents.length}個)`);
    console.log('═'.repeat(80));

    subagents.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.name}`);
      console.log(`   🔧 専門分野: ${agent.specialty}`);
      console.log(`   📝 説明: ${agent.description}`);
      console.log(`   🎨 色: ${agent.color}`);
      console.log(`   🤖 モデル: ${agent.model}`);
      if (agent.capabilities && agent.capabilities.length > 0) {
        console.log(`   ⚡ 機能: ${agent.capabilities.join(', ')}`);
      }
      console.log('');
    });
  } catch (error) {
    console.error(`❌ サブエージェント一覧の取得に失敗しました:`, error);
    process.exit(1);
  }
}
