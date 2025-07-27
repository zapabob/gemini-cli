# GitHub Actions統合の実装

**日時**: 2025-07-27 14:40

## 概要

Gemini CLIをGitHub Actionsで使用できるように統合し、自動コード分析とレビュー機能を実装した。

## 実装内容

### 1. GitHub Actionsワークフローの作成

#### ファイル: `.github/workflows/gemini-cli-action.yml`
- **手動実行**: workflow_dispatchで手動実行可能
- **自動実行**: push/PRでコードファイル変更時に自動実行
- **入力パラメータ**: prompt, model, max_tokens, temperature
- **権限設定**: contents: read, pull-requests: write, checks: write

#### 主要機能:
1. **Gemini CLI Analysis**: 基本的なコード分析
2. **DeepResearch Analysis**: DeepResearchツールを使用した詳細分析
3. **PRコメント**: Pull Requestへの自動コメント追加
4. **アーティファクト保存**: 分析結果の保存

### 2. セットアップスクリプトの作成

#### ファイル: `.github/scripts/setup-gemini-cli.sh`
- **依存関係インストール**: npm ci
- **ビルド実行**: npm run build
- **グローバルインストール**: npm link
- **APIキー設定**: GEMINI_API_KEY/GOOGLE_API_KEY
- **基本テスト**: 機能確認

### 3. ドキュメントの作成

#### ファイル: `docs/github-actions.md`
- **セットアップ手順**: シークレット設定とワークフロー追加
- **使用方法**: 手動実行と自動実行
- **機能説明**: コード分析、DeepResearch分析、PRコメント
- **設定オプション**: 環境変数とワークフロー入力
- **例**: 基本的なコード分析、アーキテクチャ分析、パフォーマンス分析
- **トラブルシューティング**: よくある問題と解決方法
- **高度な設定**: カスタムワークフローと複数分析
- **ベストプラクティス**: 最適化と管理方法

### 4. README.mdの更新

- **GitHub Actions統合**: 新機能として追加
- **ドキュメントリンク**: github-actions.mdへの参照追加

## 技術的詳細

### ワークフロー構成

```yaml
jobs:
  gemini-analysis:
    # 基本的なGemini CLI分析
    steps:
      - Checkout repository
      - Set up Node.js
      - Install dependencies
      - Install Gemini CLI globally
      - Set up API keys
      - Run analysis
      - Comment on PR
      - Upload artifacts

  deep-research-analysis:
    # DeepResearchツールを使用した詳細分析
    needs: gemini-analysis
    if: contains(prompt, 'DeepResearch')
```

### 環境変数管理

```bash
# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Google API Key (Vertex AI)
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_GENAI_USE_VERTEXAI=true
```

### 自動実行条件

- **Push to main**: コードファイル（.md, .js, .ts, .json）変更時
- **Pull Request**: mainブランチへのPRでコードファイル変更時
- **手動実行**: workflow_dispatchで任意のタイミング

## 機能の特徴

### 1. コード分析
- リポジトリのコードを自動分析
- 主要な機能と改善点を特定
- セキュリティ問題の検出
- パフォーマンス改善点の提案

### 2. DeepResearch分析
- 技術スタックの詳細調査
- アーキテクチャパターンの分析
- 多層的な研究分析
- ソース検証とトピック探索

### 3. PRコメント
- Pull Requestへの自動コメント
- 分析結果の詳細表示
- モデル情報とプロンプトの記録
- バージョン情報の表示

### 4. アーティファクト保存
- 分析結果の30日間保存
- ダウンロード可能な形式
- 履歴管理と追跡

## セットアップ手順

### 1. シークレットの設定
```bash
# GitHubリポジトリの設定で以下を追加
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
```

### 2. ワークフローファイルの追加
```bash
# .github/workflows/gemini-cli-action.ymlを追加
```

### 3. 手動実行
```bash
# GitHub Actionsのタブから「Gemini CLI Action」を選択
# パラメータを設定して実行
```

## 使用例

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

### DeepResearch分析
```yaml
- name: DeepResearch Analysis
  run: |
    gemini -p "DeepResearchツールを使って、このリポジトリの技術スタックとアーキテクチャについて詳しく調べて"
```

## トラブルシューティング

### よくある問題

1. **APIキーが設定されていない**
   - GitHubシークレットでAPIキーを設定
   - デフォルト認証を使用することも可能

2. **クォータ制限**
   - APIキーの使用制限に達した場合
   - 有料プランへのアップグレードを検討

3. **ビルドエラー**
   - Node.js 20以上が必要
   - 依存関係のインストールを確認

## 次のステップ

1. **高度な分析**: より詳細な分析機能の追加
2. **カスタマイズ**: プロジェクト固有の分析ルール
3. **統合強化**: 他のCI/CDツールとの連携
4. **パフォーマンス最適化**: 実行速度の向上

## 結論

Gemini CLIのGitHub Actions統合が正常に完了し、自動コード分析とレビュー機能が利用可能になった。DeepResearch機能も含めて、包括的な分析機能を提供している。 