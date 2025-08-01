# Cursorのmcp.json設定ガイド

**日時**: 2025年7月31日 12:45  
**実装者**: AI Assistant  
**機能**: DeepresearchMCPサーバーのCursor設定ガイド

## Cursorのmcp.json設定方法

### 1. mcp.jsonファイルの場所

**Windows**:
```
C:\Users\[ユーザー名]\.cursor\mcp.json
```

**macOS/Linux**:
```
~/.cursor/mcp.json
```

### 2. 現在の設定確認

```powershell
# Windows PowerShell
Get-Content "C:\Users\downl\.cursor\mcp.json"
```

### 3. DeepresearchMCPサーバーの追加

#### 方法1: 手動で追加

1. **mcp.jsonファイルを開く**:
   ```powershell
   notepad "C:\Users\downl\.cursor\mcp.json"
   ```

2. **以下の設定を追加**:
   ```json
   {
     "mcpServers": {
       "unityMCP": {
         "command": "uv",
         "args": [
           "--directory",
           "C:\\Users\\downl\\AppData\\Local\\Programs\\UnityMCP\\UnityMcpServer\\src",
           "run",
           "server.py"
         ]
       },
       "blenderMCP": {
         "command": "C:\\Users\\downl\\.local\\bin\\uvx.exe",
         "args": [
           "blender-mcp"
         ],
         "directory": "C:\\Users\\downl\\Desktop\\blender-mcp-main\\blender-mcp-main",
         "run": "addon.py",
         "main": "main.py"
       },
       "mcp-deepwiki": {
         "command": "npx",
         "args": [
           "-y",
           "mcp-deepwiki@latest"
         ]
       },
       "unity": {
         "command": "node",
         "args": [
           "C:/Users/downl/Desktop/UnityMCP/unity-mcp-server/build/index.js"
         ]
       },
       "note-api": {
         "command": "node",
         "args": [
           "C:/Users/downl/Desktop/note-mcp-server-main/note-mcp-server-main/build/note-api.js"
         ]
       },
       "deepresearch-mcp": {
         "command": "node",
         "args": [
           "C:\\Users\\downl\\Desktop\\gemini-cli-main\\mcp-servers\\deepresearch-mcp\\dist\\index.js"
         ]
       }
     }
   }
   ```

#### 方法2: PowerShellスクリプトで追加

```powershell
# mcp.jsonファイルを読み込み
$mcpConfig = Get-Content "C:\Users\downl\.cursor\mcp.json" | ConvertFrom-Json

# DeepresearchMCPサーバーの設定を追加
$mcpConfig.mcpServers | Add-Member -Name "deepresearch-mcp" -Value @{
    command = "node"
    args = @("C:\Users\downl\Desktop\gemini-cli-main\mcp-servers\deepresearch-mcp\dist\index.js")
} -MemberType NoteProperty

# 更新された設定を保存
$mcpConfig | ConvertTo-Json -Depth 10 | Set-Content "C:\Users\downl\.cursor\mcp.json"
```

### 4. 環境変数の設定

#### Windows PowerShell:
```powershell
# 環境変数を設定
$env:GOOGLE_API_KEY = "your_api_key_here"
$env:LOG_LEVEL = "info"

# 永続的に設定する場合
[Environment]::SetEnvironmentVariable("GOOGLE_API_KEY", "your_api_key_here", "User")
[Environment]::SetEnvironmentVariable("LOG_LEVEL", "info", "User")
```

#### Windows Command Prompt:
```cmd
set GOOGLE_API_KEY=your_api_key_here
set LOG_LEVEL=info
```

### 5. サーバーのビルド

```powershell
# DeepresearchMCPサーバーディレクトリに移動
cd "C:\Users\downl\Desktop\gemini-cli-main\mcp-servers\deepresearch-mcp"

# 依存関係のインストール
npm install

# TypeScriptのビルド
npm run build
```

### 6. Cursor IDEの再起動

1. **Cursor IDEを完全に閉じる**
2. **Cursor IDEを再起動**
3. **設定の確認**: Settings > Features > MCP

### 7. 動作確認

#### 7.1 サーバーの手動テスト

```powershell
# サーバーを手動で実行
node "C:\Users\downl\Desktop\gemini-cli-main\mcp-servers\deepresearch-mcp\dist\index.js"
```

#### 7.2 Cursor IDEでの確認

1. **Cursor IDEを開く**
2. **Composerでテスト**:
   ```javascript
   // 深層研究のテスト
   deep_research({
     query: "量子コンピューティングの最新動向",
     max_depth: 2,
     strategy: "comprehensive"
   })
   ```

### 8. トラブルシューティング

#### 8.1 よくある問題

**問題1: サーバーが見つからない**
```powershell
# パスの確認
Test-Path "C:\Users\downl\Desktop\gemini-cli-main\mcp-servers\deepresearch-mcp\dist\index.js"
```

