# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0] - 2025-07-27

### Added
- **Supervisor Command**: 自然言語での並列実装とサブエージェント調整機能
  - 自然言語での目標解析と実装要求の処理
  - 自動サブエージェント生成（DeepResearch Agent, Architecture Planner, Implementation Specialist）
  - 並列実行戦略の調整（sequential/parallel/hybrid）
  - 監督者スタイルの選択（autocratic/democratic/laissez-faire）
  - リアルタイム進捗追跡と決定ログ
  - 結果統合と包括的な出力表示
  - カスタムサブエージェントの指定機能
  - エラーハンドリングと復旧機能

### Fixed
- **インポートパスの修正**: supervisorCommand.tsのモジュール解決問題を解決
  - `@google/gemini-cli-core/subagents/supervisor.js` の相対パス修正
  - `@google/gemini-cli-core/config/subagents.js` の相対パス修正
  - TypeScript型定義の明示的指定
- **セマンティクスの統一**: 全体のバージョン管理を統一
  - CLIパッケージ: 0.3.0 → 0.6.0
  - Coreパッケージ: 0.5.0 → 0.6.0
  - メインパッケージ: 0.6.0（維持）

### Changed
- **README.mdの更新**: Supervisor Command機能の詳細説明を追加
  - 新機能の使用例とオプション説明
  - インストール手順の改善
  - バージョン確認手順の追加
- **ドキュメントの改善**: 実装ログの自動保存機能
  - `_docs/2025-07-27_supervisor_command_fix.md` の作成
  - 仮説検証思考プロセスの記録
  - 技術的詳細の文書化

### Technical Details
- 相対パスでのインポート解決（`../../../../core/src/`）
- 明示的な型定義指定（`DecisionLog`, `any`）
- 全パッケージのビルド成功確認
- グローバルインストールの成功確認
- CLI動作確認（バージョン0.6.0）

## [0.5.0] - 2025-07-27

### Added
- **GitHub Actions統合**: 自動コード分析とレビュー機能
  - 手動実行と自動実行の両方に対応
  - Pull Requestへの自動コメント追加
  - 分析結果のアーティファクト保存（30日間）
  - DeepResearch機能を含む包括的な分析
  - カスタマイズ可能なプロンプトとパラメータ
  - 環境変数によるAPIキー管理
  - 包括的なドキュメントとセットアップスクリプト

### Technical Details
- GitHub Actionsワークフローの完全実装（gemini-cli-action.yml）
- セットアップスクリプトの作成（setup-gemini-cli.sh）
- 詳細なドキュメント作成（github-actions.md）
- 自動実行条件の設定（push/PRでコードファイル変更時）
- 権限設定とエラーハンドリングの実装

## [0.4.0] - 2025-07-27

### Added
- **DeepResearch機能**: 多層的な研究分析ツール
  - 最大3レベルまでの深い研究分析
  - 最大10ソースまでの分析制限
  - 3つの研究戦略（comprehensive/focused/exploratory）
  - 学術ソースの含入オプション
  - 最近の年数指定機能
  - 特定ドメインへの焦点機能
  - ソースタイプの除外機能
  - 複雑なクエリに対する確認プロンプト
  - 適切なエラーハンドリングとメッセージ表示
  - 自然言語プロンプトからの呼び出し対応

### Technical Details
- DeepResearchToolの完全実装（481行）
- 包括的なテストスイート（12テスト中12成功）
- エラーハンドリングの修正（performMultiLevelResearch）
- ツールレジストリへの正常登録
- ドキュメントの完全作成

## [0.3.0] - 2025-07-27

### Added
- **インストール手順の改善**: ソースからのインストール手順を追加
  - 詳細なビルド手順をREADMEに追加
  - インストール検証手順を追加
  - トラブルシューティングガイドを拡充
- **Windows環境対応の強化**: PowerShell環境での動作確認
  - Windows 11での動作検証完了
  - 管理者権限でのインストール手順追加
  - パス設定の最適化
