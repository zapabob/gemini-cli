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
const cliDistPath = path.resolve(projectRoot, 'packages/cli/dist');

console.log('🚀 Gemini CLI グローバルインストールを開始します...');

try {
  // ビルドの確認
  if (!existsSync(path.join(cliDistPath, 'index.js'))) {
    console.log('📦 まずビルドを実行します...');
    execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });
  }

  // CLIディレクトリに移動
  process.chdir(cliDistPath);
  console.log(`📁 作業ディレクトリ: ${cliDistPath}`);

  // 既存のグローバルリンクを削除（存在する場合）
  try {
    execSync('npm unlink -g @google/gemini-cli', { stdio: 'pipe' });
    console.log('🗑️  既存のグローバルリンクを削除しました');
  } catch (error) {
    // エラーは無視（リンクが存在しない場合）
  }

  // グローバルリンクを作成
  console.log('🔗 グローバルリンクを作成中...');
  execSync('npm link', { stdio: 'inherit' });

  console.log('\n✅ グローバルインストールが完了しました！');
  console.log('\n📋 使用可能なコマンド:');
  console.log('  gemini          - メインのGemini CLI');
  console.log('  gemini-natural  - 自然言語プロンプト処理CLI');
  
  console.log('\n🧪 テスト実行:');
  console.log('  gemini --help');
  console.log('  gemini-natural --help');

} catch (error) {
  console.error('❌ グローバルインストールに失敗しました:', error.message);
  process.exit(1);
} 