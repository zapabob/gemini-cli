/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { MessageActionReturn, SlashCommand } from './types.js';
import { CommandKind } from './types.js';
import {
  readSubagentsConfig,
  createSubagent,
  getSubagent,
  updateSubagent,
  deleteSubagent,
  getSubagentsBySpecialty,
  SubagentSpecialtySchema,
  SubagentExecutor,
} from '@google/gemini-cli-core';

// ハンドラー関数の実装
async function handleListSubagents(): Promise<MessageActionReturn> {
  try {
    const config = await readSubagentsConfig();
    const activeSubagents = config.subagents.filter(
      (s: {
        name: string;
        specialty: string;
        isActive: boolean;
        description: string;
        id: string;
      }) => s.isActive,
    );

    if (activeSubagents.length === 0) {
      return {
        type: 'message',
        messageType: 'info',
        content:
          '📋 **サブエージェント一覧**\n\n現在アクティブなサブエージェントはありません。\n\n`/subagents create` で新しいサブエージェントを作成してください。',
      };
    }

    const subagentsList = activeSubagents
      .map(
        (s: {
          name: string;
          specialty: string;
          isActive: boolean;
          description: string;
          id: string;
        }) =>
          `- **${s.name}** (${s.specialty})\n  ${s.description}\n  ID: \`${s.id}\``,
      )
      .join('\n\n');

    return {
      type: 'message',
      messageType: 'info',
      content: `📋 **サブエージェント一覧**\n\n${subagentsList}\n\n**合計**: ${activeSubagents.length}個のアクティブなサブエージェント`,
    };
  } catch (error) {
    return {
      type: 'message',
      messageType: 'error',
      content: `❌ サブエージェント一覧の取得に失敗しました: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function handleCreateSubagent(
  args: string[],
): Promise<MessageActionReturn> {
  if (args.length < 3) {
    return {
      type: 'message',
      messageType: 'error',
      content:
        '❌ 使用方法: `/subagents create <name> <specialty> <description>`\n\n例: `/subagents create CodeReviewer code_review "コードレビュー専門家"`',
    };
  }

  const [name, specialty, ...descriptionParts] = args;
  const description = descriptionParts.join(' ');

  try {
    // 専門分野の検証
    const specialtyResult = SubagentSpecialtySchema.safeParse(specialty);
    if (!specialtyResult.success) {
      return {
        type: 'message',
        messageType: 'error',
        content: `❌ 無効な専門分野: ${specialty}\n\n利用可能な専門分野: code_review, debugging, data_analysis, security_audit, performance_optimization, documentation, testing, architecture_design, api_design, machine_learning`,
      };
    }

    const subagent = await createSubagent({
      name,
      description,
      specialty: specialtyResult.data,
      prompt: `あなたは${name}という${description}です。専門的な視点から回答してください。`,
      maxTokens: 4000,
      temperature: 0.7,
      customTools: [],
      isActive: true,
    });

    return {
      type: 'message',
      messageType: 'info',
      content: `✅ **サブエージェント作成完了**\n\n**名前**: ${subagent.name}\n**専門分野**: ${subagent.specialty}\n**説明**: ${subagent.description}\n**ID**: \`${subagent.id}\`\n\n/subagents execute ${subagent.id} <task> でタスクを実行できます。`,
    };
  } catch (error) {
    return {
      type: 'message',
      messageType: 'error',
      content: `❌ サブエージェントの作成に失敗しました: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function handleDeleteSubagent(
  args: string[],
): Promise<MessageActionReturn> {
  if (args.length < 1) {
    return {
      type: 'message',
      messageType: 'error',
      content: '❌ 使用方法: `/subagents delete <id>`',
    };
  }

  const id = args[0];

  try {
    const success = await deleteSubagent(id);
    if (success) {
      return {
        type: 'message',
        messageType: 'info',
        content: `✅ サブエージェント \`${id}\` を削除しました。`,
      };
    } else {
      return {
        type: 'message',
        messageType: 'error',
        content: `❌ サブエージェント \`${id}\` が見つかりません。`,
      };
    }
  } catch (error) {
    return {
      type: 'message',
      messageType: 'error',
      content: `❌ サブエージェントの削除に失敗しました: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function handleShowSubagent(
  args: string[],
): Promise<MessageActionReturn> {
  if (args.length < 1) {
    return {
      type: 'message',
      messageType: 'error',
      content: '❌ 使用方法: `/subagents show <id>`',
    };
  }

  const id = args[0];

  try {
    const subagent = await getSubagent(id);
    if (!subagent) {
      return {
        type: 'message',
        messageType: 'error',
        content: `❌ サブエージェント \`${id}\` が見つかりません。`,
      };
    }

    const taskHistory = subagent.taskHistory.slice(-5); // 最新5件
    const taskHistoryText =
      taskHistory.length > 0
        ? taskHistory.map((t) => `- ${t.task} (${t.status})`).join('\n')
        : 'なし';

    return {
      type: 'message',
      messageType: 'info',
      content: `📋 **サブエージェント詳細**\n\n**名前**: ${subagent.name}\n**専門分野**: ${subagent.specialty}\n**説明**: ${subagent.description}\n**ステータス**: ${subagent.status}\n**作成日**: ${subagent.createdAt}\n**最終使用**: ${subagent.lastUsed || 'なし'}\n\n**最新のタスク履歴**:\n${taskHistoryText}`,
    };
  } catch (error) {
    return {
      type: 'message',
      messageType: 'error',
      content: `❌ サブエージェント詳細の取得に失敗しました: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function handleExecuteSubagent(
  args: string[],
): Promise<MessageActionReturn> {
  if (args.length < 2) {
    return {
      type: 'message',
      messageType: 'error',
      content:
        '❌ 使用方法: `/subagents execute <id> <task>`\n\n例: `/subagents execute abc123 "このコードをレビューしてください"`',
    };
  }

  const [id, ...taskParts] = args;
  const task = taskParts.join(' ');

  try {
    const subagent = await getSubagent(id);
    if (!subagent) {
      return {
        type: 'message',
        messageType: 'error',
        content: `❌ サブエージェント \`${id}\` が見つかりません。`,
      };
    }

    // モック実行（実際のGemini API統合は後で実装）
    const executor = new SubagentExecutor();
    const result = await executor.executeTask(subagent, {
      id: `task-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      task,
      priority: 'medium',
      timeout: 30000,
    });

    return {
      type: 'message',
      messageType: 'info',
      content: `🤖 **タスク実行完了**\n\n**サブエージェント**: ${subagent.name}\n**タスク**: ${task}\n**結果**: ${result.result}\n**実行時間**: ${result.executionTime}ms\n**トークン使用量**: ${result.tokensUsed || '不明'}`,
    };
  } catch (error) {
    return {
      type: 'message',
      messageType: 'error',
      content: `❌ タスク実行に失敗しました: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function handleExecuteParallel(
  args: string[],
): Promise<MessageActionReturn> {
  if (args.length < 2) {
    return {
      type: 'message',
      messageType: 'error',
      content:
        '❌ 使用方法: `/subagents execute-parallel <specialty> <task>`\n\n例: `/subagents execute-parallel code_review "このコードをレビューしてください"`',
    };
  }

  const [specialty, ...taskParts] = args;
  const task = taskParts.join(' ');

  try {
    const specialtyResult = SubagentSpecialtySchema.safeParse(specialty);
    if (!specialtyResult.success) {
      return {
        type: 'message',
        messageType: 'error',
        content: `❌ 無効な専門分野: ${specialty}\n\n利用可能な専門分野: ${SubagentSpecialtySchema.options.join(', ')}`,
      };
    }
    const subagents = await getSubagentsBySpecialty(specialtyResult.data);
    if (subagents.length === 0) {
      return {
        type: 'message',
        messageType: 'error',
        content: `❌ 専門分野 \`${specialty}\` のサブエージェントが見つかりません。`,
      };
    }

    const executor = new SubagentExecutor();
    const results = await executor.executeParallel(subagents, {
      id: `parallel-task-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      task,
      priority: 'medium',
      timeout: 30000,
    });

    const resultsText = results
      .map(
        (r) =>
          `- **${r.subagentId}**: ${r.result.substring(0, 100)}${r.result.length > 100 ? '...' : ''}`,
      )
      .join('\n');

    return {
      type: 'message',
      messageType: 'info',
      content: `🤖 **並列実行完了**\n\n**専門分野**: ${specialty}\n**タスク**: ${task}\n**実行数**: ${results.length}\n\n**結果**:\n${resultsText}`,
    };
  } catch (error) {
    return {
      type: 'message',
      messageType: 'error',
      content: `❌ 並列実行に失敗しました: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function handleToggleSubagent(
  args: string[],
): Promise<MessageActionReturn> {
  if (args.length < 1) {
    return {
      type: 'message',
      messageType: 'error',
      content: '❌ 使用方法: `/subagents toggle <id>`',
    };
  }

  const id = args[0];

  try {
    const subagent = await getSubagent(id);
    if (!subagent) {
      return {
        type: 'message',
        messageType: 'error',
        content: `❌ サブエージェント \`${id}\` が見つかりません。`,
      };
    }

    const updatedSubagent = await updateSubagent(id, {
      isActive: !subagent.isActive,
    });
    if (!updatedSubagent) {
      return {
        type: 'message',
        messageType: 'error',
        content: `❌ サブエージェントの更新に失敗しました。`,
      };
    }

    const status = updatedSubagent.isActive ? '有効' : '無効';
    return {
      type: 'message',
      messageType: 'info',
      content: `✅ サブエージェント \`${id}\` を${status}にしました。`,
    };
  } catch (error) {
    return {
      type: 'message',
      messageType: 'error',
      content: `❌ サブエージェントの切り替えに失敗しました: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function handleCreateTemplate(
  args: string[],
): Promise<MessageActionReturn> {
  if (args.length < 1) {
    return {
      type: 'message',
      messageType: 'error',
      content:
        '❌ 使用方法: `/subagents create-template <specialty>`\n\n例: `/subagents create-template code_review`',
    };
  }

  const specialty = args[0];

  try {
    const specialtyResult = SubagentSpecialtySchema.safeParse(specialty);
    if (!specialtyResult.success) {
      return {
        type: 'message',
        messageType: 'error',
        content: `❌ 無効な専門分野: ${specialty}`,
      };
    }

    const templates: Record<
      string,
      { name: string; description: string; prompt: string }
    > = {
      code_review: {
        name: 'CodeReviewer',
        description: 'コードレビューと品質保証の専門家',
        prompt:
          'あなたはコードレビュー専門家です。バグの特定、セキュリティ問題の検出、コード品質の向上に特化して回答してください。',
      },
      debugging: {
        name: 'DebugMaster',
        description: 'デバッグとトラブルシューティングの専門家',
        prompt:
          'あなたはデバッグ専門家です。エラーの原因特定と解決策の提案に特化して回答してください。',
      },
      data_analysis: {
        name: 'DataAnalyst',
        description: 'データ分析と統計の専門家',
        prompt:
          'あなたはデータ分析専門家です。データの可視化、統計解析、インサイトの抽出に特化して回答してください。',
      },
    };

    const template = templates[specialtyResult.data];
    if (!template) {
      return {
        type: 'message',
        messageType: 'error',
        content: `❌ テンプレートが利用できません: ${specialty}`,
      };
    }

    const subagent = await createSubagent({
      name: template.name,
      description: template.description,
      specialty: specialtyResult.data,
      prompt: template.prompt,
      maxTokens: 4000,
      temperature: 0.7,
      customTools: [],
      isActive: true,
    });

    return {
      type: 'message',
      messageType: 'info',
      content: `✅ **テンプレートからサブエージェント作成完了**\n\n**名前**: ${subagent.name}\n**専門分野**: ${subagent.specialty}\n**説明**: ${subagent.description}\n**ID**: \`${subagent.id}\``,
    };
  } catch (error) {
    return {
      type: 'message',
      messageType: 'error',
      content: `❌ テンプレート作成に失敗しました: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export const subagentsCommand: SlashCommand = {
  name: 'subagents',
  description: 'Manage specialized sub-agents',
  kind: CommandKind.BUILT_IN,
  action: async (_context, args): Promise<MessageActionReturn> => {
    const argsArray = args.split(' ').filter((arg) => arg.length > 0);

    if (argsArray.length === 0) {
      return {
        type: 'message',
        messageType: 'info',
        content: `🤖 **サブエージェント機能**

専門的なAIアシスタントチームを管理できます。

**利用可能なコマンド:**
- \`/subagents list\` - サブエージェント一覧表示
- \`/subagents create\` - サブエージェント作成
- \`/subagents show <id>\` - サブエージェント詳細表示
- \`/subagents execute <id> <task>\` - タスク実行
- \`/subagents execute-parallel <specialty> <task>\` - 並列実行
- \`/subagents toggle <id>\` - 有効/無効切り替え
- \`/subagents delete <id>\` - サブエージェント削除

**専門分野:**
- code_review, debugging, data_analysis, security_audit
- performance_optimization, documentation, testing
- architecture_design, api_design, machine_learning`,
      };
    }

    const subcommand = argsArray[0];

    try {
      switch (subcommand) {
        case 'list':
          return await handleListSubagents();
        case 'create':
          return await handleCreateSubagent(argsArray.slice(1));
        case 'delete':
          return await handleDeleteSubagent(argsArray.slice(1));
        case 'show':
          return await handleShowSubagent(argsArray.slice(1));
        case 'execute':
          return await handleExecuteSubagent(argsArray.slice(1));
        case 'execute-parallel':
          return await handleExecuteParallel(argsArray.slice(1));
        case 'toggle':
          return await handleToggleSubagent(argsArray.slice(1));
        case 'create-template':
          return await handleCreateTemplate(argsArray.slice(1));
        default:
          return {
            type: 'message',
            messageType: 'error',
            content: `❌ 不明なサブコマンド: ${subcommand}\n\n利用可能なコマンド: list, create, delete, show, execute, execute-parallel, toggle, create-template`,
          };
      }
    } catch (error) {
      return {
        type: 'message',
        messageType: 'error',
        content: `❌ エラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
};
