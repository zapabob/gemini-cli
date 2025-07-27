/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommandKind, MessageActionReturn, SlashCommand } from './types.js';
import { SupervisorAgent, SupervisorConfig, SupervisorRole, SupervisorResult, DecisionLog } from '../../../../core/src/subagents/supervisor.js';
import { Subagent, SubagentSpecialty } from '../../../../core/src/config/subagents.js';

interface NaturalLanguageRequest {
  goal: string;
  context?: string;
  subagents?: string[];
  style?: 'autocratic' | 'democratic' | 'laissez-faire';
  strategy?: 'sequential' | 'parallel' | 'hybrid';
}

/**
 * 自然言語の解析
 */
function parseNaturalLanguage(text: string): NaturalLanguageRequest {
  const request: NaturalLanguageRequest = {
    goal: '',
    context: '',
    subagents: [],
    style: 'democratic',
    strategy: 'hybrid'
  };

  // 基本的なキーワード解析
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  for (const line of lines) {
    if (line.toLowerCase().includes('目標') || line.toLowerCase().includes('goal') || line.toLowerCase().includes('実装')) {
      request.goal = line.replace(/^(目標|goal|実装):?\s*/i, '');
    } else if (line.toLowerCase().includes('コンテキスト') || line.toLowerCase().includes('context')) {
      request.context = line.replace(/^(コンテキスト|context):?\s*/i, '');
    } else if (line.toLowerCase().includes('サブエージェント') || line.toLowerCase().includes('subagent')) {
      const subagents = line.replace(/^(サブエージェント|subagent):?\s*/i, '').split(',').map(s => s.trim());
      request.subagents = subagents;
    } else if (line.toLowerCase().includes('スタイル') || line.toLowerCase().includes('style')) {
      const style = line.toLowerCase();
      if (style.includes('独裁') || style.includes('autocratic')) {
        request.style = 'autocratic';
      } else if (style.includes('放任') || style.includes('laissez')) {
        request.style = 'laissez-faire';
      } else {
        request.style = 'democratic';
      }
    } else if (line.toLowerCase().includes('戦略') || line.toLowerCase().includes('strategy')) {
      const strategy = line.toLowerCase();
      if (strategy.includes('順次') || strategy.includes('sequential')) {
        request.strategy = 'sequential';
      } else if (strategy.includes('並列') || strategy.includes('parallel')) {
        request.strategy = 'parallel';
      } else {
        request.strategy = 'hybrid';
      }
    }
  }

  // デフォルトの目標設定
  if (!request.goal) {
    request.goal = text;
  }

  return request;
}

/**
 * サブエージェントの自動生成
 */
function generateSubagents(request: NaturalLanguageRequest): Subagent[] {
  const subagents: Subagent[] = [];
  const baseId = Date.now().toString();

  // デフォルトのサブエージェント
  if (!request.subagents || request.subagents.length === 0) {
    subagents.push(
      {
        id: `${baseId}-researcher`,
        name: 'DeepResearch Agent',
        description: '最新ドキュメンテーションを調査する専門エージェント',
        specialty: 'documentation',
        prompt: `あなたは最新の技術ドキュメンテーションを調査する専門家です。
実装に必要な最新情報を収集し、以下の点に注目してください：
- 最新の技術仕様とベストプラクティス
- 関連するライブラリやフレームワーク
- セキュリティ要件とガイドライン
- パフォーマンス要件と最適化手法
- 互換性と依存関係`,
        maxTokens: 4000,
        temperature: 0.7,
        status: 'idle',
        createdAt: new Date().toISOString(),
        taskHistory: [],
        customTools: ['web_search', 'documentation_search'],
        isActive: true
      },
      {
        id: `${baseId}-architect`,
        name: 'Architecture Planner',
        description: '実装の指針を立てるアーキテクチャ専門エージェント',
        specialty: 'architecture_design',
        prompt: `あなたは優秀なアーキテクチャ設計者です。
収集された情報を基に、実装の指針を立ててください：
- システムアーキテクチャの設計
- 技術スタックの最適な選択
- 実装順序と優先度の決定
- リスク対策と品質基準の設定
- スケーラビリティと保守性の考慮`,
        maxTokens: 4000,
        temperature: 0.7,
        status: 'idle',
        createdAt: new Date().toISOString(),
        taskHistory: [],
        customTools: ['architecture_analysis', 'technology_selection'],
        isActive: true
      },
      {
        id: `${baseId}-developer`,
        name: 'Implementation Specialist',
        description: '実際の実装を行う開発専門エージェント',
        specialty: 'frontend_development',
        prompt: `あなたは経験豊富な開発者です。
設計された指針に基づいて、実際の実装を行ってください：
- 高品質なコードの作成
- パフォーマンスの最適化
- セキュリティの実装
- テスト可能性の確保
- 保守性の向上`,
        maxTokens: 4000,
        temperature: 0.7,
        status: 'idle',
        createdAt: new Date().toISOString(),
        taskHistory: [],
        customTools: ['code_generation', 'testing_framework'],
        isActive: true
      }
    );
  } else {
    // カスタムサブエージェントの生成
    request.subagents.forEach((name, index) => {
      subagents.push({
        id: `${baseId}-custom-${index}`,
        name,
        description: `${name}専門のサブエージェント`,
        specialty: 'custom' as SubagentSpecialty,
        prompt: `あなたは${name}の専門家です。与えられたタスクを専門的に実行してください。`,
        maxTokens: 4000,
        temperature: 0.7,
        status: 'idle',
        createdAt: new Date().toISOString(),
        taskHistory: [],
        customTools: [],
        isActive: true
      });
    });
  }

  return subagents;
}

