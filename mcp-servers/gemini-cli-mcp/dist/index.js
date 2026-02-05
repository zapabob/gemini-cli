#!/usr/bin/env node
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { SubagentRegistry, SubagentExecutor, YamlAgentLoader, LoadBalancerService, MainAgentInterface, GeminiClient, Config, ApprovalMode, } from '@google/gemini-cli-core';
class GeminiCLIMCPServer {
    server;
    geminiClient;
    subagentRegistry;
    subagentExecutor;
    loadBalancerService = null;
    mainAgent = null;
    constructor() {
        this.server = new Server({
            name: 'gemini-cli-mcp-server',
            version: '0.1.0',
        });
        // Initialize Gemini Client
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || '';
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY or GOOGLE_GENAI_API_KEY environment variable is required');
        }
        this.geminiClient = new GeminiClient({
            apiKey,
            baseUrl: process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta',
            defaultModel: process.env.GEMINI_MODEL || 'models/gemini-2.5-pro',
            defaultTemperature: 0.7,
            defaultMaxTokens: 4096,
        });
        // Initialize Subagent Registry and Executor
        this.subagentRegistry = SubagentRegistry.getInstance();
        this.subagentExecutor = new SubagentExecutor({
            maxConcurrent: 3,
            timeout: 300000,
        });
        // Initialize Load Balancer Service if configured
        try {
            this.loadBalancerService = new LoadBalancerService();
        }
        catch (error) {
            console.warn('LoadBalancerService initialization failed:', error);
        }
        this.setupHandlers();
    }
    setupHandlers() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'list_subagents',
                    description: 'List all available subagents and their specialties',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            specialty: {
                                type: 'string',
                                description: 'Filter by specialty (optional)',
                                enum: [
                                    'code_review',
                                    'debugging',
                                    'data_analysis',
                                    'security_audit',
                                    'performance_optimization',
                                    'documentation',
                                    'testing',
                                    'architecture_design',
                                    'api_design',
                                ],
                            },
                        },
                    },
                },
                {
                    name: 'execute_subagent',
                    description: 'Execute a task using a specific subagent',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            agent_name: {
                                type: 'string',
                                description: 'Name of the subagent to execute',
                            },
                            task: {
                                type: 'string',
                                description: 'Task description to execute',
                            },
                            context: {
                                type: 'string',
                                description: 'Additional context for the task (optional)',
                            },
                        },
                        required: ['agent_name', 'task'],
                    },
                },
                {
                    name: 'execute_subagents_parallel',
                    description: 'Execute a task using multiple subagents in parallel',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            agent_names: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'List of subagent names to execute in parallel',
                            },
                            task: {
                                type: 'string',
                                description: 'Task description to execute',
                            },
                            max_concurrent: {
                                type: 'number',
                                description: 'Maximum number of concurrent executions (default: 3)',
                                default: 3,
                            },
                        },
                        required: ['agent_names', 'task'],
                    },
                },
                {
                    name: 'create_subagent',
                    description: 'Create a new subagent from a natural language description',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                                description: 'Name for the subagent',
                            },
                            specialty: {
                                type: 'string',
                                description: 'Specialty of the subagent',
                                enum: [
                                    'code_review',
                                    'debugging',
                                    'data_analysis',
                                    'security_audit',
                                    'performance_optimization',
                                    'documentation',
                                    'testing',
                                    'architecture_design',
                                    'api_design',
                                ],
                            },
                            description: {
                                type: 'string',
                                description: 'Description of what the subagent does',
                            },
                        },
                        required: ['name', 'specialty', 'description'],
                    },
                },
                {
                    name: 'deep_research',
                    description: 'Perform comprehensive multi-level research on a topic',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            query: {
                                type: 'string',
                                description: 'Research query or topic',
                            },
                            depth: {
                                type: 'number',
                                description: 'Research depth level (1-5, default: 3)',
                                default: 3,
                            },
                            max_sources: {
                                type: 'number',
                                description: 'Maximum number of sources to gather (default: 10)',
                                default: 10,
                            },
                            strategy: {
                                type: 'string',
                                description: 'Research strategy',
                                enum: ['comprehensive', 'focused', 'exploratory'],
                                default: 'focused',
                            },
                        },
                        required: ['query'],
                    },
                },
                {
                    name: 'loadbalancer_add_endpoint',
                    description: 'Add a new endpoint to the load balancer',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                                description: 'Name for the endpoint',
                            },
                            url: {
                                type: 'string',
                                description: 'Base URL of the endpoint',
                            },
                            api_key: {
                                type: 'string',
                                description: 'API key for the endpoint',
                            },
                            weight: {
                                type: 'number',
                                description: 'Weight for load balancing (default: 1)',
                                default: 1,
                            },
                        },
                        required: ['name', 'url', 'api_key'],
                    },
                },
                {
                    name: 'loadbalancer_list_endpoints',
                    description: 'List all configured load balancer endpoints',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                    },
                },
                {
                    name: 'supervisor_execute',
                    description: 'Execute a task using the supervisor with natural language processing and sub-agent coordination',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            prompt: {
                                type: 'string',
                                description: 'Natural language prompt describing the task',
                            },
                            mode: {
                                type: 'string',
                                description: 'Execution mode',
                                enum: ['auto', 'natural_language', 'autonomous', 'supervisor', 'manual'],
                                default: 'auto',
                            },
                            timeout: {
                                type: 'number',
                                description: 'Timeout in seconds (default: 300)',
                                default: 300,
                            },
                        },
                        required: ['prompt'],
                    },
                },
            ],
        }));
        // Handle tool execution
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case 'list_subagents': {
                        const specialty = args.specialty;
                        const agents = specialty
                            ? this.subagentRegistry.getSubagentsBySpecialty(specialty)
                            : this.subagentRegistry.getAllSubagents();
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        count: agents.length,
                                        agents: agents.map((agent) => ({
                                            name: agent.name,
                                            specialty: agent.specialty,
                                            description: agent.description,
                                            model: agent.model,
                                        })),
                                    }, null, 2),
                                },
                            ],
                        };
                    }
                    case 'execute_subagent': {
                        const agentName = args.agent_name;
                        const task = args.task;
                        const context = args.context || '';
                        const agent = this.subagentRegistry.getSubagent(agentName);
                        if (!agent) {
                            throw new Error(`Subagent "${agentName}" not found`);
                        }
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const result = await this.subagentExecutor.executeTask(agent, {
                            id: `mcp-${agentName}-${Date.now()}`,
                            task,
                            context,
                            priority: 'medium',
                            agentName: agent.name,
                        });
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        success: true,
                                        agent: agentName,
                                        executionTime: result.executionTime,
                                        result: result.result || result,
                                    }, null, 2),
                                },
                            ],
                        };
                    }
                    case 'execute_subagents_parallel': {
                        const agentNames = args.agent_names;
                        const task = args.task;
                        const maxConcurrent = args.max_concurrent || 3;
                        const agents = agentNames
                            .map((name) => this.subagentRegistry.getSubagent(name))
                            .filter((agent) => agent !== null);
                        if (agents.length === 0) {
                            throw new Error('No valid subagents found');
                        }
                        const executor = new SubagentExecutor({
                            maxConcurrent,
                            timeout: 300000,
                        });
                        const results = await Promise.all(agents.map(async (agent) => {
                            try {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const result = await executor.executeTask(agent, {
                                    id: `mcp-parallel-${agent.name}-${Date.now()}`,
                                    task,
                                    context: '',
                                    priority: 'medium',
                                    agentName: agent.name,
                                });
                                return {
                                    agent: agent.name,
                                    success: true,
                                    executionTime: result.executionTime,
                                    result: result.result || result,
                                };
                            }
                            catch (error) {
                                return {
                                    agent: agent.name,
                                    success: false,
                                    error: error instanceof Error ? error.message : String(error),
                                };
                            }
                        }));
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        success: true,
                                        task,
                                        results,
                                    }, null, 2),
                                },
                            ],
                        };
                    }
                    case 'create_subagent': {
                        const subagentName = args.name;
                        const specialty = args.specialty;
                        const description = args.description;
                        const loader = new YamlAgentLoader();
                        const filePath = await loader.createAgentDefinition(subagentName, specialty, description);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        success: true,
                                        message: 'Subagent created successfully',
                                        name: subagentName,
                                        specialty,
                                        configPath: filePath,
                                    }, null, 2),
                                },
                            ],
                        };
                    }
                    case 'deep_research': {
                        if (!this.mainAgent) {
                            // Initialize main agent for deep research
                            const config = new Config({
                                sessionId: `mcp-research-${Date.now()}`,
                                targetDir: process.cwd(),
                                cwd: process.cwd(),
                                debugMode: false,
                                model: 'models/gemini-2.5-pro',
                                fullContext: false,
                                approvalMode: ApprovalMode.DEFAULT,
                                showMemoryUsage: false,
                                accessibility: {},
                                telemetry: { enabled: false },
                                usageStatisticsEnabled: false,
                                fileFiltering: {
                                    respectGitIgnore: true,
                                    respectGeminiIgnore: true,
                                    enableRecursiveFileSearch: false,
                                },
                                checkpointing: false,
                                noBrowser: true,
                                ideMode: false,
                                maxSessionTurns: 100,
                                listExtensions: false,
                                extensions: [],
                                blockedMcpServers: [],
                                summarizeToolOutput: {},
                            });
                            const mainAgentConfig = {
                                geminiClient: this.geminiClient,
                                config,
                                enableAutonomousMode: true,
                                enableSupervisorMode: true,
                                enableNaturalLanguageProcessing: true,
                                maxConcurrentSubagents: 5,
                                autoAnalysisThreshold: 5,
                                decisionTimeout: 300000,
                                enableRealTimeCoordination: true,
                                enableCheckpointing: true,
                                researchOutputPath: './_docs',
                            };
                            this.mainAgent = new MainAgentInterface(mainAgentConfig);
                        }
                        const query = args.query;
                        const depth = args.depth || 3;
                        const maxSources = args.max_sources || 10;
                        const strategy = args.strategy || 'focused';
                        // Use the main agent's deep research capability
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const result = await this.mainAgent.deepResearch?.(query, {
                            depth,
                            maxSources,
                            strategy,
                        });
                        if (!result) {
                            // Fallback to simple research
                            return {
                                content: [
                                    {
                                        type: 'text',
                                        text: JSON.stringify({
                                            success: true,
                                            query,
                                            message: 'Deep research functionality is available. Please use the supervisor_execute tool for comprehensive research.',
                                        }, null, 2),
                                    },
                                ],
                            };
                        }
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(result, null, 2),
                                },
                            ],
                        };
                    }
                    case 'loadbalancer_add_endpoint': {
                        if (!this.loadBalancerService) {
                            throw new Error('LoadBalancerService is not available');
                        }
                        const endpointName = args.name;
                        const url = args.url;
                        const apiKey = args.api_key;
                        const weight = args.weight || 1;
                        // This would need to be implemented in LoadBalancerService
                        // For now, return a message
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        success: true,
                                        message: 'Load balancer endpoint added (implementation needed)',
                                        endpoint: {
                                            name: endpointName,
                                            url,
                                            weight,
                                        },
                                    }, null, 2),
                                },
                            ],
                        };
                    }
                    case 'loadbalancer_list_endpoints': {
                        if (!this.loadBalancerService) {
                            throw new Error('LoadBalancerService is not available');
                        }
                        // This would need to be implemented in LoadBalancerService
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        success: true,
                                        message: 'Load balancer endpoints list (implementation needed)',
                                        endpoints: [],
                                    }, null, 2),
                                },
                            ],
                        };
                    }
                    case 'supervisor_execute': {
                        if (!this.mainAgent) {
                            // Initialize main agent
                            const config = new Config({
                                sessionId: `mcp-supervisor-${Date.now()}`,
                                targetDir: process.cwd(),
                                cwd: process.cwd(),
                                debugMode: false,
                                model: 'models/gemini-2.5-pro',
                                fullContext: false,
                                approvalMode: ApprovalMode.DEFAULT,
                                showMemoryUsage: false,
                                accessibility: {},
                                telemetry: { enabled: false },
                                usageStatisticsEnabled: false,
                                fileFiltering: {
                                    respectGitIgnore: true,
                                    respectGeminiIgnore: true,
                                    enableRecursiveFileSearch: false,
                                },
                                checkpointing: false,
                                noBrowser: true,
                                ideMode: false,
                                maxSessionTurns: 100,
                                listExtensions: false,
                                extensions: [],
                                blockedMcpServers: [],
                                summarizeToolOutput: {},
                            });
                            const mainAgentConfig = {
                                geminiClient: this.geminiClient,
                                config,
                                enableAutonomousMode: true,
                                enableSupervisorMode: true,
                                enableNaturalLanguageProcessing: true,
                                maxConcurrentSubagents: 5,
                                autoAnalysisThreshold: 5,
                                decisionTimeout: args.timeout || 300,
                                enableRealTimeCoordination: true,
                                enableCheckpointing: true,
                                researchOutputPath: './_docs',
                            };
                            this.mainAgent = new MainAgentInterface(mainAgentConfig);
                        }
                        const prompt = args.prompt;
                        const mode = args.mode || 'auto';
                        const timeout = (args.timeout || 300) * 1000;
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const result = await this.mainAgent.executeTask(prompt, '', mode, { timeout });
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        success: true,
                                        prompt,
                                        mode,
                                        result: result.finalResult || result.result || result,
                                        collaborationMetrics: result.collaborationMetrics,
                                    }, null, 2),
                                },
                            ],
                        };
                    }
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: false,
                                error: error instanceof Error ? error.message : String(error),
                            }, null, 2),
                        },
                    ],
                    isError: true,
                };
            }
        });
    }
    async start() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Gemini CLI MCP Server started');
    }
}
new GeminiCLIMCPServer()
    .start()
    .catch((err) => {
    console.error('Failed to start Gemini CLI MCP Server:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map