# 2025-08-10_DeepResearch_高度リサーチ_ステータス

- 対象: DeepResearch / 高度リサーチ機能の実装状況

- 実装位置:
  - MCP: `mcp-servers/deepresearch-mcp/`（`advancedResearchProtocolService.ts` ほか）
  - Core ツール: `packages/core/src/tools/deep-research.ts`
  - ドキュメント: `docs/tools/deep-research.md`

- 現状:
  - DeepResearch: 既に利用可能。多段階調査・要約・レポート生成のAPIフロー実装済み。
  - 高度リサーチ(Advanced Research Protocol): 並列/段階的探索、証拠トラッキング、構造化出力をサポート。
  - テスト: 関連ユニット/統合テストはグリーン（CLI全体テスト通過済み）。

- 使い方（例）:
  - CLIから特化ツール経由で研究タスクを投入（設定によりMCP DeepResearchを有効化）。
  - UIでは自動で長尺調査へエスカレーション可能（プロンプトに応じて並列化/ハイブリッドを選択）。

- 次の強化予定:
  - 動的ロードバランシング最適化（負荷/ソース数/信頼度に応じた配分）
  - 分野別テンプレート最適化（技術文書/市場調査/学術レビュー）
  - 失敗時リトライ戦略と中間成果物のサマリ品質向上

- 備考:
  - 実行パス/ログは各モジュールのロガーに送出、`_docs/` へは節目ごとに要約を追記。


