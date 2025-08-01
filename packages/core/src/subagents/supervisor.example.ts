/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { SupervisorAgent, SupervisorConfig, SupervisorRole } from './supervisor.js';
import { Subagent, SubagentSpecialty as _SubagentSpecialty } from '../config/subagents.js';

/**
 * 監督者エージェントの使用例
 * メインエージェントが監督者として機能し、サブエージェントが専門的なタスクを分担
 */
export async function runSupervisorExample() {
  console.log('🎯 監督者エージェントの使用例を開始します...\n');

  // 1. 監督者の設定
  const supervisorRole: SupervisorRole = {
    id: 'main-supervisor',
    name: 'プロジェクト監督者',
    description: 'Aという実装の監督を行うメインエージェント',
    responsibilities: [
      '実装目標の分析と計画立案',
      'サブエージェントの役割割り当て',
      '並列実行の調整',
      '結果の統合と最終決定'
    ],
    decisionMakingAuthority: 'high',
    coordinationStyle: 'democratic'
  };

  const supervisorConfig: SupervisorConfig = {
    role: supervisorRole,
    maxSubagents: 5,
    coordinationStrategy: 'hybrid',
    decisionThreshold: 0.8,
    progressReporting: true,
    errorHandling: 'adaptive'
  };

  // 2. 監督者エージェントの初期化
  const supervisor = new SupervisorAgent(supervisorConfig);

  // 3. サブエージェントの定義
  const subagents: Subagent[] = [
    {
      id: 'subagent-1',
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
      id: 'subagent-2',
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
      id: 'subagent-3',
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
    },
    {
      id: 'subagent-4',
      name: 'Quality Assurance',
      description: '品質保証とテストを行う専門エージェント',
      specialty: 'testing',
      prompt: `あなたは品質保証の専門家です。
      実装されたコードの品質を確保してください：
      - 包括的なテストケースの作成
      - コードレビューの実施
      - パフォーマンステストの実行
      - セキュリティテストの実施
      - 品質基準の検証`,
      maxTokens: 4000,
      temperature: 0.7,
      status: 'idle',
      createdAt: new Date().toISOString(),
      taskHistory: [],
      customTools: ['test_generation', 'code_review'],
      isActive: true
    }
  ];

  // 4. 実装目標の定義
  const implementationGoal = `
Aという実装を監督してください：
- モダンなWebアプリケーションの開発
- React + TypeScript + Node.js を使用
- ユーザー認証機能の実装
- データベース連携（PostgreSQL）
- RESTful API の構築
- レスポンシブデザインの実装
- セキュリティ対策の実装
- パフォーマンス最適化
  `;

  const context = `
技術要件：
- フロントエンド: React 18, TypeScript, Tailwind CSS
- バックエンド: Node.js, Express, TypeScript
- データベース: PostgreSQL
- 認証: JWT
- デプロイ: Docker, AWS
- テスト: Jest, React Testing Library
  `;

  console.log('📋 実装目標:', implementationGoal);
  console.log('🔧 技術コンテキスト:', context);
  console.log('👥 サブエージェント数:', subagents.length);
  console.log('\n🚀 監督者エージェントの実行を開始します...\n');

  try {
    // 5. 監督者エージェントの実行
    const result = await supervisor.superviseImplementation(
      implementationGoal,
      subagents,
      context
    );

    // 6. 結果の表示
    console.log('\n🎉 監督者エージェントの実行が完了しました！\n');

    console.log('📊 実行結果:');
    console.log(`✅ 成功: ${result.success}`);
    console.log(`⏱️  実行時間: ${result.executionTime}ms`);
    console.log(`👥 サブエージェント数: ${result.subagentResults.length}`);
    console.log(`📝 決定数: ${result.decisions.length}`);
    console.log(`❌ エラー数: ${result.errors.length}`);

    console.log('\n📋 最終出力:');
    console.log(result.finalOutput);

    console.log('\n📝 調整ログ:');
    result.coordinationLog.forEach(log => {
      console.log(`  ${log}`);
    });

    console.log('\n🎯 重要な決定:');
    result.decisions
      .filter(decision => decision.impact === 'high')
      .forEach(decision => {
        console.log(`  [${decision.timestamp.toISOString()}] ${decision.decision}`);
        console.log(`    理由: ${decision.reasoning}`);
      });

    console.log('\n👥 サブエージェントの結果:');
    result.subagentResults.forEach(subResult => {
      console.log(`  ${subResult.subagentId}: ${subResult.status}`);
      if (subResult.error) {
        console.log(`    エラー: ${subResult.error}`);
      }
    });

  } catch (error) {
    console.error('❌ 監督者エージェントの実行中にエラーが発生しました:', error);
  }
}

/**
 * 特定の実装シナリオの例
 */
export async function runSpecificImplementationExample() {
  console.log('🎯 特定の実装シナリオ例: ユーザー認証システムの実装\n');

  const supervisor = new SupervisorAgent({
    role: {
      id: 'auth-supervisor',
      name: '認証システム監督者',
      description: 'ユーザー認証システムの実装を監督',
      responsibilities: ['認証要件の分析', 'セキュリティ設計', '実装監督'],
      decisionMakingAuthority: 'high',
      coordinationStyle: 'democratic'
    },
    maxSubagents: 3,
    coordinationStrategy: 'hybrid',
    decisionThreshold: 0.9,
    progressReporting: true,
    errorHandling: 'strict'
  });

  const authSubagents: Subagent[] = [
    {
      id: 'auth-researcher',
      name: '認証セキュリティ研究者',
      description: '最新の認証セキュリティ要件を調査',
      specialty: 'security_audit',
      prompt: '最新の認証セキュリティ要件とベストプラクティスを調査してください',
      maxTokens: 4000,
      temperature: 0.7,
      status: 'idle',
      createdAt: new Date().toISOString(),
      taskHistory: [],
      customTools: ['security_research'],
      isActive: true
    },
    {
      id: 'auth-architect',
      name: '認証アーキテクト',
      description: '認証システムのアーキテクチャを設計',
      specialty: 'architecture_design',
      prompt: 'セキュアな認証システムのアーキテクチャを設計してください',
      maxTokens: 4000,
      temperature: 0.7,
      status: 'idle',
      createdAt: new Date().toISOString(),
      taskHistory: [],
      customTools: ['architecture_design'],
      isActive: true
    },
    {
      id: 'auth-developer',
      name: '認証開発者',
      description: '認証システムを実装',
      specialty: 'backend_development',
      prompt: '設計された認証システムを実装してください',
      maxTokens: 4000,
      temperature: 0.7,
      status: 'idle',
      createdAt: new Date().toISOString(),
      taskHistory: [],
      customTools: ['code_generation'],
      isActive: true
    }
  ];

  const authGoal = `
セキュアなユーザー認証システムを実装してください：
- JWT ベースの認証
- パスワードハッシュ化（bcrypt）
- リフレッシュトークン機能
- レート制限
- 2FA サポート
- セッション管理
- ログイン履歴
- パスワードリセット機能
  `;

  const result = await supervisor.superviseImplementation(
    authGoal,
    authSubagents,
    'Node.js + Express + PostgreSQL 環境'
  );

  console.log('✅ 認証システム実装完了！');
  console.log('📋 最終設計:', result.finalOutput);
}

// 使用例の実行
if (require.main === module) {
  runSupervisorExample()
    .then(() => runSpecificImplementationExample())
    .catch(console.error);
} 