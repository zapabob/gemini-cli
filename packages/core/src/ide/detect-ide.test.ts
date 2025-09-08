/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { detectIde, DetectedIde } from './detect-ide.js';

describe('detectIde', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([
    {
      env: {},
      expected: DetectedIde.VSCode,
    },
    {
      env: { __COG_BASHRC_SOURCED: '1' },
      expected: DetectedIde.Devin,
    },
    {
      env: { REPLIT_USER: 'test' },
      expected: DetectedIde.Replit,
    },
    {
      env: { CURSOR_TRACE_ID: 'test' },
      expected: DetectedIde.Cursor,
    },
    {
      env: { CODESPACES: 'true' },
      expected: DetectedIde.Codespaces,
    },
    {
      env: { EDITOR_IN_CLOUD_SHELL: 'true' },
      expected: DetectedIde.CloudShell,
    },
    {
      env: { CLOUD_SHELL: 'true' },
      expected: DetectedIde.CloudShell,
    },
    {
      env: { TERM_PRODUCT: 'Trae' },
      expected: DetectedIde.Trae,
    },
    {
      env: { FIREBASE_DEPLOY_AGENT: 'true' },
      expected: DetectedIde.FirebaseStudio,
    },
    {
      env: { MONOSPACE_ENV: 'true' },
      expected: DetectedIde.FirebaseStudio,
    },
  ])('detects the IDE for $expected', ({ env, expected }) => {
    // Clear all environment variables first to avoid conflicts
    vi.unstubAllEnvs();
    
    // Set environment variables in the correct order
    for (const [key, value] of Object.entries(env)) {
      vi.stubEnv(key, value);
    }
    
    // Set default vscode environment only if not testing for other IDEs
    if (expected === DetectedIde.VSCode) {
      vi.stubEnv('TERM_PROGRAM', 'vscode');
    }
    
    expect(detectIde({ pid: 1234, command: 'vscode' })).toBe(expected);
  });

  it('returns undefined for non-vscode', () => {
    vi.stubEnv('TERM_PROGRAM', 'definitely-not-vscode');
    expect(detectIde({ pid: 1234, command: 'not-vscode' })).toBeUndefined();
  });
});
