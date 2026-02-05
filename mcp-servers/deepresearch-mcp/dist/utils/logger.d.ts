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
export declare class Logger {
    private logLevel;
    private enableConsole;
    private enableFile;
    private logFile?;
    constructor(logLevel?: LogLevel, enableConsole?: boolean, enableFile?: boolean, logFile?: string);
    /**
     * デバッグログ
     */
    debug(message: string, data?: unknown): void;
    /**
     * 情報ログ
     */
    info(message: string, data?: unknown): void;
    /**
     * 警告ログ
     */
    warn(message: string, data?: unknown): void;
    /**
     * エラーログ
     */
    error(message: string, data?: unknown): void;
    /**
     * ログの出力
     */
    private log;
    /**
     * ログレベルチェック
     */
    private shouldLog;
    /**
     * ログエントリのフォーマット
     */
    private formatLogEntry;
    /**
     * コンソールへの出力
     */
    private writeToConsole;
    /**
     * ファイルへの出力
     */
    private writeToFile;
    /**
     * ログレベルの設定
     */
    setLogLevel(level: LogLevel): void;
    /**
     * コンソール出力の有効/無効設定
     */
    setConsoleOutput(enabled: boolean): void;
    /**
     * ファイル出力の有効/無効設定
     */
    setFileOutput(enabled: boolean, logFile?: string): void;
    /**
     * ログ統計の取得
     */
    getStats(): {
        logLevel: LogLevel;
        consoleEnabled: boolean;
        fileEnabled: boolean;
        logFile?: string;
    };
}
//# sourceMappingURL=logger.d.ts.map