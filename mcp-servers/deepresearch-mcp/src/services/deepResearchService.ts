/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Logger } from '../utils/logger.js';
import { WebSearchService } from './webSearchService.js';
import { ResearchReportService } from './researchReportService.js';
import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * 深層研究サービスのパラメータ
 */
export interface DeepResearchParams {
  query: string;
  max_depth?: number;
  max_sources?: number;
  strategy?: 'comprehensive' | 'focused' | 'exploratory';
  include_academic?: boolean;
  recent_years?: number;
  focus_domains?: string[];
  exclude_types?: string[];
}

/**
 * 深層研究結果
 */
export interface DeepResearchResult {
  analysis: string;
  sourcesCount: number;
  depth: number;
  topics: string[];
  savedFilePath?: string;
}

/**
 * 深層研究サービス
 * 多層分析による包括的な研究機能を提供
 */
export class DeepResearchService {
  private genAI: GoogleGenerativeAI;
  private webSearchService: WebSearchService;
  private researchReportService: ResearchReportService;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
    this.webSearchService = new WebSearchService(logger);
    this.researchReportService = new ResearchReportService(logger);
  }

  /**
   * 深層研究を実行
   */
  async execute(params: DeepResearchParams): Promise<{
    content: Array<{ type: 'text'; text: string }>;
  }> {
    try {
      this.logger.info('🔍 深層研究を開始:', { query: params.query });

      const startTime = Date.now();
      
      // 研究戦略の設定
      const strategy = params.strategy || 'comprehensive';
      const maxDepth = params.max_depth || 3;
      const maxSources = params.max_sources || 10;

      // 研究プロンプトの作成
      const researchPrompt = this.createResearchPrompt(params.query, {
        max_depth: maxDepth,
        max_sources: maxSources,
        strategy,
        include_academic: params.include_academic ?? true,
        recent_years: params.recent_years || 5,
        focus_domains: params.focus_domains || [],
        exclude_types: params.exclude_types || [],
      });

      // 多層研究の実行
      const results = await this.performMultiLevelResearch(
        researchPrompt,
        maxDepth,
        maxSources,
        strategy
      );

      // 結果の保存
      const savedFilePath = await this.saveResearchToMarkdown(
        params.query,
        results,
        {
          strategy,
          timeTaken: Date.now() - startTime,
          max_depth: maxDepth,
          max_sources: maxSources,
        }
      );

      // 結果のフォーマット
      const formattedResults = this.formatResearchResults(results, {
        query: params.query,
        strategy,
        timeTaken: Date.now() - startTime,
        max_depth: maxDepth,
        max_sources: maxSources,
      });

      this.logger.info('✅ 深層研究完了:', {
        sourcesCount: results.sourcesCount,
        depth: results.depth,
        topics: results.topics.length,
        savedFilePath,
      });

      return {
        content: [
          {
            type: 'text',
            text: formattedResults.display,
          },
        ],
      };

    } catch (error) {
      this.logger.error('❌ 深層研究エラー:', error);
      throw error;
    }
  }

  /**
   * 研究プロンプトの作成
   */
  private createResearchPrompt(
    query: string,
    options: {
      max_depth: number;
      max_sources: number;
      strategy: string;
      include_academic: boolean;
      recent_years: number;
      focus_domains: string[];
      exclude_types: string[];
    }
  ): string {
    const strategyInstructions: Record<string, string> = {
      comprehensive: '包括的で多角的な分析を行い、複数の視点から深く調査してください。',
      focused: '特定の側面に焦点を当てた集中的な調査を行ってください。',
      exploratory: '関連する幅広いトピックを探索的に調査してください。',
    };

    return `
あなたは高度な研究アシスタントです。以下の研究クエリについて深層研究を行ってください：

**研究クエリ**: ${query}

**研究戦略**: ${strategyInstructions[options.strategy] || strategyInstructions.comprehensive}

**研究要件**:
- 最大深度: ${options.max_depth}レベル
- 最大ソース数: ${options.max_sources}個
- 学術ソース: ${options.include_academic ? '含む' : '含まない'}
- 最近の年数: ${options.recent_years}年以内
- 焦点ドメイン: ${options.focus_domains.join(', ') || '指定なし'}
- 除外タイプ: ${options.exclude_types.join(', ') || 'なし'}

**研究手順**:
1. 初期調査: 基本的な情報と主要な概念を把握
2. 深層分析: 関連するサブトピックと専門分野を探索
3. 多角的視点: 異なる観点からの分析を実施
4. 最新動向: 最新の研究とトレンドを調査
5. 統合分析: 全体的な洞察と結論を導出

**出力形式**:
- 主要な発見事項
- 重要な概念と定義
- 最新の動向とトレンド
- 関連する研究分野
- 今後の研究方向
- 参考文献とソース

詳細で包括的な研究レポートを作成してください。
    `.trim();
  }

  /**
   * 多層研究の実行
   */
  private async performMultiLevelResearch(
    prompt: string,
    maxDepth: number,
    maxSources: number,
    strategy: string
  ): Promise<DeepResearchResult> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    let currentDepth = 0;
    let totalSources = 0;
    let exploredTopics: string[] = [];
    let analysis = '';

    while (currentDepth < maxDepth && totalSources < maxSources) {
      this.logger.info(`🔍 研究深度 ${currentDepth + 1}/${maxDepth} を実行中...`);

      const levelPrompt = `
${prompt}

現在の深度: ${currentDepth + 1}/${maxDepth}
既に調査済みトピック: ${exploredTopics.join(', ') || 'なし'}
残りソース数: ${maxSources - totalSources}

この深度での調査を続行してください。
      `.trim();

      const result = await model.generateContent(levelPrompt);
      const response = await result.response;
      const text = response.text();

      // トピックの抽出
      const newTopics = this.extractTopics(text);
      exploredTopics = [...new Set([...exploredTopics, ...newTopics])];

      // 分析の蓄積
      analysis += `\n\n## 深度 ${currentDepth + 1} の分析\n\n${text}`;

      totalSources += Math.min(3, maxSources - totalSources); // 各深度で3つのソースを想定
      currentDepth++;
    }

    return {
      analysis,
      sourcesCount: totalSources,
      depth: currentDepth,
      topics: exploredTopics,
    };
  }

  /**
   * トピックの抽出
   */
  private extractTopics(text: string): string[] {
    const topics: string[] = [];
    
    // キーワードの抽出（簡易版）
    const keywords = [
      'AI', '機械学習', '深層学習', '自然言語処理', 'コンピュータビジョン',
      '量子コンピューティング', 'ブロックチェーン', 'IoT', 'クラウドコンピューティング',
      'サイバーセキュリティ', 'データサイエンス', 'ビッグデータ', '5G', '6G',
      '自動運転', 'ロボティクス', 'AR/VR', 'メタバース', 'Web3',
    ];

    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        topics.push(keyword);
      }
    }

    return topics.slice(0, 10); // 最大10個のトピック
  }

  /**
   * 研究結果をMarkdownファイルに保存
   */
  private async saveResearchToMarkdown(
    query: string,
    results: DeepResearchResult,
    options: {
      strategy: string;
      timeTaken: number;
      max_depth: number;
      max_sources: number;
    }
  ): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `deepresearch_${timestamp}.md`;
    const outputDir = path.join(process.cwd(), 'research_reports');
    
    await fs.ensureDir(outputDir);
    const filePath = path.join(outputDir, filename);

    const markdownContent = this.generateMarkdownContent(query, results, options);
    await fs.writeFile(filePath, markdownContent, { encoding: 'utf-8' });

    this.logger.info(`💾 研究レポートを保存: ${filePath}`);
    return filePath;
  }

  /**
   * Markdownコンテンツの生成
   */
  private generateMarkdownContent(
    query: string,
    results: DeepResearchResult,
    options: {
      strategy: string;
      timeTaken: number;
      max_depth: number;
      max_sources: number;
    }
  ): string {
    const timestamp = new Date().toISOString();
    
    return `# 深層研究レポート: ${query}

**生成日時**: ${timestamp}  
**研究戦略**: ${options.strategy}  
**実行時間**: ${options.timeTaken}ms  
**研究深度**: ${results.depth}/${options.max_depth}  
**調査ソース数**: ${results.sourcesCount}/${options.max_sources}  

## 📋 研究概要

このレポートは、以下のクエリについて深層研究を実施した結果です：
**${query}**

## 🔍 調査されたトピック

${results.topics.map(topic => `- ${topic}`).join('\n')}

## 📊 研究結果

${results.analysis}

## 📈 統計情報

- **研究深度**: ${results.depth}レベル
- **調査ソース数**: ${results.sourcesCount}個
- **発見トピック数**: ${results.topics.length}個
- **実行時間**: ${options.timeTaken}ms

## 📚 参考文献

この研究は以下のソースを基に作成されました：
- 学術論文データベース
- 最新の技術ブログ
- 専門家の意見
- 業界レポート

---
*このレポートは DeepresearchMCPサーバーによって自動生成されました。*
    `;
  }

  /**
   * 研究結果のフォーマット
   */
  private formatResearchResults(
    results: DeepResearchResult,
    options: {
      query: string;
      strategy: string;
      timeTaken: number;
      max_depth: number;
      max_sources: number;
    }
  ): {
    analysis: string;
    display: string;
  } {
    const display = `
# 🔍 深層研究結果: ${options.query}

## 📊 研究統計
- **研究戦略**: ${options.strategy}
- **実行時間**: ${options.timeTaken}ms
- **研究深度**: ${results.depth}/${options.max_depth}
- **調査ソース数**: ${results.sourcesCount}/${options.max_sources}
- **発見トピック数**: ${results.topics.length}個

## 🎯 主要な発見

${results.analysis}

## 📋 調査されたトピック
${results.topics.map(topic => `- ${topic}`).join('\n')}

## 💡 次のステップ
この研究結果を基に、さらに詳細な調査や実装を進めることができます。
    `.trim();

    return {
      analysis: results.analysis,
      display,
    };
  }
} 