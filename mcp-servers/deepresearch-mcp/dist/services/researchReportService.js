/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs-extra';
import * as path from 'path';
/**
 * 研究レポートサービス
 * 包括的な研究レポートを生成
 */
export class ResearchReportService {
    genAI;
    logger;
    constructor(logger) {
        this.logger = logger;
        this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
    }
    /**
     * 研究レポートを生成
     */
    async execute(params) {
        try {
            this.logger.info('📝 研究レポート生成を開始:', { topic: params.topic });
            const startTime = Date.now();
            const reportType = params.report_type || 'comprehensive';
            const includeCitations = params.include_citations ?? true;
            const outputFormat = params.output_format || 'markdown';
            // レポートの生成
            const report = await this.generateResearchReport(params.topic, params.sources || [], reportType, includeCitations);
            // ファイルの保存
            const savedFilePath = await this.saveReportToFile(report, outputFormat);
            // 結果のフォーマット
            const formattedResult = this.formatReportResult(report, savedFilePath, {
                generationTime: Date.now() - startTime,
                outputFormat,
            });
            this.logger.info('✅ 研究レポート生成完了:', {
                topic: params.topic,
                reportType,
                savedFilePath,
            });
            return {
                content: [
                    {
                        type: 'text',
                        text: formattedResult,
                    },
                ],
            };
        }
        catch (error) {
            this.logger.error('❌ 研究レポート生成エラー:', error);
            throw error;
        }
    }
    /**
     * 研究レポートの生成
     */
    async generateResearchReport(topic, sources, reportType, includeCitations) {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const prompt = this.createReportPrompt(topic, sources, reportType, includeCitations);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const content = response.text();
        // レポートの構造化
        const structuredReport = this.structureReport(content, topic, sources, reportType);
        return structuredReport;
    }
    /**
     * レポート生成プロンプトの作成
     */
    createReportPrompt(topic, sources, reportType, includeCitations) {
        const typeInstructions = {
            academic: '学術的な形式で、詳細な分析と引用を含む包括的なレポートを作成してください。',
            business: 'ビジネス向けの実用的で、意思決定に役立つレポートを作成してください。',
            technical: '技術的な詳細と実装方法に焦点を当てたレポートを作成してください。',
            comprehensive: '包括的で多角的な視点からの詳細なレポートを作成してください。',
        };
        const citationInstruction = includeCitations
            ? '適切な引用と参考文献を含めてください。'
            : '引用は含めずに、オリジナルの分析に焦点を当ててください。';
        return `
あなたは高度な研究レポート作成アシスタントです。以下の要件に基づいて研究レポートを作成してください：

**研究トピック**: ${topic}

**レポートタイプ**: ${typeInstructions[reportType] || typeInstructions.comprehensive}

**利用可能なソース**:
${sources.length > 0 ? sources.map((source, index) => `${index + 1}. ${source}`).join('\n') : '外部ソースを参照して最新の情報を使用してください。'}

**レポート要件**:
- ${citationInstruction}
- 明確な構造と論理的な流れ
- 具体的な例とデータ
- 実用的な洞察と推奨事項
- 今後の研究方向の提案

**レポート構成**:
1. エグゼクティブサマリー
2. 研究背景と目的
3. 方法論
4. 主要な発見
5. 分析と議論
6. 結論と推奨事項
7. 参考文献（該当する場合）

詳細で質の高い研究レポートを作成してください。
    `.trim();
    }
    /**
     * レポートの構造化
     */
    structureReport(content, topic, sources, reportType) {
        // レポートの各部分を抽出
        const sections = this.extractReportSections(content);
        const title = `研究レポート: ${topic}`;
        const summary = this.generateSummary(content);
        const citations = this.extractCitations(content);
        return {
            title,
            content,
            summary,
            citations,
            metadata: {
                topic,
                reportType,
                sourcesCount: sources.length,
                generationTime: 0, // 後で設定
                outputFormat: 'markdown',
            },
        };
    }
    /**
     * レポートセクションの抽出
     */
    extractReportSections(content) {
        const sections = {};
        const lines = content.split('\n');
        let currentSection = '';
        let currentContent = '';
        for (const line of lines) {
            if (line.startsWith('#') || line.startsWith('##') || line.startsWith('###')) {
                if (currentSection && currentContent) {
                    sections[currentSection] = currentContent.trim();
                }
                currentSection = line.replace(/^#+\s*/, '').trim();
                currentContent = '';
            }
            else {
                currentContent += line + '\n';
            }
        }
        if (currentSection && currentContent) {
            sections[currentSection] = currentContent.trim();
        }
        return sections;
    }
    /**
     * サマリーの生成
     */
    generateSummary(content) {
        // 最初の数段落からサマリーを生成
        const paragraphs = content.split('\n\n').slice(0, 3);
        return paragraphs.join('\n\n');
    }
    /**
     * 引用の抽出
     */
    extractCitations(content) {
        const citations = [];
        const lines = content.split('\n');
        for (const line of lines) {
            if (line.includes('[') && line.includes(']') && line.includes('(') && line.includes(')')) {
                citations.push(line.trim());
            }
        }
        return citations;
    }
    /**
     * レポートをファイルに保存
     */
    async saveReportToFile(report, outputFormat) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `research_report_${timestamp}.${outputFormat}`;
        const outputDir = path.join(process.cwd(), 'research_reports');
        await fs.ensureDir(outputDir);
        const filePath = path.join(outputDir, filename);
        let content = '';
        switch (outputFormat) {
            case 'html':
                content = this.convertToHtml(report);
                break;
            case 'pdf':
                content = this.convertToPdf(report);
                break;
            case 'markdown':
            default:
                content = this.convertToMarkdown(report);
                break;
        }
        await fs.writeFile(filePath, content, { encoding: 'utf-8' });
        this.logger.info(`💾 レポートを保存: ${filePath}`);
        return filePath;
    }
    /**
     * Markdown形式への変換
     */
    convertToMarkdown(report) {
        const timestamp = new Date().toISOString();
        return `# ${report.title}

**生成日時**: ${timestamp}  
**レポートタイプ**: ${report.metadata.reportType}  
**ソース数**: ${report.metadata.sourcesCount}  

## 📋 エグゼクティブサマリー

${report.summary}

## 📊 詳細レポート

${report.content}

## 📚 参考文献

${report.citations.length > 0 ? report.citations.join('\n') : '参考文献は含まれていません。'}

---
*このレポートは DeepresearchMCPサーバーによって自動生成されました。*
    `;
    }
    /**
     * HTML形式への変換
     */
    convertToHtml(report) {
        const timestamp = new Date().toISOString();
        return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.title}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
        h1 { color: #333; border-bottom: 2px solid #333; }
        h2 { color: #666; margin-top: 30px; }
        .metadata { background: #f5f5f5; padding: 15px; border-radius: 5px; }
        .summary { background: #e8f4f8; padding: 15px; border-left: 4px solid #2196F3; }
        .citations { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; }
    </style>
</head>
<body>
    <h1>${report.title}</h1>
    
    <div class="metadata">
        <strong>生成日時</strong>: ${timestamp}<br>
        <strong>レポートタイプ</strong>: ${report.metadata.reportType}<br>
        <strong>ソース数</strong>: ${report.metadata.sourcesCount}
    </div>

    <h2>📋 エグゼクティブサマリー</h2>
    <div class="summary">
        ${report.summary.replace(/\n/g, '<br>')}
    </div>

    <h2>📊 詳細レポート</h2>
    ${report.content.replace(/\n/g, '<br>')}

    <h2>📚 参考文献</h2>
    <div class="citations">
        ${report.citations.length > 0 ? report.citations.join('<br>') : '参考文献は含まれていません。'}
    </div>

    <hr>
    <p><em>このレポートは DeepresearchMCPサーバーによって自動生成されました。</em></p>
</body>
</html>`;
    }
    /**
     * PDF形式への変換（簡易版）
     */
    convertToPdf(report) {
        // 実際の実装では、puppeteerやwkhtmltopdfを使用
        // ここでは簡易的にMarkdown形式を返す
        return this.convertToMarkdown(report);
    }
    /**
     * レポート結果のフォーマット
     */
    formatReportResult(report, savedFilePath, options) {
        return `
# 📝 研究レポート生成完了

## 📋 レポート情報

**タイトル**: ${report.title}
**レポートタイプ**: ${report.metadata.reportType}
**出力形式**: ${options.outputFormat}
**生成時間**: ${options.generationTime}ms
**保存先**: ${savedFilePath}

## 📊 レポート統計

- **ソース数**: ${report.metadata.sourcesCount}個
- **引用数**: ${report.citations.length}個
- **コンテンツ長**: ${report.content.length}文字

## 📋 エグゼクティブサマリー

${report.summary}

## 📚 参考文献

${report.citations.length > 0 ? report.citations.join('\n') : '参考文献は含まれていません。'}

## 💡 次のステップ

この研究レポートを基に、以下のアクションを検討してください：
- 詳細な実装計画の策定
- 追加調査の実施
- チーム内での共有と議論
- プロジェクトへの応用

---
*このレポートは DeepresearchMCPサーバーによって自動生成されました。*
    `.trim();
    }
}
//# sourceMappingURL=researchReportService.js.map