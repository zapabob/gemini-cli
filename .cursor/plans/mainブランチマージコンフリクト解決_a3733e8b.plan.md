---
name: mainブランチマージコンフリクト解決
overview: マージコンフリクトを解決してmainブランチを完成させます。公式版（upstream）のAPI変更を優先しつつ、独自機能を可能な限り保持します。
todos:
  - id: resolve_execute_parallel
    content: execute-parallel.tsのコンフリクトを解決（upstream版のAPIを採用）
    status: completed
  - id: resolve_execute
    content: execute.tsのコンフリクトを解決（upstream版のAPIを採用）
    status: completed
  - id: resolve_loadbalancer
    content: loadBalancerCommand.tsのコンフリクトを解決（独自機能を保持）
    status: completed
  - id: resolve_natural_language
    content: naturalLanguageSubagentProcessor.tsのコンフリクトを解決（upstream版の実装を採用）
    status: completed
  - id: verify_conflicts
    content: コンフリクトマーカーの確認とマージコミット
    status: completed
    dependencies:
      - resolve_execute_parallel
      - resolve_execute
      - resolve_loadbalancer
      - resolve_natural_language
---

# mainブランチマージコンフリクト解決計画

## 現状

現在`main`ブランチにいて、マージコンフリクトが4つのファイルで発生しています：

1. `packages/cli/src/commands/agents/execute-parallel.ts` - 複数のコンフリクト
2. `packages/cli/src/commands/agents/execute.ts` - API変更によるコンフリクト
3. `packages/cli/src/ui/commands/loadBalancerCommand.ts` - インポート文のコンフリクト
4. `packages/cli/src/ui/hooks/naturalLanguageSubagentProcessor.ts` - インポートと実装のコンフリクト

## 解決方針

公式版（upstream）のAPI変更を優先し、独自機能は可能な限り保持します。

## 修正内容

### 1. execute-parallel.ts の修正

**コンフリクト1 (75-84行目)**: `argv.agents`の処理

- **解決**: upstream版を採用（`requestedAgents`を使用、型安全性向上）

**コンフリクト2 (164-170行目)**: `SubagentExecutor`の初期化

- **解決**: upstream版を採用（`options`から値を取得）

**コンフリクト3 (185-207行目)**: `executor.executeTask`の呼び出し

- **解決**: upstream版を採用（新しいAPI: `executeTask(subagent, taskPayload)`）

### 2. execute.ts の修正

**コンフリクト (62-82行目)**: `executor.executeTask`の呼び出し

- **解決**: upstream版を採用（新しいAPI: `executeTask(subagent, task)`）
- `toSubagent`ヘルパー関数を使用して`SubagentDefinition`から`Subagent`に変換

### 3. loadBalancerCommand.ts の修正

**コンフリクト (14-39行目)**: インポート文

- **解決**: HEAD版を採用（独自機能を保持）
- upstream版のコメントアウト部分を削除
- `createDefaultEndpoint`と`LoadBalancerService`のインポートを保持

### 4. naturalLanguageSubagentProcessor.ts の修正

**コンフリクト (7-52行目)**: `getSubagentsBySpecialty`の実装

- **解決**: upstream版を採用（ローカル実装を使用）
- `SubagentRegistry`を使用してサブエージェントを取得
- `getSubagentsBySpecialty`関数をローカルに実装

## 実装手順

1. 各コンフリクトファイルを順次修正
2. コンフリクトマーカーを削除
3. 型エラーがないか確認
4. マージをコミット

## 成功基準

- `git diff --check`でコンフリクトマーカーが0件
- `git status`で「Unmerged paths」が0件
- マージコミットが正常に完了
