# サブエージェント使用ガイド

**作成日**: 2025年7月31日  
**バージョン**: 0.7.0  
**対象**: gemini-cli サブエージェント機能

## 概要

gemini-cliのサブエージェント機能は、複雑なタスクを専門的なAIエージェントに分割して並列実行するための高度な機能です。このガイドでは、サブエージェントの使用方法、設定、ベストプラクティスについて説明します。

## 目次

1. [サブエージェントとは](#サブエージェントとは)
2. [基本的な使用方法](#基本的な使用方法)
3. [サブエージェントの種類](#サブエージェントの種類)
4. [設定とカスタマイズ](#設定とカスタマイズ)
5. [エラーハンドリング](#エラーハンドリング)
6. [パフォーマンス最適化](#パフォーマンス最適化)
7. [監視とデバッグ](#監視とデバッグ)
8. [ベストプラクティス](#ベストプラクティス)
9. [トラブルシューティング](#トラブルシューティング)

## サブエージェントとは

サブエージェントは、特定の専門分野に特化したAIエージェントです。メインエージェントが全体の調整を行い、各サブエージェントが並列で専門的なタスクを実行します。

### 主な特徴

- **専門性**: 各サブエージェントは特定の分野に特化
- **並列実行**: 複数のサブエージェントが同時に動作
- **協調**: リアルタイム通信による協調的な問題解決
- **スケーラビリティ**: 必要に応じてサブエージェントを追加・削除

## 基本的な使用方法

### 1. サブエージェントの起動

```bash
# 基本的なサブエージェント使用
gemini -p "Use subagents to analyze the current project structure"

# 特定のサブエージェントを指定
gemini -p "Use documentation and architecture subagents to design a new feature"
```

### 2. サブエージェントの種類指定

```bash
# 複数の専門分野を指定
gemini -p "Use subagents: documentation, architecture_design, frontend_development, backend_development, testing"
```

## サブエージェントの種類

### 利用可能な専門分野

| 専門分野               | 説明                     | 主な用途                             |
| ---------------------- | ------------------------ | ------------------------------------ |
| `documentation`        | ドキュメンテーション専門 | API仕様書、ユーザーガイド、技術文書  |
| `architecture_design`  | アーキテクチャ設計専門   | システム設計、技術選定、パターン適用 |
| `frontend_development` | フロントエンド開発専門   | UI/UX実装、React/Vue開発             |
| `backend_development`  | バックエンド開発専門     | API実装、データベース設計            |
| `testing`              | テスト専門               | 単体テスト、統合テスト、E2Eテスト    |
| `security`             | セキュリティ専門         | 脆弱性分析、セキュリティ設計         |
| `performance`          | パフォーマンス専門       | 最適化、負荷テスト、監視             |
| `devops`               | DevOps専門               | CI/CD、インフラ、デプロイメント      |

### カスタム専門分野の作成

```typescript
// カスタムサブエージェントの定義
const customSubagent: Subagent = {
  id: 'custom-specialist',
  name: 'Custom Specialist',
  specialty: 'custom_specialty',
  capabilities: ['custom_analysis', 'specialized_processing'],
  description: 'カスタム専門分野のサブエージェント',
};
```

## 設定とカスタマイズ

### 1. サブエージェント設定

```typescript
// サブエージェント設定の例
const subagentConfig: SubagentConfig = {
  maxConcurrent: 5, // 最大並列実行数
  timeout: 300000, // タイムアウト（ミリ秒）
  retryAttempts: 3, // リトライ回数
  communicationMode: 'realtime', // 通信モード
  checkpointing: true, // チェックポイント有効
  errorHandling: 'adaptive', // エラーハンドリング戦略
};
```

### 2. 監督者エージェント設定

```typescript
// 監督者エージェント設定の例
const supervisorConfig: SupervisorConfig = {
  role: {
    id: 'main-supervisor',
    name: 'Main Supervisor',
    description: 'メイン監督者',
    responsibilities: ['タスク分割', '進捗監視', '結果統合'],
    decisionMakingAuthority: 'high',
    coordinationStyle: 'democratic',
  },
  maxSubagents: 10,
  coordinationStrategy: 'hybrid',
  decisionThreshold: 0.8,
  progressReporting: true,
  errorHandling: 'adaptive',
};
```

## エラーハンドリング

### 1. エラー処理戦略

```typescript
// エラーハンドリング設定
const errorHandlingConfig = {
  strategy: 'adaptive', // 'strict' | 'flexible' | 'adaptive'
  retryOnFailure: true,
  fallbackMechanism: 'graceful_degradation',
  errorReporting: 'detailed',
};
```

### 2. エラー回復メカニズム

- **自動リトライ**: 一時的なエラーの自動回復
- **フェイルオーバー**: 代替サブエージェントへの切り替え
- **グレースフルデグラデーション**: 機能を制限して継続実行
- **チェックポイント復旧**: 前回の状態からの復旧

## パフォーマンス最適化

### 1. 並列処理の最適化

```typescript
// 並列処理設定
const parallelConfig = {
  maxConcurrentTasks: 5,
  loadBalancing: 'round_robin',
  resourceAllocation: 'dynamic',
  priorityQueuing: true,
};
```

### 2. リソース管理

- **メモリ使用量の監視**: 各サブエージェントのメモリ使用量を追跡
- **CPU使用率の最適化**: 負荷分散によるCPU使用率の最適化
- **ネットワーク帯域幅**: 通信量の監視と制御

### 3. キャッシュ戦略

```typescript
// キャッシュ設定
const cacheConfig = {
  enabled: true,
  strategy: 'lru',
  maxSize: 1000,
  ttl: 3600000, // 1時間
};
```

## 監視とデバッグ

### 1. 監視ダッシュボード

```bash
# サブエージェントの状態確認
gemini -p "Show subagent status and performance metrics"

# リアルタイム監視
gemini -p "Monitor subagent execution in real-time"
```

### 2. ログとメトリクス

```typescript
// 監視メトリクス
interface SubagentMetrics {
  executionTime: number;
  successRate: number;
  errorRate: number;
  throughput: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    network: number;
  };
}
```

### 3. デバッグツール

```bash
# デバッグモードでの実行
gemini -d -p "Debug subagent execution with detailed logging"

# 特定のサブエージェントのデバッグ
gemini -p "Debug the architecture_design subagent specifically"
```

## ベストプラクティス

### 1. サブエージェントの選択

- **タスクの複雑さに応じた選択**: 単純なタスクには少ないサブエージェント
- **専門性の活用**: 各サブエージェントの専門分野を最大限活用
- **リソースの考慮**: 利用可能なリソースに応じたサブエージェント数の調整

### 2. 通信と協調

- **明確な役割分担**: 各サブエージェントの責任範囲を明確化
- **効率的な通信**: 必要な情報のみを共有
- **進捗の可視化**: リアルタイムでの進捗確認

### 3. エラー処理

- **予防的なエラー処理**: エラーが発生する前の対策
- **段階的なエラー回復**: 軽微なエラーから重大なエラーへの段階的対応
- **学習機能**: エラーパターンの学習と改善

### 4. パフォーマンス

- **適切な並列度**: システムリソースに応じた並列実行数の調整
- **効率的なリソース使用**: メモリとCPUの効率的な使用
- **スケーラビリティ**: 負荷に応じた動的なスケーリング

## トラブルシューティング

### よくある問題と解決方法

#### 1. サブエージェントが応答しない

**症状**: サブエージェントがタイムアウトする

**解決方法**:

```bash
# タイムアウト設定の確認
gemini -p "Check subagent timeout settings and increase if necessary"

# サブエージェントの再起動
gemini -p "Restart unresponsive subagents"
```

#### 2. メモリ使用量が高い

**症状**: システムのメモリ使用量が異常に高い

**解決方法**:

```bash
# メモリ使用量の監視
gemini -p "Monitor subagent memory usage and optimize"

# サブエージェント数の削減
gemini -p "Reduce number of concurrent subagents"
```

#### 3. 通信エラー

**症状**: サブエージェント間の通信が失敗する

**解決方法**:

```bash
# 通信設定の確認
gemini -p "Check subagent communication settings"

# ネットワーク接続の確認
gemini -p "Verify network connectivity between subagents"
```

#### 4. 結果の不整合

**症状**: サブエージェントの結果が期待と異なる

**解決方法**:

```bash
# 結果の検証
gemini -p "Validate subagent results and identify inconsistencies"

# サブエージェントの再実行
gemini -p "Re-run subagents with corrected parameters"
```

### デバッグコマンド

```bash
# サブエージェントの状態確認
gemini -p "Show detailed subagent status"

# ログの確認
gemini -p "Display subagent execution logs"

# パフォーマンスメトリクス
gemini -p "Show subagent performance metrics"

# エラーログの確認
gemini -p "Check subagent error logs"
```

## 高度な機能

### 1. カスタムサブエージェントの作成

```typescript
// カスタムサブエージェントの実装例
class CustomSubagent implements Subagent {
  id: string;
  name: string;
  specialty: SubagentSpecialty;

  async executeTask(task: SubagentTask): Promise<SubagentResult> {
    // カスタム処理ロジック
    return {
      success: true,
      output: 'Custom result',
      executionTime: Date.now(),
      metadata: {},
    };
  }
}
```

### 2. リアルタイム通信

```typescript
// リアルタイム通信の設定
const realTimeConfig: RealTimeSessionConfig = {
  sessionId: 'unique-session-id',
  mainAgentId: 'main-agent',
  subagentIds: ['subagent-1', 'subagent-2'],
  enableHeartbeat: true,
  enableCheckpointing: true,
  heartbeatInterval: 30000,
  checkpointInterval: 60000,
};
```

### 3. チェックポイント機能

```typescript
// チェックポイントの設定
const checkpointConfig = {
  enabled: true,
  interval: 60000, // 1分間隔
  autoRestore: true,
  compression: true,
};
```

## まとめ

サブエージェント機能は、複雑なタスクを効率的に処理するための強力なツールです。適切な設定と使用方法により、大幅な生産性向上を実現できます。

### 次のステップ

1. **基本機能の習得**: 基本的なサブエージェントの使用方法を習得
2. **カスタマイズ**: プロジェクトに特化したカスタマイズ
3. **最適化**: パフォーマンスとリソース使用量の最適化
4. **監視**: 継続的な監視と改善

### 参考資料

- [API リファレンス](./api-reference.md)
- [設定ガイド](./configuration-guide.md)
- [トラブルシューティング](./troubleshooting.md)
- [ベストプラクティス](./best-practices.md)

---

**注意**: このガイドは gemini-cli
v0.7.0 に基づいています。最新の機能については、[公式ドキュメント](https://github.com/google/gemini-cli)を参照してください。
