/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { YamlAgentLoader , GeminiClient } from '@google/gemini-cli-core';

/**
 * 自然言語プロンプトからサブエージェントを作成するコマンド
 */
export async function createNaturalLanguageAgentCommand(
  args: string[],
): Promise<void> {
  if (args.length === 0) {
    console.log(
      '❌ 使用方法: gemini agents create-natural "サブエージェントの説明を自然言語で記述してください"',
    );
    console.log('');
    console.log('例:');
    console.log(
      '  gemini agents create-natural "コードレビューの専門家。セキュリティとパフォーマンスをチェックする"',
    );
    console.log(
      '  gemini agents create-natural "デバッグの専門家。エラーログを解析してバグを特定する"',
    );
    return;
  }

  const prompt = args.join(' ');

  try {
    console.log(
      '🤖 自然言語プロンプトを解析してサブエージェントを作成します...',
    );
    console.log(`📝 プロンプト: ${prompt}`);

    // Geminiクライアントでプロンプトを解析してサブエージェント情報を抽出
    const geminiClient = new GeminiClient({
      apiKey: process.env['GOOGLE_GENAI_API_KEY'] || '',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      defaultModel: 'gemini-3.0-pro',
      defaultTemperature: 0.3, // 構造化された応答が必要なので低めに設定
      defaultMaxTokens: 2048,
    });

    const analysisPrompt = `
以下の自然言語プロンプトから、サブエージェントの定義を抽出してください。

プロンプト: "${prompt}"

以下の情報をJSON形式で返してください:
{
  "name": "サブエージェントの名前（英語で、キャメルケース）",
  "description": "サブエージェントの説明",
  "specialty": "専門分野（例: code_review, debugging, data_analysisなど）",
  "capabilities": ["機能1", "機能2", "機能3"],
  "triggers": ["トリガーコマンド1", "トリガーコマンド2"],
  "model": "gemini-3.0-pro"
}

専門分野の候補:
- code_review: コードレビュー
- debugging: デバッグ
- data_analysis: データ分析
- security_audit: セキュリティ監査
- performance_optimization: パフォーマンス最適化
- documentation: ドキュメント作成
- testing: テスト
- architecture_design: アーキテクチャ設計
- api_design: API設計

JSONのみを出力してください。説明文は含めないでください。
`;

    const response = await geminiClient.generateContent([
      { role: 'user', parts: [{ text: analysisPrompt }] },
    ]);

    if (!response.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Geminiからの応答が不正です');
    }

    let analysisResult;
    try {
      analysisResult = JSON.parse(response.candidates[0].content.parts[0].text);
    } catch (_error) {
      console.error(
        'JSONパースエラー:',
        response.candidates[0].content.parts[0].text,
      );
      throw new Error('サブエージェント情報の抽出に失敗しました');
    }

    // 抽出された情報でサブエージェントを作成
    const loader = new YamlAgentLoader();
    const filePath = await loader.createAgentDefinition(
      analysisResult.name,
      analysisResult.specialty,
      analysisResult.description,
    );

    console.log('✅ サブエージェントを自然言語プロンプトから作成しました！');
    console.log(`📁 設定ファイル: ${filePath}`);
    console.log(`🤖 サブエージェント名: ${analysisResult.name}`);
    console.log(`🔧 専門分野: ${analysisResult.specialty}`);
    console.log(`📝 説明: ${analysisResult.description}`);
    console.log(`⚡ 機能: ${analysisResult.capabilities.join(', ')}`);
    console.log(`🎯 トリガー: ${analysisResult.triggers.join(', ')}`);
  } catch (error) {
    console.error(`❌ サブエージェントの作成に失敗しました:`, error);
    process.exit(1);
  }
}
