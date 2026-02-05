/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { WebSearchService } from './webSearchService.js';
import { ResearchReportService } from './researchReportService.js';
import * as fs from 'fs-extra';
import * as path from 'path';
/**
 * 高度リサーチエージェント行動規範 v2 (Robust) サービス
 * 計画第一、構造化、証拠主義、客観性、対話と確認の原則に基づく研究機能
 */
export class AdvancedResearchProtocolService {
    genAI;
    webSearchService;
    researchReportService;
    logger;
    researchLog = [];
    constructor(logger) {
        this.logger = logger;
        this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
        this.webSearchService = new WebSearchService(logger);
        this.researchReportService = new ResearchReportService(logger);
    }
    /**
     * 高度リサーチプロトコルを実行
     */
    async execute(params) {
        try {
            this.logger.info('🔬 高度リサーチプロトコル開始:', { query: params.query });
            const startTime = Date.now();
            // フェーズ1: 計画立案と合意形成
            const plan = await this.createResearchPlan(params.query, params);
            this.addLogEntry('planning', '計画作成', `研究計画を作成: ${plan.theme}`, plan);
            // 研究ログファイルの生成
            const logFileName = `${this.sanitizeFileName(params.query)}_research_log.md`;
            await this.createResearchLogFile(logFileName, plan);
            // フェーズ2: タスク実行と記録
            const results = await this.executeResearchTasks(plan, params, logFileName);
            // フェーズ3: 統合と最終化
            const finalReport = await this.integrateAndFinalize(results, plan, params, logFileName);
            // フェーズ4: 完了報告
            const completionTime = Date.now() - startTime;
            this.addLogEntry('completion', '完了報告', `研究完了: ${completionTime}ms`, finalReport);
            this.logger.info('✅ 高度リサーチプロトコル完了:', {
                theme: plan.theme,
                tasksCompleted: results.filter(r => r.status === 'completed').length,
                totalTasks: results.length,
                timeTaken: completionTime,
            });
            return {
                content: [
                    {
                        type: 'text',
                        text: finalReport,
                    },
                ],
            };
        }
        catch (error) {
            this.logger.error('❌ 高度リサーチプロトコルエラー:', error instanceof Error ? error.message : String(error));
            this.addLogEntry('execution', 'エラー発生', `エラー: ${error instanceof Error ? error.message : String(error)}`, { error: error instanceof Error ? error.message : String(error) });
            throw error;
        }
    }
    /**
     * フェーズ1: 研究計画の作成
     */
    async createResearchPlan(query, params) {
        const prompt = `
高度リサーチエージェント行動規範 v2 (Robust) に基づいて、以下のテーマの研究計画を作成してください：

**テーマ**: ${query}

**研究戦略**: ${params.strategy || 'comprehensive'}
**最大深度**: ${params.max_depth || 3}
**最大ソース数**: ${params.max_sources || 10}
**学術ソース**: ${params.include_academic ? '含む' : '含まない'}
**最近の年数**: ${params.recent_years || 5}年

以下の形式で回答してください：

## 研究計画

### テーマ
${query}

### ワークフロー
1. [具体的なステップ1]
2. [具体的なステップ2]
3. [具体的なステップ3]
...

### タスクリスト
- [ ] タスク1: [詳細な説明]
- [ ] タスク2: [詳細な説明]
- [ ] タスク3: [詳細な説明]
...

### 推定時間
[分単位で推定]

### リスク要因
- [リスク1]
- [リスク2]
...

### 成功基準
- [基準1]
- [基準2]
...
`;
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            // 計画の解析
            const plan = this.parseResearchPlan(text, query);
            return plan;
        }
        catch (error) {
            this.logger.warn('⚠️ 計画作成エラー、フォールバック計画を使用:', error instanceof Error ? error.message : String(error));
            return this.createFallbackPlan(query, params);
        }
    }
    /**
     * 研究計画の解析
     */
    parseResearchPlan(text, query) {
        const lines = text.split('\n');
        let currentSection = '';
        const workflow = [];
        const taskList = [];
        let estimatedTime = 30;
        const riskFactors = [];
        const successCriteria = [];
        for (const line of lines) {
            if (line.includes('### ワークフロー')) {
                currentSection = 'workflow';
                continue;
            }
            else if (line.includes('### タスクリスト')) {
                currentSection = 'tasklist';
                continue;
            }
            else if (line.includes('### 推定時間')) {
                currentSection = 'time';
                continue;
            }
            else if (line.includes('### リスク要因')) {
                currentSection = 'risks';
                continue;
            }
            else if (line.includes('### 成功基準')) {
                currentSection = 'criteria';
                continue;
            }
            if (currentSection === 'workflow' && line.trim().match(/^\d+\./)) {
                workflow.push(line.trim());
            }
            else if (currentSection === 'tasklist' && line.trim().startsWith('- [ ]')) {
                taskList.push(line.trim());
            }
            else if (currentSection === 'time' && line.trim()) {
                const timeMatch = line.match(/(\d+)/);
                if (timeMatch) {
                    estimatedTime = parseInt(timeMatch[1]);
                }
            }
            else if (currentSection === 'risks' && line.trim().startsWith('-')) {
                riskFactors.push(line.trim().substring(1).trim());
            }
            else if (currentSection === 'criteria' && line.trim().startsWith('-')) {
                successCriteria.push(line.trim().substring(1).trim());
            }
        }
        return {
            theme: query,
            workflow,
            taskList,
            estimatedTime,
            riskFactors,
            successCriteria,
        };
    }
    /**
     * フォールバック計画の作成
     */
    createFallbackPlan(query, params) {
        return {
            theme: query,
            workflow: [
                '1. 基本情報の収集',
                '2. 関連トピックの探索',
                '3. 信頼性の高いソースの特定',
                '4. 情報の統合と分析',
                '5. 結果の整理と報告',
            ],
            taskList: [
                '- [ ] 基本検索クエリの実行',
                '- [ ] 関連キーワードの抽出',
                '- [ ] 学術ソースの調査',
                '- [ ] 最新情報の確認',
                '- [ ] 結果の統合',
            ],
            estimatedTime: 30,
            riskFactors: ['情報が古い可能性', '信頼性の低いソース'],
            successCriteria: ['十分な情報収集', '信頼性の高いソース', '構造化された結果'],
        };
    }
    /**
     * 研究ログファイルの作成
     */
    async createResearchLogFile(fileName, plan) {
        const logContent = `# ${plan.theme} 研究ログ

**作成日時**: ${new Date().toISOString()}
**研究テーマ**: ${plan.theme}

## 研究計画

### ワークフロー
${plan.workflow.map(w => w).join('\n')}

### タスクリスト
${plan.taskList.map(t => t).join('\n')}

### 推定時間
${plan.estimatedTime}分

### リスク要因
${plan.riskFactors.map(r => `- ${r}`).join('\n')}

### 成功基準
${plan.successCriteria.map(c => `- ${c}`).join('\n')}

## 研究記録

`;
        const logPath = path.join(process.cwd(), '_docs', fileName);
        await fs.ensureDir(path.dirname(logPath));
        await fs.writeFile(logPath, logContent, { encoding: 'utf-8' });
        this.logger.info('📝 研究ログファイル作成:', logPath);
    }
    /**
     * フェーズ2: タスク実行と記録
     */
    async executeResearchTasks(plan, params, logFileName) {
        const tasks = plan.taskList.map((task, index) => ({
            id: `task_${index + 1}`,
            name: task.replace('- [ ] ', ''),
            description: task,
            status: 'pending',
        }));
        const results = [];
        for (const task of tasks) {
            try {
                task.status = 'in_progress';
                this.addLogEntry('execution', 'タスク開始', `タスク開始: ${task.name}`, task);
                // タスクの実行
                const taskResult = await this.executeSingleTask(task, plan, params);
                task.results = taskResult;
                task.status = 'completed';
                // ログファイルに追記
                await this.appendToLogFile(logFileName, `[完了] ${task.name}`, taskResult);
                results.push(task);
            }
            catch (error) {
                task.status = 'failed';
                task.error = error instanceof Error ? error.message : String(error);
                this.addLogEntry('execution', 'タスク失敗', `タスク失敗: ${task.name}`, { error: error instanceof Error ? error.message : String(error) });
                // 例外処理
                await this.handleTaskException(task, plan, params, logFileName);
                results.push(task);
            }
        }
        return results;
    }
    /**
     * 単一タスクの実行
     */
    async executeSingleTask(task, plan, params) {
        const taskName = task.name.toLowerCase();
        if (taskName.includes('検索') || taskName.includes('search')) {
            return await this.performWebSearch(plan.theme, params);
        }
        else if (taskName.includes('分析') || taskName.includes('analysis')) {
            return await this.performAnalysis(plan.theme, params);
        }
        else if (taskName.includes('統合') || taskName.includes('integration')) {
            return await this.performIntegration(plan.theme, params);
        }
        else {
            // 汎用タスク実行
            return await this.performGenericTask(task, plan, params);
        }
    }
    /**
     * Web検索の実行
     */
    async performWebSearch(query, params) {
        try {
            const searchResults = await this.webSearchService.execute({
                query,
                max_results: params.max_sources || 10,
                include_summary: true,
            });
            return {
                type: 'web_search',
                query,
                results: searchResults,
                sources: 1, // 簡易的な実装
            };
        }
        catch (error) {
            throw new Error(`Web検索エラー: ${error}`);
        }
    }
    /**
     * 分析の実行
     */
    async performAnalysis(query, params) {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const prompt = `
以下のテーマについて、客観的で構造化された分析を行ってください：

**テーマ**: ${query}

**分析要件**:
- 事実と推論を明確に区別
- 情報源を明記
- 多角的な視点を提供
- 構造化された形式で出力

分析結果を返してください。
`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return {
                type: 'analysis',
                query,
                analysis: response.text(),
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            throw new Error(`分析エラー: ${error}`);
        }
    }
    /**
     * 統合の実行
     */
    async performIntegration(query, params) {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const prompt = `
以下のテーマについて、収集した情報を統合して包括的なレポートを作成してください：

**テーマ**: ${query}

**統合要件**:
- 収集した情報の統合
- 矛盾点の解決
- 優先度の考慮
- 元のテーマとの整合性

統合されたレポートを返してください。
`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return {
                type: 'integration',
                query,
                report: response.text(),
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            throw new Error(`統合エラー: ${error}`);
        }
    }
    /**
     * 汎用タスクの実行
     */
    async performGenericTask(task, plan, params) {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const prompt = `
以下のタスクを実行してください：

**タスク**: ${task.name}
**テーマ**: ${plan.theme}

**実行要件**:
- 具体的で実用的な結果を提供
- 証拠に基づく分析
- 構造化された出力

タスクの実行結果を返してください。
`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return {
                type: 'generic_task',
                task: task.name,
                result: response.text(),
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            throw new Error(`汎用タスクエラー: ${error}`);
        }
    }
    /**
     * タスク例外の処理
     */
    async handleTaskException(task, plan, params, logFileName) {
        this.logger.warn(`⚠️ タスク例外処理: ${task.name}`, task.error);
        // ログファイルに例外情報を追記
        await this.appendToLogFile(logFileName, `[例外] ${task.name}`, {
            error: task.error,
            timestamp: new Date().toISOString(),
            recovery_attempt: '自動復旧を試行',
        });
        // 自動復旧の試行
        try {
            const recoveryResult = await this.attemptTaskRecovery(task, plan, params);
            if (recoveryResult) {
                task.status = 'completed';
                task.results = recoveryResult;
                await this.appendToLogFile(logFileName, `[復旧成功] ${task.name}`, recoveryResult);
            }
        }
        catch (recoveryError) {
            this.logger.error(`❌ 復旧失敗: ${task.name}`, recoveryError);
        }
    }
    /**
     * タスク復旧の試行
     */
    async attemptTaskRecovery(task, plan, params) {
        // 簡略化されたタスク実行
        const simplifiedResult = await this.performGenericTask(task, plan, params);
        return {
            ...simplifiedResult,
            recovery: true,
            original_error: task.error,
        };
    }
    /**
     * ログファイルへの追記
     */
    async appendToLogFile(fileName, action, details) {
        const logPath = path.join(process.cwd(), '_docs', fileName);
        const entry = `
### ${action}
**時刻**: ${new Date().toISOString()}
**詳細**: ${JSON.stringify(details, null, 2)}

`;
        await fs.writeFile(logPath, await fs.readFile(logPath, 'utf-8') + entry, { encoding: 'utf-8' });
    }
    /**
     * フェーズ3: 統合と最終化
     */
    async integrateAndFinalize(results, plan, params, logFileName) {
        // ログファイルの読み込み
        const logPath = path.join(process.cwd(), '_docs', logFileName);
        const logContent = await fs.readFile(logPath, 'utf-8');
        // 最終レポートの生成
        const finalReport = await this.generateFinalReport(results, plan, logContent, params);
        // 最終レポートをログファイルに追記
        await this.appendToLogFile(logFileName, '[最終レポート]', { report: finalReport });
        return finalReport;
    }
    /**
     * 最終レポートの生成
     */
    async generateFinalReport(results, plan, logContent, params) {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const completedTasks = results.filter(r => r.status === 'completed');
        const failedTasks = results.filter(r => r.status === 'failed');
        const prompt = `
高度リサーチエージェント行動規範 v2 (Robust) に基づいて、以下の研究結果を統合して最終レポートを作成してください：

**研究テーマ**: ${plan.theme}
**完了タスク数**: ${completedTasks.length}/${results.length}
**失敗タスク数**: ${failedTasks.length}

**研究計画**:
${plan.workflow.join('\n')}

**完了したタスク**:
${completedTasks.map(t => `- ${t.name}: ${JSON.stringify(t.results)}`).join('\n')}

**失敗したタスク**:
${failedTasks.map(t => `- ${t.name}: ${t.error}`).join('\n')}

**研究ログ**:
${logContent}

以下の形式で最終レポートを作成してください：

# ${plan.theme} 研究レポート

## エグゼクティブサマリー
[研究の概要と主要な発見]

## 目次
1. [研究目的]
2. [研究方法]
3. [主要な発見]
4. [分析結果]
5. [結論と推奨事項]
6. [参考文献]

## 詳細分析
[構造化された詳細分析]

## 結論
[研究の結論と今後の方向性]

## 参考文献
[使用した情報源のリスト]
`;
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        }
        catch (error) {
            this.logger.error('❌ 最終レポート生成エラー:', error);
            return this.createFallbackReport(plan, results);
        }
    }
    /**
     * フォールバックレポートの作成
     */
    createFallbackReport(plan, results) {
        const completedTasks = results.filter(r => r.status === 'completed');
        return `# ${plan.theme} 研究レポート

## エグゼクティブサマリー
研究テーマ「${plan.theme}」について、${completedTasks.length}個のタスクを完了しました。

## 研究結果
${completedTasks.map(t => `### ${t.name}\n${JSON.stringify(t.results, null, 2)}`).join('\n\n')}

## 結論
研究は部分的に完了しました。${results.length - completedTasks.length}個のタスクでエラーが発生しました。
`;
    }
    /**
     * ログエントリの追加
     */
    addLogEntry(phase, action, details, data) {
        const entry = {
            timestamp: new Date().toISOString(),
            phase,
            action,
            details,
            ...(data && { analysis: JSON.stringify(data, null, 2) }),
        };
        this.researchLog.push(entry);
    }
    /**
     * ファイル名のサニタイズ
     */
    sanitizeFileName(query) {
        return query
            .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '_')
            .substring(0, 50);
    }
}
//# sourceMappingURL=advancedResearchProtocolService.js.map