# Gemini CLI 🌟

<table>
  <thead>
    <tr>
      <th style="text-align:center"><a href="README.md">English</a></th>
      <th style="text-align:center">日本語</th>
    </tr>
  </thead>
</table>

[![Gemini CLI CI](https://github.com/google-gemini/gemini-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/google-gemini/gemini-cli/actions/workflows/ci.yml)
[![Version](https://img.shields.io/npm/v/@google/gemini-cli)](https://www.npmjs.com/package/@google/gemini-cli)
[![License](https://img.shields.io/github/license/google-gemini/gemini-cli)](https://github.com/google-gemini/gemini-cli/blob/main/LICENSE)

![Gemini CLI Screenshot](./docs/assets/gemini-screenshot.png)

Gemini CLI は、Gemini の力を直接ターミナルにもたらすオープンソースのAIエージェントです。Gemini への軽量アクセスを提供し、プロンプトからモデルまでの最も直接的なパスを提供します。

## 🚀 なぜ Gemini CLI？

### コア機能
- **🎯 無料プラン**: 個人のGoogleアカウントで1分間60リクエスト、1日1,000リクエスト
- **🧠 強力なGemini 2.5 Pro**: 100万トークンのコンテキストウィンドウへのアクセス
- **🔧 内蔵ツール**: Google検索、ファイル操作、シェルコマンド、ウェブ取得
- **🔌 拡張可能**: カスタム統合のためのMCP（Model Context Protocol）サポート
- **💻 ターミナルファースト**: コマンドラインで生活する開発者向けに設計

### 高度な機能
- Geminiの100万トークンコンテキストウィンドウを使用して大規模なコードベースをクエリ・編集
- Geminiのマルチモーダル機能を使用してPDFやスケッチから新しいアプリを生成
- プルリクエストのクエリや複雑なリベースの処理など、運用タスクの自動化
- GitHub統合: 自動PRレビュー、イシュー分類、リポジトリでのオンデマンドAI支援
- Imagen、Veo、Lyriaを使用したメディア生成など、新しい機能を接続するためのツールとMCPサーバーの使用
- Geminiに内蔵されたGoogle検索ツールでクエリを根拠づけ

### 🆕 拡張機能（カスタム拡張）
- **🆕 ロードバランシング**: 信頼性とパフォーマンス向上のため複数のGemini APIエンドポイントに リクエストを分散
- **🆕 サブエージェント**: 異なるタスク用の専門AIエージェントを作成し、シームレスに調整
- **🆕 電源断保護**: 中断のないワークフローのための自動チェックポイント、緊急保存、セッション復旧
- **🆕 DeepResearch**: ソース検証とトピック探索による包括的な多レベル研究
- **🆕 スーパーバイザーコマンド**: サブエージェント協調による自然言語並列実装
- **🆕 GitHub Actions統合**: PRコメント付き自動コード分析とレビュー
- **🆕 リリース準備システム**: 自動デプロイ準備と品質保証
- **🆕 継続的開発プラットフォーム**: 強化された開発ワークフローとモジュラーアーキテクチャ
- **🆕 グローバルインストールシステム**: 高度な機能を備えたワンコマンドインストールと管理
- **🆕 自然言語CLI**: 自然言語処理による直感的なコマンドインターフェース
- **🆕 高度なエラーハンドリング**: 包括的なエラー分類と回復システム

## 🆕 最新機能 (v0.7.0) - 上流統合完了

**🆕 上流統合**: 独自機能を保持しながら最新の上流アップデートを正常に統合
**🆕 強化されたIDE統合**: 最新の上流機能を備えた改良されたVSCodeコンパニオン
**🆕 高度な設定**: 上流互換性を持つ統一設定システム
**🆕 戦略的マージ**: 最新の改良を採用しながらカスタム機能を保持

### グローバルインストールシステム
高度な機能を備えたワンコマンドインストールと管理:

```bash
# クイックグローバルインストール
npm run install:global

# クリーンアップ付きアンインストール
npm run uninstall:global

# 現在のバージョンチェック
npm run version:current

# 最新バージョンへの更新
npm run update:auto
```

**特徴:**
- ワンコマンドグローバルインストールとアンインストール
- 自動バージョン管理と更新
- 高度なエラーハンドリングと回復
- 進捗追跡とステータス監視
- トラブルシューティング用システム情報収集

### 自然言語CLI
自然言語処理による直感的なコマンドインターフェース:

```bash
# 自然言語コマンド
gemini-natural "Webアプリケーションのユーザー認証システムを実装したい"

# 自然言語による対話モード
gemini-natural
> このコードベースのセキュリティ問題を分析して
```

**特徴:**
- 自然言語コマンド処理
- 対話型インターフェースによるインタラクティブモード
- コンテキスト認識コマンド解釈
- 多言語サポート（日本語/英語）
- インテリジェントコマンド提案

### 高度なエラーハンドリング
包括的なエラー分類と回復システム:

```bash
# システムエラーを分析
npm run error:analyze

# システム情報を取得
npm run error:system-info

# 進捗追跡デモ
npm run progress:demo
```

**エラーカテゴリ:**
- インストールエラー（権限、依存関係、ネットワーク）
- 設定エラー（設定ファイル、環境変数）
- 実行時エラー（API、認証、リソース）
- システムエラー（互換性、パフォーマンス）

## 📦 インストール

### クイックインストール

#### npxで即座に実行

```bash
npx @google/gemini-cli
```

認証後、すぐに開始できます。何もインストールする必要はありません。

#### npmでグローバルインストール

```bash
npm install -g @google/gemini-cli
```

#### Homebrew（macOS/Linux）でグローバルインストール

```bash
# Homebrewタップを追加
brew tap google-gemini/gemini-cli

# Gemini CLIをインストール
brew install gemini-cli
```

### 前提条件

- **Node.js**: バージョン20以上が必要
- **オペレーティングシステム**: macOS、Linux、Windows
- **認証**: GoogleアカウントまたはGemini API キー

### 認証設定

初回実行時に認証方法を選択できます:

1. **Googleアカウントでログイン**（推奨）
2. **Gemini API キー使用**
3. **Vertex AI**（企業ユーザー向け）

```bash
gemini
# 認証ダイアログに従って設定
```

## 🚀 クイックスタート

### 基本的な使用法

```bash
# インタラクティブモードで開始
gemini

# 単一プロンプト（非インタラクティブ）
gemini -p "このプロジェクトのREADMEを作成して"

# 特定のモデルを使用
gemini -m gemini-2.0-flash-exp

# デバッグモードで実行
gemini --debug
```

### ファイルとの作業

```bash
# 現在のディレクトリのコンテキストを含める
gemini
> このコードベースを分析して、改善点を教えて

# 特定のファイルを参照
gemini
> @src/main.js このファイルをリファクタリングして
```

### プロジェクト作成

```bash
# 新しいディレクトリを作成
mkdir my-new-project
cd my-new-project

# Gemini CLIを開始
gemini
> 提供するFAQ.mdファイルを使用して質問に答えるDiscordボットを作成して
```

## 💡 人気のタスク

### コードベースの理解

```bash
> このシステムアーキテクチャの主要部分を説明して
```

```bash
> どのようなセキュリティメカニズムが実装されていますか？
```

### 既存コードでの作業

```bash
> GitHub issue #123の最初のドラフトを実装して
```

```bash
> このコードベースをJavaの最新バージョンに移行してください。まず計画から始めて
```

### ワークフローの自動化

MCPサーバーを使用してローカルシステムツールをエンタープライズコラボレーションスイートと統合:

```bash
> 過去7日間のgit履歴を機能とチームメンバー別にグループ化したスライドデッキを作成して
```

```bash
> 最も相互作用の多いGitHub issueを表示する壁面ディスプレイ用のフルスクリーンWebアプリを作成して
```

### システムとの相互作用

```bash
> このディレクトリの全ての画像をpngに変換し、exifデータの日付を使用してリネームして
```

```bash
> PDF請求書を支出月別に整理して
```

## 🔧 設定

### 設定ファイル

Gemini CLIは階層的な設定システムを使用します:

- **システム設定**: 全ユーザー向けグローバル設定
- **ユーザー設定**: ユーザー固有の設定
- **ワークスペース設定**: プロジェクト固有の設定

設定ファイルの場所:
- macOS/Linux: `~/.config/gemini-cli/settings.json`
- Windows: `%APPDATA%\\gemini-cli\\settings.json`

### MCP サーバー統合

Model Context Protocol (MCP) を使用して外部ツールやサービスを統合:

```bash
# MCPサーバーを追加
gemini mcp add my-server --command "npx my-mcp-server"

# MCPサーバー一覧表示
gemini mcp list

# MCPサーバーを削除
gemini mcp remove my-server
```

例:
```bash
> @github 私のオープンPRを一覧表示
> @slack 今日のコミット要約を#devチャンネルに送信
> @database 非アクティブユーザーを見つけるクエリを実行
```

セットアップ手順については[MCP Server Integration guide](./docs/tools/mcp-server.md)を参照してください。

## 📚 ドキュメント

### はじめに

- [**CLIコマンドリファレンス**](./docs/cli/commands.md) - 全てのスラッシュコマンド（`/help`, `/chat`, `/mcp`など）
- [**チェックポイント機能**](./docs/checkpointing.md) - 会話の保存と再開
- [**設定ガイド**](./docs/cli/configuration.md) - 設定のカスタマイズ
- [**認証設定**](./docs/cli/authentication.md) - 認証方法の設定

### 高度な機能

- [**ツールAPI**](./docs/core/tools-api.md) - カスタムツールの作成
- [**MCP統合**](./docs/tools/mcp-server.md) - 外部サービス統合
- [**Deep Research**](./docs/tools/deep-research.md) - 包括的な研究機能
- [**ファイルシステムツール**](./docs/tools/file-system.md) - ファイル操作

### 開発者向け

- [**アーキテクチャ**](./docs/architecture.md) - システム設計と構成
- [**デプロイメント**](./docs/deployment.md) - 本番環境への展開
- [**コントリビューション**](./CONTRIBUTING.md) - 開発への参加方法

## 🆕 DeepResearch 機能

包括的な研究とソース検証のための高度な機能:

```bash
# 深い研究を開始
gemini
> @deepresearch 人工知能の最新動向について包括的な調査をして

# 特定トピックの分析
> @deepresearch TypeScript 2025年のベストプラクティス
```

**特徴:**
- 多レベル情報収集
- ソース検証と信頼性評価
- トピック探索と関連概念発見
- 構造化された研究レポート生成
- 引用とリファレンス管理

## 🤖 サブエージェント システム

専門化されたAIエージェントによるタスク分散:

```bash
# サブエージェントを作成
gemini
> @supervisor フロントエンド開発専門のサブエージェントを作成して

# 並列タスク実行
> @parallel ユーザー認証システムを設計 AND データベース設計を最適化
```

**特徴:**
- 専門分野別エージェント作成
- 並列タスク処理
- エージェント間協調
- 負荷分散と効率化
- リアルタイム進捗監視

## 🔄 電源断保護

中断のないワークフローのための堅牢なセッション管理:

**自動機能:**
- 5分間隔での定期保存
- Ctrl+C や異常終了時の自動保存
- 最大10個のバックアップ自動管理
- 固有IDでの完全なセッション追跡

**復旧システム:**
- SIGINT、SIGTERM、SIGBREAK対応のシグナルハンドラー
- プロセス異常時の自動データ保護
- 前回セッションからの自動復旧
- JSON+Pickleによる複合保存でデータ整合性を保証

## 🌐 自然言語CLI

日本語対応の直感的なコマンドインターフェース:

```bash
# 日本語での自然な対話
gemini-natural "Webアプリのセキュリティを強化したい"

# 技術的な相談
> "Reactのパフォーマンス問題を解決する方法を教えて"

# プロジェクト管理
> "このプロジェクトのタスクを整理して優先順位をつけて"
```

## 🤝 コントリビューション

コントリビューションを歓迎します！Gemini CLI は完全にオープンソース（Apache 2.0）であり、コミュニティに以下を奨励します:

- バグ報告と機能提案
- ドキュメントの改善
- コード改善の提出
- MCPサーバーと拡張機能の共有

開発セットアップ、コーディング標準、プルリクエストの提出方法については[コントリビューションガイド](./CONTRIBUTING.md)を参照してください。

計画された機能と優先事項については[公式ロードマップ](https://github.com/orgs/google-gemini/projects/11/)をチェックしてください。

## 📖 リソース

- **[公式ロードマップ](./ROADMAP.md)** - 今後の予定
- **[NPMパッケージ](https://www.npmjs.com/package/@google/gemini-cli)** - パッケージレジストリ
- **[GitHub Issues](https://github.com/google-gemini/gemini-cli/issues)** - バグ報告や機能リクエスト
- **[セキュリティアドバイザリ](https://github.com/google-gemini/gemini-cli/security/advisories)** - セキュリティアップデート

### アンインストール

削除手順については[アンインストールガイド](docs/Uninstall.md)を参照してください。

グローバルインストールユーザー向け:

```bash
# 完全クリーンアンインストール
npm run uninstall:global
```

## 📄 法的事項

- **ライセンス**: [Apache License 2.0](LICENSE)
- **利用規約**: [利用規約とプライバシー](./docs/tos-privacy.md)
- **セキュリティ**: [セキュリティポリシー](SECURITY.md)

---

<p align="center">
  <strong>🌟 Gemini CLI で開発体験を革新しましょう！ 🌟</strong>
</p>
