/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeepResearchTool, DeepResearchToolParams } from './deep-research.js';
import { Config } from '../config/config.js';
import { ToolConfirmationOutcome } from './tools.js';

// Mock the Gemini client
const mockGeminiClient = {
  generateContent: vi.fn(),
};

// Mock the Config
const mockConfig = {
  getGeminiClient: vi.fn(() => mockGeminiClient),
  getSessionId: vi.fn(() => 'test-session'),
} as unknown as Config;

describe('DeepResearchTool', () => {
  let deepResearchTool: DeepResearchTool;

  beforeEach(() => {
    deepResearchTool = new DeepResearchTool(mockConfig);
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create a DeepResearchTool with correct properties', () => {
      expect(deepResearchTool.name).toBe('deep_research');
      expect(deepResearchTool.displayName).toBe('Deep Research');
      expect(deepResearchTool.description).toContain('comprehensive research');
    });
  });

  describe('validateToolParams', () => {
    it('should validate correct parameters', () => {
      const params: DeepResearchToolParams = {
        query: 'test query',
        max_depth: 3,
        max_sources: 10,
        strategy: 'comprehensive',
      };

      const result = deepResearchTool.validateToolParams(params);
      expect(result).toBeNull();
    });

    it('should reject empty query', () => {
      const params: DeepResearchToolParams = {
        query: '',
      };

      const result = deepResearchTool.validateToolParams(params);
      expect(result).toContain('cannot be empty');
    });

    it('should reject whitespace-only query', () => {
      const params: DeepResearchToolParams = {
        query: '   ',
      };

      const result = deepResearchTool.validateToolParams(params);
      expect(result).toContain('cannot be empty');
    });
  });

  describe('shouldConfirmExecute', () => {
    it('should not require confirmation for simple queries', async () => {
      const params: DeepResearchToolParams = {
        query: 'simple query',
        max_depth: 2,
        max_sources: 5,
      };

      const result = await deepResearchTool.shouldConfirmExecute(params, new AbortController().signal);
      expect(result).toBe(false);
    });

    it('should require confirmation for complex queries', async () => {
      const params: DeepResearchToolParams = {
        query: 'a'.repeat(300), // Long query
        max_depth: 7,
        max_sources: 20,
      };

      const result = await deepResearchTool.shouldConfirmExecute(params, new AbortController().signal);
      expect(result).toBeTruthy();
      if (result && result.type === 'info') {
        expect(result.title).toBe('Deep Research Confirmation');
        expect(result.prompt).toContain('complex');
      }
    });
  });

  describe('execute', () => {
    it('should execute research with default parameters', async () => {
      const params: DeepResearchToolParams = {
        query: 'test research query',
      };

      // Mock successful response
      mockGeminiClient.generateContent.mockResolvedValue({
        response: {
          text: () => 'Research results for test query',
        },
        candidates: [{
          content: {
            parts: [{
              text: 'Research results for test query',
            }],
          },
        }],
      });

      const result = await deepResearchTool.execute(params, new AbortController().signal);

      expect(result.llmContent).toContain('Research results');
      expect(result.returnDisplay).toContain('Deep Research Results');
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.strategy_used).toBe('comprehensive');
    });

    it('should handle research errors gracefully', async () => {
      const params: DeepResearchToolParams = {
        query: 'test query',
      };

      // Mock error response
      mockGeminiClient.generateContent.mockRejectedValue(new Error('API Error'));

      const result = await deepResearchTool.execute(params, new AbortController().signal);

      expect(result.llmContent).toContain('Error during deep research');
      expect(result.returnDisplay).toContain('Deep Research Error');
    });

    it('should use custom parameters when provided', async () => {
      const params: DeepResearchToolParams = {
        query: 'custom research',
        max_depth: 5,
        max_sources: 15,
        strategy: 'focused',
        include_academic: false,
        recent_years: 3,
        focus_domains: ['example.com'],
        exclude_types: ['social_media'],
      };

      mockGeminiClient.generateContent.mockResolvedValue({
        response: {
          text: () => 'Custom research results',
        },
        candidates: [{
          content: {
            parts: [{
              text: 'Custom research results',
            }],
          },
        }],
      });

      const result = await deepResearchTool.execute(params, new AbortController().signal);

      expect(result.metadata?.strategy_used).toBe('focused');
      expect(result.metadata?.research_depth).toBe(3);
    });
  });

  describe('parameter validation', () => {
    it('should accept valid strategy values', () => {
      const validStrategies = ['comprehensive', 'focused', 'exploratory'] as const;
      
      validStrategies.forEach(strategy => {
        const params: DeepResearchToolParams = {
          query: 'test',
          strategy,
        };

        const result = deepResearchTool.validateToolParams(params);
        expect(result).toBeNull();
      });
    });

    it('should handle array parameters correctly', () => {
      const params: DeepResearchToolParams = {
        query: 'test',
        focus_domains: ['domain1.com', 'domain2.com'],
        exclude_types: ['type1', 'type2'],
      };

      const result = deepResearchTool.validateToolParams(params);
      expect(result).toBeNull();
    });
  });

  describe('research methodology', () => {
    it('should create appropriate research prompts', async () => {
      const params: DeepResearchToolParams = {
        query: 'AI research',
        strategy: 'comprehensive',
        include_academic: true,
        recent_years: 5,
      };

      mockGeminiClient.generateContent.mockResolvedValue({
        response: {
          text: () => 'Research findings',
        },
        candidates: [{
          content: {
            parts: [{
              text: 'Research findings',
            }],
          },
        }],
      });

      await deepResearchTool.execute(params, new AbortController().signal);

      // Verify that generateContent was called with appropriate parameters
      expect(mockGeminiClient.generateContent).toHaveBeenCalled();
      const callArgs = mockGeminiClient.generateContent.mock.calls[0];
      expect(callArgs[0]).toHaveLength(1); // Should have one message
      expect(callArgs[0][0].role).toBe('user');
      expect(callArgs[1].tools).toEqual([{ googleSearch: {} }]);
    });
  });
}); 