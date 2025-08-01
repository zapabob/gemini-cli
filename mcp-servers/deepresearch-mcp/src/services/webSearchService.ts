/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Logger } from '../utils/logger.js';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

/**
 * Web検索サービスのパラメータ
 */
export interface WebSearchParams {
  query: string;
  max_results?: number;
  include_summary?: boolean;
}

/**
 * Web検索結果
 */
export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  content?: string;
}

/**
 * Web検索サービス
 * Web検索機能を提供
 */
export class WebSearchService {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Web検索を実行
   */
  async execute(params: WebSearchParams): Promise<{
    content: Array<{ type: 'text'; text: string }>;
  }> {
    try {
      this.logger.info('🌐 Web検索を開始:', { query: params.query });

      const maxResults = params.max_results || 10;
      const includeSummary = params.include_summary ?? true;

      // 検索結果の取得
      const searchResults = await this.performWebSearch(params.query, maxResults);

      // コンテンツの取得
      const enrichedResults = await this.enrichSearchResults(searchResults);

      // 結果のフォーマット
      const formattedResults = this.formatSearchResults(
        enrichedResults,
        params.query,
        includeSummary
      );

      this.logger.info('✅ Web検索完了:', {
        query: params.query,
        resultsCount: enrichedResults.length,
      });

      return {
        content: [
          {
            type: 'text',
            text: formattedResults,
          },
        ],
      };

    } catch (error) {
      this.logger.error('❌ Web検索エラー:', error);
      throw error;
    }
  }

  /**
   * Web検索の実行
   */
  private async performWebSearch(query: string, maxResults: number): Promise<WebSearchResult[]> {
    // 簡易的な検索エンジンAPIのシミュレーション
    // 実際の実装では、Google Custom Search APIやBing Search APIを使用
    const mockResults: WebSearchResult[] = [
      {
        title: `検索結果: ${query}`,
        url: `https://example.com/search?q=${encodeURIComponent(query)}`,
        snippet: `${query}に関する最新の情報が見つかりました。`,
      },
      {
        title: `${query} - 技術情報`,
        url: `https://tech.example.com/${encodeURIComponent(query)}`,
        snippet: `${query}の技術的な詳細と実装方法について説明しています。`,
      },
      {
        title: `${query} - 最新動向`,
        url: `https://news.example.com/${encodeURIComponent(query)}`,
        snippet: `${query}の最新の動向とトレンドについて報告しています。`,
      },
    ];

    return mockResults.slice(0, maxResults);
  }

  /**
   * 検索結果の内容を充実させる
   */
  private async enrichSearchResults(results: WebSearchResult[]): Promise<WebSearchResult[]> {
    const enrichedResults: WebSearchResult[] = [];

    for (const result of results) {
      try {
        // 実際の実装では、URLからコンテンツを取得
        const content = await this.fetchWebContent(result.url);
        enrichedResults.push({
          ...result,
          content,
        });
      } catch (error) {
        this.logger.warn(`コンテンツ取得エラー: ${result.url}`, error);
        enrichedResults.push(result);
      }
    }

    return enrichedResults;
  }

  /**
   * Webコンテンツの取得
   */
  private async fetchWebContent(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);

      // メタコンテンツの抽出
      const title = $('title').text() || $('h1').first().text();
      const description = $('meta[name="description"]').attr('content') || '';
      const content = $('body').text().substring(0, 1000); // 最初の1000文字

      return `${title}\n\n${description}\n\n${content}`;
    } catch (error) {
      this.logger.warn(`Webコンテンツ取得エラー: ${url}`, error);
      return 'コンテンツを取得できませんでした。';
    }
  }

  /**
   * 検索結果のフォーマット
   */
  private formatSearchResults(
    results: WebSearchResult[],
    query: string,
    includeSummary: boolean
  ): string {
    let formatted = `# 🌐 Web検索結果: ${query}\n\n`;

    if (results.length === 0) {
      formatted += '検索結果が見つかりませんでした。\n';
      return formatted;
    }

    // 検索結果の一覧
    formatted += `## 📋 検索結果 (${results.length}件)\n\n`;

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      formatted += `### ${i + 1}. ${result.title}\n`;
      formatted += `**URL**: ${result.url}\n`;
      formatted += `**概要**: ${result.snippet}\n\n`;

      if (result.content && includeSummary) {
        formatted += `**内容**: ${result.content.substring(0, 300)}...\n\n`;
      }

      formatted += '---\n\n';
    }

    // サマリーの追加
    if (includeSummary) {
      formatted += this.generateSearchSummary(results, query);
    }

    return formatted;
  }

  /**
   * 検索サマリーの生成
   */
  private generateSearchSummary(results: WebSearchResult[], query: string): string {
    const summary = `
## 📊 検索サマリー

**検索クエリ**: ${query}
**結果数**: ${results.length}件
**検索日時**: ${new Date().toISOString()}

### 🎯 主要な発見

${results.map((result, index) => `- ${index + 1}. ${result.title}`).join('\n')}

### 💡 次のステップ

これらの検索結果を基に、さらに詳細な調査や分析を進めることができます。

---
*この検索結果は DeepresearchMCPサーバーによって生成されました。*
    `.trim();

    return summary;
  }
} 