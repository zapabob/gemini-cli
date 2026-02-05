/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Logger } from '../utils/logger.js';
/**
 * ドキュメント分析サービスのパラメータ
 */
export interface DocumentAnalysisParams {
    file_pattern?: string;
    analysis_type?: 'content' | 'structure' | 'code' | 'comprehensive';
    include_metadata?: boolean;
}
/**
 * ドキュメント分析結果
 */
export interface DocumentAnalysisResult {
    filePath: string;
    fileName: string;
    fileSize: number;
    contentType: string;
    analysis: string;
    metadata?: {
        lines: number;
        characters: number;
        lastModified: Date;
        encoding: string;
    };
}
/**
 * ドキュメント分析サービス
 * ワークスペース内のドキュメントを分析
 */
export declare class DocumentAnalysisService {
    private logger;
    constructor(logger: Logger);
    /**
     * ドキュメント分析を実行
     */
    execute(params: DocumentAnalysisParams): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
    }>;
    /**
     * ファイルの検索
     */
    private findFiles;
    /**
     * ファイルの分析
     */
    private analyzeFiles;
    /**
     * 個別ファイルの分析
     */
    private analyzeFile;
    /**
     * コンテンツタイプの取得
     */
    private getContentType;
    /**
     * コンテンツ分析
     */
    private analyzeContent;
    /**
     * 構造分析
     */
    private analyzeStructure;
    /**
     * コード分析
     */
    private analyzeCode;
    /**
     * 包括的分析
     */
    private analyzeComprehensive;
    /**
     * 主要コンテンツの抽出
     */
    private extractKeyContent;
    /**
     * セクションの抽出
     */
    private extractSections;
    /**
     * 関数の抽出
     */
    private extractFunctions;
    /**
     * インポートの抽出
     */
    private extractImports;
    /**
     * コメントの抽出
     */
    private extractComments;
    /**
     * 分析結果のフォーマット
     */
    private formatAnalysisResults;
    /**
     * タイプ統計の計算
     */
    private calculateTypeStats;
    /**
     * 分析サマリーの生成
     */
    private generateAnalysisSummary;
    /**
     * 最も多いファイルタイプの取得
     */
    private getMostCommonType;
    /**
     * 最大ファイルの取得
     */
    private getLargestFile;
}
//# sourceMappingURL=documentAnalysisService.d.ts.map