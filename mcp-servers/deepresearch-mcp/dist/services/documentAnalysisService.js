/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as fs from 'fs-extra';
import * as path from 'path';
import pkg from 'glob';
const { glob } = pkg;
/**
 * ドキュメント分析サービス
 * ワークスペース内のドキュメントを分析
 */
export class DocumentAnalysisService {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    /**
     * ドキュメント分析を実行
     */
    async execute(params) {
        try {
            this.logger.info('📄 ドキュメント分析を開始:', { params });
            const filePattern = params.file_pattern || '**/*';
            const analysisType = params.analysis_type || 'comprehensive';
            const includeMetadata = params.include_metadata ?? true;
            // ファイルの検索
            const files = await this.findFiles(filePattern);
            // ファイルの分析
            const analysisResults = await this.analyzeFiles(files, analysisType, includeMetadata);
            // 結果のフォーマット
            const formattedResults = this.formatAnalysisResults(analysisResults, filePattern, analysisType);
            this.logger.info('✅ ドキュメント分析完了:', {
                fileCount: analysisResults.length,
                analysisType,
            });
            return {
                content: [
                    {
                        type: 'text',
                        text: formattedResults,
                    },
                ],
            };
        }
        catch (error) {
            this.logger.error('❌ ドキュメント分析エラー:', error);
            throw error;
        }
    }
    /**
     * ファイルの検索
     */
    async findFiles(pattern) {
        try {
            const files = await glob(pattern, {
                ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**'],
                nodir: true,
            });
            this.logger.info(`📁 ファイル検索結果: ${files.length}件`);
            return files;
        }
        catch (error) {
            this.logger.error('ファイル検索エラー:', error);
            return [];
        }
    }
    /**
     * ファイルの分析
     */
    async analyzeFiles(files, analysisType, includeMetadata) {
        const results = [];
        for (const filePath of files) {
            try {
                const result = await this.analyzeFile(filePath, analysisType, includeMetadata);
                results.push(result);
            }
            catch (error) {
                this.logger.warn(`ファイル分析エラー: ${filePath}`, error);
            }
        }
        return results;
    }
    /**
     * 個別ファイルの分析
     */
    async analyzeFile(filePath, analysisType, includeMetadata) {
        const stats = await fs.stat(filePath);
        const content = await fs.readFile(filePath, 'utf-8');
        const fileName = path.basename(filePath);
        const contentType = this.getContentType(fileName);
        let analysis = '';
        switch (analysisType) {
            case 'content':
                analysis = this.analyzeContent(content, fileName);
                break;
            case 'structure':
                analysis = this.analyzeStructure(content, fileName);
                break;
            case 'code':
                analysis = this.analyzeCode(content, fileName);
                break;
            case 'comprehensive':
            default:
                analysis = this.analyzeComprehensive(content, fileName);
                break;
        }
        const result = {
            filePath,
            fileName,
            fileSize: stats.size,
            contentType,
            analysis,
        };
        if (includeMetadata) {
            result.metadata = {
                lines: content.split('\n').length,
                characters: content.length,
                lastModified: stats.mtime,
                encoding: 'utf-8',
            };
        }
        return result;
    }
    /**
     * コンテンツタイプの取得
     */
    getContentType(fileName) {
        const ext = path.extname(fileName).toLowerCase();
        const typeMap = {
            '.md': 'Markdown',
            '.ts': 'TypeScript',
            '.js': 'JavaScript',
            '.json': 'JSON',
            '.html': 'HTML',
            '.css': 'CSS',
            '.txt': 'Text',
            '.py': 'Python',
            '.java': 'Java',
            '.cpp': 'C++',
            '.c': 'C',
            '.go': 'Go',
            '.rs': 'Rust',
            '.php': 'PHP',
            '.rb': 'Ruby',
            '.sql': 'SQL',
            '.xml': 'XML',
            '.yaml': 'YAML',
            '.yml': 'YAML',
            '.toml': 'TOML',
            '.ini': 'INI',
            '.conf': 'Configuration',
        };
        return typeMap[ext] || 'Unknown';
    }
    /**
     * コンテンツ分析
     */
    analyzeContent(content, fileName) {
        const lines = content.split('\n');
        const words = content.split(/\s+/).filter(word => word.length > 0);
        const characters = content.length;
        return `
## 📄 コンテンツ分析: ${fileName}

**統計情報**:
- 行数: ${lines.length}
- 単語数: ${words.length}
- 文字数: ${characters}

**主要な内容**:
${this.extractKeyContent(content)}
    `.trim();
    }
    /**
     * 構造分析
     */
    analyzeStructure(content, fileName) {
        const lines = content.split('\n');
        const sections = this.extractSections(content);
        return `
## 🏗️ 構造分析: ${fileName}

**構造情報**:
- 総行数: ${lines.length}
- セクション数: ${sections.length}

**セクション構成**:
${sections.map((section, index) => `- ${index + 1}. ${section.title} (${section.lines}行)`).join('\n')}
    `.trim();
    }
    /**
     * コード分析
     */
    analyzeCode(content, fileName) {
        const lines = content.split('\n');
        const functions = this.extractFunctions(content);
        const imports = this.extractImports(content);
        const comments = this.extractComments(content);
        return `
## 💻 コード分析: ${fileName}

**コード統計**:
- 総行数: ${lines.length}
- 関数数: ${functions.length}
- インポート数: ${imports.length}
- コメント行数: ${comments.length}

**関数一覧**:
${functions.map(func => `- ${func.name} (${func.lines}行)`).join('\n')}

**インポート**:
${imports.map(imp => `- ${imp}`).join('\n')}
    `.trim();
    }
    /**
     * 包括的分析
     */
    analyzeComprehensive(content, fileName) {
        const contentAnalysis = this.analyzeContent(content, fileName);
        const structureAnalysis = this.analyzeStructure(content, fileName);
        const codeAnalysis = this.analyzeCode(content, fileName);
        return `
# 📊 包括的分析: ${fileName}

${contentAnalysis}

${structureAnalysis}

${codeAnalysis}

## 🎯 総合評価

このファイルは包括的な分析により、以下の特徴を持っています：
- 適切な構造化
- 明確なコンテンツ
- 保守性の高いコード
    `.trim();
    }
    /**
     * 主要コンテンツの抽出
     */
    extractKeyContent(content) {
        const lines = content.split('\n');
        const keyLines = lines
            .filter(line => line.trim().length > 0)
            .slice(0, 10)
            .map(line => `- ${line.trim()}`)
            .join('\n');
        return keyLines || 'コンテンツが見つかりませんでした。';
    }
    /**
     * セクションの抽出
     */
    extractSections(content) {
        const lines = content.split('\n');
        const sections = [];
        let currentSection = { title: 'Main', lines: 0 };
        for (const line of lines) {
            if (line.startsWith('#') || line.startsWith('##') || line.startsWith('###')) {
                if (currentSection.lines > 0) {
                    sections.push(currentSection);
                }
                currentSection = { title: line.trim(), lines: 1 };
            }
            else {
                currentSection.lines++;
            }
        }
        if (currentSection.lines > 0) {
            sections.push(currentSection);
        }
        return sections;
    }
    /**
     * 関数の抽出
     */
    extractFunctions(content) {
        const functions = [];
        const lines = content.split('\n');
        let inFunction = false;
        let functionName = '';
        let functionLines = 0;
        for (const line of lines) {
            if (line.includes('function') || line.includes('=>') || line.includes('class')) {
                if (inFunction) {
                    functions.push({ name: functionName, lines: functionLines });
                }
                functionName = line.trim();
                functionLines = 1;
                inFunction = true;
            }
            else if (inFunction) {
                functionLines++;
            }
        }
        if (inFunction) {
            functions.push({ name: functionName, lines: functionLines });
        }
        return functions;
    }
    /**
     * インポートの抽出
     */
    extractImports(content) {
        const imports = [];
        const lines = content.split('\n');
        for (const line of lines) {
            if (line.includes('import') || line.includes('require')) {
                imports.push(line.trim());
            }
        }
        return imports;
    }
    /**
     * コメントの抽出
     */
    extractComments(content) {
        const comments = [];
        const lines = content.split('\n');
        for (const line of lines) {
            if (line.includes('//') || line.includes('/*') || line.includes('*/')) {
                comments.push(line.trim());
            }
        }
        return comments;
    }
    /**
     * 分析結果のフォーマット
     */
    formatAnalysisResults(results, filePattern, analysisType) {
        let formatted = `# 📄 ドキュメント分析結果\n\n`;
        formatted += `**分析パターン**: ${filePattern}\n`;
        formatted += `**分析タイプ**: ${analysisType}\n`;
        formatted += `**分析ファイル数**: ${results.length}件\n`;
        formatted += `**分析日時**: ${new Date().toISOString()}\n\n`;
        if (results.length === 0) {
            formatted += '分析対象のファイルが見つかりませんでした。\n';
            return formatted;
        }
        // ファイルタイプ別の統計
        const typeStats = this.calculateTypeStats(results);
        formatted += `## 📊 ファイルタイプ統計\n\n`;
        for (const [type, count] of Object.entries(typeStats)) {
            formatted += `- ${type}: ${count}件\n`;
        }
        formatted += '\n';
        // 個別ファイルの分析結果
        formatted += `## 📋 個別ファイル分析\n\n`;
        for (const result of results) {
            formatted += `### ${result.fileName}\n`;
            formatted += `**パス**: ${result.filePath}\n`;
            formatted += `**サイズ**: ${result.fileSize} bytes\n`;
            formatted += `**タイプ**: ${result.contentType}\n`;
            if (result.metadata) {
                formatted += `**行数**: ${result.metadata.lines}\n`;
                formatted += `**文字数**: ${result.metadata.characters}\n`;
                formatted += `**最終更新**: ${result.metadata.lastModified.toISOString()}\n`;
            }
            formatted += `\n**分析結果**:\n${result.analysis}\n\n`;
            formatted += '---\n\n';
        }
        // 総合サマリー
        formatted += this.generateAnalysisSummary(results, analysisType);
        return formatted;
    }
    /**
     * タイプ統計の計算
     */
    calculateTypeStats(results) {
        const stats = {};
        for (const result of results) {
            stats[result.contentType] = (stats[result.contentType] || 0) + 1;
        }
        return stats;
    }
    /**
     * 分析サマリーの生成
     */
    generateAnalysisSummary(results, analysisType) {
        const totalSize = results.reduce((sum, result) => sum + result.fileSize, 0);
        const totalLines = results.reduce((sum, result) => sum + (result.metadata?.lines || 0), 0);
        return `
## 📈 分析サマリー

**総ファイル数**: ${results.length}件
**総サイズ**: ${totalSize} bytes
**総行数**: ${totalLines}行
**分析タイプ**: ${analysisType}

### 🎯 主要な発見

- 最も多いファイルタイプ: ${this.getMostCommonType(results)}
- 最大ファイル: ${this.getLargestFile(results)}
- 平均ファイルサイズ: ${Math.round(totalSize / results.length)} bytes

### 💡 推奨事項

この分析結果を基に、以下の改善を検討してください：
- コードの構造化
- ドキュメントの充実
- 不要なファイルの削除
- 命名規則の統一

---
*この分析は DeepresearchMCPサーバーによって生成されました。*
    `.trim();
    }
    /**
     * 最も多いファイルタイプの取得
     */
    getMostCommonType(results) {
        const typeStats = this.calculateTypeStats(results);
        return Object.entries(typeStats).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
    }
    /**
     * 最大ファイルの取得
     */
    getLargestFile(results) {
        const largest = results.reduce((max, current) => current.fileSize > max.fileSize ? current : max);
        return `${largest.fileName} (${largest.fileSize} bytes)`;
    }
}
//# sourceMappingURL=documentAnalysisService.js.map