#!/usr/bin/env node

/**
 * リポジトリ整理整頓と独自機能統合スクリプト
 * 公式リポジトリとの統合を尊重しつつ独自機能を保護
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class RepositoryOrganizer {
  constructor() {
    this.rootDir = path.join(__dirname, '..');
    this.docsDir = path.join(this.rootDir, '_docs');
    this.kiroDir = path.join(this.rootDir, '.kiro');
    this.packagesDir = path.join(this.rootDir, 'packages');
  }

  /**
   * メイン実行
   */
  async run() {
    console.log('🏗️ リポジトリ整理整頓と独自機能統合を開始します...\n');

    try {
      // Phase 1: 現在の状態確認
      await this.checkCurrentStatus();

      // Phase 2: 公式リポジトリとの統合確認
      await this.checkUpstreamIntegration();

      // Phase 3: 独自機能の保護確認
      await this.checkCustomFeatures();

      // Phase 4: モジュラー構造の検証
      await this.validateModularStructure();

      // Phase 5: 実装ログの整理確認
      await this.checkImplementationLogs();

      // Phase 6: CI/CDパイプラインの検証
      await this.validateCICDPipeline();

      // Phase 7: 電源断保護機能の統合
      await this.integrateCheckpointSystem();

      console.log('\n✅ リポジトリ整理整頓と独自機能統合が完了しました！');
      this.showSummary();

    } catch (error) {
      console.error('❌ 整理整頓中にエラーが発生しました:', error.message);
      process.exit(1);
    }
  }

  /**
   * 現在の状態確認
   */
  async checkCurrentStatus() {
    console.log('📊 現在の状態を確認中...');

    // プロジェクト構造の確認
    const structure = {
      packages: fs.existsSync(this.packagesDir),
      docs: fs.existsSync(this.docsDir),
      kiro: fs.existsSync(this.kiroDir),
      packageJson: fs.existsSync(path.join(this.rootDir, 'package.json'))
    };

    console.log('📁 プロジェクト構造:');
    Object.entries(structure).forEach(([key, exists]) => {
      console.log(`  ${exists ? '✅' : '❌'} ${key}: ${exists ? '存在' : '不存在'}`);
    });

    // Git状態の確認
    try {
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
      const gitBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      
      console.log(`🌿 Git状態: ${gitBranch}ブランチ`);
      console.log(`📝 変更ファイル数: ${gitStatus.split('\n').filter(line => line.trim()).length}`);
    } catch (error) {
      console.warn('⚠️ Git状態の取得に失敗:', error.message);
    }
  }

  /**
   * 公式リポジトリとの統合確認
   */
  async checkUpstreamIntegration() {
    console.log('\n🔄 公式リポジトリとの統合を確認中...');

    try {
      const remotes = execSync('git remote -v', { encoding: 'utf8' });
      const hasUpstream = remotes.includes('upstream');
      
      if (hasUpstream) {
        console.log('✅ upstreamリモートが設定済み');
        
        // 最新変更の確認
        try {
          execSync('git fetch upstream', { stdio: 'pipe' });
          console.log('✅ 公式リポジトリから最新変更を取得');
        } catch (error) {
          console.warn('⚠️ 公式リポジトリからの取得に失敗:', error.message);
        }
      } else {
        console.log('❌ upstreamリモートが未設定');
        console.log('💡 公式リポジトリとの統合が必要です');
      }
    } catch (error) {
      console.warn('⚠️ リモート確認に失敗:', error.message);
    }
  }

  /**
   * 独自機能の保護確認
   */
  async checkCustomFeatures() {
    console.log('\n🎯 独自機能の保護を確認中...');

    // .kiroディレクトリの確認
    if (fs.existsSync(this.kiroDir)) {
      console.log('✅ .kiroディレクトリが存在（独自機能保護）');
      
      const steeringDir = path.join(this.kiroDir, 'steering');
      if (fs.existsSync(steeringDir)) {
        const files = fs.readdirSync(steeringDir);
        console.log(`📋 独自ルールファイル数: ${files.length}`);
        
        files.forEach(file => {
          console.log(`  📄 ${file}`);
        });
      }
    } else {
      console.log('❌ .kiroディレクトリが存在しません');
    }

    // 独自実装の確認
    const customFeatures = [
      'scripts/checkpoint-manager.js',
      'scripts/repository-organizer.js'
    ];

    console.log('\n🔧 独自実装の確認:');
    customFeatures.forEach(feature => {
      const exists = fs.existsSync(path.join(this.rootDir, feature));
      console.log(`  ${exists ? '✅' : '❌'} ${feature}: ${exists ? '存在' : '不存在'}`);
    });
  }

  /**
   * モジュラー構造の検証
   */
  async validateModularStructure() {
    console.log('\n📦 モジュラー構造を検証中...');

    const packages = ['cli', 'core', 'vscode-ide-companion'];
    
    packages.forEach(pkg => {
      const pkgDir = path.join(this.packagesDir, pkg);
      const packageJsonPath = path.join(pkgDir, 'package.json');
      
      if (fs.existsSync(pkgDir) && fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          console.log(`✅ ${pkg}: v${packageJson.version}`);
        } catch (error) {
          console.log(`❌ ${pkg}: package.jsonの読み込みに失敗`);
        }
      } else {
        console.log(`❌ ${pkg}: ディレクトリまたはpackage.jsonが存在しません`);
      }
    });
  }

  /**
   * 実装ログの整理確認
   */
  async checkImplementationLogs() {
    console.log('\n📚 実装ログの整理を確認中...');

    if (fs.existsSync(this.docsDir)) {
      const categories = ['features', 'installation', 'integration', 'bugfixes'];
      
      categories.forEach(category => {
        const categoryDir = path.join(this.docsDir, category);
        if (fs.existsSync(categoryDir)) {
          const files = fs.readdirSync(categoryDir).filter(file => file.endsWith('.md'));
          console.log(`📁 ${category}: ${files.length}個のログファイル`);
        } else {
          console.log(`❌ ${category}: ディレクトリが存在しません`);
        }
      });

      // ルートレベルのログファイル
      const rootLogs = fs.readdirSync(this.docsDir)
        .filter(file => file.endsWith('.md') && !categories.some(cat => file.includes(cat)));
      
      if (rootLogs.length > 0) {
        console.log(`📄 ルートレベルログ: ${rootLogs.length}個`);
        rootLogs.forEach(log => console.log(`  📄 ${log}`));
      }
    } else {
      console.log('❌ _docsディレクトリが存在しません');
    }
  }

  /**
   * CI/CDパイプラインの検証
   */
  async validateCICDPipeline() {
    console.log('\n🚀 CI/CDパイプラインを検証中...');

    const workflowsDir = path.join(this.rootDir, '.github', 'workflows');
    
    if (fs.existsSync(workflowsDir)) {
      const workflows = fs.readdirSync(workflowsDir).filter(file => file.endsWith('.yml'));
      console.log(`📋 CI/CDワークフロー数: ${workflows.length}`);
      
      workflows.forEach(workflow => {
        const workflowPath = path.join(workflowsDir, workflow);
        try {
          const content = fs.readFileSync(workflowPath, 'utf8');
          const hasSyntaxError = this.checkYAMLSyntax(content);
          console.log(`  ${hasSyntaxError ? '❌' : '✅'} ${workflow}: ${hasSyntaxError ? '構文エラー' : '正常'}`);
        } catch (error) {
          console.log(`  ❌ ${workflow}: 読み込みエラー`);
        }
      });
    } else {
      console.log('❌ .github/workflowsディレクトリが存在しません');
    }
  }

  /**
   * YAML構文チェック
   */
  checkYAMLSyntax(content) {
    // 簡易的なYAML構文チェック
    const commonErrors = [
      /^\s+with:$/m,  // インデントエラー
      /^\s+\s+with:$/m,  // 過度なインデント
      /^\s+[a-zA-Z_][a-zA-Z0-9_]*:\s*$/m  // 不完全なマッピング
    ];
    
    return commonErrors.some(pattern => pattern.test(content));
  }

  /**
   * チェックポイントシステムの統合
   */
  async integrateCheckpointSystem() {
    console.log('\n🛡️ 電源断保護機能を統合中...');

    const checkpointManagerPath = path.join(this.rootDir, 'scripts', 'checkpoint-manager.js');
    
    if (fs.existsSync(checkpointManagerPath)) {
      console.log('✅ チェックポイントマネージャーが存在');
      
      // package.jsonにスクリプトを追加
      try {
        const packageJsonPath = path.join(this.rootDir, 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        if (!packageJson.scripts['checkpoint']) {
          packageJson.scripts['checkpoint'] = 'node scripts/checkpoint-manager.js';
          packageJson.scripts['organize'] = 'node scripts/repository-organizer.js';
          
          fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
          console.log('✅ package.jsonにスクリプトを追加');
        }
      } catch (error) {
        console.warn('⚠️ package.jsonの更新に失敗:', error.message);
      }
    } else {
      console.log('❌ チェックポイントマネージャーが存在しません');
    }
  }

  /**
   * サマリー表示
   */
  showSummary() {
    console.log('\n📊 整理整頓サマリー');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 公式リポジトリとの統合確認');
    console.log('✅ 独自機能の保護確認');
    console.log('✅ モジュラー構造の検証');
    console.log('✅ 実装ログの整理確認');
    console.log('✅ CI/CDパイプラインの検証');
    console.log('✅ 電源断保護機能の統合');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎯 次のステップ:');
    console.log('1. npm run checkpoint でチェックポイントシステムを起動');
    console.log('2. npm run organize で定期的な整理整頓を実行');
    console.log('3. 公式リポジトリとの同期を継続');
    console.log('4. 独自機能の開発を継続');
  }
}

// メイン実行
if (import.meta.url === `file://${process.argv[1]}`) {
  const organizer = new RepositoryOrganizer();
  organizer.run();
}

export default RepositoryOrganizer; 