/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type MockInstance,
} from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { reportError } from './errorReporting.js';
import { debugLogger } from './debugLogger.js';

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

describe('reportError', () => {
  let debugLoggerErrorSpy: MockInstance;
  let testDir: string;
  const MOCK_TIMESTAMP = '2025-01-01T00-00-00-000Z';

  beforeEach(async () => {
    // Create a temporary directory for logs
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gemini-report-test-'));
    vi.resetAllMocks();
    vi.mocked(os.tmpdir).mockReturnValue(testDir);
    debugLoggerErrorSpy = vi
      .spyOn(debugLogger, 'error')
      .mockImplementation(() => {});
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue(MOCK_TIMESTAMP);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should generate a report and log the path', async () => {
    const error = new Error('Test error');
    error.stack = 'Test stack';
    const baseMessage = 'Test error occurred';
    const context = ['some context'];
    const type = 'general';
    const expectedReportPath = path.join(
      testDir,
      `gemini-client-error-${type}-${MOCK_TIMESTAMP.replace(/[:.]/g, '-')}.json`,
    );

    await reportError(error, baseMessage, context, type);

    // Verify the file was written
    expect(vi.mocked(fs.writeFile)).toHaveBeenCalledWith(
      expectedReportPath,
      expect.stringContaining('"message": "Test error"'),
    );

    // Verify the user feedback
    expect(debugLoggerErrorSpy).toHaveBeenCalledWith(
      `${baseMessage} Full report available at: ${expectedReportPath}`,
      error,
    );
  });

  it('should handle errors that are plain objects with a message property', async () => {
    const error = { message: 'Test plain object error' };
    const baseMessage = 'Test error occurred';
    const type = 'plain-object';
    const expectedReportPath = path.join(
      testDir,
      `gemini-client-error-${type}-${MOCK_TIMESTAMP.replace(/[:.]/g, '-')}.json`,
    );

    await reportError(error, baseMessage, undefined, type);

    expect(debugLoggerErrorSpy).toHaveBeenCalledWith(
      `${baseMessage} Full report available at: ${expectedReportPath}`,
      error,
    );
  });

  it('should handle string errors', async () => {
    const error = 'Just a string error';
    const baseMessage = 'Test error occurred';
    const type = 'string-error';
    const expectedReportPath = path.join(
      testDir,
      `gemini-client-error-${type}-${MOCK_TIMESTAMP.replace(/[:.]/g, '-')}.json`,
    );

    await reportError(error, baseMessage, undefined, type);

    expect(debugLoggerErrorSpy).toHaveBeenCalledWith(
      `${baseMessage} Full report available at: ${expectedReportPath}`,
      error,
    );
  });

  it('should log fallback message if writing report fails', async () => {
    const error = new Error('Main error');
    error.stack = 'Main stack';
    const baseMessage = 'Test error occurred';
    const context = ['some context'];
    const type = 'write-fail';

    vi.mocked(fs.writeFile).mockRejectedValueOnce(new Error('Write failed'));

    await reportError(error, baseMessage, context, type);

    expect(debugLoggerErrorSpy).toHaveBeenCalledWith(
      `${baseMessage} Additionally, failed to write detailed error report:`,
      expect.any(Error),
    );
    expect(debugLoggerErrorSpy).toHaveBeenCalledWith(
      'Original error that triggered report generation:',
      error,
    );
    expect(debugLoggerErrorSpy).toHaveBeenCalledWith(
      'Original context:',
      context,
    );
  });

  it('should handle stringification failure of report content (e.g. BigInt in context)', async () => {
    const error = new Error('Main error');
    error.stack = 'Main stack';
    const baseMessage = 'Test error occurred';
    const context = [BigInt(123)];
    const type = 'bigint-fail';
    const expectedMinimalReportPath = path.join(
      testDir,
      `gemini-client-error-${type}-${MOCK_TIMESTAMP.replace(/[:.]/g, '-')}.json`,
    );

    await reportError(error, baseMessage, context, type);

    expect(debugLoggerErrorSpy).toHaveBeenCalledWith(
      `${baseMessage} Could not stringify report content (likely due to context):`,
      expect.any(Error),
    );
    expect(debugLoggerErrorSpy).toHaveBeenCalledWith(
      'Original error that triggered report generation:',
      error,
    );
    expect(debugLoggerErrorSpy).toHaveBeenCalledWith(
      'Original context could not be stringified or included in report.',
    );

    expect(debugLoggerErrorSpy).toHaveBeenCalledWith(
      `${baseMessage} Partial report (excluding context) available at: ${expectedMinimalReportPath}`,
      error,
    );
  });

  it('should generate a report without context if context is not provided', async () => {
    const error = new Error('Error without context');
    error.stack = 'No context stack';
    const baseMessage = 'Test error occurred';
    const type = 'no-context';
    const expectedReportPath = path.join(
      testDir,
      `gemini-client-error-${type}-${MOCK_TIMESTAMP.replace(/[:.]/g, '-')}.json`,
    );

    await reportError(error, baseMessage, undefined, type);

    expect(debugLoggerErrorSpy).toHaveBeenCalledWith(
      `${baseMessage} Full report available at: ${expectedReportPath}`,
      error,
    );
  });
});
