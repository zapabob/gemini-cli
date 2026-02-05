/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Logger } from '../utils/logger.js';
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
export declare class WebSearchService {
    private logger;
    constructor(logger: Logger);
    /**
     * Web検索を実行
     */
    execute(params: WebSearchParams): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
    }>;
    /**
     * Web検索の実行
     */
    private performWebSearch;
    /**
     * 検索結果の内容を充実させる
     */
    private enrichSearchResults;
    /**
     * Webコンテンツの取得
     */
    private fetchWebContent;
    /**
     * 検索結果のフォーマット
     */
    private formatSearchResults;
    /**
     * 検索サマリーの生成
     */
    private generateSearchSummary;
}
//# sourceMappingURL=webSearchService.d.ts.map