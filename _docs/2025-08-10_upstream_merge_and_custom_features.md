# Upstream統合と独自機能維持 ログ

- 日時: 2025-08-10 18:17 (Asia/Tokyo)
- ブランチ: `chore/integrate-upstream-2025-08-07`

## 作業内容
- upstream/main を fetch 済み
- 統合ブランチ作成済み
- 広範囲競合を upstream 優先で解消（package.json 群、TSファイル多数）
- package-lock.json は削除し後で再生成予定
- stash に独自変更あり: `stash@{0}: chore: pre-upstream-merge 2025-08-07`

## 直近の予定
1. stash を適用（pop）
2. 競合発生時は upstream 優先 + 独自ファイルは温存で解消
3. 依存関係再インストール（npm ci または npm install）
4. ビルド（npm run build）
5. テスト（npm test）

## 備考
- PowerShell 環境で pager の影響により git コマンド出力が阻害される事象あり
- 必要に応じて `git --no-pager` を使用
