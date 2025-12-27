/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { YamlAgentLoader, SubagentGeminiClient } from '@google/gemini-cli-core';

/**
 * 閾ｪ辟ｶ險隱槭・繝ｭ繝ｳ繝励ヨ縺九ｉ繧ｵ繝悶お繝ｼ繧ｸ繧ｧ繝ｳ繝医ｒ菴懈・縺吶ｋ繧ｳ繝槭Φ繝・ */
export async function createNaturalLanguageAgentCommand(
  args: string[],
): Promise<void> {
  if (args.length === 0) {
    console.log(
      '笶・菴ｿ逕ｨ譁ｹ豕・ gemini agents create-natural "繧ｵ繝悶お繝ｼ繧ｸ繧ｧ繝ｳ繝医・隱ｬ譏弱ｒ閾ｪ辟ｶ險隱槭〒險倩ｿｰ縺励※縺上□縺輔＞"',
    );
    console.log('');
    console.log('萓・');
    console.log(
      '  gemini agents create-natural "繧ｳ繝ｼ繝峨Ξ繝薙Η繝ｼ縺ｮ蟆る摩螳ｶ縲ゅそ繧ｭ繝･繝ｪ繝・ぅ縺ｨ繝代ヵ繧ｩ繝ｼ繝槭Φ繧ｹ繧偵メ繧ｧ繝・け縺吶ｋ"',
    );
    console.log(
      '  gemini agents create-natural "繝・ヰ繝・げ縺ｮ蟆る摩螳ｶ縲ゅお繝ｩ繝ｼ繝ｭ繧ｰ繧定ｧ｣譫舌＠縺ｦ繝舌げ繧堤音螳壹☆繧・',
    );
    return;
  }

  const prompt = args.join(' ');

  try {
    console.log(
      '､・閾ｪ辟ｶ險隱槭・繝ｭ繝ｳ繝励ヨ繧定ｧ｣譫舌＠縺ｦ繧ｵ繝悶お繝ｼ繧ｸ繧ｧ繝ｳ繝医ｒ菴懈・縺励∪縺・..',
    );
    console.log(`統 繝励Ο繝ｳ繝励ヨ: ${prompt}`);

    // Gemini繧ｯ繝ｩ繧､繧｢繝ｳ繝医〒繝励Ο繝ｳ繝励ヨ繧定ｧ｣譫舌＠縺ｦ繧ｵ繝悶お繝ｼ繧ｸ繧ｧ繝ｳ繝域ュ蝣ｱ繧呈歓蜃ｺ
    const geminiClient = new SubagentGeminiClient({
      apiKey: process.env['GOOGLE_GENAI_API_KEY'] || '',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      defaultModel: 'gemini-3.0-pro',
      defaultTemperature: 0.3, // 讒矩蛹悶＆繧後◆蠢懃ｭ斐′蠢・ｦ√↑縺ｮ縺ｧ菴弱ａ縺ｫ險ｭ螳・      defaultMaxTokens: 2048,
    });

    const analysisPrompt = `
莉･荳九・閾ｪ辟ｶ險隱槭・繝ｭ繝ｳ繝励ヨ縺九ｉ縲√し繝悶お繝ｼ繧ｸ繧ｧ繝ｳ繝医・螳夂ｾｩ繧呈歓蜃ｺ縺励※縺上□縺輔＞縲・
繝励Ο繝ｳ繝励ヨ: "${prompt}"

莉･荳九・諠・ｱ繧谷SON蠖｢蠑上〒霑斐＠縺ｦ縺上□縺輔＞:
{
  "name": "繧ｵ繝悶お繝ｼ繧ｸ繧ｧ繝ｳ繝医・蜷榊燕・郁恭隱槭〒縲√く繝｣繝｡繝ｫ繧ｱ繝ｼ繧ｹ・・,
  "description": "繧ｵ繝悶お繝ｼ繧ｸ繧ｧ繝ｳ繝医・隱ｬ譏・,
  "specialty": "蟆る摩蛻・㍽・井ｾ・ code_review, debugging, data_analysis縺ｪ縺ｩ・・,
  "capabilities": ["讖溯・1", "讖溯・2", "讖溯・3"],
  "triggers": ["繝医Μ繧ｬ繝ｼ繧ｳ繝槭Φ繝・", "繝医Μ繧ｬ繝ｼ繧ｳ繝槭Φ繝・"],
  "model": "gemini-3.0-pro"
}

蟆る摩蛻・㍽縺ｮ蛟呵｣・
- code_review: 繧ｳ繝ｼ繝峨Ξ繝薙Η繝ｼ
- debugging: 繝・ヰ繝・げ
- data_analysis: 繝・・繧ｿ蛻・梵
- security_audit: 繧ｻ繧ｭ繝･繝ｪ繝・ぅ逶｣譟ｻ
- performance_optimization: 繝代ヵ繧ｩ繝ｼ繝槭Φ繧ｹ譛驕ｩ蛹・- documentation: 繝峨く繝･繝｡繝ｳ繝井ｽ懈・
- testing: 繝・せ繝・- architecture_design: 繧｢繝ｼ繧ｭ繝・け繝√Ε險ｭ險・- api_design: API險ｭ險・
JSON縺ｮ縺ｿ繧貞・蜉帙＠縺ｦ縺上□縺輔＞縲りｪｬ譏取枚縺ｯ蜷ｫ繧√↑縺・〒縺上□縺輔＞縲・`;

    const response = await geminiClient.executeSubagentTask(
      {
        id: 'analysis-agent',
        name: 'Analysis Agent',
        specialty: 'analysis',
        description: '閾ｪ辟ｶ險隱槫・譫千畑縺ｮ繧ｨ繝ｼ繧ｸ繧ｧ繝ｳ繝・,
        prompt: '',
        maxTokens: 2048,
        temperature: 0.3,
        status: 'idle',
        createdAt: new Date().toISOString(),
        taskHistory: [],
        customTools: [],
        isActive: true,
      },
      analysisPrompt,
      '',
      {
        maxTokens: 2048,
        temperature: 0.3,
      },
    );
    const response = await geminiClient.generateText({
      prompt: analysisPrompt,
      maxTokens: 1024,
      temperature: 0.3,
    });

    if (!response.text) {
      throw new Error('Gemini縺九ｉ縺ｮ蠢懃ｭ斐′荳肴ｭ｣縺ｧ縺・);
    }

    let analysisResult;
    try {
      analysisResult = JSON.parse(response.text);
    } catch (_error) {
      console.error('JSON繝代・繧ｹ繧ｨ繝ｩ繝ｼ:', response.text);
      console.error(
        'JSON繝代・繧ｹ繧ｨ繝ｩ繝ｼ:',
        response.text,
      );
      throw new Error('繧ｵ繝悶お繝ｼ繧ｸ繧ｧ繝ｳ繝域ュ蝣ｱ縺ｮ謚ｽ蜃ｺ縺ｫ螟ｱ謨励＠縺ｾ縺励◆');
    }

    // 謚ｽ蜃ｺ縺輔ｌ縺滓ュ蝣ｱ縺ｧ繧ｵ繝悶お繝ｼ繧ｸ繧ｧ繝ｳ繝医ｒ菴懈・
    const loader = new YamlAgentLoader();
    const filePath = await loader.createAgentDefinition(
      analysisResult.name,
      analysisResult.specialty,
      analysisResult.description,
    );

    console.log('笨・繧ｵ繝悶お繝ｼ繧ｸ繧ｧ繝ｳ繝医ｒ閾ｪ辟ｶ險隱槭・繝ｭ繝ｳ繝励ヨ縺九ｉ菴懈・縺励∪縺励◆・・);
    console.log(`刀 險ｭ螳壹ヵ繧｡繧､繝ｫ: ${filePath}`);
    console.log(`､・繧ｵ繝悶お繝ｼ繧ｸ繧ｧ繝ｳ繝亥錐: ${analysisResult.name}`);
    console.log(`肌 蟆る摩蛻・㍽: ${analysisResult.specialty}`);
    console.log(`統 隱ｬ譏・ ${analysisResult.description}`);
    console.log(`笞｡ 讖溯・: ${analysisResult.capabilities.join(', ')}`);
    console.log(`識 繝医Μ繧ｬ繝ｼ: ${analysisResult.triggers.join(', ')}`);
  } catch (error) {
    console.error(`笶・繧ｵ繝悶お繝ｼ繧ｸ繧ｧ繝ｳ繝医・菴懈・縺ｫ螟ｱ謨励＠縺ｾ縺励◆:`, error);
    process.exit(1);
  }
}
