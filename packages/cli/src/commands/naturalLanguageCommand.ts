/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { MainAgentInterface, MainAgentInterfaceConfig, SubagentGeminiClient as GeminiClient, Config, ApprovalMode } from '@google/gemini-cli-core';
import fs from 'node:fs';
import path from 'node:path';

/**
 * 自然言語プロンプト処理コマンド
 */
export class NaturalLanguageCommand {
  private mainAgent?: MainAgentInterface;

  constructor() {
    // コンストラクタは空にする
  }

  /**
   * コマンド実行
   */
  private async execute(prompt: string, options: any): Promise<void> {
    try {
      console.log('🤖 自然言語プロンプト処理を開始します...');
      console.log(`📝 プロンプト: ${prompt}`);
      console.log(`🔧 実行モード: ${options.mode}`);
      
      // 設定の初期化
      const config = await this.initializeConfig(options);
      
      // メインエージェントの初期化
      this.mainAgent = new MainAgentInterface(config);
      
      // 自然言語プロンプトの実行
      const startTime = Date.now();
      const result = await this.mainAgent.executeTask(
        prompt,
        options.context,
        options.mode as any,
        {
          timeout: parseInt(options.timeout) * 1000
        }
      );
      const executionTime = Date.now() - startTime;
      
      // 結果の表示
      this.displayResult(result, executionTime, options);
      
      // 結果の保存
      if (options.output) {
        await this.saveResult(result, prompt, options.output);
      }
      
      console.log('✅ 自然言語プロンプト処理が完了しました！');
      
    } catch (error) {
      console.error('❌ エラーが発生しました:', error);
      process.exit(1);
    }
  }

  /**
   * 設定の初期化
   */
  private async initializeConfig(options: any): Promise<MainAgentInterfaceConfig> {
    // Gemini APIキーの取得
    const apiKey = process.env['GEMINI_API_KEY'];
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY環境変数が設定されていません');
    }

    // Geminiクライアントの初期化
    const geminiClient = new GeminiClient({
      apiKey,
      defaultModel: 'models/gemini-2.5-pro',
      defaultTemperature: 0.7,
      defaultMaxTokens: 4096
    });

    // 設定オブジェクトの初期化
    const config = new Config({
      sessionId: 'natural-language-session',
      targetDir: process.cwd(),
      cwd: process.cwd(),
      debugMode: false,
      model: 'models/gemini-2.5-pro',
      fullContext: false,
      approvalMode: ApprovalMode.DEFAULT,
      showMemoryUsage: false,
      accessibility: {},
      telemetry: { enabled: false },
      usageStatisticsEnabled: false,
      fileFiltering: {
        respectGitIgnore: true,
        respectGeminiIgnore: true,
        enableRecursiveFileSearch: false
      },
      checkpointing: false,
      noBrowser: true,
      ideModeFeature: false,
      ideMode: false,
      maxSessionTurns: 100,
      listExtensions: false,
      extensions: [],
      blockedMcpServers: [],
      summarizeToolOutput: {}
    });
    
