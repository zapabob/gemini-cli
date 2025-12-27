/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

declare module 'yaml' {
  export function parse<T = unknown>(input: string): T;
  export function stringify(value: unknown): string;
}

declare module 'mock-fs' {
  interface MockFsConfig {
    [path: string]: unknown;
  }

  function mock(config?: MockFsConfig): void;
  namespace mock {
    function file(config?: unknown): unknown;
    function restore(): void;
  }

  export = mock;
}