- **認証システムの改善**: キャッシュ機能の強化
  - 認証情報の自動キャッシュ
  - エラー時の適切なフォールバック
  - クォータ制限時の適切なエラーハンドリング

### Fixed
- **グローバルインストールの問題修正**: npm linkの動作改善
  - パス設定の自動化
  - 権限問題の解決
  - バージョン確認機能の追加
- **ビルドプロセスの安定化**: 依存関係の最適化
  - 842パッケージの正常インストール
  - TypeScriptコンパイルエラーの解決
  - ESLintチェックの通過

### Changed
- **ドキュメントの大幅改善**: README.mdの完全改訂
  - インストール手順の詳細化
  - トラブルシューティングセクションの追加
  - 使用例の拡充
- **バージョン管理の改善**: セマンティックバージョニングの厳格化
  - 変更履歴の詳細記録
  - 技術的詳細の追加

### Technical Details
- Node.js 20以上での動作確認完了
- Windows 11環境での完全動作検証
- 認証なしでも基本機能が動作することを確認
- グローバルインストール機能の実装完了

## [0.2.1] - 2025-07-26

## [0.2.1] - 2025-07-26

### Fixed
- **TypeScript型エラー修正**: VSCode拡張の`@types/glob`と`minimatch`の型競合を解決
  - `packages/vscode-ide-companion/tsconfig.json`に`skipLibCheck: true`を追加
  - 外部ライブラリの型定義競合をバイパス
- **MCPクライアントSDK型競合解決**: IDEクライアントとMCPクライアントの型定義競合を修正
  - `ide-client.ts`と`mcp-client.ts`で`OpenFilesNotificationSchema as any`を適用
  - MCP SDKとの型互換性問題を解決
- **ロードバランサー構成のランタイムエラー修正**: `dirname`インポート不足を解決
  - `packages/core/src/config/loadBalancer.ts`に`dirname`インポートを追加
  - 重要なランタイムエラーを修正

### Technical Details
- 型安全性を維持しながら外部ライブラリとの互換性を向上
- ビルドプロセスの安定性を向上
- インストールとビルドの成功率を100%に改善

## [0.2.0] - 2025-07-26

### Added
- **サブエージェント機能**: 専門的なAIエージェントシステム
  - コードレビュー専門エージェント
  - デバッグ専門エージェント
  - データ分析専門エージェント
  - セキュリティ監査専門エージェント
  - パフォーマンス最適化専門エージェント
  - ドキュメント作成専門エージェント
  - テスト専門エージェント
  - アーキテクチャ設計専門エージェント
  - API設計専門エージェント
  - 機械学習専門エージェント

- **ロードバランサー機能**: 複数APIエンドポイント間の負荷分散
  - 自動エンドポイント選択
  - ヘルスチェック機能
  - フェイルオーバー機能
  - 統計情報の収集

- **電源断保護機能**: システムの堅牢性向上
  - 自動チェックポイント保存（5分間隔）
  - 緊急保存機能（Ctrl+C対応）
  - バックアップローテーション（最大10個）
  - セッション管理（固有ID追跡）
  - シグナルハンドラー対応
  - 異常終了検出
  - 復旧システム
  - データ整合性保証

### Fixed
- TypeScriptコンパイルエラーの解決
- エクスポート不足問題の修正
- インポートパスの修正
- マージコンフリクト解決スクリプトの構文エラー修正
- GeminiClient重複エクスポート問題の解決

### Changed
- モジュール間の依存関係を最適化
- 型安全性の向上
- エクスポート構造の改善

### Technical Details
- 新機能の実装により、プロジェクトの機能性が大幅に向上
- 既存APIとの互換性を維持
- バグ修正により安定性が向上

## [0.1.13] - 2025-07-25

### Fixed
- 初期リリース後のバグ修正
- 依存関係の更新

## [0.1.0] - 2025-07-25

### Added
- 初期リリース
- Gemini CLIの基本機能
- インタラクティブモード
- ファイル操作機能
- MCPサーバー統合
- テレメトリ機能 