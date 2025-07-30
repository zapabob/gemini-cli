/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as vscode from 'vscode';
import { CursorIntegrationManager, CursorIntegrationConfig } from './cursorIntegration.js';
import { AIOrchestrationEngine, AIOrchestrationEngineConfig } from './aiOrchestrationEngine.js';

/**
 * Cursor拡張機能のアクティベーション関数
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('🚀 Cursor連携拡張機能がアクティベートされました');

  // Cursor統合設定の初期化
  const config: CursorIntegrationConfig = {
    enableRealTimeSync: true,
    enableAutoCodeReview: true,
    enableParallelExecution: true,
    enableCommandPalette: true,
    enableFileWatcher: true,
    enableLiveCollaboration: true,
    enableAIOrchestration: true,
    enableAutonomousExecution: true,
    maxConcurrentTasks: 5,
    syncInterval: 5000, // 5秒
    autoSaveInterval: 300000, // 5分
    aiOrchestrationThreshold: 0.7,
    autonomousDecisionThreshold: 0.8
  };

  // Cursor統合マネージャーの初期化
  const cursorManager = new CursorIntegrationManager(config, context);

  // AIオーケストレーションエンジン設定の初期化
  const aiEngineConfig: AIOrchestrationEngineConfig = {
    enableAutonomousDevelopment: true,
    enableIntelligentCodeGeneration: true,
    enablePredictiveAnalysis: true,
    enableAdaptiveLearning: true,
    enableContextAwareSuggestions: true,
    maxConcurrentOrchestrations: 3,
    orchestrationTimeout: 60000, // 60秒
    learningRate: 0.1,
    confidenceThreshold: 0.8
  };

  // AIオーケストレーションエンジンの初期化
  const aiEngine = new AIOrchestrationEngine(aiEngineConfig, cursorManager, context);

  // コマンドの登録
  const commands = [
    {
      id: 'cursor.subagent.codeReview',
      title: 'サブエージェント: コードレビュー',
      description: '現在のファイルでコードレビューを実行',
      handler: () => executeCodeReview(cursorManager)
    },
    {
      id: 'cursor.subagent.debug',
      title: 'サブエージェント: デバッグ',
      description: '現在のファイルでデバッグを実行',
      handler: () => executeDebug(cursorManager)
    },
    {
      id: 'cursor.subagent.optimize',
      title: 'サブエージェント: 最適化',
      description: '現在のファイルでパフォーマンス最適化を実行',
      handler: () => executeOptimize(cursorManager)
    },
    {
      id: 'cursor.subagent.security',
      title: 'サブエージェント: セキュリティ監査',
      description: '現在のファイルでセキュリティ監査を実行',
      handler: () => executeSecurity(cursorManager)
    },
    {
      id: 'cursor.subagent.parallel',
      title: 'サブエージェント: 並列実行',
      description: '複数のサブエージェントで並列実行',
      handler: () => executeParallel(cursorManager)
    },
    {
      id: 'cursor.subagent.status',
      title: 'サブエージェント: 状態確認',
      description: 'アクティブなサブエージェントの状態を表示',
      handler: () => showStatus(cursorManager)
    },
    {
      id: 'cursor.ai.drivenDevelopment',
      title: 'AIドリブン開発',
      description: 'AIオーケストレーションによる自律的開発',
      handler: () => executeAIDrivenDevelopment(aiEngine)
    },
    {
      id: 'cursor.ai.intelligentGeneration',
      title: 'インテリジェントコード生成',
      description: 'AIによるインテリジェントなコード生成',
      handler: () => executeIntelligentGeneration(aiEngine)
    },
    {
      id: 'cursor.ai.predictiveAnalysis',
      title: '予測分析',
      description: '開発要件の予測分析を実行',
      handler: () => executePredictiveAnalysis(aiEngine)
    },
    {
      id: 'cursor.ai.contextAwareSuggestions',
      title: 'コンテキスト認識提案',
      description: 'コンテキストを考慮した提案を生成',
      handler: () => executeContextAwareSuggestions(aiEngine)
    }
  ];

  // コマンドの登録
  commands.forEach(command => {
    const disposable = vscode.commands.registerCommand(command.id, command.handler);
    context.subscriptions.push(disposable);
  });

  // コンテキストメニューの登録
  context.subscriptions.push(
    vscode.commands.registerCommand('cursor.subagent.codeReview', () => executeCodeReview(cursorManager)),
    vscode.commands.registerCommand('cursor.subagent.debug', () => executeDebug(cursorManager)),
    vscode.commands.registerCommand('cursor.subagent.optimize', () => executeOptimize(cursorManager)),
    vscode.commands.registerCommand('cursor.subagent.security', () => executeSecurity(cursorManager)),
    vscode.commands.registerCommand('cursor.subagent.parallel', () => executeParallel(cursorManager)),
    vscode.commands.registerCommand('cursor.subagent.status', () => showStatus(cursorManager)),
    vscode.commands.registerCommand('cursor.ai.drivenDevelopment', () => executeAIDrivenDevelopment(aiEngine)),
    vscode.commands.registerCommand('cursor.ai.intelligentGeneration', () => executeIntelligentGeneration(aiEngine)),
    vscode.commands.registerCommand('cursor.ai.predictiveAnalysis', () => executePredictiveAnalysis(aiEngine)),
    vscode.commands.registerCommand('cursor.ai.contextAwareSuggestions', () => executeContextAwareSuggestions(aiEngine))
  );

  console.log('✅ Cursor拡張機能のコマンドを登録完了');
}

/**
 * コードレビューの実行
 */
