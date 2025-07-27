import path from 'node:path';
import os from 'node:os';

/**
 * Windows環境でのパス区切り文字を正規化する
 * テストでは常にフォワードスラッシュを使用し、実際の実行ではOSに応じた区切り文字を使用
 */
export function normalizePath(filePath: string, forTest: boolean = false): string {
  if (forTest || os.platform() === 'win32') {
    // テスト環境またはWindows環境では常にフォワードスラッシュを使用
    return filePath.replace(/\\/g, '/');
  }
  return filePath;
}

/**
 * パスを相対パスに変換し、正規化する
 */
export function normalizeRelativePath(filePath: string, basePath: string, forTest: boolean = false): string {
  const relativePath = path.relative(basePath, filePath);
  return normalizePath(relativePath, forTest);
}

/**
 * パスが有効かどうかをチェックし、正規化する
 */
export function validateAndNormalizePath(filePath: string, forTest: boolean = false): string {
  const normalized = normalizePath(filePath, forTest);
  
  // 基本的なパス検証
  if (normalized.includes('..') || normalized.includes('//')) {
    throw new Error(`Invalid path: ${filePath}`);
  }
  
  return normalized;
}

/**
 * テスト環境用のパス正規化（常にフォワードスラッシュを使用）
 */
export function normalizePathForTest(filePath: string): string {
  return normalizePath(filePath, true);
} 