/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the MCP SDK
vi.mock('@modelcontextprotocol/sdk/server/index.js', () => ({
  Server: vi.fn().mockImplementation(() => ({
    setRequestHandler: vi.fn(),
    connect: vi.fn().mockResolvedValue(undefined)
  }))
}));

vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: vi.fn().mockImplementation(() => ({}))
}));

vi.mock('@modelcontextprotocol/sdk/types.js', () => ({
  CallToolRequestSchema: 'CallToolRequestSchema',
  ListToolsRequestSchema: 'ListToolsRequestSchema',
  Tool: 'Tool'
}));

// Mock services
vi.mock('./services/deepResearchService.js', () => ({
  DeepResearchService: vi.fn().mockImplementation(() => ({
    execute: vi.fn().mockResolvedValue({
      content: [{ type: 'text', text: 'Mock deep research result' }]
    })
  }))
}));

vi.mock('./services/webSearchService.js', () => ({
  WebSearchService: vi.fn().mockImplementation(() => ({
    execute: vi.fn().mockResolvedValue({
      content: [{ type: 'text', text: 'Mock web search result' }]
    })
  }))
}));

vi.mock('./services/documentAnalysisService.js', () => ({
  DocumentAnalysisService: vi.fn().mockImplementation(() => ({
    execute: vi.fn().mockResolvedValue({
      content: [{ type: 'text', text: 'Mock document analysis result' }]
    })
  }))
}));

vi.mock('./services/researchReportService.js', () => ({
  ResearchReportService: vi.fn().mockImplementation(() => ({
    execute: vi.fn().mockResolvedValue({
      content: [{ type: 'text', text: 'Mock research report result' }]
    })
  }))
}));

vi.mock('./utils/logger.js', () => ({
  Logger: vi.fn().mockImplementation(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }))
}));

