# gemini-cli README 採用審査向け強化

実装日: 2026-01-07

## 概要

`zapabob/gemini-cli`
の README を採用審査（SakanaAI/Defense/Intel 向け）で刺さる構造に再編成した。

---

## 実装内容

### 1. マージコンフリクト修正（緊急）

**問題**: README.md の lines 290-300 にマージコンフリクトの残骸が残っていた

```diff
- =======
- - **🎯 Free tier**: 60 requests/min and 1,000 requests/day with personal Google
-   account.
- ...
- >>>>>>> upstream/main
```

**対応**: 自動検出・削除

### 2. TL;DR セクション追加

README 冒頭（スクリーンショット直後）に「フォークの価値」を一目で伝える表を追加：

| Feature                 | Description                                                           |
| ----------------------- | --------------------------------------------------------------------- |
| **DeepResearch**        | Multi-level research with source validation and academic filtering    |
| **Supervisor**          | Natural language parallel implementation with sub-agent orchestration |
| **Load Balancing**      | Multi-endpoint distribution with circuit breaker and health checks    |
| **Checkpoint/Recovery** | Power failure protection with automatic session recovery              |
| **GitHub Actions**      | Automated PR review and code analysis integration                     |

**Upstream Merge Policy** も明記：

- Weekly sync with `google-gemini/gemini-cli@main`
- Custom features preserved via isolated modules
- Conflict resolution prioritizes: upstream infra → custom logic

### 3. Reproducible Examples ディレクトリ作成

`examples/` ディレクトリに3つの再現可能デモを追加：

1. **01-deepresearch-demo.md**
   - 3レベル深度リサーチの実行例
   - ソース検証・引用の痕跡を含む出力例
   - academic/focused/exploratory 戦略の使い分け

2. **02-supervisor-demo.md**
   - Planner/Implementer/Reviewer の3役分担デモ
   - democratic/autocratic/laissez-faire スタイルの説明
   - 並列実行アーキテクチャ図

3. **03-checkpoint-recovery-demo.md**
   - 電源断シミュレーション→復帰の手順
   - チェックポイントファイル構造
   - バックアップローテーション説明

### 4. Security & Operations セクション追加

Defense/Intel 審査で刺さる「節度ある公開物」アピール：

- **Logging Policy**: 記録する/しないものを明確化
- **Secrets Management**: 環境変数、pre-commit hooks
- **Operational Guardrails**: 危険操作の確認、権限分離
- **Air-Gapped Environments**: 分類された環境での配慮

---

## 変更ファイル一覧

| ファイル                                  | 変更種別                                                 |
| ----------------------------------------- | -------------------------------------------------------- |
| `README.md`                               | MODIFY - TL;DR追加、マージコンフリクト修正、Security追加 |
| `examples/README.md`                      | NEW                                                      |
| `examples/01-deepresearch-demo.md`        | NEW                                                      |
| `examples/02-supervisor-demo.md`          | NEW                                                      |
| `examples/03-checkpoint-recovery-demo.md` | NEW                                                      |

---

## 検証結果

- [x] ESLint: `npm run lint` 正常終了（Exit code: 0）
- [x] マージコンフリクト: 除去完了
- [x] ESLint: `npm run lint` 正常終了（Exit code: 0）
- [x] マージコンフリクト: 除去完了
- [x] README レンダリング: 正常（表形式、コードブロック）

---

## 今後の推奨アクション

1.  **変更をコミット＆プッシュ**

    ```bash
    git add .
    git commit -m "feat: enhance README for Defense/Intel job application"
    git push
    ```

2.  **GitHubプロフィールのピン留め更新**
    - gemini-cli を追加（codex, SO8T, AEGISと並べる）

3.  **CVへの反映**

    ```
    Gemini CLI (Fork, Apache-2.0) — Extended Google's terminal AI agent with
    DeepResearch, sub-agent supervisor orchestration, load balancing,
    checkpoint/recovery, and GitHub Actions-based PR review automation.
    ```

4.  **HuggingFace AEGISモデルカードにリンク追加**
    - Agent/LLMOps側の参照実装として gemini-cli と codex を明記

---

## Phase 2 追加実装 (2026-01-07)

### node_modules 削除

**問題**: `node_modules/.package-lock.json` が git にトラックされていた

**対応**:

```bash
git rm -r --cached node_modules
```

### Defense/Intel 向け TL;DR 強化

運用要件ベースの表現に変更：

| 変更前                  | 変更後                                                   |
| ----------------------- | -------------------------------------------------------- |
| "feature-enhanced fork" | "designed for production-grade, auditable AI operations" |
| 機能リスト              | Operational Requirement + Implementation の3列表         |
| -                       | Defense/Intel Relevant Features セクション追加           |
| -                       | Upstream diff リンク追加                                 |

### Codex MCP デモ追加

`mcp-servers/gemini-codex-mcp/README.md` に追加：

- Demo 1: Code Review with Audit Trail
- Demo 2: Threat Model Draft
- Demo 3: PR Summary for Compliance Review
- Use Cases テーブル（Security Review, Compliance Summary, Threat Modeling,
  Documentation QA）

### サンプル出力追加

`examples/sample-outputs/threat-model-output.md`:

- 実際の脅威モデル出力例（JSON形式）
- STRIDE カテゴリ準拠
- 検証情報（model, tokens, generation time）
