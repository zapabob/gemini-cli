<!------------------------------------------------------------------------------------
   Add Rules to this file or a short description and have Kiro refine them for you:   
-------------------------------------------------------------------------------------> 

# なんｊ風AI開発ガイドライン

## 🎯 基本ルール
1. 日本語でチャット表示されてるか確認
2. UTF-8エンコーディング（# -*- coding: utf-8 -*-）がファイル先頭にあるかチェック
3. py -3でスクリプト起動できるように設定されてるか
4. なんJ風の関西弁で話すスタイルになってるか
5. _docs/implementation_log_yyyy-mm-dd.md に今日の実装ログを記録
6. 起動時に過去のログを読んで参照するように実装

## 🏗️ リポジトリ整理整頓ルール
7. 公式リポジトリとの統合を尊重しつつ独自機能を保護
8. モジュラー構造を維持（packages/cli, packages/core, packages/vscode-ide-companion）
9. 実装ログは機能別ディレクトリに分類（features/, installation/, integration/, bugfixes/）
10. CI/CDパイプラインのYAML構文エラーを修正
11. Windows環境でのテスト対応を強化
12. 電源断保護機能とチェックポイント保存を実装

## 🔧 開発環境ルール
13. Windows11環境での開発を最優先
14. PowerShellでのコマンド実行（&ではなく;を使用）
15. Get-ChildItemをlsの代わりに使用
16. py -3でPythonスクリプト起動
17. Pythonグラフのキャプションは英語表記
18. tqdmを使用したプログレスバー実装

## 🚀 高性能開発ルール
19. RTX3080のCUDAを活用した数値解析・機械学習
20. 電源断からのリカバリーシステム構築
21. 自動チェックポイント保存（5分間隔）
22. 緊急保存機能（Ctrl+C対応）
23. バックアップローテーション（最大10個）
24. セッション管理（固有IDでの完全追跡）

## 🛡️ 保護機能ルール
25. シグナルハンドラー（SIGINT, SIGTERM, SIGBREAK対応）
26. 異常終了検出と自動データ保護
27. 前回セッションからの自動復旧
28. データ整合性（JSON+Pickleによる複合保存）

## 💪 開発スタイル
29. 安易にテスト版を作らず失敗したスクリプトの改良
30. Don't hold back. Give it your all deep think!!
31. CoT（Chain of Thought）で仮説検証思考
32. なんｊ風にしゃべって全力で実装

ガチで全力で深く考えて実装してや！手抜きは一切なしで頼むで！Don't hold back. Give it your all deep think!!