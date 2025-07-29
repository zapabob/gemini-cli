/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { ColorManager, ColorManagerConfig } from '../colorManager.js';
import { SubagentSpecialty } from '../../config/subagents.js';

/**
 * 色分け機能のテスト
 */
export class ColorTest {
  private colorManager: ColorManager;

  constructor() {
    const config: ColorManagerConfig = {
      enableColors: true,
      enableEmojis: true,
      enableTimestamps: true,
      logToFile: false,
      colorMode: 'ansi'
    };

    this.colorManager = new ColorManager(config);
  }

  /**
   * 基本的な色分けテスト
   */
  runBasicTest(): void {
    console.log('🎨 基本的な色分けテスト開始\n');

    // システムメッセージのテスト
    console.log(this.colorManager.formatSystemMessage('システム情報メッセージ', 'info'));
    console.log(this.colorManager.formatSystemMessage('成功メッセージ', 'success'));
    console.log(this.colorManager.formatSystemMessage('警告メッセージ', 'warning'));
    console.log(this.colorManager.formatSystemMessage('エラーメッセージ', 'error'));
    console.log(this.colorManager.formatSystemMessage('進捗メッセージ', 'progress'));
    console.log(this.colorManager.formatSystemMessage('デバッグメッセージ', 'debug'));

    console.log('\n' + '='.repeat(50) + '\n');
  }

  /**
   * サブエージェント会話テスト
   */
  runAgentSpeechTest(): void {
    console.log('🤖 サブエージェント会話テスト開始\n');

    const agents = [
      { id: 'code-review-1', name: 'コードレビューエージェント', specialty: 'code_review' as SubagentSpecialty },
      { id: 'debug-1', name: 'デバッグエージェント', specialty: 'debugging' as SubagentSpecialty },
      { id: 'security-1', name: 'セキュリティエージェント', specialty: 'security_audit' as SubagentSpecialty },
      { id: 'frontend-1', name: 'フロントエンドエージェント', specialty: 'frontend_development' as SubagentSpecialty },
      { id: 'backend-1', name: 'バックエンドエージェント', specialty: 'backend_development' as SubagentSpecialty }
    ];

    const messages = [
      'このコードには型安全性の問題があります。',
      'パフォーマンスの改善が必要です。',
      'セキュリティ上の脆弱性を発見しました。',
      'UIの改善提案があります。',
      'データベースの最適化を提案します。'
    ];

    agents.forEach((agent, index) => {
      console.log(this.colorManager.formatAgentSpeech(
        agent.id,
        agent.name,
        agent.specialty,
        messages[index]
      ));
    });

    console.log('\n' + '='.repeat(50) + '\n');
  }

  /**
   * 設定変更テスト
   */
  runConfigurationTest(): void {
    console.log('⚙️ 設定変更テスト開始\n');

    // 色分け無効化
    this.colorManager.updateConfig({ enableColors: false });
    console.log(this.colorManager.formatSystemMessage('色分けが無効化されました', 'warning'));

    // 色分け再有効化
    this.colorManager.updateConfig({ enableColors: true });
    console.log(this.colorManager.formatSystemMessage('色分けが再有効化されました', 'success'));

    // 絵文字無効化
    this.colorManager.updateConfig({ enableEmojis: false });
    console.log(this.colorManager.formatSystemMessage('絵文字が無効化されました', 'info'));

    // 絵文字再有効化
    this.colorManager.updateConfig({ enableEmojis: true });
    console.log(this.colorManager.formatSystemMessage('絵文字が再有効化されました', 'success'));

    console.log('\n' + '='.repeat(50) + '\n');
  }

  /**
   * カスタム色テスト
   */
  runCustomColorTest(): void {
    console.log('🎨 カスタム色テスト開始\n');

    // カスタム色を設定
    this.colorManager.updateConfig({
      customColors: {
        'special-agent': '\x1b[1m\x1b[35m', // 太字マゼンタ
        'vip-agent': '\x1b[1m\x1b[33m'      // 太字黄
      }
    });

    console.log(this.colorManager.formatAgentSpeech(
      'special-agent',
      '特別エージェント',
      'custom' as SubagentSpecialty,
      'これは特別な色で表示されるメッセージです。'
    ));

    console.log(this.colorManager.formatAgentSpeech(
      'vip-agent',
      'VIPエージェント',
      'custom' as SubagentSpecialty,
      'これはVIPエージェントのメッセージです。'
    ));

    console.log('\n' + '='.repeat(50) + '\n');
  }

  /**
   * 全テスト実行
   */
  runAllTests(): void {
    console.log('🚀 色分け機能全テスト開始\n');

    this.runBasicTest();
    this.runAgentSpeechTest();
    this.runConfigurationTest();
    this.runCustomColorTest();

    console.log('✅ 全テスト完了！');
  }
}

/**
 * テスト実行
 */
function runColorTest(): void {
  const test = new ColorTest();
  test.runAllTests();
}

// このファイルが直接実行された場合
if (require.main === module) {
  runColorTest();
}

export { runColorTest }; 