/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * ログレベル
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * ログエントリ
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

/**
 * ロガークラス
 * DeepresearchMCPサーバーのログ機能を提供
 */
export class Logger {
  private logLevel: LogLevel;
  private enableConsole: boolean;
  private enableFile: boolean;
  private logFile?: string;

  constructor(
    logLevel: LogLevel = 'info',
    enableConsole = true,
    enableFile = false,
    logFile?: string
  ) {
    this.logLevel = logLevel;
    this.enableConsole = enableConsole;
    this.enableFile = enableFile;
    this.logFile = logFile;
  }

  /**
   * デバッグログ
   */
  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  /**
   * 情報ログ
   */
  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  /**
   * 警告ログ
   */
  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  /**
   * エラーログ
   */
  error(message: string, data?: unknown): void {
    this.log('error', message, data);
  }

  /**
   * ログの出力
   */
  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };

    const formattedLog = this.formatLogEntry(entry);

    if (this.enableConsole) {
      this.writeToConsole(level, formattedLog);
    }

    if (this.enableFile && this.logFile) {
      this.writeToFile(formattedLog);
    }
  }

  /**
   * ログレベルチェック
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * ログエントリのフォーマット
   */
  private formatLogEntry(entry: LogEntry): string {
    const { timestamp, level, message, data } = entry;
    
    let formatted = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (data) {
      try {
        const dataStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        formatted += `\n${dataStr}`;
      } catch (error) {
        formatted += `\n[Data serialization error: ${error}]`;
      }
    }
    
    return formatted;
  }

  /**
   * コンソールへの出力
   */
  private writeToConsole(level: LogLevel, formattedLog: string): void {
    const colors = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m',  // Green
      warn: '\x1b[33m',  // Yellow
      error: '\x1b[31m', // Red
    };

    const reset = '\x1b[0m';
    const color = colors[level] || '';
    
    console.log(`${color}${formattedLog}${reset}`);
  }

  /**
   * ファイルへの出力
   */
  private writeToFile(formattedLog: string): void {
    if (!this.logFile) return;

    try {
      const fs = require('fs-extra');
      fs.appendFileSync(this.logFile, formattedLog + '\n', 'utf-8');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  /**
   * ログレベルの設定
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * コンソール出力の有効/無効設定
   */
  setConsoleOutput(enabled: boolean): void {
    this.enableConsole = enabled;
  }

  /**
   * ファイル出力の有効/無効設定
   */
  setFileOutput(enabled: boolean, logFile?: string): void {
    this.enableFile = enabled;
    if (logFile) {
      this.logFile = logFile;
    }
  }

  /**
   * ログ統計の取得
   */
  getStats(): {
    logLevel: LogLevel;
    consoleEnabled: boolean;
    fileEnabled: boolean;
    logFile?: string;
  } {
    return {
      logLevel: this.logLevel,
      consoleEnabled: this.enableConsole,
      fileEnabled: this.enableFile,
      logFile: this.logFile,
    };
  }
} 