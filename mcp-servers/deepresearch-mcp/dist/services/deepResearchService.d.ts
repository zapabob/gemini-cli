/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Logger } from '../utils/logger.js';
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
export declare class DeepResearchService {
    private genAI;
    private webSearchService;
    private researchReportService;
    private logger;
    constructor(logger: Logger);
    /**
     * 深層研究を実行
     */
    execute(params: DeepResearchParams): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
    }>;
    /**
     * 研究プロンプトの作成
     */
    private createResearchPrompt;
    /**
     * 多層研究の実行
     */
    private performMultiLevelResearch;
    /**
     * トピックの抽出
     */
    private extractTopics;
    /**
     * 研究結果をMarkdownファイルに保存
     */
    private saveResearchToMarkdown;
    /**
     * Markdownコンテンツの生成
     */
    private generateMarkdownContent;
    /**
     * 研究結果のフォーマット
     */
    private formatResearchResults;
}
//# sourceMappingURL=deepResearchService.d.ts.map