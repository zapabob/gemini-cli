---
layout: default
title: Gemini CLI - zapabob fork
---

# Gemini CLI (zapabob fork)

<table>
  <thead>
    <tr>
      <th style="text-align:center">English</th>
      <th style="text-align:center">日本語</th>
    </tr>
  </thead>
</table>

[![Gemini CLI CI](https://github.com/google-gemini/gemini-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/google-gemini/gemini-cli/actions/workflows/ci.yml)
[![Version](https://img.shields.io/npm/v/@google/gemini-cli)](https://www.npmjs.com/package/@google/gemini-cli)
[![License](https://img.shields.io/github/license/google-gemini/gemini-cli)](https://github.com/google-gemini/gemini-cli/blob/main/LICENSE)

![Gemini CLI Screenshot](./assets/gemini-screenshot.png)

## 🔥 What's New in this Fork (TL;DR) / このフォークの特徴 (要約)

This is a **feature-enhanced fork** of
[google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli),
designed for **production-grade, auditable AI operations**.

このリポジトリは
[google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) の
**機能拡張フォーク** であり、**実運用レベルの監査可能なAIオペレーション**
を目的に設計されています。

### Key Enhancements / 主な拡張機能

| Capability / 機能        | Description / 説明                                                                             |
| :----------------------- | :--------------------------------------------------------------------------------------------- |
| **DeepResearch**         | Reproducible, citation-backed analysis / 再現性のある引用付き分析                              |
| **Supervisor**           | Auditable multi-agent orchestration / 監査可能なマルチエージェント協調                         |
| **Load Balancing**       | High availability for Gemini API endpoints / Gemini APIエンドポイントの高可用性                |
| **Checkpoint/Recovery**  | Session continuity with auto-save and recovery / 自動保存と復旧によるセッション継続性          |
| **Codex MCP**            | Cross-tool orchestration between Gemini and Codex / GeminiとCodex間のクロスツール協調          |
| **Natural Language CLI** | Intuitive command interface with NLP / 自然言語処理による直感的なコマンドインターフェース      |
| **GitHub Actions CI**    | Automated code analysis and review with PR comments / PRコメント付きの自動コード分析とレビュー |

---

## 🚀 Why Gemini CLI? / なぜ Gemini CLI なのか？

### Core Features (from upstream) / コア機能 (公式リポジトリより)

- **🎯 Free tier / 無料枠**: 60 requests/min with a personal Google account.
- **🧠 Powerful models / 強力なモデル**: Access to Gemini 3 with 1M token
  context.
- **🔧 Built-in tools / 内蔵ツール**: Google Search, file ops, shell commands,
  web fetching.
- **🔌 Extensible / 拡張性**: MCP (Model Context Protocol) support for custom
  integrations.
- **💻 Terminal-First**: Designed for developers who live in the command line.

---

## 📦 Installation / インストール

### Quick Install / クイックインストール

```bash
# Run instantly with npx / npxで即座に実行
npx @google/gemini-cli

# Install globally / グローバルインストール
npm install -g @google/gemini-cli
```

### From Source (Recommended for this fork) / ソースからビルド (このフォークで推奨)

1. **Prerequisites / 前提条件**: Node.js v20+
2. **Setup / セットアップ**:
   ```bash
   git clone https://github.com/zapabob/gemini-cli.git
   cd gemini-cli
   npm install
   npm run build:all
   npm run install:global
   ```

---

## 📚 Documentation / ドキュメント

For full details on all features, please see the sidebar
navigation. 全ての機能に関する詳細は、サイドバーのナビゲーションをご覧ください。

- **[Official Documentation](./docs/index.md)**: Browse the comprehensive
  official docs. / 公式の包括的なドキュメントを閲覧。
- **[This Fork's Patch List](./ZAPABOB_PATCHES.md)**: See a detailed list of all
  custom enhancements. / このフォークの全てのカスタム拡張機能の詳細リスト。

---

<p align="center">
  <strong>🌟 Revolutionize your AI workflow with the enhanced Gemini CLI! / 拡張された Gemini CLI で開発体験を革新しましょう！ 🌟</strong>
</p>
