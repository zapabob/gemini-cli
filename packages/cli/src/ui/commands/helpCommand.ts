/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommandKind, MessageActionReturn, SlashCommand } from './types.js';

export const helpCommand: SlashCommand = {
  name: 'help',
  description: 'Show help information',
  kind: CommandKind.BUILT_IN,
  action: async (_context, _args): Promise<MessageActionReturn> => ({
    type: 'message',
    messageType: 'info',
    content: `🤖 **Gemini CLI ヘルプ**

## 📋 基本コマンド
- \`/help\` - このヘルプを表示
- \`/clear\` - 画面をクリア
- \`/quit\` - CLIを終了
- \`/tools\` - 利用可能なツールを表示
- \`/theme\` - テーマを変更

## 🤖 サブエージェント機能
- \`/subagents\` - サブエージェント管理
- \`/subagents list\` - サブエージェント一覧
- \`/subagents create\` - サブエージェント作成
- \`/subagents execute\` - タスク実行
- \`/subagents execute-parallel\` - 並列実行

## 🌟 自然言語サブエージェント並列起動
**自然言語でサブエージェントを並列起動できます！**

### 使用例:
- "コードレビューチームで並列実行してください"
- "デバッグチームで同時にエラーを分析してください"
- "データ分析チームで並列処理してください"
- "セキュリティ監査チームで同時実行してください"

### 対応キーワード:
- **並列実行**: 並列、parallel、同時、simultaneous、複数、multiple
- **専門分野**: コードレビュー、デバッグ、データ分析、セキュリティ監査、パフォーマンス最適化、ドキュメント、テスト、アーキテクチャ設計、API設計、機械学習

### 🎯 リアルタイム表示機能
- **メインエージェント動作**: タスク分析、サブエージェント起動、結果統合の進行状況をリアルタイム表示
- **サブエージェント動作**: 各サブエージェントの起動状況と実行結果を個別表示
- **協調作業進行**: 並列実行の進行状況と完了率を表示
- **詳細フィードバック**: エラーや成功の詳細情報を即座に表示

## 📁 ファイル操作
- \`@path/to/file\` - ファイル内容を読み込み
- \`@directory/\` - ディレクトリ内のファイルを読み込み

## 💬 チャット機能
- \`/chat save <tag>\` - 会話を保存
- \`/chat resume <tag>\` - 会話を復元
- \`/chat list\` - 保存された会話一覧

## 🛠️ その他のコマンド
- \`/memory\` - メモリ管理
- \`/stats\` - 統計情報表示
- \`/auth\` - 認証設定
- \`/bug\` - バグ報告

**💡 ヒント**: 自然言語でサブエージェントを起動する際は、「並列」「同時」「複数」などのキーワードを含めてください！`
  }),
};
