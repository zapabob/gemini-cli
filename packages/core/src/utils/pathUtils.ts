/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as path from 'path';

/**
 * Windows環境でのパス問題を解決するためのユーティリティ関数
 */

/**
 * パスを正規化して、プラットフォーム間で一貫性を保つ
 * @param filePath 正規化するパス
 * @returns 正規化されたパス
 */
export function normalizePath(filePath: string): string {
  return path.normalize(filePath);
}

/**
 * テスト環境でのパス比較を安全に行う
 * @param actual 実際のパス
 * @param expected 期待されるパス
 * @returns パスが等しいかどうか
 */
export function comparePaths(actual: string, expected: string): boolean {
  const normalizedActual = normalizePath(actual);
  const normalizedExpected = normalizePath(expected);
  return normalizedActual === normalizedExpected;
}

/**
 * Windows環境でのパス区切り文字を考慮したパス正規化
 * @param filePath 正規化するパス
 * @returns 正規化されたパス
 */
export function normalizePathForTests(filePath: string): string {
  // Windows環境ではバックスラッシュをスラッシュに変換
  if (process.platform === 'win32') {
    return filePath.replace(/\\/g, '/');
  }
  return filePath;
}

/**
 * 環境変数の値を安全に取得する
 * @param key 環境変数名
 * @param defaultValue デフォルト値
 * @returns 環境変数の値
 */
export function getEnvVar(key: string, defaultValue?: string): string | undefined {
  const value = process.env[key];
  if (value === undefined || value === '') {
    return defaultValue;
  }
  return value;
}

/**
 * Windows環境での環境変数展開を安全に行う
 * @param command コマンド文字列
 * @returns 環境変数が展開されたコマンド
 */
export function expandEnvVars(command: string): string {
  if (process.platform === 'win32') {
    // Windows環境での環境変数展開
    return command.replace(/\$([A-Z_][A-Z0-9_]*)/g, (match, varName) => process.env[varName] || match);
  }
  return command;
}

/**
 * テスト用のモックパスを生成する
 * @param basePath ベースパス
 * @param fileName ファイル名
 * @returns モックパス
 */
export function createMockPath(basePath: string, fileName: string): string {
  return normalizePath(path.join(basePath, fileName));
}

/**
 * プラットフォーム固有のパス区切り文字を取得する
 * @returns パス区切り文字
 */
export function getPathSeparator(): string {
  return process.platform === 'win32' ? '\\' : '/';
}

/**
 * パスが絶対パスかどうかを判定する
 * @param filePath 判定するパス
 * @returns 絶対パスかどうか
 */
export function isAbsolutePath(filePath: string): boolean {
  return path.isAbsolute(filePath);
}

/**
 * 相対パスを絶対パスに変換する
 * @param relativePath 相対パス
 * @param basePath ベースパス
 * @returns 絶対パス
 */
export function resolvePath(relativePath: string, basePath: string): string {
  return normalizePath(path.resolve(basePath, relativePath));
} 