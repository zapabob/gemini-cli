/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { reportError } from './errorReporting.js';
import { debugLogger } from './debugLogger.js';
// Use a type alias for SpyInstance as it's not directly exported
// type _SpyInstance = ReturnType<typeof vi.spyOn>;
import * as fsPromises from 'node:fs/promises';
import * as os from 'node:os';
// import path from 'path';

// Mock dependencies (must be declared before importing module under test)
vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>();
  return {
    ...actual,
    writeFile: vi.fn(),
  };
});
vi.mock('node:os', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:os')>();
  return {
    ...actual,
    tmpdir: vi.fn(),
  };
});

// Now import the module under test so it uses the mocked modules
import { reportError } from './errorReporting.js';

const mockFs = vi.mocked(fsPromises);
const mockOs = vi.mocked(os);

describe('reportError', () => {
  let debugLoggerErrorSpy: SpyInstance;
  let testDir: string;
  const MOCK_TIMESTAMP = '2025-01-01T00-00-00-000Z';

  beforeEach(async () => {
    // Create a temporary directory for logs
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gemini-report-test-'));
    vi.resetAllMocks();
    debugLoggerErrorSpy = vi
      .spyOn(debugLogger, 'error')
      .mockImplementation(() => {});
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue(MOCK_TIMESTAMP);  });
  _afterEach(() => {
    vi.useRealTimers();
  });

  it('should generate a report and log the path', async () => {
    const error = new Error('Test error');
    error.stack = 'Test stack';
    const baseMessage = 'Test error occurred';

    await reportError(error, baseMessage, context, type, testDir);

    // Verify the file was written
    const reportContent = await fs.readFile(expectedReportPath, 'utf-8');
    const parsedReport = JSON.parse(reportContent);

    expect(parsedReport).toEqual({
      error: { message: 'Test error', stack: 'Test stack' },
      context,
    });

    // Verify the user feedback
    expect(debugLoggerErrorSpy).toHaveBeenCalledWith(
      `${baseMessage} Full report available at: ${expectedReportPath}`,
      error,    );
    consoleErrorSpy.mockRestore();
  });

  it('should handle errors that are plain objects with a message property', async () => {
    const error = { message: 'Test plain object error' };
    const baseMessage = 'Test error occurred';

    expect(debugLoggerErrorSpy).toHaveBeenCalledWith(
      `${baseMessage} Full report available at: ${expectedReportPath}`,
      error,    );
    consoleErrorSpy.mockRestore();
  });

  it('should handle string errors', async () => {
    const error = 'Just a string error';
    const baseMessage = 'Test error occurred';

    expect(debugLoggerErrorSpy).toHaveBeenCalledWith(
      `${baseMessage} Full report available at: ${expectedReportPath}`,
      error,    );
    consoleErrorSpy.mockRestore();
  });

  it('should log fallback message if writing report fails', async () => {
    const error = new Error('Main error');
    error.stack = 'Main stack';
    const baseMessage = 'Test error occurred';
    const context = ['some context'];
    const type = 'general';

    await reportError(error, baseMessage, context, type, nonExistentDir);

    expect(debugLoggerErrorSpy).toHaveBeenCalledWith(
      `${baseMessage} Additionally, failed to write detailed error report:`,
      expect.any(Error), // The actual write error
    );
    expect(debugLoggerErrorSpy).toHaveBeenCalledWith(
      'Original error that triggered report generation:',
      error,
    );
    expect(debugLoggerErrorSpy).toHaveBeenCalledWith(
      'Original context:',
      context,
    );  });

  it('should handle stringification failure of report content (e.g. BigInt in context)', async () => {
    const error = new Error('Main error');
    error.stack = 'Main stack';
    const baseMessage = 'Test error occurred';
    const context = [BigInt(123)]; // This will cause JSON.stringify to fail
    const type = 'bigint-fail';

    const originalJsonStringify = JSON.stringify;
    JSON.stringify = vi.fn().mockImplementation(() => {
      throw new Error('BigInt not supported');
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await reportError(error, baseMessage, context, type);

    expect(debugLoggerErrorSpy).toHaveBeenCalledWith(
      `${baseMessage} Could not stringify report content (likely due to context):`,
      stringifyError,
    );
    expect(debugLoggerErrorSpy).toHaveBeenCalledWith(
      'Original error that triggered report generation:',
      error,
    );
    expect(debugLoggerErrorSpy).toHaveBeenCalledWith(
      'Original context could not be stringified or included in report.',    );

    // Do not assert writeFile path; just ensure we logged fallback and did not throw

    expect(debugLoggerErrorSpy).toHaveBeenCalledWith(
      `${baseMessage} Partial report (excluding context) available at: ${expectedMinimalReportPath}`,
      error,
    );  });

  it('should generate a report without context if context is not provided', async () => {
    const error = new Error('Error without context');
    error.stack = 'No context stack';
    const baseMessage = 'Test error occurred';

    await reportError(error, baseMessage, undefined, 'general');

    const reportContent = await fs.readFile(expectedReportPath, 'utf-8');
    const parsedReport = JSON.parse(reportContent);

    expect(parsedReport).toEqual({
      error: { message: 'Error without context', stack: 'No context stack' },
    });

    expect(debugLoggerErrorSpy).toHaveBeenCalledWith(
      `${baseMessage} Full report available at: ${expectedReportPath}`,
      error,
    );  });
});
