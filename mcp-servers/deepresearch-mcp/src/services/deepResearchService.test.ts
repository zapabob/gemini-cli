/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeepResearchService } from './deepResearchService.js';
import { Logger } from '../utils/logger.js';

// Mock the Google AI module
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: Promise.resolve({
          text: () => 'Mock research result'
        })
      })
    })
  }))
}));

// Mock fs-extra
vi.mock('fs-extra', () => ({
  default: {
    ensureDir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined)
  }
}));

// Mock path
vi.mock('path', () => ({
  default: {
    join: vi.fn().mockReturnValue('/mock/path'),
    extname: vi.fn().mockReturnValue('.md')
  }
}));

describe('DeepResearchService', () => {
  let service: DeepResearchService;
  let mockLogger: Logger;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      setLogLevel: vi.fn(),
      setConsoleOutput: vi.fn(),
      setFileOutput: vi.fn(),
      getStats: vi.fn().mockReturnValue({
        logLevel: 'info',
        consoleEnabled: true,
        fileEnabled: false
      })
    } as unknown as Logger;

    service = new DeepResearchService(mockLogger);
  });

  describe('execute', () => {
    it('should execute deep research successfully', async () => {
      const params = {
        query: 'AI技術の最新動向',
        max_depth: 2,
        max_sources: 5,
        strategy: 'comprehensive' as const
      };

      const result = await service.execute(params);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('深層研究結果');
      expect(mockLogger.info).toHaveBeenCalledWith('🔍 深層研究を開始:', expect.any(Object));
      expect(mockLogger.info).toHaveBeenCalledWith('✅ 深層研究完了:', expect.any(Object));
    });

    it('should handle errors gracefully', async () => {
      const params = {
        query: 'Invalid query',
        max_depth: 1,
        max_sources: 1
      };

      // Mock an error
      vi.mocked(mockLogger.error).mockImplementation(() => {
        throw new Error('Test error');
      });

      await expect(service.execute(params)).rejects.toThrow('Test error');
    });

    it('should use default parameters when not provided', async () => {
      const params = {
        query: 'Default test query'
      };

      const result = await service.execute(params);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe('parameter validation', () => {
    it('should handle different strategy types', async () => {
      const strategies = ['comprehensive', 'focused', 'exploratory'] as const;
      
      for (const strategy of strategies) {
        const params = {
          query: `Test query with ${strategy} strategy`,
          strategy
        };

        const result = await service.execute(params);
        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
      }
    });

    it('should handle different depth and source limits', async () => {
      const params = {
        query: 'Test query with limits',
        max_depth: 1,
        max_sources: 3
      };

      const result = await service.execute(params);
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });
}); 