async function executeCodeReview(cursorManager: CursorIntegrationManager) {
  try {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      vscode.window.showErrorMessage('アクティブなエディタが見つかりません');
      return;
    }

    vscode.window.showInformationMessage('🔍 コードレビューを開始します...');
    
    const result = await cursorManager.executeCommand('cursor.subagent.codeReview');
    
    if (result.success) {
      // 結果を新しいエディタで表示
      const document = await vscode.workspace.openTextDocument({
        content: `# コードレビュー結果\n\n${result.output}`,
        language: 'markdown'
      });
      
      await vscode.window.showTextDocument(document);
      vscode.window.showInformationMessage('✅ コードレビューが完了しました');
    } else {
      vscode.window.showErrorMessage(`❌ コードレビューに失敗しました: ${result.error}`);
    }
  } catch (error) {
    console.error('コードレビュー実行エラー:', error);
    vscode.window.showErrorMessage(`コードレビュー実行エラー: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * デバッグの実行
 */
async function executeDebug(cursorManager: CursorIntegrationManager) {
  try {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      vscode.window.showErrorMessage('アクティブなエディタが見つかりません');
      return;
    }

    vscode.window.showInformationMessage('🐛 デバッグを開始します...');
    
    const result = await cursorManager.executeCommand('cursor.subagent.debug');
    
    if (result.success) {
      // 結果を新しいエディタで表示
      const document = await vscode.workspace.openTextDocument({
        content: `# デバッグ結果\n\n${result.output}`,
        language: 'markdown'
      });
      
      await vscode.window.showTextDocument(document);
      vscode.window.showInformationMessage('✅ デバッグが完了しました');
    } else {
      vscode.window.showErrorMessage(`❌ デバッグに失敗しました: ${result.error}`);
    }
  } catch (error) {
    console.error('デバッグ実行エラー:', error);
    vscode.window.showErrorMessage(`デバッグ実行エラー: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 最適化の実行
 */
async function executeOptimize(cursorManager: CursorIntegrationManager) {
  try {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      vscode.window.showErrorMessage('アクティブなエディタが見つかりません');
      return;
    }

    vscode.window.showInformationMessage('⚡ 最適化を開始します...');
    
    const result = await cursorManager.executeCommand('cursor.subagent.optimize');
    
    if (result.success) {
      // 結果を新しいエディタで表示
      const document = await vscode.workspace.openTextDocument({
        content: `# 最適化結果\n\n${result.output}`,
        language: 'markdown'
      });
      
      await vscode.window.showTextDocument(document);
      vscode.window.showInformationMessage('✅ 最適化が完了しました');
    } else {
      vscode.window.showErrorMessage(`❌ 最適化に失敗しました: ${result.error}`);
    }
  } catch (error) {
    console.error('最適化実行エラー:', error);
    vscode.window.showErrorMessage(`最適化実行エラー: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * セキュリティ監査の実行
 */
async function executeSecurity(cursorManager: CursorIntegrationManager) {
  try {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      vscode.window.showErrorMessage('アクティブなエディタが見つかりません');
      return;
    }

    vscode.window.showInformationMessage('🛡️ セキュリティ監査を開始します...');
    
    const result = await cursorManager.executeCommand('cursor.subagent.security');
    
    if (result.success) {
      // 結果を新しいエディタで表示
      const document = await vscode.workspace.openTextDocument({
        content: `# セキュリティ監査結果\n\n${result.output}`,
        language: 'markdown'
      });
      
      await vscode.window.showTextDocument(document);
      vscode.window.showInformationMessage('✅ セキュリティ監査が完了しました');
    } else {
      vscode.window.showErrorMessage(`❌ セキュリティ監査に失敗しました: ${result.error}`);
    }
  } catch (error) {
    console.error('セキュリティ監査実行エラー:', error);
    vscode.window.showErrorMessage(`セキュリティ監査実行エラー: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 並列実行
 */
async function executeParallel(cursorManager: CursorIntegrationManager) {
  try {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      vscode.window.showErrorMessage('アクティブなエディタが見つかりません');
      return;
    }

    vscode.window.showInformationMessage('🔄 並列実行を開始します...');
    
    const result = await cursorManager.executeCommand('cursor.subagent.parallel');
    
    if (result.success) {
      // 結果を新しいエディタで表示
      const document = await vscode.workspace.openTextDocument({
        content: `# 並列実行結果\n\n${result.output}`,
        language: 'markdown'
      });
      
      await vscode.window.showTextDocument(document);
      vscode.window.showInformationMessage('✅ 並列実行が完了しました');
    } else {
      vscode.window.showErrorMessage(`❌ 並列実行に失敗しました: ${result.error}`);
    }
  } catch (error) {
    console.error('並列実行エラー:', error);
    vscode.window.showErrorMessage(`並列実行エラー: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 状態確認
 */
async function showStatus(cursorManager: CursorIntegrationManager) {
  try {
    const activeTasks = cursorManager.getActiveTasks();
    
    let statusMessage = '## アクティブなタスク\n\n';
    
    if (activeTasks.length === 0) {
      statusMessage += '現在アクティブなタスクはありません。\n';
    } else {
      activeTasks.forEach((task, index) => {
        statusMessage += `### タスク ${index + 1}\n`;
        statusMessage += `- ID: ${task.taskId}\n`;
        statusMessage += `- 状態: ${task.success ? '成功' : '失敗'}\n`;
        statusMessage += `- 実行時間: ${task.executionTime}ms\n`;
        statusMessage += `- 使用サブエージェント: ${task.subagentsUsed.join(', ')}\n\n`;
      });
    }
    
    // 状態を新しいエディタで表示
    const document = await vscode.workspace.openTextDocument({
      content: statusMessage,
      language: 'markdown'
    });
    
    await vscode.window.showTextDocument(document);
    vscode.window.showInformationMessage('📊 状態確認が完了しました');
  } catch (error) {
    console.error('状態確認エラー:', error);
    vscode.window.showErrorMessage(`状態確認エラー: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * AIドリブン開発の実行
 */
async function executeAIDrivenDevelopment(aiEngine: AIOrchestrationEngine) {
  try {
    // 要件の入力
    const requirement = await vscode.window.showInputBox({
      prompt: '開発要件を入力してください',
      placeHolder: '例: ユーザー認証機能を実装する',
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return '要件を入力してください';
        }
        return null;
      }
    });

    if (!requirement) {
      return;
    }

    // コンテキストの入力（オプション）
    const context = await vscode.window.showInputBox({
      prompt: '開発コンテキストを入力してください（オプション）',
      placeHolder: '例: React + TypeScript + Firebaseを使用',
      value: ''
    });

    vscode.window.showInformationMessage('🤖 AIドリブン開発を開始します...');
    
    const result = await aiEngine.executeAIDrivenDevelopment(requirement, context);
    
    // 結果を新しいエディタで表示
    const content = `# AIドリブン開発結果

## 要件
${requirement}

## 生成されたコード
\`\`\`
${result.generatedCode}
\`\`\`

## 改善提案
${result.improvements.map(imp => `- ${imp}`).join('\n')}

## 次のステップ
${result.nextSteps.map(step => `- ${step}`).join('\n')}

## 学習インサイト
${result.learningInsights.map(insight => `- ${insight}`).join('\n')}

## 実行情報
- タスクID: ${result.taskId}
- 信頼度: ${(result.confidence * 100).toFixed(1)}%
- 実行時間: ${result.executionTime}ms
`;

    const document = await vscode.workspace.openTextDocument({
      content,
      language: 'markdown'
    });
    
    await vscode.window.showTextDocument(document);
    vscode.window.showInformationMessage(`✅ AIドリブン開発が完了しました（信頼度: ${(result.confidence * 100).toFixed(1)}%）`);

  } catch (error) {
    console.error('AIドリブン開発実行エラー:', error);
    vscode.window.showErrorMessage(`AIドリブン開発実行エラー: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * インテリジェントコード生成の実行
 */
async function executeIntelligentGeneration(aiEngine: AIOrchestrationEngine) {
  try {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      vscode.window.showErrorMessage('アクティブなエディタが見つかりません');
      return;
    }

    const document = activeEditor.document;
    const code = document.getText();
    const filePath = document.fileName;

    vscode.window.showInformationMessage('💻 インテリジェントコード生成を開始します...');
    
    const suggestions = await aiEngine.generateContextAwareSuggestions(filePath, code);
    
    if (suggestions.length > 0) {
      const content = `# インテリジェントコード生成結果

## ファイル
${filePath}

## 提案
${suggestions.map((suggestion, index) => `${index + 1}. ${suggestion}`).join('\n')}
`;

      const resultDocument = await vscode.workspace.openTextDocument({
        content,
        language: 'markdown'
      });
      
      await vscode.window.showTextDocument(resultDocument);
      vscode.window.showInformationMessage(`✅ インテリジェントコード生成が完了しました（${suggestions.length}個の提案）`);
    } else {
      vscode.window.showInformationMessage('ℹ️ 現在のコードに対して提案はありません');
    }

  } catch (error) {
    console.error('インテリジェントコード生成実行エラー:', error);
    vscode.window.showErrorMessage(`インテリジェントコード生成実行エラー: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 予測分析の実行
 */
async function executePredictiveAnalysis(aiEngine: AIOrchestrationEngine) {
  try {
    // 分析対象の入力
    const target = await vscode.window.showInputBox({
      prompt: '予測分析の対象を入力してください',
      placeHolder: '例: ユーザー管理システムの開発',
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return '分析対象を入力してください';
        }
        return null;
      }
    });

    if (!target) {
      return;
    }

    vscode.window.showInformationMessage('🔮 予測分析を開始します...');
    
    // 予測分析の実行（AIオーケストレーションエンジンを使用）
    const result = await aiEngine.executeAIDrivenDevelopment(target, '予測分析モード');
    
    const content = `# 予測分析結果

## 分析対象
${target}

## 分析結果
- 複雑度: ${(result.confidence * 100).toFixed(1)}%
- 推定開発時間: ${Math.round(result.executionTime / 1000)}秒
- 信頼度: ${(result.confidence * 100).toFixed(1)}%

## 改善提案
${result.improvements.map(imp => `- ${imp}`).join('\n')}

## 次のステップ
${result.nextSteps.map(step => `- ${step}`).join('\n')}

## 学習インサイト
${result.learningInsights.map(insight => `- ${insight}`).join('\n')}
`;

    const document = await vscode.workspace.openTextDocument({
      content,
      language: 'markdown'
    });
    
    await vscode.window.showTextDocument(document);
    vscode.window.showInformationMessage('✅ 予測分析が完了しました');

  } catch (error) {
    console.error('予測分析実行エラー:', error);
    vscode.window.showErrorMessage(`予測分析実行エラー: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * コンテキスト認識提案の実行
 */
async function executeContextAwareSuggestions(aiEngine: AIOrchestrationEngine) {
  try {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      vscode.window.showErrorMessage('アクティブなエディタが見つかりません');
      return;
    }

    const document = activeEditor.document;
    const code = document.getText();
    const filePath = document.fileName;

    vscode.window.showInformationMessage('🎯 コンテキスト認識提案を開始します...');
    
    const suggestions = await aiEngine.generateContextAwareSuggestions(filePath, code);
    
    if (suggestions.length > 0) {
      const content = `# コンテキスト認識提案結果

## ファイル
${filePath}

## 提案
${suggestions.map((suggestion, index) => `${index + 1}. ${suggestion}`).join('\n')}
`;

      const resultDocument = await vscode.workspace.openTextDocument({
        content,
        language: 'markdown'
      });
      
      await vscode.window.showTextDocument(resultDocument);
      vscode.window.showInformationMessage(`✅ コンテキスト認識提案が完了しました（${suggestions.length}個の提案）`);
    } else {
      vscode.window.showInformationMessage('ℹ️ 現在のコンテキストに対して提案はありません');
    }

  } catch (error) {
    console.error('コンテキスト認識提案実行エラー:', error);
    vscode.window.showErrorMessage(`コンテキスト認識提案実行エラー: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 拡張機能の非アクティベーション
 */
export function deactivate() {
  console.log('🛑 Cursor拡張機能が非アクティベートされました');
} 