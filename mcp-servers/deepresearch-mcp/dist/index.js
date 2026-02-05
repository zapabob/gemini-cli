#!/usr/bin/env node
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { DeepResearchService } from './services/deepResearchService.js';
import { WebSearchService } from './services/webSearchService.js';
import { DocumentAnalysisService } from './services/documentAnalysisService.js';
import { ResearchReportService } from './services/researchReportService.js';
import { AdvancedResearchProtocolService } from './services/advancedResearchProtocolService.js';
import { Logger } from './utils/logger.js';
/**
 * DeepresearchMCPサーバー
 * Cursor IDEで使用するための深層研究機能を提供
 */
class DeepresearchMCPServer {
    server;
    deepResearchService;
    webSearchService;
    documentAnalysisService;
    researchReportService;
    advancedResearchProtocolService;
    logger;
    constructor() {
        this.logger = new Logger();
        this.server = new Server({
            name: 'deepresearch-mcp-server',
            version: '1.0.0',
        });
        // サービスの初期化
        this.deepResearchService = new DeepResearchService(this.logger);
        this.webSearchService = new WebSearchService(this.logger);
        this.documentAnalysisService = new DocumentAnalysisService(this.logger);
        this.researchReportService = new ResearchReportService(this.logger);
        this.advancedResearchProtocolService = new AdvancedResearchProtocolService(this.logger);
        this.setupToolHandlers();
        this.setupErrorHandling();
    }
    /**
     * ツールハンドラーの設定
     */
    setupToolHandlers() {
        // 深層研究ツール
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'deep_research',
                        description: 'Perform comprehensive deep research on a given topic with multi-level analysis',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                query: {
                                    type: 'string',
                                    description: 'The research query to investigate deeply',
                                },
                                max_depth: {
                                    type: 'number',
                                    description: 'Maximum depth of research (default: 3)',
                                    default: 3,
                                },
                                max_sources: {
                                    type: 'number',
                                    description: 'Maximum number of sources to analyze (default: 10)',
                                    default: 10,
                                },
                                strategy: {
                                    type: 'string',
                                    enum: ['comprehensive', 'focused', 'exploratory'],
                                    description: 'Research strategy to use',
                                    default: 'comprehensive',
                                },
                                include_academic: {
                                    type: 'boolean',
                                    description: 'Include academic sources in research',
                                    default: true,
                                },
                                recent_years: {
                                    type: 'number',
                                    description: 'Include recent sources within specified years',
                                    default: 5,
                                },
                                focus_domains: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: 'Specific domains to focus on',
                                },
                                exclude_types: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: 'Exclude certain types of sources',
                                },
                            },
                            required: ['query'],
                        },
                    },
                    {
                        name: 'advanced_research_protocol',
                        description: 'Execute advanced research protocol v2 (Robust) based on structured research methodology',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                query: {
                                    type: 'string',
                                    description: 'The research query to investigate using advanced protocol',
                                },
                                max_depth: {
                                    type: 'number',
                                    description: 'Maximum depth of research (default: 3)',
                                    default: 3,
                                },
                                max_sources: {
                                    type: 'number',
                                    description: 'Maximum number of sources to analyze (default: 10)',
                                    default: 10,
                                },
                                strategy: {
                                    type: 'string',
                                    enum: ['comprehensive', 'focused', 'exploratory'],
                                    description: 'Research strategy to use',
                                    default: 'comprehensive',
                                },
                                include_academic: {
                                    type: 'boolean',
                                    description: 'Include academic sources in research',
                                    default: true,
                                },
                                recent_years: {
                                    type: 'number',
                                    description: 'Include recent sources within specified years',
                                    default: 5,
                                },
                                focus_domains: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: 'Specific domains to focus on',
                                },
                                exclude_types: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: 'Exclude certain types of sources',
                                },
                                enable_planning: {
                                    type: 'boolean',
                                    description: 'Enable research planning phase',
                                    default: true,
                                },
                                enable_structured_output: {
                                    type: 'boolean',
                                    description: 'Enable structured output format',
                                    default: true,
                                },
                                enable_evidence_tracking: {
                                    type: 'boolean',
                                    description: 'Enable evidence tracking',
                                    default: true,
                                },
                                enable_objective_analysis: {
                                    type: 'boolean',
                                    description: 'Enable objective analysis',
                                    default: true,
                                },
                                enable_dialogue_confirmation: {
                                    type: 'boolean',
                                    description: 'Enable dialogue confirmation',
                                    default: true,
                                },
                                enable_exception_handling: {
                                    type: 'boolean',
                                    description: 'Enable exception handling',
                                    default: true,
                                },
                            },
                            required: ['query'],
                        },
                    },
                    {
                        name: 'web_search',
                        description: 'Search the web for current information on a topic',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                query: {
                                    type: 'string',
                                    description: 'Search query',
                                },
                                max_results: {
                                    type: 'number',
                                    description: 'Maximum number of results to return',
                                    default: 10,
                                },
                                include_summary: {
                                    type: 'boolean',
                                    description: 'Include AI-generated summary of results',
                                    default: true,
                                },
                            },
                            required: ['query'],
                        },
                    },
                    {
                        name: 'analyze_documents',
                        description: 'Analyze documents in the workspace for research insights',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                file_pattern: {
                                    type: 'string',
                                    description: 'File pattern to analyze (e.g., "*.md", "src/**/*.ts")',
                                    default: '**/*',
                                },
                                analysis_type: {
                                    type: 'string',
                                    enum: ['content', 'structure', 'code', 'comprehensive'],
                                    description: 'Type of analysis to perform',
                                    default: 'comprehensive',
                                },
                                include_metadata: {
                                    type: 'boolean',
                                    description: 'Include file metadata in analysis',
                                    default: true,
                                },
                            },
                        },
                    },
                    {
                        name: 'generate_research_report',
                        description: 'Generate a comprehensive research report from collected data',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                topic: {
                                    type: 'string',
                                    description: 'Main research topic',
                                },
                                sources: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: 'List of sources to include in report',
                                },
                                report_type: {
                                    type: 'string',
                                    enum: ['academic', 'business', 'technical', 'comprehensive'],
                                    description: 'Type of report to generate',
                                    default: 'comprehensive',
                                },
                                include_citations: {
                                    type: 'boolean',
                                    description: 'Include citations in the report',
                                    default: true,
                                },
                                output_format: {
                                    type: 'string',
                                    enum: ['markdown', 'html', 'pdf'],
                                    description: 'Output format for the report',
                                    default: 'markdown',
                                },
                            },
                            required: ['topic'],
                        },
                    },
                ],
            };
        });
        // ツール実行ハンドラー
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                this.logger.info(`Executing tool: ${name}`, { args });
                switch (name) {
                    case 'deep_research':
                        return await this.deepResearchService.execute(args);
                    case 'advanced_research_protocol':
                        return await this.advancedResearchProtocolService.execute(args);
                    case 'web_search':
                        return await this.webSearchService.execute(args);
                    case 'analyze_documents':
                        return await this.documentAnalysisService.execute(args);
                    case 'generate_research_report':
                        return await this.researchReportService.execute(args);
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            }
            catch (error) {
                this.logger.error(`Error executing tool ${name}:`, error);
                throw error;
            }
        });
    }
    /**
     * エラーハンドリングの設定
     */
    setupErrorHandling() {
        process.on('uncaughtException', (error) => {
            this.logger.error('Uncaught Exception:', error);
            process.exit(1);
        });
        process.on('unhandledRejection', (reason, promise) => {
            this.logger.error('Unhandled Rejection at:', promise);
            this.logger.error('Reason:', reason);
            process.exit(1);
        });
    }
    /**
     * サーバーの開始
     */
    async start() {
        try {
            this.logger.info('🚀 DeepresearchMCPサーバーを開始中...');
            const transport = new StdioServerTransport();
            await this.server.connect(transport);
            this.logger.info('✅ DeepresearchMCPサーバーが正常に開始されました');
            this.logger.info('📋 利用可能なツール:');
            this.logger.info('  - deep_research: 深層研究機能');
            this.logger.info('  - web_search: Web検索機能');
            this.logger.info('  - analyze_documents: ドキュメント分析機能');
            this.logger.info('  - generate_research_report: 研究レポート生成機能');
        }
        catch (error) {
            this.logger.error('❌ サーバー開始エラー:', error);
            process.exit(1);
        }
    }
}
// サーバーの開始
const server = new DeepresearchMCPServer();
server.start().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map