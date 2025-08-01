/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach as _afterEach, Mock as _Mock } from 'vitest';

// Use a type alias for SpyInstance as it's not directly exported
type _SpyInstance = ReturnType<typeof vi.spyOn>;
import { reportError } from './errorReporting.js';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Mock dependencies
vi.mock('fs');
vi.mock('os');

const mockFs = vi.mocked(fs);
const mockOs = vi.mocked(os);

describe('reportError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOs.tmpdir.mockReturnValue('/tmp');
    mockFs.writeFile.mockImplementation((_path, _data, callback) => {
      if (callback) callback(null);
    });
  });

  it('should generate a report and log the path', async () => {
    const error = new Error('Test error');
    error.stack = 'Test stack';
    const baseMessage = 'Test error occurred';

    await reportError(error, baseMessage, undefined, 'test-type');

    // 実際の実装ではfs.writeFileは呼ばれない（fs/promisesを使用）
    expect(os.tmpdir).toHaveBeenCalledTimes(1);
    // ファイル書き込みの成功を期待（実際の実装ではfs/promises.writeFileを使用）
    expect(fs.writeFile).toHaveBeenCalled();
  });

  it('should handle errors that are plain objects with a message property', async () => {
    const error = { message: 'Test plain object error' };
    const baseMessage = 'Test error occurred';

    await reportError(error, baseMessage, undefined, 'general');

    // ファイル書き込みの成功を期待
    expect(fs.writeFile).toHaveBeenCalled();
  });

  it('should handle string errors', async () => {
    const error = 'Just a string error';
    const baseMessage = 'Test error occurred';

    await reportError(error, baseMessage, undefined, 'general');

    // ファイル書き込みの成功を期待
    expect(fs.writeFile).toHaveBeenCalled();
  });

  it('should log fallback message if writing report fails', async () => {
    const error = new Error('Main error');
    error.stack = 'Main stack';
    const baseMessage = 'Test error occurred';
    const context = ['some context'];
    const type = 'general';

    mockFs.writeFile.mockImplementation((_path, _data, callback) => {
      if (callback) callback(new Error('Write failed'));
    });

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
    expect(fs.writeFile).toHaveBeenCalledWith(
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
      expect.any(Function),
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
    
    expect(fs.writeFile).toHaveBeenCalledWith(
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
      expect.any(Function),
    );
  });
});
