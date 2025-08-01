#!/usr/bin/env node
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * エラーハンドラークラス
 */
class ErrorHandler {
  constructor() {
    this.errorTypes = {
      MODULE_NOT_FOUND: 'MODULE_NOT_FOUND',
      PERMISSION_DENIED: 'PERMISSION_DENIED',
      NETWORK_ERROR: 'NETWORK_ERROR',
      BUILD_ERROR: 'BUILD_ERROR',
      CONFIG_ERROR: 'CONFIG_ERROR',
      API_ERROR: 'API_ERROR',
      UNKNOWN_ERROR: 'UNKNOWN_ERROR'
    };
  }

  /**
   * エラーを分類
   */
  classifyError(error) {
    const errorMessage = error.message || error.toString();
    const errorStack = error.stack || '';

    if (errorMessage.includes('Cannot find module') || errorMessage.includes('MODULE_NOT_FOUND')) {
      return this.errorTypes.MODULE_NOT_FOUND;
    }
    
    if (errorMessage.includes('EACCES') || errorMessage.includes('permission denied')) {
      return this.errorTypes.PERMISSION_DENIED;
    }
    
    if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('network') || errorMessage.includes('timeout')) {
      return this.errorTypes.NETWORK_ERROR;
    }
    
    if (errorMessage.includes('build') || errorMessage.includes('compilation')) {
      return this.errorTypes.BUILD_ERROR;
    }
    
    if (errorMessage.includes('config') || errorMessage.includes('configuration')) {
      return this.errorTypes.CONFIG_ERROR;
    }
    
    if (errorMessage.includes('API') || errorMessage.includes('authentication')) {
      return this.errorTypes.API_ERROR;
    }
    
