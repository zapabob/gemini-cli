/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Logger } from '../utils/logger.js';
/**
 * 高度リサーチエージェント行動規範 v2 (Robust) パラメータ
 */
export interface AdvancedResearchProtocolParams {
    query: string;
    max_depth?: number;
    max_sources?: number;
    strategy?: 'comprehensive' | 'focused' | 'exploratory';
    include_academic?: boolean;
    recent_years?: number;
    focus_domains?: string[];
    exclude_types?: string[];
    enable_planning?: boolean;
    enable_structured_output?: boolean;
    enable_evidence_tracking?: boolean;
    enable_objective_analysis?: boolean;
    enable_dialogue_confirmation?: boolean;
    enable_exception_handling?: boolean;
}
/**
 * 研究計画
 */
export interface ResearchPlan {
    theme: string;
    workflow: string[];
    taskList: string[];
    estimatedTime: number;
    riskFactors: string[];
    successCriteria: string[];
}
/**
 * 研究タスク
 */
export interface ResearchTask {
    id: string;
    name: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    results?: any;
    error?: string;
}
/**
 * 研究ログエントリ
 */
export interface ResearchLogEntry {
    timestamp: string;
    phase: 'planning' | 'execution' | 'integration' | 'completion';
    task?: string;
    action: string;
    details: string;
    url?: string;
    evidence?: string;
    analysis?: string;
}
/**
 * 高度リサーチエージェント行動規範 v2 (Robust) サービス
 * 計画第一、構造化、証拠主義、客観性、対話と確認の原則に基づく研究機能
 */
export declare class AdvancedResearchProtocolService {
    private genAI;
    private webSearchService;
    private researchReportService;
    private logger;
    private researchLog;
    constructor(logger: Logger);
    /**
     * 高度リサーチプロトコルを実行
     */
    execute(params: AdvancedResearchProtocolParams): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
    }>;
    /**
     * フェーズ1: 研究計画の作成
     */
    private createResearchPlan;
    /**
     * 研究計画の解析
     */
    private parseResearchPlan;
    /**
     * フォールバック計画の作成
     */
    private createFallbackPlan;
    /**
     * 研究ログファイルの作成
     */
    private createResearchLogFile;
    /**
     * フェーズ2: タスク実行と記録
     */
    private executeResearchTasks;
    /**
     * 単一タスクの実行
     */
    private executeSingleTask;
    /**
     * Web検索の実行
     */
    private performWebSearch;
    /**
     * 分析の実行
     */
    private performAnalysis;
    /**
     * 統合の実行
     */
    private performIntegration;
    /**
     * 汎用タスクの実行
     */
    private performGenericTask;
    /**
     * タスク例外の処理
     */
    private handleTaskException;
    /**
     * タスク復旧の試行
     */
    private attemptTaskRecovery;
    /**
     * ログファイルへの追記
     */
    private appendToLogFile;
    /**
     * フェーズ3: 統合と最終化
     */
    private integrateAndFinalize;
    /**
     * 最終レポートの生成
     */
    private generateFinalReport;
    /**
     * フォールバックレポートの作成
     */
    private createFallbackReport;
    /**
     * ログエントリの追加
     */
    private addLogEntry;
    /**
     * ファイル名のサニタイズ
     */
    private sanitizeFileName;
}
//# sourceMappingURL=advancedResearchProtocolService.d.ts.map