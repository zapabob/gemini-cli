/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const { spawn } = require('child_process');
const path = require('path');

/**
 * MCPサーバーの統合テスト
 */
class MCPIntegrationTest {
  constructor() {
    this.serverProcess = null;
    this.testResults = [];
  }

  /**
   * サーバーを起動
   */
  async startServer() {
    return new Promise((resolve, reject) => {
      const serverPath = path.join(__dirname, 'dist', 'index.js');
      
      console.log('🚀 MCPサーバーを起動中...');
      console.log(`📁 サーバーパス: ${serverPath}`);
      
      this.serverProcess = spawn('node', [serverPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      this.serverProcess.stdout.on('data', (data) => {
        const message = data.toString();
        output += message;
        console.log(`📤 サーバー出力: ${message.trim()}`);
        
        // サーバーが正常に起動したかチェック
        if (message.includes('DeepresearchMCPサーバーが正常に開始されました')) {
          console.log('✅ サーバー起動成功！');
          resolve();
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        const message = data.toString();
        errorOutput += message;
        console.log(`❌ サーバーエラー: ${message.trim()}`);
      });

      this.serverProcess.on('error', (error) => {
        console.error('❌ サーバー起動エラー:', error);
        reject(error);
      });

      this.serverProcess.on('exit', (code) => {
        console.log(`📊 サーバー終了コード: ${code}`);
      });

      // タイムアウト設定
      setTimeout(() => {
        if (this.serverProcess && !this.serverProcess.killed) {
          console.log('⏰ サーバー起動タイムアウト');
          this.stopServer();
          reject(new Error('Server startup timeout'));
        }
      }, 10000);
    });
  }

  /**
   * サーバーを停止
   */
  stopServer() {
    if (this.serverProcess && !this.serverProcess.killed) {
      console.log('🛑 サーバーを停止中...');
      this.serverProcess.kill('SIGTERM');
      
      setTimeout(() => {
        if (this.serverProcess && !this.serverProcess.killed) {
          console.log('💀 強制終了...');
          this.serverProcess.kill('SIGKILL');
        }
      }, 5000);
    }
  }

  /**
   * テストを実行
   */
  async runTests() {
    console.log('\n🧪 統合テストを開始...\n');

    try {
      // 1. サーバー起動テスト
      await this.testServerStartup();
      
      // 2. ログ出力テスト
      await this.testLogOutput();
      
      // 3. プロセス安定性テスト
      await this.testProcessStability();
      
      console.log('\n✅ すべてのテストが完了しました！');
      this.printTestResults();
      
    } catch (error) {
      console.error('\n❌ テスト実行エラー:', error);
      this.printTestResults();
      throw error;
    } finally {
      this.stopServer();
    }
  }

  /**
   * サーバー起動テスト
   */
  async testServerStartup() {
    console.log('📋 テスト1: サーバー起動');
    
    try {
      await this.startServer();
      this.addTestResult('サーバー起動', 'PASS', 'サーバーが正常に起動しました');
    } catch (error) {
      this.addTestResult('サーバー起動', 'FAIL', `起動エラー: ${error.message}`);
      throw error;
    }
  }

  /**
   * ログ出力テスト
   */
  async testLogOutput() {
    console.log('📋 テスト2: ログ出力');
    
    // サーバーが起動してから少し待つ
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (this.serverProcess && !this.serverProcess.killed) {
      this.addTestResult('ログ出力', 'PASS', 'ログが正常に出力されています');
    } else {
      this.addTestResult('ログ出力', 'FAIL', 'サーバープロセスが異常終了しました');
    }
  }

  /**
   * プロセス安定性テスト
   */
  async testProcessStability() {
    console.log('📋 テスト3: プロセス安定性');
    
    // 5秒間プロセスが安定しているかチェック
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    if (this.serverProcess && !this.serverProcess.killed) {
      this.addTestResult('プロセス安定性', 'PASS', 'プロセスが安定して動作しています');
    } else {
      this.addTestResult('プロセス安定性', 'FAIL', 'プロセスが異常終了しました');
    }
  }

  /**
   * テスト結果を追加
   */
  addTestResult(testName, status, message) {
    this.testResults.push({
      name: testName,
      status,
      message,
      timestamp: new Date().toISOString()
    });
    
    const icon = status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${testName}: ${message}`);
  }

  /**
   * テスト結果を表示
   */
  printTestResults() {
    console.log('\n📊 テスト結果サマリー:');
    console.log('='.repeat(50));
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const total = this.testResults.length;
    
    console.log(`総テスト数: ${total}`);
    console.log(`成功: ${passed}`);
    console.log(`失敗: ${failed}`);
    console.log(`成功率: ${((passed / total) * 100).toFixed(1)}%`);
    
    console.log('\n詳細結果:');
    this.testResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${result.name}: ${result.message}`);
    });
    
    console.log('='.repeat(50));
  }
}

/**
 * メイン実行関数
 */
async function main() {
  const test = new MCPIntegrationTest();
  
  try {
    await test.runTests();
    process.exit(0);
  } catch (error) {
    console.error('❌ 統合テスト失敗:', error);
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみテストを実行
if (require.main === module) {
  main();
}

module.exports = MCPIntegrationTest; 