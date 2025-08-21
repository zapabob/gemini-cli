/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { MainAgentInterface, MainAgentInterfaceConfig } from '../mainAgentInterface.js';
import { GeminiClient } from '../geminiClient.js';
import { ColorManager, ColorManagerConfig } from '../colorManager.js';
import { SubagentSpecialty } from '../../config/subagents.js';

/**
 * サブエージェント色分けデモ
 * メインエージェントから自律的にサブエージェントを呼び出し、色分けされた出力を表示
 */
export class ColoredSubagentsDemo {
  private mainAgent: MainAgentInterface;
  private colorManager: ColorManager;

  constructor() {
    // Geminiクライアントの初期化
    const geminiClient = new GeminiClient({
      apiKey: process.env['GEMINI_API_KEY'] || 'demo-api-key',
      defaultModel: 'models/gemini-1.5-flash',
      defaultTemperature: 0.7,
      defaultMaxTokens: 4096
    });

    // メインエージェントインターフェースの設定
    const mainAgentConfig: MainAgentInterfaceConfig = {
      geminiClient,
      config: {} as any,
      enableAutonomousMode: true,
      enableSupervisorMode: true,
      enableNaturalLanguageProcessing: false,
      maxConcurrentSubagents: 5,
      autoAnalysisThreshold: 5,
      decisionTimeout: 30000,
      enableRealTimeCoordination: true,
      enableCheckpointing: true,
      researchOutputPath: './_docs'
    };

    this.mainAgent = new MainAgentInterface(mainAgentConfig);

    // カラーマネージャーの設定
    const colorConfig: ColorManagerConfig = {
      enableColors: true,
      enableEmojis: true,
      enableTimestamps: true,
      logToFile: false,
      colorMode: 'ansi',
      customColors: {
        'main-agent': '\x1b[1m\x1b[36m', // 太字シアン
        'demo-special': '\x1b[1m\x1b[35m' // 太字マゼンタ
      }
    };

    this.colorManager = new ColorManager(colorConfig);
  }

  /**
   * デモの実行
   */
  async runDemo(): Promise<void> {
    console.log(this.colorManager.formatSystemMessage('🎭 サブエージェント色分けデモ開始', 'info'));
    console.log(this.colorManager.formatSystemMessage('各サブエージェントが異なる色で話す様子をお楽しみください！', 'info'));
    console.log('');

    try {
      // デモ1: 複雑なタスクの自律実行
      await this.demoAutonomousTask();

      console.log('');
      
      // デモ2: リアルタイム協調セッション
      await this.demoRealTimeCollaboration();

      console.log('');
      
      // デモ3: 色分け設定の変更
      await this.demoColorConfiguration();

      console.log('');
      console.log(this.colorManager.formatSystemMessage('🎉 デモ完了！サブエージェントの色分け機能が正常に動作しました。', 'success'));

    } catch (error) {
      console.error(this.colorManager.formatErrorMessage(`デモ実行エラー: ${error}`));
    }
  }

  /**
   * デモ1: 自律的タスク実行
   */
  private async demoAutonomousTask(): Promise<void> {
    console.log(this.colorManager.formatSystemMessage('📋 デモ1: 自律的タスク実行', 'info'));
    
    const task = `
以下のコードを分析して、セキュリティの問題、パフォーマンスの改善点、コードの品質を評価してください：

\`\`\`typescript
function processUserData(userData: any) {
  const result = {};
  for (let key in userData) {
    result[key] = userData[key] + "processed";
  }
  return result;
}
\`\`\`
    `;

    console.log(this.colorManager.formatSystemMessage('🤖 メインエージェントがタスクを分析し、適切なサブエージェントを自動選択します...', 'progress'));

    const result = await this.mainAgent.executeTask(task, 'TypeScriptコードレビューのデモ', 'auto');

    if (result.success) {
      console.log('');
      console.log(this.colorManager.formatSystemMessage('📊 実行結果:', 'info'));
      console.log(`- 実行時間: ${result.executionTime}ms`);
      console.log(`- 使用サブエージェント数: ${result.collaborationMetrics?.subagentsUsed || 0}`);
      console.log(`- 成功ステップ数: ${result.collaborationMetrics?.successfulSteps || 0}/${result.collaborationMetrics?.totalSteps || 0}`);
      
      if (result.finalResult) {
        console.log('');
        console.log(this.colorManager.formatSystemMessage('🎯 最終結果:', 'success'));
        console.log(result.finalResult.finalResult);
      }
    } else {
      console.log(this.colorManager.formatErrorMessage(`タスク実行失敗: ${result.error}`));
    }
  }

