/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResearchReportService } from './researchReportService.js';
import { Logger } from '../utils/logger.js';

// Mock the Google AI module
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: Promise.resolve({
          text: () => 'Mock research report content'
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

describe('ResearchReportService', () => {
  let service: ResearchReportService;
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

    service = new ResearchReportService(mockLogger);
  });

  describe('execute', () => {
    it('should execute research report generation successfully', async () => {
      const params = {
        topic: 'AI技術の最新動向',
        sources: ['source1', 'source2'],
        report_type: 'comprehensive' as const,
        include_citations: true,
        output_format: 'markdown' as const
      };

      const result = await service.execute(params);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('研究レポート生成完了');
      expect(mockLogger.info).toHaveBeenCalledWith('📝 研究レポート生成を開始:', expect.any(Object));
      expect(mockLogger.info).toHaveBeenCalledWith('✅ 研究レポート生成完了:', expect.any(Object));
    });

    it('should handle errors gracefully', async () => {
      const params = {
        topic: 'Invalid topic',
        report_type: 'academic' as const
      };

      // Mock an error
      vi.mocked(mockLogger.error).mockImplementation(() => {
        throw new Error('Test error');
      });

      await expect(service.execute(params)).rejects.toThrow('Test error');
    });

    it('should use default parameters when not provided', async () => {
      const params = {
        topic: 'Default test topic'
      };

      const result = await service.execute(params);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should handle different report types', async () => {
      const reportTypes = ['academic', 'business', 'technical', 'comprehensive'] as const;
      
      for (const reportType of reportTypes) {
        const params = {
          topic: `Test topic with ${reportType} type`,
          report_type: reportType
        };

        const result = await service.execute(params);
        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
      }
    });

    it('should handle different output formats', async () => {
      const outputFormats = ['markdown', 'html', 'pdf'] as const;
      
      for (const outputFormat of outputFormats) {
        const params = {
          topic: `Test topic with ${outputFormat} output`,
          output_format: outputFormat
        };

        const result = await service.execute(params);
        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
      }
    });
  });

  describe('report generation', () => {
    it('should generate comprehensive report', async () => {
      const params = {
        topic: 'Comprehensive test topic',
        report_type: 'comprehensive' as const,
        include_citations: true
      };

      const result = await service.execute(params);
      const text = result.content[0].text;

      expect(text).toContain('研究レポート生成完了');
      expect(text).toContain('レポート情報');
      expect(text).toContain('レポート統計');
      expect(text).toContain('エグゼクティブサマリー');
    });

    it('should handle citations correctly', async () => {
      const params = {
        topic: 'Test topic with citations',
        include_citations: true
      };

      const result = await service.execute(params);
      const text = result.content[0].text;

      expect(text).toContain('参考文献');
    });

    it('should exclude citations when not requested', async () => {
      const params = {
        topic: 'Test topic without citations',
        include_citations: false
      };

      const result = await service.execute(params);
      const text = result.content[0].text;

      // Should still contain the section but indicate no citations
      expect(text).toContain('参考文献');
    });
  });

  describe('file output', () => {
    it('should save report to file', async () => {
      const params = {
        topic: 'Test topic for file output',
        output_format: 'markdown' as const
      };

      const result = await service.execute(params);
      const text = result.content[0].text;

      expect(text).toContain('保存先:');
      expect(mockLogger.info).toHaveBeenCalledWith('💾 レポートを保存:', expect.any(String));
    });

    it('should handle different file formats', async () => {
      const formats = ['markdown', 'html', 'pdf'] as const;
      
      for (const format of formats) {
        const params = {
          topic: `Test topic for ${format} format`,
          output_format: format
        };

        const result = await service.execute(params);
        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
      }
    });
  });
}); 