**問題2: 環境変数が設定されていない**
```powershell
# 環境変数の確認
echo $env:GOOGLE_API_KEY
echo $env:LOG_LEVEL
```

**問題3: TypeScriptビルドエラー**
```powershell
# 依存関係の再インストール
npm clean-install
npm run build
```

#### 8.2 ログの確認

```powershell
# サーバーログの確認
Get-Content "C:\Users\downl\Desktop\gemini-cli-main\mcp-servers\deepresearch-mcp\logs\deepresearch-mcp.log"
```

### 9. 設定例

#### 9.1 完全なmcp.json設定

```json
{
  "mcpServers": {
    "unityMCP": {
      "command": "uv",
      "args": [
        "--directory",
        "C:\\Users\\downl\\AppData\\Local\\Programs\\UnityMCP\\UnityMcpServer\\src",
        "run",
        "server.py"
      ]
    },
    "blenderMCP": {
      "command": "C:\\Users\\downl\\.local\\bin\\uvx.exe",
      "args": [
        "blender-mcp"
      ],
      "directory": "C:\\Users\\downl\\Desktop\\blender-mcp-main\\blender-mcp-main",
      "run": "addon.py",
      "main": "main.py"
    },
    "mcp-deepwiki": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-deepwiki@latest"
      ]
    },
    "unity": {
      "command": "node",
      "args": [
        "C:/Users/downl/Desktop/UnityMCP/unity-mcp-server/build/index.js"
      ]
    },
    "note-api": {
      "command": "node",
      "args": [
        "C:/Users/downl/Desktop/note-mcp-server-main/note-mcp-server-main/build/note-api.js"
      ]
    },
    "deepresearch-mcp": {
      "command": "node",
      "args": [
        "C:\\Users\\downl\\Desktop\\gemini-cli-main\\mcp-servers\\deepresearch-mcp\\dist\\index.js"
      ]
    }
  }
}
```

#### 9.2 環境変数設定

```powershell
# 環境変数の設定
[Environment]::SetEnvironmentVariable("GOOGLE_API_KEY", "your_api_key_here", "User")
[Environment]::SetEnvironmentVariable("LOG_LEVEL", "info", "User")
[Environment]::SetEnvironmentVariable("LOG_FILE", "C:\Users\downl\Desktop\gemini-cli-main\mcp-servers\deepresearch-mcp\logs\deepresearch-mcp.log", "User")
```

### 10. 使用方法

#### 10.1 深層研究の実行

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

#### 10.2 Web検索の実行

```javascript
web_search({
  query: "AI技術の最新トレンド",
  max_results: 10,
  include_summary: true
})
```

#### 10.3 ドキュメント分析の実行

```javascript
analyze_documents({
  file_pattern: "src/**/*.ts",
  analysis_type: "comprehensive",
  include_metadata: true
})
```

#### 10.4 研究レポート生成の実行

```javascript
generate_research_report({
  topic: "機械学習の実装手法",
  sources: ["research_data_1", "research_data_2"],
  report_type: "technical",
  include_citations: true,
  output_format: "markdown"
})
```

### 11. セキュリティ注意事項

1. **APIキーの管理**:
   - 環境変数で安全に管理
   - ソースコードに直接記述しない
   - 定期的なキーの更新

2. **ファイルパスの保護**:
   - 絶対パスを使用
   - スペースや特殊文字に注意
   - バックスラッシュのエスケープ

3. **ログの管理**:
   - 機密情報の暗号化
   - ログファイルの定期的な削除
   - アクセス権限の設定

### 12. パフォーマンス最適化

1. **メモリ使用量の監視**:
   ```powershell
   # プロセスのメモリ使用量確認
   Get-Process node | Select-Object ProcessName, WorkingSet
   ```

2. **ログレベルの調整**:
   ```powershell
   # 本番環境ではinfoレベル
   $env:LOG_LEVEL = "info"
   
   # 開発環境ではdebugレベル
   $env:LOG_LEVEL = "debug"
   ```

3. **キャッシュの活用**:
   - 検索結果のキャッシュ
   - 研究結果の保存
   - 重複処理の回避

### 13. 今後の改善計画

1. **自動化スクリプトの作成**:
   - インストールスクリプト
   - 設定自動化
   - 更新スクリプト

2. **GUI設定ツールの開発**:
   - 視覚的な設定インターフェース
   - ドラッグ&ドロップ機能
   - リアルタイム設定確認

3. **統合開発環境の拡張**:
   - VS Code拡張機能
   - Cursor IDE専用プラグイン
   - 他のIDEとの連携

---

**注意**: このガイドに従って設定を行う際は、必ずバックアップを取ってから作業を行ってください。設定ミスによりCursor IDEが正常に動作しなくなる可能性があります。 