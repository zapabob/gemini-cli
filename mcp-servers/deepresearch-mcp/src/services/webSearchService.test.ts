/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebSearchService } from './webSearchService.js';
import { Logger } from '../utils/logger.js';

// Mock node-fetch
vi.mock('node-fetch', () => ({
  default: vi.fn().mockResolvedValue({
    text: vi.fn().mockResolvedValue('<html><title>Test Title</title><body>Test content</body></html>'),
    ok: true,
    status: 200
  })
}));

// Mock cheerio
vi.mock('cheerio', () => ({
  default: {
    load: vi.fn().mockReturnValue({
      text: vi.fn().mockReturnValue('Test content'),
      html: vi.fn().mockReturnValue('<html>Test</html>'),
      find: vi.fn().mockReturnValue({
        text: vi.fn().mockReturnValue('Test Title'),
        first: vi.fn().mockReturnValue({
          text: vi.fn().mockReturnValue('Test Title')
        })
      }),
      $: vi.fn().mockReturnValue({
        text: vi.fn().mockReturnValue('Test Title'),
        attr: vi.fn().mockReturnValue('Test description')
      })
    })
  }
}));

describe('WebSearchService', () => {
  let service: WebSearchService;
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

    service = new WebSearchService(mockLogger);
  });

  describe('execute', () => {
    it('should execute web search successfully', async () => {
      const params = {
        query: 'AI技術の最新動向',
        max_results: 5,
        include_summary: true
      };

      const result = await service.execute(params);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Web検索結果');
      expect(mockLogger.info).toHaveBeenCalledWith('🌐 Web検索を開始:', expect.any(Object));
      expect(mockLogger.info).toHaveBeenCalledWith('✅ Web検索完了:', expect.any(Object));
    });

    it('should handle errors gracefully', async () => {
      const params = {
        query: 'Invalid query',
        max_results: 1
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

    it('should handle different result limits', async () => {
      const params = {
        query: 'Test query with limits',
        max_results: 3,
        include_summary: false
      };

      const result = await service.execute(params);
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });

  describe('search result formatting', () => {
    it('should format search results correctly', async () => {
      const params = {
        query: 'Test query',
        max_results: 2,
        include_summary: true
      };

      const result = await service.execute(params);
      const text = result.content[0].text;

      expect(text).toContain('Web検索結果');
      expect(text).toContain('検索結果');
      expect(text).toContain('検索サマリー');
    });

    it('should handle empty search results', async () => {
      // Mock empty results
      vi.mocked(service['performWebSearch']).mockResolvedValue([]);

      const params = {
        query: 'Empty results query',
        max_results: 5
      };

      const result = await service.execute(params);
      const text = result.content[0].text;

      expect(text).toContain('検索結果が見つかりませんでした');
    });
  });
}); 