/**
 * 監督者エージェントの実行
 */
async function executeSupervisor(request: NaturalLanguageRequest): Promise<MessageActionReturn> {
  try {
    const subagents = generateSubagents(request);

    const supervisorRole: SupervisorRole = {
      id: 'natural-language-supervisor',
      name: '自然言語監督者',
      description: '自然言語で指定された実装を監督するエージェント',
      responsibilities: [
        '自然言語での要求解析',
        'サブエージェントの自動生成',
        '並列実行の調整',
        '結果の統合と最終決定'
      ],
      decisionMakingAuthority: 'high',
      coordinationStyle: request.style || 'democratic'
    };

    const supervisorConfig: SupervisorConfig = {
      role: supervisorRole,
      maxSubagents: subagents.length,
      coordinationStrategy: request.strategy || 'hybrid',
      decisionThreshold: 0.8,
      progressReporting: true,
      errorHandling: 'adaptive'
    };

    const supervisor = new SupervisorAgent(supervisorConfig);

    const result: SupervisorResult = await supervisor.superviseImplementation(
      request.goal,
      subagents,
      request.context
    );

    // 結果の整形
    const subagentsList = subagents.map(s => `- ${s.name} (${s.specialty})`).join('\n');
    const decisionsList = result.decisions
      .filter((d: DecisionLog) => d.impact === 'high')
      .map((d: DecisionLog) => `- ${d.decision}: ${d.reasoning}`)
      .join('\n');

    return {
      type: 'message',
      messageType: 'info',
      content: `✅ **監督者エージェントの実行完了**

📊 **実行結果**
- 成功: ${result.success ? '✅' : '❌'}
- 実行時間: ${result.executionTime}ms
- サブエージェント数: ${result.subagentResults.length}
- 決定数: ${result.decisions.length}
- エラー数: ${result.errors.length}

👥 **生成されたサブエージェント**
${subagentsList}

🎯 **重要な決定**
${decisionsList || 'なし'}

📋 **最終出力**
${result.finalOutput}

📝 **調整ログ**
${result.coordinationLog.slice(-3).join('\n')}

👥 **サブエージェントの結果**
${result.subagentResults.map((sr: any) => `- ${sr.subagentId}: ${sr.status}${sr.error ? ` (エラー: ${sr.error})` : ''}`).join('\n')}`
    };

  } catch (error) {
    return {
      type: 'message',
      messageType: 'error',
      content: `❌ 監督者エージェントの実行に失敗しました: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * 監督者コマンドのメインアクション
 */
async function handleSupervisor(context: any, args: string): Promise<MessageActionReturn> {
  if (!args.trim()) {
    return {
      type: 'message',
      messageType: 'info',
      content: `🤖 **自然言語で並列実装とサブエージェントを呼び出し**

使用方法: \`/supervisor <自然言語での要求>\`

**例:**
\`\`\`
/supervisor Webアプリケーションのユーザー認証システムを実装したい
\`\`\`

**詳細な指定例:**
\`\`\`
/supervisor 目標: セキュアな認証システムの実装
コンテキスト: React + Node.js + PostgreSQL
サブエージェント: セキュリティ研究者, アーキテクト, 開発者
スタイル: democratic
戦略: hybrid
\`\`\`

**利用可能なオプション:**
- **スタイル**: autocratic, democratic, laissez-faire
- **戦略**: sequential, parallel, hybrid
- **サブエージェント**: カスタム名をカンマ区切りで指定

**デフォルト**: DeepResearch Agent, Architecture Planner, Implementation Specialist`
    };
  }

  const request = parseNaturalLanguage(args);
  return await executeSupervisor(request);
}

/**
 * 監督者コマンドの定義
 */
export const supervisorCommand: SlashCommand = {
  name: 'supervisor',
  altNames: ['sup', 'super'],
  description: '自然言語で並列実装とサブエージェントを呼び出す',
  kind: CommandKind.BUILT_IN,
  action: handleSupervisor
};