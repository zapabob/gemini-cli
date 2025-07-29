/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as vscode from 'vscode';
// Cursor連携機能のモック実装（実際の実装ではcoreパッケージを使用）
interface CursorIntegrationConfig {
  enableRealTimeSync: boolean;
  enableAutoCodeReview: boolean;
  enableParallelExecution: boolean;
  enableCommandPalette: boolean;
  enableFileWatcher: boolean;
  enableLiveCollaboration: boolean;
  maxConcurrentTasks: number;
  syncInterval: number;
  autoSaveInterval: number;
}

class CursorIntegrationManager {
  constructor(config: CursorIntegrationConfig) {
    console.log('Cursor連携マネージャーを初期化:', config);
  }

  async processFileChangeEvent(event: any): Promise<void> {
    console.log('ファイル変更イベントを処理:', event);
  }

  async executeParallelTask(task: string, filePath?: string): Promise<string> {
    console.log('並列タスクを実行:', task, filePath);
    return `task-${Date.now()}`;
  }

  async executeCommand(commandId: string, context?: any): Promise<any> {
    console.log('コマンドを実行:', commandId, context);
    return { success: true, output: 'コマンド実行完了', executionTime: 1000 };
  }

  getActiveTasks(): any[] {
    return [];
  }

  async cleanup(): Promise<void> {
    console.log('Cursor連携マネージャーをクリーンアップ');
  }
}

/**
 * Cursor拡張機能のアクティベーション関数
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('🚀 Cursor連携拡張機能がアクティベートされました');

  // Cursor連携マネージャーの初期化
  const config: CursorIntegrationConfig = {
    enableRealTimeSync: true,
    enableAutoCodeReview: true,
    enableParallelExecution: true,
    enableCommandPalette: true,
    enableFileWatcher: true,
    enableLiveCollaboration: true,
    maxConcurrentTasks: 5,
    syncInterval: 5000, // 5秒
    autoSaveInterval: 300000 // 5分
  };

  const cursorManager = new CursorIntegrationManager(config);

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
      description: '現在のタスク状態を確認',
      handler: () => showStatus(cursorManager)
    }
  ];

  // コマンドを登録
  commands.forEach(command => {
    const disposable = vscode.commands.registerCommand(command.id, command.handler);
    context.subscriptions.push(disposable);
  });

  // ファイル変更の監視
  const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*.{ts,js,tsx,jsx,py,java,cpp,c,cs,go,rs,php,rb,swift,kt}');
  
  fileWatcher.onDidChange(async (uri) => {
    try {
      const document = await vscode.workspace.openTextDocument(uri);
      const content = document.getText();
      
      await cursorManager.processFileChangeEvent({
        filePath: uri.fsPath,
        changeType: 'modified',
        content,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('ファイル変更処理エラー:', error);
    }
  });

  context.subscriptions.push(fileWatcher);

  // 拡張機能の非アクティベーション時にクリーンアップ
  context.subscriptions.push({
    dispose: async () => {
      await cursorManager.cleanup();
    }
  });

  console.log('✅ Cursor連携拡張機能の初期化が完了しました');
}

/**
 * コードレビューコマンドの実行
 */
async function executeCodeReview(cursorManager: CursorIntegrationManager) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('アクティブなエディタがありません');
    return;
  }

  const document = editor.document;
  const content = document.getText();
  const filePath = document.fileName;

  vscode.window.showInformationMessage('🔍 コードレビューを開始しています...');

  try {
    const result = await cursorManager.executeCommand('cursor.subagent.codeReview', {
      filePath,
      content
    });

    if (result.success) {
      // 結果を新しいタブで表示
      const outputChannel = vscode.window.createOutputChannel('サブエージェント: コードレビュー');
      outputChannel.appendLine('=== コードレビュー結果 ===');
      outputChannel.appendLine(result.output);
      outputChannel.show();

      vscode.window.showInformationMessage('✅ コードレビューが完了しました');
    } else {
      vscode.window.showErrorMessage(`❌ コードレビューに失敗: ${result.error}`);
    }
  } catch (error) {
    vscode.window.showErrorMessage(`❌ コードレビューエラー: ${error}`);
  }
}

/**
 * デバッグコマンドの実行
 */
async function executeDebug(cursorManager: CursorIntegrationManager) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('アクティブなエディタがありません');
    return;
  }

  const document = editor.document;
  const content = document.getText();
  const filePath = document.fileName;

  vscode.window.showInformationMessage('🐛 デバッグを開始しています...');

  try {
    const result = await cursorManager.executeCommand('cursor.subagent.debug', {
      filePath,
      content
    });

    if (result.success) {
      const outputChannel = vscode.window.createOutputChannel('サブエージェント: デバッグ');
      outputChannel.appendLine('=== デバッグ結果 ===');
      outputChannel.appendLine(result.output);
      outputChannel.show();

      vscode.window.showInformationMessage('✅ デバッグが完了しました');
    } else {
      vscode.window.showErrorMessage(`❌ デバッグに失敗: ${result.error}`);
    }
  } catch (error) {
    vscode.window.showErrorMessage(`❌ デバッグエラー: ${error}`);
  }
}