    return this.errorTypes.UNKNOWN_ERROR;
  }

  /**
   * エラー情報を収集
   */
  collectErrorInfo(error) {
    const errorType = this.classifyError(error);
    const systemInfo = this.getSystemInfo();
    const projectInfo = this.getProjectInfo();
    const environmentInfo = this.getEnvironmentInfo();

    return {
      type: errorType,
      message: error.message || error.toString(),
      stack: error.stack,
      timestamp: new Date().toISOString(),
      system: systemInfo,
      project: projectInfo,
      environment: environmentInfo
    };
  }

  /**
   * システム情報を取得
   */
  getSystemInfo() {
    return {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      npmVersion: this.getNpmVersion(),
      memory: process.memoryUsage()
    };
  }

  /**
   * プロジェクト情報を取得
   */
  getProjectInfo() {
    try {
      const packageJson = JSON.parse(readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
      return {
        name: packageJson.name,
        version: packageJson.version,
        dependencies: Object.keys(packageJson.dependencies || {}).length,
        devDependencies: Object.keys(packageJson.devDependencies || {}).length
      };
    } catch {
      return { error: 'package.jsonの読み込みに失敗' };
    }
  }

  /**
   * 環境情報を取得
   */
  getEnvironmentInfo() {
    return {
      cwd: process.cwd(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '設定済み' : '未設定',
        PATH: process.env.PATH ? '設定済み' : '未設定'
      }
    };
  }

  /**
   * npmバージョンを取得
   */
  getNpmVersion() {
    try {
      return execSync('npm --version', { encoding: 'utf-8' }).trim();
    } catch {
      return 'unknown';
    }
  }

  /**
   * エラー診断を実行
   */
  diagnoseError(errorInfo) {
    const diagnosis = {
      severity: this.getErrorSeverity(errorInfo.type),
      description: this.getErrorDescription(errorInfo.type),
      causes: this.getErrorCauses(errorInfo),
      solutions: this.getErrorSolutions(errorInfo),
      prevention: this.getErrorPrevention(errorInfo.type)
    };

    return diagnosis;
  }

  /**
   * エラーの重要度を取得
   */
  getErrorSeverity(errorType) {
    const severityMap = {
      [this.errorTypes.MODULE_NOT_FOUND]: 'HIGH',
      [this.errorTypes.PERMISSION_DENIED]: 'CRITICAL',
      [this.errorTypes.NETWORK_ERROR]: 'MEDIUM',
      [this.errorTypes.BUILD_ERROR]: 'HIGH',
      [this.errorTypes.CONFIG_ERROR]: 'MEDIUM',
      [this.errorTypes.API_ERROR]: 'HIGH',
      [this.errorTypes.UNKNOWN_ERROR]: 'MEDIUM'
    };
    return severityMap[errorType] || 'MEDIUM';
  }

  /**
   * エラーの説明を取得
   */
  getErrorDescription(errorType) {
    const descriptions = {
      [this.errorTypes.MODULE_NOT_FOUND]: '必要なモジュールが見つかりません',
      [this.errorTypes.PERMISSION_DENIED]: '権限が不足しています',
      [this.errorTypes.NETWORK_ERROR]: 'ネットワーク接続に問題があります',
      [this.errorTypes.BUILD_ERROR]: 'ビルドプロセスでエラーが発生しました',
      [this.errorTypes.CONFIG_ERROR]: '設定ファイルに問題があります',
      [this.errorTypes.API_ERROR]: 'API呼び出しでエラーが発生しました',
      [this.errorTypes.UNKNOWN_ERROR]: '不明なエラーが発生しました'
    };
    return descriptions[errorType] || 'エラーの詳細を確認してください';
  }

  /**
   * エラーの原因を取得
   */
  getErrorCauses(errorInfo) {
    const causes = [];
    
    switch (errorInfo.type) {
      case this.errorTypes.MODULE_NOT_FOUND:
        causes.push('依存関係がインストールされていない');
        causes.push('パッケージ名が間違っている');
        causes.push('node_modulesが破損している');
        break;
        
      case this.errorTypes.PERMISSION_DENIED:
        causes.push('管理者権限が不足している');
        causes.push('ファイルの権限設定が不適切');
        causes.push('アンチウイルスソフトの干渉');
        break;
        
      case this.errorTypes.NETWORK_ERROR:
        causes.push('インターネット接続が不安定');
        causes.push('プロキシ設定の問題');
        causes.push('ファイアウォールの干渉');
        break;
        
      case this.errorTypes.BUILD_ERROR:
        causes.push('TypeScriptコンパイルエラー');
        causes.push('依存関係の競合');
        causes.push('Node.jsバージョンの不適合');
        break;
        
      case this.errorTypes.CONFIG_ERROR:
        causes.push('設定ファイルの構文エラー');
        causes.push('必要な環境変数が未設定');
        causes.push('設定値が無効');
        break;
        
      case this.errorTypes.API_ERROR:
        causes.push('APIキーが無効または期限切れ');
        causes.push('API制限に達した');
        causes.push('APIエンドポイントが変更された');
        break;
    }
    
    return causes;
  }

  /**
   * エラーの解決策を取得
   */
  getErrorSolutions(errorInfo) {
    const solutions = [];
    
    switch (errorInfo.type) {
      case this.errorTypes.MODULE_NOT_FOUND:
        solutions.push('npm install を実行して依存関係を再インストール');
        solutions.push('node_modulesを削除して npm install を実行');
        solutions.push('package-lock.jsonを削除して npm install を実行');
        break;
        
      case this.errorTypes.PERMISSION_DENIED:
        solutions.push('管理者権限でコマンドを実行');
        solutions.push('sudo npm install -g @google/gemini-cli (Linux/Mac)');
        solutions.push('管理者としてPowerShellを実行 (Windows)');
        break;
        
      case this.errorTypes.NETWORK_ERROR:
        solutions.push('インターネット接続を確認');
        solutions.push('プロキシ設定を確認');
        solutions.push('ファイアウォール設定を確認');
        break;
        
      case this.errorTypes.BUILD_ERROR:
        solutions.push('npm run clean && npm run build を実行');
        solutions.push('Node.jsを最新バージョンに更新');
        solutions.push('TypeScriptの設定を確認');
        break;
        
      case this.errorTypes.CONFIG_ERROR:
        solutions.push('環境変数 GEMINI_API_KEY を設定');
        solutions.push('設定ファイルの構文を確認');
        solutions.push('デフォルト設定で再実行');
        break;
        
      case this.errorTypes.API_ERROR:
        solutions.push('GEMINI_API_KEY を再生成して設定');
        solutions.push('API使用量制限を確認');
        solutions.push('ネットワーク接続を確認');
        break;
    }
    
    return solutions;
  }

  /**
   * エラー予防策を取得
   */
  getErrorPrevention(errorType) {
    const prevention = {
      [this.errorTypes.MODULE_NOT_FOUND]: '定期的に npm install を実行して依存関係を更新',
      [this.errorTypes.PERMISSION_DENIED]: '適切な権限でインストールを実行',
      [this.errorTypes.NETWORK_ERROR]: '安定したネットワーク環境で実行',
      [this.errorTypes.BUILD_ERROR]: '開発環境を定期的に更新',
      [this.errorTypes.CONFIG_ERROR]: '設定ファイルをバックアップして管理',
      [this.errorTypes.API_ERROR]: 'APIキーを安全に管理し、定期的に更新',
      [this.errorTypes.UNKNOWN_ERROR]: 'エラーログを定期的に確認'
    };
    return prevention[errorType] || 'エラーログを定期的に確認してください';
  }

  /**
   * エラー報告を生成
   */
  generateErrorReport(error) {
    const errorInfo = this.collectErrorInfo(error);
    const diagnosis = this.diagnoseError(errorInfo);

    console.log('🚨 エラー診断レポート');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📋 エラータイプ: ${errorInfo.type}`);
    console.log(`⚠️  重要度: ${diagnosis.severity}`);
    console.log(`📝 説明: ${diagnosis.description}`);
    console.log(`💬 メッセージ: ${errorInfo.message}`);
    
    console.log('\n🔍 原因:');
    diagnosis.causes.forEach((cause, index) => {
      console.log(`  ${index + 1}. ${cause}`);
    });
    
    console.log('\n💡 解決策:');
    diagnosis.solutions.forEach((solution, index) => {
      console.log(`  ${index + 1}. ${solution}`);
    });
    
    console.log('\n🛡️  予防策:');
    console.log(`  ${diagnosis.prevention}`);
    
    console.log('\n📊 システム情報:');
    console.log(`  OS: ${errorInfo.system.platform} (${errorInfo.system.arch})`);
    console.log(`  Node.js: ${errorInfo.system.nodeVersion}`);
    console.log(`  npm: ${errorInfo.system.npmVersion}`);
    
    if (errorInfo.project.name) {
      console.log(`  プロジェクト: ${errorInfo.project.name} v${errorInfo.project.version}`);
    }
    
    console.log(`  作業ディレクトリ: ${errorInfo.environment.cwd}`);
    console.log(`  タイムスタンプ: ${errorInfo.timestamp}`);
    
    return { errorInfo, diagnosis };
  }

  /**
   * エラーログを保存
   */
  saveErrorLog(errorInfo, diagnosis) {
    const logDir = path.join(projectRoot, '_logs');
    const logFile = path.join(logDir, `error-${Date.now()}.json`);
    
    try {
      if (!existsSync(logDir)) {
        execSync(`mkdir -p "${logDir}"`);
      }
      
      const logData = {
        errorInfo,
        diagnosis,
        timestamp: new Date().toISOString()
      };
      
      writeFileSync(logFile, JSON.stringify(logData, null, 2));
      console.log(`📄 エラーログを保存しました: ${logFile}`);
      
    } catch (error) {
      console.log('⚠️  エラーログの保存に失敗しました');
    }
  }
}

/**
 * メイン実行関数
 */
async function main() {
  const argv = await yargs(hideBin(process.argv))
    .usage('$0 <command> [options]')
    .command('analyze <error>', 'エラーを分析', (yargs) => {
      return yargs
        .positional('error', {
          describe: 'エラーメッセージ',
          type: 'string',
          demandOption: true
        });
    }, (argv) => {
      const handler = new ErrorHandler();
      const error = new Error(argv.error);
      const report = handler.generateErrorReport(error);
      handler.saveErrorLog(report.errorInfo, report.diagnosis);
    })
    .command('system-info', 'システム情報を表示', {}, () => {
      const handler = new ErrorHandler();
      const systemInfo = handler.getSystemInfo();
      const projectInfo = handler.getProjectInfo();
      const environmentInfo = handler.getEnvironmentInfo();
      
      console.log('💻 システム情報:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`OS: ${systemInfo.platform} (${systemInfo.arch})`);
      console.log(`Node.js: ${systemInfo.nodeVersion}`);
      console.log(`npm: ${systemInfo.npmVersion}`);
      console.log(`メモリ使用量: ${Math.round(systemInfo.memory.heapUsed / 1024 / 1024)}MB`);
      
      console.log('\n📦 プロジェクト情報:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      if (projectInfo.name) {
        console.log(`名前: ${projectInfo.name}`);
        console.log(`バージョン: ${projectInfo.version}`);
        console.log(`依存関係: ${projectInfo.dependencies}個`);
        console.log(`開発依存関係: ${projectInfo.devDependencies}個`);
      } else {
        console.log('プロジェクト情報の取得に失敗しました');
      }
      
      console.log('\n🌍 環境情報:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`作業ディレクトリ: ${environmentInfo.cwd}`);
      console.log(`NODE_ENV: ${environmentInfo.env.NODE_ENV || '未設定'}`);
      console.log(`GEMINI_API_KEY: ${environmentInfo.env.GEMINI_API_KEY}`);
      console.log(`PATH: ${environmentInfo.env.PATH}`);
    })
    .help()
    .alias('h', 'help')
    .argv;

  if (argv._.length === 0) {
    console.log('🚨 エラーハンドラー');
    console.log('使用方法: node scripts/error-handler.js analyze "エラーメッセージ"');
    console.log('または: node scripts/error-handler.js system-info');
  }
}

main().catch((error) => {
  console.error('❌ エラーハンドラーエラー:', error.message);
  process.exit(1);
}); 