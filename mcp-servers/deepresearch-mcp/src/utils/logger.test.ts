/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger } from './logger.js';

// Mock console.log
const mockConsoleLog = vi.fn();
const originalConsoleLog = console.log;

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    console.log = mockConsoleLog;
    logger = new Logger('info', true, false);
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create logger with default settings', () => {
      const defaultLogger = new Logger();
      const stats = defaultLogger.getStats();
      
      expect(stats.logLevel).toBe('info');
      expect(stats.consoleEnabled).toBe(true);
      expect(stats.fileEnabled).toBe(false);
    });

    it('should create logger with custom settings', () => {
      const customLogger = new Logger('debug', false, true, 'test.log');
      const stats = customLogger.getStats();
      
      expect(stats.logLevel).toBe('debug');
      expect(stats.consoleEnabled).toBe(false);
      expect(stats.fileEnabled).toBe(true);
      expect(stats.logFile).toBe('test.log');
    });
  });

  describe('log levels', () => {
    it('should log debug messages when level is debug', () => {
      const debugLogger = new Logger('debug');
      debugLogger.debug('Debug message');
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG] Debug message')
      );
    });

    it('should log info messages', () => {
      logger.info('Info message');
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] Info message')
      );
    });

    it('should log warn messages', () => {
      logger.warn('Warning message');
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[WARN] Warning message')
      );
    });

    it('should log error messages', () => {
      logger.error('Error message');
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] Error message')
      );
    });

    it('should not log debug messages when level is info', () => {
      logger.debug('Debug message');
      
      expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    it('should not log info messages when level is warn', () => {
      const warnLogger = new Logger('warn');
      warnLogger.info('Info message');
      
      expect(mockConsoleLog).not.toHaveBeenCalled();
    });
  });

  describe('log data', () => {
    it('should include data in log messages', () => {
      const testData = { key: 'value', number: 42 };
      logger.info('Message with data', testData);
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] Message with data')
      );
    });

    it('should handle string data', () => {
      logger.info('Message with string data', 'test string');
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] Message with string data')
      );
    });

    it('should handle undefined data', () => {
      logger.info('Message with undefined data', undefined);
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] Message with undefined data')
      );
    });
  });

  describe('configuration methods', () => {
    it('should set log level', () => {
      logger.setLogLevel('debug');
      const stats = logger.getStats();
      
      expect(stats.logLevel).toBe('debug');
    });

    it('should set console output', () => {
      logger.setConsoleOutput(false);
      const stats = logger.getStats();
      
      expect(stats.consoleEnabled).toBe(false);
    });

    it('should set file output', () => {
      logger.setFileOutput(true, 'test.log');
      const stats = logger.getStats();
      
      expect(stats.fileEnabled).toBe(true);
      expect(stats.logFile).toBe('test.log');
    });
  });

  describe('getStats', () => {
    it('should return correct stats', () => {
      const stats = logger.getStats();
      
      expect(stats).toEqual({
        logLevel: 'info',
        consoleEnabled: true,
        fileEnabled: false,
        logFile: undefined
      });
    });

    it('should return updated stats after configuration changes', () => {
      logger.setLogLevel('error');
      logger.setConsoleOutput(false);
      logger.setFileOutput(true, 'custom.log');
      
      const stats = logger.getStats();
      
      expect(stats).toEqual({
        logLevel: 'error',
        consoleEnabled: false,
        fileEnabled: true,
        logFile: 'custom.log'
      });
    });
  });

  describe('log formatting', () => {
    it('should format log entries with timestamp', () => {
      logger.info('Test message');
      
      const logCall = mockConsoleLog.mock.calls[0][0];
      expect(logCall).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
      expect(logCall).toContain('[INFO] Test message');
    });

    it('should format log entries with data', () => {
      const testData = { test: 'value' };
      logger.info('Test message', testData);
      
      const logCall = mockConsoleLog.mock.calls[0][0];
      expect(logCall).toContain('[INFO] Test message');
      expect(logCall).toContain('"test": "value"');
    });
  });

  describe('error handling', () => {
    it('should handle data serialization errors', () => {
      const circularData: any = {};
      circularData.self = circularData;
      
      logger.info('Message with circular data', circularData);
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] Message with circular data')
      );
    });
  });
}); 