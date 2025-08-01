#!/usr/bin/env node
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🗑️  Gemini CLI グローバルアンインストールを開始します...');

try {
  // グローバルリンクの削除
  console.log('🔗 グローバルリンクを削除中...');
  try {
    execSync('npm unlink -g @google/gemini-cli', { stdio: 'inherit' });
    console.log('✅ グローバルリンクを削除しました');
  } catch (error) {
    console.log('ℹ️  グローバルリンクは既に削除されています');
  }

  // ローカルリンクの削除
  const cliDistPath = path.resolve(projectRoot, 'packages/cli/dist');
  if (existsSync(cliDistPath)) {
    process.chdir(cliDistPath);
    try {
      execSync('npm unlink', { stdio: 'pipe' });
      console.log('✅ ローカルリンクを削除しました');
    } catch (error) {
      console.log('ℹ️  ローカルリンクは既に削除されています');
    }
  }

  // キャッシュのクリーンアップ
  console.log('🧹 キャッシュをクリーンアップ中...');
  try {
    execSync('npm cache clean --force', { stdio: 'pipe' });
    console.log('✅ npmキャッシュをクリーンアップしました');
  } catch (error) {
    console.log('⚠️  npmキャッシュのクリーンアップに失敗しました');
  }

  // 一時ファイルの削除
  const tempDirs = [
    path.join(projectRoot, 'node_modules/.cache'),
    path.join(projectRoot, '.npm'),
    path.join(projectRoot, 'packages/cli/dist/.last_build')
  ];

  tempDirs.forEach(dir => {
    if (existsSync(dir)) {
      try {
        rmSync(dir, { recursive: true, force: true });
        console.log(`✅ 一時ディレクトリを削除しました: ${path.basename(dir)}`);
      } catch (error) {
        console.log(`⚠️  一時ディレクトリの削除に失敗しました: ${path.basename(dir)}`);
      }
    }
  });

  console.log('\n✅ グローバルアンインストールが完了しました！');
  console.log('\n📋 削除されたコマンド:');
  console.log('  gemini          - メインのGemini CLI');
  console.log('  gemini-natural  - 自然言語プロンプト処理CLI');
  
  console.log('\n💡 再インストールする場合:');
  console.log('  npm run install:global');

} catch (error) {
  console.error('❌ グローバルアンインストールに失敗しました:', error.message);
  process.exit(1);
} 