describe('DeepresearchMCPServer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('server initialization', () => {
    it('should create server with correct configuration', async () => {
      const { Server } = await import('@modelcontextprotocol/sdk/server/index.js');
      
      expect(Server).toHaveBeenCalledWith({
        name: 'deepresearch-mcp-server',
        version: '1.0.0'
      });
    });

    it('should initialize all services', async () => {
      const { DeepResearchService } = await import('./services/deepResearchService.js');
      const { WebSearchService } = await import('./services/webSearchService.js');
      const { DocumentAnalysisService } = await import('./services/documentAnalysisService.js');
      const { ResearchReportService } = await import('./services/researchReportService.js');
      
      expect(DeepResearchService).toHaveBeenCalled();
      expect(WebSearchService).toHaveBeenCalled();
      expect(DocumentAnalysisService).toHaveBeenCalled();
      expect(ResearchReportService).toHaveBeenCalled();
    });
  });

  describe('tool registration', () => {
    it('should register all required tools', async () => {
      const { Server } = await import('@modelcontextprotocol/sdk/server/index.js');
      const mockServer = (Server as any).mock.results[0].value;
      const setRequestHandler = mockServer.setRequestHandler;
      
      expect(setRequestHandler).toHaveBeenCalledWith('ListToolsRequestSchema', expect.any(Function));
      expect(setRequestHandler).toHaveBeenCalledWith('CallToolRequestSchema', expect.any(Function));
    });

    it('should return correct tool list', async () => {
      const { Server } = await import('@modelcontextprotocol/sdk/server/index.js');
      const mockServer = (Server as any).mock.results[0].value;
      const setRequestHandler = mockServer.setRequestHandler;
      
      // Get the ListToolsRequestSchema handler
      const listToolsHandler = setRequestHandler.mock.calls.find(
        (call: any) => call[0] === 'ListToolsRequestSchema'
      )?.[1];
      
      if (listToolsHandler) {
        const result = await listToolsHandler();
        expect(result.tools).toHaveLength(4);
        expect(result.tools.map((tool: any) => tool.name)).toEqual([
          'deep_research',
          'web_search',
          'analyze_documents',
          'generate_research_report'
        ]);
      }
    });
  });

  describe('tool execution', () => {
    it('should execute deep_research tool', async () => {
      const { Server } = await import('@modelcontextprotocol/sdk/server/index.js');
      const mockServer = (Server as any).mock.results[0].value;
      const setRequestHandler = mockServer.setRequestHandler;
      
      // Get the CallToolRequestSchema handler
      const callToolHandler = setRequestHandler.mock.calls.find(
        (call: any) => call[0] === 'CallToolRequestSchema'
      )?.[1];
      
      if (callToolHandler) {
        const request = {
          params: {
            name: 'deep_research',
            arguments: {
              query: 'Test query',
              max_depth: 2,
              max_sources: 5
            }
          }
        };
        
        const result = await callToolHandler(request);
        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
      }
    });

    it('should execute web_search tool', async () => {
      const { Server } = await import('@modelcontextprotocol/sdk/server/index.js');
      const mockServer = (Server as any).mock.results[0].value;
      const setRequestHandler = mockServer.setRequestHandler;
      
      const callToolHandler = setRequestHandler.mock.calls.find(
        (call: any) => call[0] === 'CallToolRequestSchema'
      )?.[1];
      
      if (callToolHandler) {
        const request = {
          params: {
            name: 'web_search',
            arguments: {
              query: 'Test search query',
              max_results: 10
            }
          }
        };
        
        const result = await callToolHandler(request);
        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
      }
    });

    it('should execute analyze_documents tool', async () => {
      const { Server } = await import('@modelcontextprotocol/sdk/server/index.js');
      const mockServer = (Server as any).mock.results[0].value;
      const setRequestHandler = mockServer.setRequestHandler;
      
      const callToolHandler = setRequestHandler.mock.calls.find(
        (call: any) => call[0] === 'CallToolRequestSchema'
      )?.[1];
      
      if (callToolHandler) {
        const request = {
          params: {
            name: 'analyze_documents',
            arguments: {
              file_pattern: '**/*.ts',
              analysis_type: 'comprehensive'
            }
          }
        };
        
        const result = await callToolHandler(request);
        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
      }
    });

    it('should execute generate_research_report tool', async () => {
      const { Server } = await import('@modelcontextprotocol/sdk/server/index.js');
      const mockServer = (Server as any).mock.results[0].value;
      const setRequestHandler = mockServer.setRequestHandler;
      
      const callToolHandler = setRequestHandler.mock.calls.find(
        (call: any) => call[0] === 'CallToolRequestSchema'
      )?.[1];
      
      if (callToolHandler) {
        const request = {
          params: {
            name: 'generate_research_report',
            arguments: {
              topic: 'Test topic',
              report_type: 'comprehensive'
            }
          }
        };
        
        const result = await callToolHandler(request);
        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
      }
    });

    it('should handle unknown tool error', async () => {
      const { Server } = await import('@modelcontextprotocol/sdk/server/index.js');
      const mockServer = (Server as any).mock.results[0].value;
      const setRequestHandler = mockServer.setRequestHandler;
      
      const callToolHandler = setRequestHandler.mock.calls.find(
        (call: any) => call[0] === 'CallToolRequestSchema'
      )?.[1];
      
      if (callToolHandler) {
        const request = {
          params: {
            name: 'unknown_tool',
            arguments: {}
          }
        };
        
        await expect(callToolHandler(request)).rejects.toThrow('Unknown tool: unknown_tool');
      }
    });
  });

  describe('error handling', () => {
    it('should handle uncaught exceptions', () => {
      const processSpy = vi.spyOn(process, 'on');
      
      // Import the module to trigger the error handler setup
      require('./index.js');
      
      expect(processSpy).toHaveBeenCalledWith('uncaughtException', expect.any(Function));
      expect(processSpy).toHaveBeenCalledWith('unhandledRejection', expect.any(Function));
    });
  });
}); 