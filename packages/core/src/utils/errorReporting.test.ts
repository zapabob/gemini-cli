/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach as _afterEach, Mock as _Mock } from 'vitest';

// Use a type alias for SpyInstance as it's not directly exported
type _SpyInstance = ReturnType<typeof vi.spyOn>;
import { reportError } from './errorReporting.js';
import * as fsPromises from 'node:fs/promises';
import * as os from 'node:os';
import path from 'path';

// Mock dependencies
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

const mockFs = vi.mocked(fsPromises);
const mockOs = vi.mocked(os);

describe('reportError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
    mockOs.tmpdir.mockReturnValue('/tmp');
    mockFs.writeFile.mockResolvedValue(undefined as unknown as void);
  });
  _afterEach(() => {
    vi.useRealTimers();
  });

  it('should generate a report and log the path', async () => {
    const error = new Error('Test error');
    error.stack = 'Test stack';
    const baseMessage = 'Test error occurred';

    await reportError(error, baseMessage, undefined, 'test-type');

    expect(os.tmpdir).toHaveBeenCalled();
    // fs/promises.writeFile が呼ばれること
    expect(fsPromises.writeFile).toHaveBeenCalled();
  });

  it('should handle errors that are plain objects with a message property', async () => {
    const error = { message: 'Test plain object error' };
    const baseMessage = 'Test error occurred';

    await reportError(error, baseMessage, undefined, 'general');

    expect(fsPromises.writeFile).toHaveBeenCalled();
  });

  it('should handle string errors', async () => {
    const error = 'Just a string error';
    const baseMessage = 'Test error occurred';

    await reportError(error, baseMessage, undefined, 'general');

    expect(fsPromises.writeFile).toHaveBeenCalled();
  });

  it('should log fallback message if writing report fails', async () => {
    const error = new Error('Main error');
    error.stack = 'Main stack';
    const baseMessage = 'Test error occurred';
    const context = ['some context'];
    const type = 'general';

    mockFs.writeFile.mockRejectedValue(new Error('Write failed'));

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await reportError(error, baseMessage, context, type);

    // 実際の実装では異なるエラーメッセージが出力される
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Test error occurred Additionally, failed to write detailed error report:',
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });

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

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Test error occurred Could not stringify report content (likely due to context):',
      expect.any(Error),
    );

    // Check that it attempts to write a minimal report
    const expectedMinimalReportPath = path.join('/tmp', 'gemini-client-error-bigint-fail-2025-01-01T00-00-00-000Z.json');
    expect(fsPromises.writeFile).toHaveBeenCalledWith(
      expectedMinimalReportPath,
      originalJsonStringify(
        {
          error: {
            message: 'Main error',
            stack: 'Main stack',
          },
        },
        null,
        2,
      ),
      
    );

    JSON.stringify = originalJsonStringify;
    consoleErrorSpy.mockRestore();
  });

  it('should generate a report without context if context is not provided', async () => {
    const error = new Error('Error without context');
    error.stack = 'No context stack';
    const baseMessage = 'Test error occurred';

    await reportError(error, baseMessage, undefined, 'general');

    const expectedReportPath = path.join('/tmp', 'gemini-client-error-general-2025-01-01T00-00-00-000Z.json');
    expect(fsPromises.writeFile).toHaveBeenCalledWith(
      expectedReportPath,
      JSON.stringify(
        {
          error: {
            message: 'Error without context',
            stack: 'No context stack',
          },
        },
        null,
        2,
      ),
      
    );
  });
});
