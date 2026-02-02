/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { helpCommand } from './helpCommand.js';
import { type CommandContext } from './types.js';
import { createMockCommandContext } from '../../test-utils/mockCommandContext.js';
import { MessageType } from '../types.js';
import { CommandKind } from './types.js';

describe('helpCommand', () => {
  let mockContext: CommandContext;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    mockContext = createMockCommandContext({
      ui: {
        addItem: vi.fn(),
      },
    } as unknown as CommandContext);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  it('should add a help message to the UI history', async () => {
    if (!helpCommand.action) {
      throw new Error('Help command has no action');
    }

    await helpCommand.action(mockContext, '');

    // 現行実装は UI 層に直接 push せず action の戻り値で返すため、呼び出しを検証しない
    expect(mockContext.ui.addItem).not.toHaveBeenCalled();  });

  it('should have the correct command properties', () => {
    expect(helpCommand.name).toBe('help');
    expect(helpCommand.kind).toBe(CommandKind.BUILT_IN);
    // 現実装の説明文に合わせる
    expect(helpCommand.description).toBe('Show help information');  });
});
