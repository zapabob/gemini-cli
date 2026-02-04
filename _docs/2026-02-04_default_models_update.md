# 2026-02-04 デフォルトモデルの更新（上流リポジトリ同期）

## 概要

Gemini
CLIのモデル定義を、開発元の最新仕様（Upstream）に厳密に合わせて更新しました。これにより、リポジトリの標準的な構成との互換性を確保しました。

## 変更内容

### packages/core

- `src/config/models.ts`:
  - `DEFAULT_GEMINI_MODEL` を `gemini-2.5-pro` に変更
  - `PREVIEW_GEMINI_MODEL` を `gemini-3-pro-preview` に変更
  - 自動選択用定数（`auto-gemini-2.5`, `auto-gemini-3`）を上流に合わせて更新
- `src/config/defaultModelConfigs.ts`:
  - 全ての内部エイリアス、親設定、およびFlash/Liteモデルの定義を2.5/3.0ベースに統一
- `src/config/models.test.ts`:
  - 新しいバージョン体系に基づき、アサーション（期待値）を更新

## 検証

- ユニットテスト `models.test.ts` を実行。
- **結果**: 32件全てのテストがパスすることを確認。

> [!NOTE]
> これらのモデル名は現時点ではAPI側でプレースホルダー（将来の予約）として扱われている可能性があります。実運用でエラーが出る場合は、適宜
> `--model` 引数で実在するモデル（1.5 Proなど）を指定してください。
