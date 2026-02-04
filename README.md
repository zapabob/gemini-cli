# Gemini CLI

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

![Gemini CLI Screenshot](./docs/assets/gemini-screenshot.png)

## 🔥 What's New in zapabob Fork (v0.29.0) / 特徴 (要約)

This is a **feature-enhanced fork** of
[google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli),
designed for **production-grade, auditable AI operations**. このリポジトリは
[google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) の
**機能拡張フォーク** であり、**実運用レベルの監査可能なAIオペレーション**
を目的に設計されています。

### Operational Capabilities / 運用機能

| Capability / 機能       | Description / 説明                                                     | Implementation / 実装                                              |
| :---------------------- | :--------------------------------------------------------------------- | :----------------------------------------------------------------- |
| **DeepResearch**        | Reproducible, citation-backed analysis / 再現性のある引用付き分析      | Multi-level source validation / 多レベルソース検証                 |
| **Supervisor**          | Auditable multi-agent orchestration / 監査可能なマルチエージェント協調 | Parallel sub-agents / 並列サブエージェント                         |
| **Load Balancing**      | High availability / 高度な可用性                                       | Circuit breaker, failover / サーキットブレーカー, フェイルオーバー |
| **Checkpoint/Recovery** | Session continuity / セッション継続性                                  | Auto-save, emergency recovery / 自動保存, 緊急復旧                 |
| **Codex MCP**           | Cross-tool orchestration / クロスツール協調                            | Gemini ↔ Codex interop                                             |

---

## 🚀 Why Gemini CLI? / なぜ Gemini CLI なのか？

### Core Features / コア機能

- **🎯 Free tier / 無料枠**: 60 requests/min, 1,000 requests/day with personal
  Google account.
- **🧠 Powerful models / 強力なモデル**: Access to Gemini 3 with 1M token
  context.
- **🔧 Built-in tools / 内蔵ツール**: Google Search, file ops, shell commands,
  web fetching.
- **🔌 Extensible / 拡張性**: MCP (Model Context Protocol) support.

## 📦 Installation / インストール

### Quick Install / クイックインストール

```bash
# Run instantly with npx / npxで即座に実行
npx @google/gemini-cli

# Install globally / グローバルインストール
npm install -g @google/gemini-cli
```

### From Source / ソースからビルド (Windows Recommended)

1. **Prerequisites**: Node.js v20+
2. **Setup**:
   ```bash
   git clone https://github.com/zapabob/gemini-cli.git
   cd gemini-cli
   npm install
   npm run build:all
   npm run install:global
   ```

## 📋 Key Features / 主な機能

### Supervisor Command

Enable parallel implementations using natural language
coordination: 自然言語による指示で、複数のサブエージェントを並列実行・調整します：

```bash
gemini /supervisor "Implement user authentication with JWT"
```

### DeepResearch

Source-validated research depth up to 3
levels: 最大3レベルの深さで、ソースを検証しながらリサーチを行います：

```bash
gemini /deepresearch "Future of AI in Japan" --levels 3
```

---

## 📚 Documentation / ドキュメント

- [English Documentation](./docs/README.md)
- [日本語ドキュメント](./README_ja.md) (Detailed)
- [Full Patch List](./ZAPABOB_PATCHES.md)

---

<p align="center">
  <strong>🌟 Revolutionize your AI workflow with Gemini CLI! / Gemini CLI で開発体験を革新しましょう！ 🌟</strong>
</p>
