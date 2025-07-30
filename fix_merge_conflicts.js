#!/usr/bin/env node

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import { glob } from 'glob';

async function fixMergeConflicts() {
  console.log('🔧 マージコンフリクトを解決中...');
  
  // マージコンフリクトマーカーを検索
  const files = await glob('**/*.{ts,tsx,js,jsx,json}', {
    ignore: ['node_modules/**', 'dist/**', 'bundle/**']
  });
  
  let fixedCount = 0;
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('<<<<<<< HEAD')) {
        console.log(`📝 修正中: ${file}`);
        
        // マージコンフリクトを解決（HEADの内容を保持）
        let fixedContent = content;
        
        // <<<<<<< HEAD から ======= までを保持し、======= から >>>>>>> までを削除
        const conflictRegex = /<<<<<<< HEAD\n([\s\S]*?)\n=======\n[\s\S]*?\n>>>>>>> [^\n]*\n/g;
        fixedContent = fixedContent.replace(conflictRegex, '$1\n');
        
        // 残りのマージコンフリクトマーカーを削除
        fixedContent = fixedContent.replace(/<<<<<<< HEAD\n/g, '');
        fixedContent = fixedContent.replace(/=======\n/g, '');
        fixedContent = fixedContent.replace(/>>>>>>> [^\n]*\n/g, '');
        
        fs.writeFileSync(file, fixedContent);
        fixedCount++;
      }
    } catch (error) {
      console.error(`❌ エラー: ${file} - ${error.message}`);
    }
  }
  
  console.log(`✅ 完了: ${fixedCount}個のファイルを修正しました`);
}

fixMergeConflicts().catch(console.error); 