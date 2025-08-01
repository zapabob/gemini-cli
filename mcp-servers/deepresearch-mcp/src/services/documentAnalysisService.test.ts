/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentAnalysisService } from './documentAnalysisService.js';
import { Logger } from '../utils/logger.js';

// Mock fs-extra
vi.mock('fs-extra', () => ({
  default: {
    stat: vi.fn().mockResolvedValue({
      size: 1024,
      mtime: new Date('2025-07-31T13:00:00Z')
    }),
    readFile: vi.fn().mockResolvedValue('Test file content\n# Test Header\nfunction test() {\n  return true;\n}')
  }
}));

// Mock path
vi.mock('path', () => ({
  default: {
    basename: vi.fn().mockReturnValue('test.ts'),
    extname: vi.fn().mockReturnValue('.ts')
  }
}));

// Mock glob
vi.mock('glob', () => ({
  default: {
    glob: vi.fn().mockResolvedValue(['test1.ts', 'test2.md', 'test3.json'])
  }
}));

describe('DocumentAnalysisService', () => {
  let service: DocumentAnalysisService;
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

    service = new DocumentAnalysisService(mockLogger);
  });

  describe('execute', () => {
    it('should execute document analysis successfully', async () => {
      const params = {
        file_pattern: '**/*.ts',
        analysis_type: 'comprehensive' as const,
        include_metadata: true
      };

      const result = await service.execute(params);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('ドキュメント分析結果');
      expect(mockLogger.info).toHaveBeenCalledWith('📄 ドキュメント分析を開始:', expect.any(Object));
      expect(mockLogger.info).toHaveBeenCalledWith('✅ ドキュメント分析完了:', expect.any(Object));
    });

    it('should handle errors gracefully', async () => {
      const params = {
        file_pattern: 'invalid-pattern',
        analysis_type: 'content' as const
      };

      // Mock an error
      vi.mocked(mockLogger.error).mockImplementation(() => {
        throw new Error('Test error');
      });

      await expect(service.execute(params)).rejects.toThrow('Test error');
    });

    it('should use default parameters when not provided', async () => {
      const params = {
        file_pattern: '**/*'
      };

      const result = await service.execute(params);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should handle different analysis types', async () => {
      const analysisTypes = ['content', 'structure', 'code', 'comprehensive'] as const;
      
      for (const analysisType of analysisTypes) {
        const params = {
          file_pattern: '**/*.ts',
          analysis_type: analysisType
        };

        const result = await service.execute(params);
        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
      }
    });
  });

  describe('file analysis', () => {
    it('should analyze file content correctly', async () => {
      const params = {
        file_pattern: '**/*.ts',
        analysis_type: 'content' as const
      };

      const result = await service.execute(params);
      const text = result.content[0].text;

      expect(text).toContain('コンテンツ分析');
      expect(text).toContain('統計情報');
      expect(text).toContain('主要な内容');
    });

    it('should analyze file structure correctly', async () => {
      const params = {
        file_pattern: '**/*.ts',
        analysis_type: 'structure' as const
      };

      const result = await service.execute(params);
      const text = result.content[0].text;

      expect(text).toContain('構造分析');
      expect(text).toContain('構造情報');
      expect(text).toContain('セクション構成');
    });

    it('should analyze code correctly', async () => {
      const params = {
        file_pattern: '**/*.ts',
        analysis_type: 'code' as const
      };

      const result = await service.execute(params);
      const text = result.content[0].text;

      expect(text).toContain('コード分析');
      expect(text).toContain('コード統計');
      expect(text).toContain('関数一覧');
    });

    it('should perform comprehensive analysis', async () => {
      const params = {
        file_pattern: '**/*.ts',
        analysis_type: 'comprehensive' as const
      };

      const result = await service.execute(params);
      const text = result.content[0].text;

      expect(text).toContain('包括的分析');
      expect(text).toContain('コンテンツ分析');
      expect(text).toContain('構造分析');
      expect(text).toContain('コード分析');
      expect(text).toContain('総合評価');
    });
  });

  describe('metadata handling', () => {
    it('should include metadata when requested', async () => {
      const params = {
        file_pattern: '**/*.ts',
        include_metadata: true
      };

      const result = await service.execute(params);
      const text = result.content[0].text;

      expect(text).toContain('行数');
      expect(text).toContain('文字数');
      expect(text).toContain('最終更新');
    });

    it('should exclude metadata when not requested', async () => {
      const params = {
        file_pattern: '**/*.ts',
        include_metadata: false
      };

      const result = await service.execute(params);
      const text = result.content[0].text;

      // Should not contain metadata fields
      expect(text).not.toContain('行数:');
      expect(text).not.toContain('文字数:');
      expect(text).not.toContain('最終更新:');
    });
  });
}); 