# DeepresearchMCPサーバー

Cursor IDEで使用するための深層研究機能を提供するMCPサーバーです。

## 🚀 機能

### 1. 深層研究機能 (`deep_research`)
- 多層分析による包括的な研究
- 学術ソースの自動検索
- 最新動向の調査
- 研究結果の自動保存

### 2. Web検索機能 (`web_search`)
- リアルタイムWeb検索
- 検索結果の要約
- コンテンツの自動抽出

### 3. ドキュメント分析機能 (`analyze_documents`)
- ワークスペース内ファイルの分析
- コード構造の解析
- コンテンツ統計の生成

### 4. 研究レポート生成機能 (`generate_research_report`)
- 包括的な研究レポートの生成
- 複数形式での出力（Markdown、HTML、PDF）
- 引用と参考文献の自動生成

## 📦 インストール

```bash
# 依存関係のインストール
npm install

# ビルド
npm run build

# 開発モードでの実行
npm run dev
```

## 🔧 設定

### 環境変数

```bash
# Google AI APIキー
GOOGLE_API_KEY=your_api_key_here

# ログレベル
LOG_LEVEL=info

# ログファイル
LOG_FILE=logs/deepresearch-mcp.log
```

### Cursor IDEでの設定

1. Cursor IDEを開く
2. 設定 > Features > MCP に移動
3. "Add New MCP Server" をクリック
4. 以下の設定を入力：

```
Name: DeepresearchMCP
Type: stdio
Command: node /path/to/deepresearch-mcp/dist/index.js
```

## 🛠️ 使用方法

### 1. 深層研究の実行

```javascript
// Cursor IDEのComposerで実行
deep_research({
  query: "量子コンピューティングの最新動向",
  max_depth: 3,
  max_sources: 10,
  strategy: "comprehensive",
  include_academic: true,
  recent_years: 5
})
```

### 2. Web検索の実行

```javascript
web_search({
  query: "AI技術の最新トレンド",
  max_results: 10,
  include_summary: true
})
```

### 3. ドキュメント分析の実行

```javascript
analyze_documents({
  file_pattern: "src/**/*.ts",
  analysis_type: "comprehensive",
  include_metadata: true
})
```

### 4. 研究レポートの生成

```javascript
generate_research_report({
  topic: "機械学習の実装手法",
  sources: ["research_data_1", "research_data_2"],
  report_type: "technical",
  include_citations: true,
  output_format: "markdown"
})
```

## 📊 出力例

### 深層研究結果

```
# 🔍 深層研究結果: 量子コンピューティングの最新動向

## 📊 研究統計
- **研究戦略**: comprehensive
- **実行時間**: 45000ms
- **研究深度**: 3/3
- **調査ソース数**: 10/10
- **発見トピック数**: 15個

## 🎯 主要な発見

量子コンピューティングは現在、以下の分野で急速に発展しています：

1. **量子優位性の実証**
   - GoogleのSycamoreプロセッサ
   - 中国の九章量子コンピュータ

2. **量子アルゴリズムの開発**
   - Shor's algorithm
   - Grover's algorithm

3. **量子エラー訂正**
   - Surface code
   - Topological qubits

## 📋 調査されたトピック
- 量子コンピューティング
- 量子優位性
- 量子アルゴリズム
- 量子エラー訂正
- 量子暗号
- 量子機械学習
- 量子シミュレーション
- 量子ネットワーク
- 量子センサー
- 量子メモリ

## 💡 次のステップ
この研究結果を基に、さらに詳細な調査や実装を進めることができます。
```

## 🏗️ アーキテクチャ

```
src/
├── index.ts                 # メインエントリーポイント
├── services/
│   ├── deepResearchService.ts    # 深層研究サービス
│   ├── webSearchService.ts       # Web検索サービス
│   ├── documentAnalysisService.ts # ドキュメント分析サービス
│   └── researchReportService.ts  # 研究レポートサービス
└── utils/
    └── logger.ts                 # ログ機能
```

## 🔍 技術スタック

- **TypeScript**: 型安全な開発
- **@modelcontextprotocol/sdk**: MCPプロトコル実装
- **@google/generative-ai**: Gemini AI API
- **node-fetch**: HTTPリクエスト
- **cheerio**: HTML解析
- **fs-extra**: ファイル操作
- **glob**: ファイル検索

## 📈 パフォーマンス

- **深層研究**: 30-60秒
- **Web検索**: 5-15秒
- **ドキュメント分析**: 10-30秒
- **レポート生成**: 20-40秒

## 🛡️ セキュリティ

- APIキーの安全な管理
- 入力値の検証
- エラーハンドリング
- ログの暗号化

## 🐛 トラブルシューティング

### よくある問題

1. **APIキーエラー**
   ```bash
   # 環境変数の確認
   echo $GOOGLE_API_KEY
   ```

2. **ビルドエラー**
   ```bash
   # 依存関係の再インストール
   npm clean-install
   npm run build
   ```

3. **MCPサーバー接続エラー**
   ```bash
   # サーバーの手動テスト
   node dist/index.js
   ```

## 📝 ライセンス

MIT License

## 🤝 貢献

プルリクエストやイシューの報告を歓迎します。

## 📞 サポート

問題が発生した場合は、以下の方法でサポートを受けることができます：

1. GitHub Issues
2. ドキュメントの確認
3. ログファイルの確認

---

**注意**: このサーバーは研究目的で使用することを推奨します。商用利用の場合は、適切なライセンスとAPIキーの管理を行ってください。 