  /**
   * デモ2: リアルタイム協調セッション
   */
  private async demoRealTimeCollaboration(): Promise<void> {
    console.log(this.colorManager.formatSystemMessage('🔄 デモ2: リアルタイム協調セッション', 'info'));
    
    const task = 'Webアプリケーションのアーキテクチャ設計について議論してください';
    
    console.log(this.colorManager.formatSystemMessage('👥 リアルタイム協調セッションを開始します...', 'progress'));

    const sessionId = await this.mainAgent.startRealTimeCollaboration(task, 'アーキテクチャ設計のデモ');

    // 複数のサブエージェントが参加するシミュレーション
    const subagents = [
      { id: 'arch-1', name: 'アーキテクチャエージェント', specialty: 'architecture_design' as SubagentSpecialty },
      { id: 'frontend-1', name: 'フロントエンドエージェント', specialty: 'frontend_development' as SubagentSpecialty },
      { id: 'backend-1', name: 'バックエンドエージェント', specialty: 'backend_development' as SubagentSpecialty },
      { id: 'security-1', name: 'セキュリティエージェント', specialty: 'security_audit' as SubagentSpecialty }
    ];

    for (const subagent of subagents) {
      await this.mainAgent.joinCollaborationSession(sessionId, subagent.id);
      
      // 各サブエージェントの意見を色分けして表示
      const opinion = this.generateSubagentOpinion(subagent);
      console.log(this.colorManager.formatAgentSpeech(
        subagent.id,
        subagent.name,
        subagent.specialty,
        opinion
      ));
      
      // 少し待機して自然な会話の流れを演出
      await this.sleep(1000);
    }

    // セッション終了
    const sessionResult = await this.mainAgent.endCollaborationSession(sessionId);
    
    console.log('');
    console.log(this.colorManager.formatSystemMessage('🏁 協調セッション完了', 'success'));
    console.log(`- 参加エージェント数: ${sessionResult.collaborationMetrics?.subagentsUsed || 0}`);
    console.log(`- 実行時間: ${sessionResult.executionTime}ms`);
  }

  /**
   * デモ3: 色分け設定の変更
   */
  private async demoColorConfiguration(): Promise<void> {
    console.log(this.colorManager.formatSystemMessage('🎨 デモ3: 色分け設定の変更', 'info'));
    
    // 色分けを無効化
    this.colorManager.updateConfig({ enableColors: false });
    console.log(this.colorManager.formatSystemMessage('色分けを無効化しました', 'warning'));
    
    // 色分けを有効化
    this.colorManager.updateConfig({ enableColors: true });
    console.log(this.colorManager.formatSystemMessage('色分けを再有効化しました', 'success'));
    
    // HTMLモードに変更
    this.colorManager.updateConfig({ colorMode: 'html' });
    console.log(this.colorManager.formatSystemMessage('HTMLモードに変更しました', 'info'));
    
    // ANSIモードに戻す
    this.colorManager.updateConfig({ colorMode: 'ansi' });
    console.log(this.colorManager.formatSystemMessage('ANSIモードに戻しました', 'info'));
  }

  /**
   * サブエージェントの意見を生成（デモ用）
   */
  private generateSubagentOpinion(subagent: { id: string; name: string; specialty: string }): string {
    const opinions = {
      'architecture_design': 'マイクロサービスアーキテクチャを採用することをお勧めします。スケーラビリティと保守性の観点から最適です。',
      'frontend_development': 'React + TypeScriptの組み合わせで、コンポーネントベースの設計を実現しましょう。',
      'backend_development': 'Node.js + ExpressでRESTful APIを構築し、データベースはPostgreSQLを使用することを提案します。',
      'security_audit': '認証にはJWT、HTTPS通信の強制、入力値検証の徹底が必要です。'
    };

    return opinions[subagent.specialty as keyof typeof opinions] || 'この分野について詳しく調査が必要です。';
  }

  /**
   * 指定時間待機
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * パフォーマンス統計の表示
   */
  async showPerformanceStats(): Promise<void> {
    console.log('');
    console.log(this.colorManager.formatSystemMessage('📈 パフォーマンス統計', 'info'));
    
    const stats = this.mainAgent.getPerformanceStats();
    console.log(`- 総タスク数: ${stats.totalTasks}`);
    console.log(`- 成功タスク数: ${stats.successfulTasks}`);
    console.log(`- 平均実行時間: ${Math.round(stats.averageExecutionTime)}ms`);
    console.log(`- 総使用サブエージェント数: ${stats.totalSubagentsUsed}`);
    console.log(`- 最も使用されたモード: ${stats.mostUsedMode}`);
  }
}

/**
 * デモの実行
 */
async function runColoredSubagentsDemo(): Promise<void> {
  const demo = new ColoredSubagentsDemo();
  await demo.runDemo();
  await demo.showPerformanceStats();
}

// デモを実行（このファイルが直接実行された場合）
if (require.main === module) {
  runColoredSubagentsDemo().catch(console.error);
}

export { runColoredSubagentsDemo }; 