/**
 * 最適化コマンドの実行
 */
async function executeOptimize(cursorManager: CursorIntegrationManager) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('アクティブなエディタがありません');
    return;
  }

  const document = editor.document;
  const content = document.getText();
  const filePath = document.fileName;

  vscode.window.showInformationMessage('⚡ 最適化を開始しています...');

  try {
    const result = await cursorManager.executeCommand('cursor.subagent.optimize', {
      filePath,
      content
    });

    if (result.success) {
      const outputChannel = vscode.window.createOutputChannel('サブエージェント: 最適化');
      outputChannel.appendLine('=== 最適化結果 ===');
      outputChannel.appendLine(result.output);
      outputChannel.show();

      vscode.window.showInformationMessage('✅ 最適化が完了しました');
    } else {
      vscode.window.showErrorMessage(`❌ 最適化に失敗: ${result.error}`);
    }
  } catch (error) {
    vscode.window.showErrorMessage(`❌ 最適化エラー: ${error}`);
  }
}

/**
 * セキュリティコマンドの実行
 */
async function executeSecurity(cursorManager: CursorIntegrationManager) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('アクティブなエディタがありません');
    return;
  }

  const document = editor.document;
  const content = document.getText();
  const filePath = document.fileName;

  vscode.window.showInformationMessage('🔒 セキュリティ監査を開始しています...');

  try {
    const result = await cursorManager.executeCommand('cursor.subagent.security', {
      filePath,
      content
    });

    if (result.success) {
      const outputChannel = vscode.window.createOutputChannel('サブエージェント: セキュリティ監査');
      outputChannel.appendLine('=== セキュリティ監査結果 ===');
      outputChannel.appendLine(result.output);
      outputChannel.show();

      vscode.window.showInformationMessage('✅ セキュリティ監査が完了しました');
    } else {
      vscode.window.showErrorMessage(`❌ セキュリティ監査に失敗: ${result.error}`);
    }
  } catch (error) {
    vscode.window.showErrorMessage(`❌ セキュリティ監査エラー: ${error}`);
  }
}

/**
 * 並列実行コマンドの実行
 */
async function executeParallel(cursorManager: CursorIntegrationManager) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('アクティブなエディタがありません');
    return;
  }

  const document = editor.document;
  const filePath = document.fileName;

  // 実行するタスクを選択
  const tasks = await vscode.window.showQuickPick([
    'コードレビュー',
    'デバッグ',
    '最適化',
    'セキュリティ監査',
    'ドキュメント生成'
  ], {
    canPickMany: true,
    placeHolder: '並列実行するタスクを選択してください'
  });

  if (!tasks || tasks.length === 0) {
    return;
  }

  vscode.window.showInformationMessage(`🚀 ${tasks.length}個のタスクを並列実行しています...`);

  try {
    const result = await cursorManager.executeCommand('cursor.subagent.parallel', {
      tasks,
      filePath
    });

    if (result.success) {
      const outputChannel = vscode.window.createOutputChannel('サブエージェント: 並列実行');
      outputChannel.appendLine('=== 並列実行結果 ===');
      outputChannel.appendLine(result.output);
      outputChannel.show();

      vscode.window.showInformationMessage(`✅ ${tasks.length}個のタスクの並列実行が完了しました`);
    } else {
      vscode.window.showErrorMessage(`❌ 並列実行に失敗: ${result.error}`);
    }
  } catch (error) {
    vscode.window.showErrorMessage(`❌ 並列実行エラー: ${error}`);
  }
}

/**
 * 状態確認コマンドの実行
 */
async function showStatus(cursorManager: CursorIntegrationManager) {
  const activeTasks = cursorManager.getActiveTasks();
  
  if (activeTasks.length === 0) {
    vscode.window.showInformationMessage('📊 現在アクティブなタスクはありません');
    return;
  }

  const outputChannel = vscode.window.createOutputChannel('サブエージェント: 状態確認');
  outputChannel.appendLine('=== アクティブタスク一覧 ===');
  
  activeTasks.forEach(task => {
    const status = task.status === 'running' ? '🔄' : 
                  task.status === 'completed' ? '✅' : 
                  task.status === 'failed' ? '❌' : '⏳';
    
    outputChannel.appendLine(`${status} ${task.id}: ${task.task} (${task.status})`);
    
    if (task.startTime) {
      const duration = task.endTime ? 
        Math.round((task.endTime.getTime() - task.startTime.getTime()) / 1000) :
        Math.round((Date.now() - task.startTime.getTime()) / 1000);
      outputChannel.appendLine(`   実行時間: ${duration}秒`);
    }
  });
  
  outputChannel.show();
  vscode.window.showInformationMessage(`📊 ${activeTasks.length}個のアクティブタスクがあります`);
}

/**
 * 拡張機能の非アクティベーション関数
 */
export function deactivate() {
  console.log('🛑 Cursor連携拡張機能が非アクティベートされました');
} 