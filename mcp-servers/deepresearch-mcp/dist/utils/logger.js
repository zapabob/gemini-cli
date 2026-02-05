/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * ロガークラス
 * DeepresearchMCPサーバーのログ機能を提供
 */
export class Logger {
    logLevel;
    enableConsole;
    enableFile;
    logFile;
    constructor(logLevel = 'info', enableConsole = true, enableFile = false, logFile) {
        this.logLevel = logLevel;
        this.enableConsole = enableConsole;
        this.enableFile = enableFile;
        this.logFile = logFile;
    }
    /**
     * デバッグログ
     */
    debug(message, data) {
        this.log('debug', message, data);
    }
    /**
     * 情報ログ
     */
    info(message, data) {
        this.log('info', message, data);
    }
    /**
     * 警告ログ
     */
    warn(message, data) {
        this.log('warn', message, data);
    }
    /**
     * エラーログ
     */
    error(message, data) {
        this.log('error', message, data);
    }
    /**
     * ログの出力
     */
    log(level, message, data) {
        if (!this.shouldLog(level)) {
            return;
        }
        const entry = {
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
    shouldLog(level) {
        const levels = ['debug', 'info', 'warn', 'error'];
        const currentLevelIndex = levels.indexOf(this.logLevel);
        const messageLevelIndex = levels.indexOf(level);
        return messageLevelIndex >= currentLevelIndex;
    }
    /**
     * ログエントリのフォーマット
     */
    formatLogEntry(entry) {
        const { timestamp, level, message, data } = entry;
        let formatted = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        if (data) {
            try {
                const dataStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
                formatted += `\n${dataStr}`;
            }
            catch (error) {
                formatted += `\n[Data serialization error: ${error}]`;
            }
        }
        return formatted;
    }
    /**
     * コンソールへの出力
     */
    writeToConsole(level, formattedLog) {
        const colors = {
            debug: '\x1b[36m', // Cyan
            info: '\x1b[32m', // Green
            warn: '\x1b[33m', // Yellow
            error: '\x1b[31m', // Red
        };
        const reset = '\x1b[0m';
        const color = colors[level] || '';
        console.log(`${color}${formattedLog}${reset}`);
    }
    /**
     * ファイルへの出力
     */
    writeToFile(formattedLog) {
        if (!this.logFile)
            return;
        try {
            const fs = require('fs-extra');
            fs.appendFileSync(this.logFile, formattedLog + '\n', 'utf-8');
        }
        catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }
    /**
     * ログレベルの設定
     */
    setLogLevel(level) {
        this.logLevel = level;
    }
    /**
     * コンソール出力の有効/無効設定
     */
    setConsoleOutput(enabled) {
        this.enableConsole = enabled;
    }
    /**
     * ファイル出力の有効/無効設定
     */
    setFileOutput(enabled, logFile) {
        this.enableFile = enabled;
        if (logFile) {
            this.logFile = logFile;
        }
    }
    /**
     * ログ統計の取得
     */
    getStats() {
        return {
            logLevel: this.logLevel,
            consoleEnabled: this.enableConsole,
            fileEnabled: this.enableFile,
            logFile: this.logFile,
        };
    }
}
//# sourceMappingURL=logger.js.map