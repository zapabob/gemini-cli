/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Logger } from '../utils/logger.js';
/**
 * 研究レポートサービスのパラメータ
 */
export interface ResearchReportParams {
    topic: string;
    sources?: string[];
    report_type?: 'academic' | 'business' | 'technical' | 'comprehensive';
    include_citations?: boolean;
    output_format?: 'markdown' | 'html' | 'pdf';
}
/**
 * 研究レポート結果
 */
export interface ResearchReportResult {
    title: string;
    content: string;
    summary: string;
    citations: string[];
    metadata: {
        topic: string;
        reportType: string;
        sourcesCount: number;
        generationTime: number;
        outputFormat: string;
    };
}
/**
 * 研究レポートサービス
 * 包括的な研究レポートを生成
 */
export declare class ResearchReportService {
    private genAI;
    private logger;
    constructor(logger: Logger);
    /**
     * 研究レポートを生成
     */
    execute(params: ResearchReportParams): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
    }>;
    /**
     * 研究レポートの生成
     */
    private generateResearchReport;
    /**
     * レポート生成プロンプトの作成
     */
    private createReportPrompt;
    /**
     * レポートの構造化
     */
    private structureReport;
    /**
     * レポートセクションの抽出
     */
    private extractReportSections;
    /**
     * サマリーの生成
     */
    private generateSummary;
    /**
     * 引用の抽出
     */
    private extractCitations;
    /**
     * レポートをファイルに保存
     */
    private saveReportToFile;
    /**
     * Markdown形式への変換
     */
    private convertToMarkdown;
    /**
     * HTML形式への変換
     */
    private convertToHtml;
    /**
     * PDF形式への変換（簡易版）
     */
    private convertToPdf;
    /**
     * レポート結果のフォーマット
     */
    private formatReportResult;
}
//# sourceMappingURL=researchReportService.d.ts.map