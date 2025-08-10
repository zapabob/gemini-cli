# 2025-08-10_マージ自動化とビルドテストログ

- 実装項目:
  - PowerShell自動化 `scripts/MergeAndBuild.ps1` 追加
  - マージ/スタッシュ適用の自動処理、依存解決、ビルド、`packages/cli` テスト実行
- 変更点ハイライト:
  - コンフリクト自動解決オプション `-AutoResolve` 対応
  - `npm ci`/`npm install` 切替 `-UseCI` 対応
  - マージ後のスタッシュ `pop` 衝突時のフォールバック適用
- 検証結果:
  - ローカルで `npm -w packages/cli test` グリーン
- 次のアクション:
  - CI へ組み込み、定期実行スケジュール化