    // 出力ディレクトリの作成
    const outputPath = path.resolve(options.output);
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    return {
      geminiClient,
      config,
      enableAutonomousMode: true,
      enableSupervisorMode: true,
      enableNaturalLanguageProcessing: true,
      maxConcurrentSubagents: 5,
      autoAnalysisThreshold: 5,
      decisionTimeout: parseInt(options.timeout) * 1000,
      enableRealTimeCoordination: true,
      enableCheckpointing: true,
      researchOutputPath: outputPath
    };
  }

  /**
   * 結果の表示
   */
  private displayResult(result: any, executionTime: number, options: any): void {
    console.log('\n📊 実行結果:');
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ 成功: ${result.success ? 'はい' : 'いいえ'}`);
    console.log(`🆔 タスクID: ${result.taskId}`);
    console.log(`⏱️  実行時間: ${executionTime}ms`);
    
    if (result.collaborationMetrics) {
      console.log(`👥 使用サブエージェント数: ${result.collaborationMetrics.subagentsUsed || 0}`);
      console.log(`📈 成功ステップ数: ${result.collaborationMetrics.successfulSteps || 0}/${result.collaborationMetrics.totalSteps || 0}`);
      console.log(`⚡ 平均応答時間: ${result.collaborationMetrics.averageResponseTime || 0}ms`);
    }
    
    if (result.finalResult) {
      console.log(`\n📋 最終結果:`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(result.finalResult.finalResult);
      
      if (result.finalResult.recommendations && result.finalResult.recommendations.length > 0) {
        console.log(`\n💡 推奨事項:`);
        result.finalResult.recommendations.forEach((rec: string, index: number) => {
          console.log(`${index + 1}. ${rec}`);
        });
      }
    }
    
    if (result.error) {
      console.log(`\n❌ エラー: ${result.error}`);
    }
    
    if (options.verbose) {
      console.log(`\n🔍 詳細情報:`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(JSON.stringify(result, null, 2));
    }
  }

  /**
   * 結果の保存
   */
  private async saveResult(result: any, prompt: string, outputPath: string): Promise<void> {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${timestamp}_natural_language_result_${result.taskId}.md`;
      const filepath = path.join(outputPath, filename);
      
      const content = `# 自然言語プロンプト処理結果

## 実行日時
${new Date().toLocaleString('ja-JP')}

## プロンプト
${prompt}

## 実行結果
- 成功: ${result.success ? 'はい' : 'いいえ'}
- タスクID: ${result.taskId}
- 実行時間: ${result.executionTime}ms

## 協調メトリクス
${result.collaborationMetrics ? `
- 使用サブエージェント数: ${result.collaborationMetrics.subagentsUsed || 0}
- 成功ステップ数: ${result.collaborationMetrics.successfulSteps || 0}/${result.collaborationMetrics.totalSteps || 0}
- 平均応答時間: ${result.collaborationMetrics.averageResponseTime || 0}ms
- 総トークン使用量: ${result.collaborationMetrics.totalTokensUsed || 0}
` : 'なし'}

## 最終結果
${result.finalResult ? result.finalResult.finalResult : 'なし'}

## 推奨事項
${result.finalResult?.recommendations ? result.finalResult.recommendations.map((rec: string, index: number) => `${index + 1}. ${rec}`).join('\n') : 'なし'}

${result.error ? `## エラー\n${result.error}` : ''}

---
*このファイルは自動生成されました*
`;

      await fs.promises.writeFile(filepath, content, 'utf-8');
      console.log(`📄 結果を保存しました: ${filepath}`);
      
    } catch (error) {
      console.error('❌ 結果の保存に失敗しました:', error);
    }
  }

  /**
   * コマンドの実行
   */
  async run(args: string[]): Promise<void> {
    const argv = await yargs(hideBin(args))
      .usage('$0 <prompt> [options]')
      .command('$0 <prompt>', '自然言語プロンプトで並列作業を自律的に分担する', (yargs) => {
        return yargs
          .positional('prompt', {
            describe: '自然言語プロンプト',
            type: 'string',
            demandOption: true
          })
          .option('context', {
            alias: 'c',
            describe: '追加のコンテキスト情報',
            type: 'string'
          })
          .option('output', {
            alias: 'o',
            describe: '出力ファイルのパス',
            type: 'string',
            default: './_docs'
          })
          .option('mode', {
            alias: 'm',
            describe: '実行モード (auto|natural_language|autonomous|supervisor|manual)',
            type: 'string',
            choices: ['auto', 'natural_language', 'autonomous', 'supervisor', 'manual'],
            default: 'auto'
          })
          .option('timeout', {
            alias: 't',
            describe: 'タイムアウト時間（秒）',
            type: 'number',
            default: 300
          })
          .option('verbose', {
            alias: 'v',
            describe: '詳細なログを出力',
            type: 'boolean',
            default: false
          })
          .help()
          .alias('h', 'help');
      })
      .argv;

    await this.execute((argv as any).prompt as string, argv);
  }
} 