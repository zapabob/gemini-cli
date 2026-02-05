# GitHub Actions Integration

Gemini CLIをGitHub Actionsで使用して、コード分析や自動レビューを実行できます。

## 概要

このドキュメントでは、GitHub ActionsでGemini CLIを使用する方法を説明します。

## セットアップ

### 1. シークレットの設定

GitHubリポジトリの設定で以下のシークレットを追加してください：

#### Gemini API Key
```
GEMINI_API_KEY=your_gemini_api_key_here
```

#### Google API Key (Vertex AI)
```
GOOGLE_API_KEY=your_google_api_key_here
```

### 2. ワークフローファイルの追加

`.github/workflows/gemini-cli-action.yml`をリポジトリに追加してください。

## 使用方法

### 手動実行

GitHub Actionsのタブから「Gemini CLI Action」を選択し、手動で実行できます：

1. **prompt**: 分析したい内容を指定
2. **model**: 使用するGeminiモデル（デフォルト: gemini-3.0-pro）
3. **max_tokens**: 最大トークン数（デフォルト: 1000）
4. **temperature**: 温度パラメータ（デフォルト: 0.7）

### 自動実行

以下の条件で自動実行されます：

- **Push to main**: コードファイル（.md, .js, .ts, .json）が変更された場合
- **Pull Request**: mainブランチへのPRでコードファイルが変更された場合

## 機能

### 1. コード分析

リポジトリのコードを分析し、主要な機能と改善点を説明します。

```yaml
- name: Run Gemini CLI Analysis
  run: |
    gemini -p "このリポジトリのコードを分析して、主要な機能と改善点を説明して"
```

### 2. DeepResearch分析

DeepResearchツールを使用して、技術スタックとアーキテクチャを詳しく調査します。

```yaml
- name: Run DeepResearch Analysis
  run: |
    gemini -p "DeepResearchツールを使って、このリポジトリの技術スタックとアーキテクチャについて詳しく調べて"
```

### 3. PRコメント

Pull Requestに自動的にコメントを追加します：

```markdown
## 🤖 Gemini CLI Analysis

**Prompt:** このリポジトリのコードを分析して、主要な機能と改善点を説明して
**Model:** gemini-3.0-pro

### Analysis Results:
```
分析結果がここに表示されます
```

---
*This analysis was performed by Gemini CLI v0.4.0*
```

## 設定オプション

### 環境変数

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `GEMINI_API_KEY` | Gemini APIキー | 推奨 |
| `GOOGLE_API_KEY` | Google APIキー（Vertex AI） | 代替 |

### ワークフロー入力

| 入力名 | 説明 | デフォルト |
|--------|------|------------|
| `prompt` | 分析プロンプト | "このリポジトリのコードを分析して、主要な機能を説明して" |
| `model` | 使用モデル | "gemini-3.0-pro" |
| `max_tokens` | 最大トークン数 | "1000" |
| `temperature` | 温度パラメータ | "0.7" |

## 例

### 基本的なコード分析

```yaml
- name: Basic Code Analysis
  run: |
    gemini -p "このコードのセキュリティ問題をチェックして"
```

### アーキテクチャ分析

```yaml
- name: Architecture Analysis
  run: |
    gemini -p "このプロジェクトのアーキテクチャパターンを分析して"
```

### パフォーマンス分析

```yaml
- name: Performance Analysis
  run: |
    gemini -p "このコードのパフォーマンス改善点を特定して"
```

## トラブルシューティング

### よくある問題

1. **APIキーが設定されていない**
   - GitHubシークレットでAPIキーを設定してください
   - デフォルト認証を使用することも可能です

2. **クォータ制限**
   - APIキーの使用制限に達した場合
   - 有料プランへのアップグレードを検討してください

3. **ビルドエラー**
   - Node.js 20以上が必要です
   - 依存関係のインストールを確認してください

### ログの確認

GitHub Actionsのログで詳細な情報を確認できます：

```bash
# セットアップログ
npm ci
npm run build
npm link

# 実行ログ
gemini --version
gemini -p "test prompt"
```

## 高度な設定

### カスタムワークフロー

独自のワークフローを作成する場合：

```yaml
name: Custom Gemini Analysis

on:
  workflow_dispatch:
    inputs:
      custom_prompt:
        description: 'カスタムプロンプト'
        required: true

jobs:
  analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: |
          npm ci
          npm run build
          npm link
      - run: |
          gemini -p "${{ github.event.inputs.custom_prompt }}"
```

### 複数の分析

複数の分析を並行実行する場合：

```yaml
jobs:
  security-analysis:
    # セキュリティ分析
  performance-analysis:
    # パフォーマンス分析
  architecture-analysis:
    # アーキテクチャ分析
```

## ベストプラクティス

1. **プロンプトの最適化**: 具体的で明確なプロンプトを使用
2. **APIキーの管理**: シークレットとして安全に管理
3. **結果の活用**: 分析結果を開発プロセスに組み込む
4. **定期的な実行**: 重要な変更時に自動実行

## サポート

問題が発生した場合は、以下を確認してください：

1. GitHub Actionsのログ
2. APIキーの設定
3. Node.jsのバージョン
4. 依存関係のインストール

詳細な情報は[メインドキュメント](../index.md)を参照してください。 