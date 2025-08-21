/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { SubagentSpecialty } from '../config/subagents.js';

/**
 * ANSIカラーコード
 */
export const ANSI_COLORS = {
  // 基本色
  BLACK: '\x1b[30m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  WHITE: '\x1b[37m',
  
  // 明るい色
  BRIGHT_BLACK: '\x1b[90m',
  BRIGHT_RED: '\x1b[91m',
  BRIGHT_GREEN: '\x1b[92m',
  BRIGHT_YELLOW: '\x1b[93m',
  BRIGHT_BLUE: '\x1b[94m',
  BRIGHT_MAGENTA: '\x1b[95m',
  BRIGHT_CYAN: '\x1b[96m',
  BRIGHT_WHITE: '\x1b[97m',
  
  // 背景色
  BG_BLACK: '\x1b[40m',
  BG_RED: '\x1b[41m',
  BG_GREEN: '\x1b[42m',
  BG_YELLOW: '\x1b[43m',
  BG_BLUE: '\x1b[44m',
  BG_MAGENTA: '\x1b[45m',
  BG_CYAN: '\x1b[46m',
  BG_WHITE: '\x1b[47m',
  
  // スタイル
  BOLD: '\x1b[1m',
  DIM: '\x1b[2m',
  ITALIC: '\x1b[3m',
  UNDERLINE: '\x1b[4m',
  BLINK: '\x1b[5m',
  REVERSE: '\x1b[7m',
  HIDDEN: '\x1b[8m',
  
  // リセット
  RESET: '\x1b[0m',
  RESET_COLOR: '\x1b[39m',
  RESET_BG: '\x1b[49m'
} as const;

/**
 * サブエージェント専門分野別の色マッピング
 */
export const SPECIALTY_COLORS: Record<SubagentSpecialty, string> = {
  code_review: ANSI_COLORS.BRIGHT_GREEN,
  debugging: ANSI_COLORS.BRIGHT_RED,
  data_analysis: ANSI_COLORS.BRIGHT_BLUE,
  security_audit: ANSI_COLORS.BRIGHT_MAGENTA,
  performance_optimization: ANSI_COLORS.BRIGHT_YELLOW,
  documentation: ANSI_COLORS.BRIGHT_CYAN,
  testing: ANSI_COLORS.BRIGHT_WHITE,
  architecture_design: ANSI_COLORS.MAGENTA,
  api_design: ANSI_COLORS.CYAN,
  database_optimization: ANSI_COLORS.YELLOW,
  frontend_development: ANSI_COLORS.BLUE,
  backend_development: ANSI_COLORS.GREEN,
  devops: ANSI_COLORS.RED,
  machine_learning: ANSI_COLORS.BRIGHT_MAGENTA,
  custom: ANSI_COLORS.WHITE
};

/**
 * エージェント状態別の色マッピング
 */
export const STATUS_COLORS = {
  idle: ANSI_COLORS.DIM + ANSI_COLORS.WHITE,
  running: ANSI_COLORS.BRIGHT_YELLOW,
  completed: ANSI_COLORS.BRIGHT_GREEN,
  failed: ANSI_COLORS.BRIGHT_RED,
  terminated: ANSI_COLORS.BRIGHT_RED
} as const;

/**
 * メッセージタイプ別の色マッピング
 */
export const MESSAGE_COLORS: Record<string, string> = {
  info: ANSI_COLORS.BRIGHT_BLUE,
  success: ANSI_COLORS.BRIGHT_GREEN,
  warning: ANSI_COLORS.BRIGHT_YELLOW,
  error: ANSI_COLORS.BRIGHT_RED,
  progress: ANSI_COLORS.BRIGHT_CYAN,
  debug: ANSI_COLORS.DIM + ANSI_COLORS.WHITE,
  agent_speech: ANSI_COLORS.WHITE
};

/**
 * カラーマネージャー設定
 */
export interface ColorManagerConfig {
  enableColors: boolean;
  enableEmojis: boolean;
  enableTimestamps: boolean;
  logToFile: boolean;
  logFilePath?: string;
  colorMode: 'ansi' | 'html' | 'none';
  customColors?: Record<string, string>;
}

/**
 * 色付きメッセージ構造
 */
export interface ColoredMessage {
  text: string;
  color: string;
  agentId?: string;
  agentName?: string;
  specialty?: SubagentSpecialty;
  timestamp: number;
  type: 'info' | 'success' | 'warning' | 'error' | 'progress' | 'debug' | 'agent_speech';
}

/**
 * サブエージェント色分けマネージャー
 * サブエージェントの出力に色分け機能を提供
 */
export class ColorManager {
  private config: ColorManagerConfig;
  private agentColors: Map<string, string> = new Map();
  private colorIndex = 0;
  private availableColors: string[];

  constructor(config: ColorManagerConfig) {
    this.config = config;
    this.availableColors = this.generateColorPalette();
  }

  /**
   * サブエージェントの色を取得または生成
   */
  getAgentColor(agentId: string, specialty?: SubagentSpecialty): string {
    // 既存の色があれば返す
    if (this.agentColors.has(agentId)) {
      return this.agentColors.get(agentId)!;
    }

    // 専門分野に基づく色を優先
    if (specialty && SPECIALTY_COLORS[specialty]) {
      const color = SPECIALTY_COLORS[specialty];
      this.agentColors.set(agentId, color);
      return color;
    }

    // カスタム色があれば使用
    if (this.config.customColors && this.config.customColors[agentId]) {
      const color = this.config.customColors[agentId];
      this.agentColors.set(agentId, color);
      return color;
    }

    // 利用可能な色から順番に割り当て
    const color = this.availableColors[this.colorIndex % this.availableColors.length];
    this.agentColors.set(agentId, color);
    this.colorIndex++;

    return color;
  }

  /**
   * 色付きメッセージを生成
   */
  createColoredMessage(
    text: string,
    agentId?: string,
    agentName?: string,
    specialty?: SubagentSpecialty,
    type: ColoredMessage['type'] = 'agent_speech'
  ): ColoredMessage {
    let color = MESSAGE_COLORS['info'];

    if (type === 'agent_speech' && agentId) {
      color = this.getAgentColor(agentId, specialty);
    } else if (MESSAGE_COLORS[type]) {
      color = MESSAGE_COLORS[type];
    }

    return {
      text,
      color,
      agentId,
      agentName,
      specialty,
      timestamp: Date.now(),
      type
    };
  }

  /**
   * 色付きメッセージをフォーマット
   */
  formatMessage(message: ColoredMessage): string {
    if (!this.config.enableColors) {
      return this.formatPlainMessage(message);
    }

    switch (this.config.colorMode) {
      case 'ansi':
        return this.formatANSIMessage(message);
      case 'html':
        return this.formatHTMLMessage(message);
      case 'none':
      default:
        return this.formatPlainMessage(message);
    }
  }

  /**
   * ANSI形式でのメッセージフォーマット
   */
  private formatANSIMessage(message: ColoredMessage): string {
    let formatted = '';

    // タイムスタンプ
    if (this.config.enableTimestamps) {
      const timestamp = new Date(message.timestamp).toLocaleTimeString();
      formatted += `${ANSI_COLORS.DIM}[${timestamp}]${ANSI_COLORS.RESET} `;
    }

    // エージェント情報
    if (message.agentId && message.agentName) {
      const agentColor = this.getAgentColor(message.agentId, message.specialty);
      formatted += `${agentColor}${message.agentName}${ANSI_COLORS.RESET}: `;
    }

    // メッセージタイプの絵文字
    if (this.config.enableEmojis) {
      const emoji = this.getMessageEmoji(message.type);
      formatted += `${emoji} `;
    }

    // メッセージ本文
    formatted += `${message.color}${message.text}${ANSI_COLORS.RESET}`;

    return formatted;
  }

  /**
   * HTML形式でのメッセージフォーマット
   */
  private formatHTMLMessage(message: ColoredMessage): string {
    let formatted = '<div class="message">';

    // タイムスタンプ
    if (this.config.enableTimestamps) {
      const timestamp = new Date(message.timestamp).toLocaleTimeString();
      formatted += `<span class="timestamp">[${timestamp}]</span> `;
    }

    // エージェント情報
    if (message.agentId && message.agentName) {
      const colorHex = this.ansiToHex(message.color);
      formatted += `<span class="agent" style="color: ${colorHex}">${message.agentName}</span>: `;
    }

    // メッセージタイプの絵文字
    if (this.config.enableEmojis) {
      const emoji = this.getMessageEmoji(message.type);
      formatted += `<span class="emoji">${emoji}</span> `;
    }

    // メッセージ本文
    const colorHex = this.ansiToHex(message.color);
    formatted += `<span class="text" style="color: ${colorHex}">${this.escapeHtml(message.text)}</span>`;

    formatted += '</div>';
    return formatted;
  }

  /**
   * プレーンテキスト形式でのメッセージフォーマット
   */
  private formatPlainMessage(message: ColoredMessage): string {
    let formatted = '';

    // タイムスタンプ
    if (this.config.enableTimestamps) {
      const timestamp = new Date(message.timestamp).toLocaleTimeString();
      formatted += `[${timestamp}] `;
    }

    // エージェント情報
    if (message.agentId && message.agentName) {
      formatted += `${message.agentName}: `;
    }

    // メッセージタイプの絵文字
    if (this.config.enableEmojis) {
      const emoji = this.getMessageEmoji(message.type);
      formatted += `${emoji} `;
    }

    // メッセージ本文
    formatted += message.text;

    return formatted;
  }

  /**
   * メッセージタイプに応じた絵文字を取得
   */
  private getMessageEmoji(type: ColoredMessage['type']): string {
    const emojis = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      progress: '🔄',
      debug: '🐛',
      agent_speech: '💬'
    };

    return emojis[type] || '💬';
  }

  /**
   * サブエージェントの会話メッセージを生成
   */
  formatAgentSpeech(
    agentId: string,
    agentName: string,
    specialty: SubagentSpecialty,
    message: string
  ): string {
    const coloredMessage = this.createColoredMessage(message, agentId, agentName, specialty, 'agent_speech');
    return this.formatMessage(coloredMessage);
  }

  /**
   * システムメッセージを生成
   */
  formatSystemMessage(message: string, type: string = 'info'): string {
    const coloredMessage = this.createColoredMessage(message, undefined, undefined, undefined, type as ColoredMessage['type']);
    return this.formatMessage(coloredMessage);
  }

  /**
   * 進捗メッセージを生成
   */
  formatProgressMessage(message: string, agentId?: string, agentName?: string): string {
    const coloredMessage = this.createColoredMessage(message, agentId, agentName, undefined, 'progress');
    return this.formatMessage(coloredMessage);
  }

  /**
   * エラーメッセージを生成
   */
  formatErrorMessage(message: string, agentId?: string, agentName?: string): string {
    const coloredMessage = this.createColoredMessage(message, agentId, agentName, undefined, 'error');
    return this.formatMessage(coloredMessage);
  }

  /**
   * 成功メッセージを生成
   */
  formatSuccessMessage(message: string, agentId?: string, agentName?: string): string {
    const coloredMessage = this.createColoredMessage(message, agentId, agentName, undefined, 'success');
    return this.formatMessage(coloredMessage);
  }

  /**
   * 利用可能な色パレットを生成
   */
  private generateColorPalette(): string[] {
    return [
      ANSI_COLORS.BRIGHT_RED,
      ANSI_COLORS.BRIGHT_GREEN,
      ANSI_COLORS.BRIGHT_BLUE,
      ANSI_COLORS.BRIGHT_YELLOW,
      ANSI_COLORS.BRIGHT_MAGENTA,
      ANSI_COLORS.BRIGHT_CYAN,
      ANSI_COLORS.RED,
      ANSI_COLORS.GREEN,
      ANSI_COLORS.BLUE,
      ANSI_COLORS.YELLOW,
      ANSI_COLORS.MAGENTA,
      ANSI_COLORS.CYAN,
      ANSI_COLORS.BRIGHT_WHITE,
      ANSI_COLORS.WHITE
    ];
  }

  /**
   * ANSIカラーコードをHEXに変換
   */
  private ansiToHex(ansiColor: string): string {
    const colorMap: Record<string, string> = {
      [ANSI_COLORS.BRIGHT_RED]: '#ff0000',
      [ANSI_COLORS.BRIGHT_GREEN]: '#00ff00',
      [ANSI_COLORS.BRIGHT_BLUE]: '#0000ff',
      [ANSI_COLORS.BRIGHT_YELLOW]: '#ffff00',
      [ANSI_COLORS.BRIGHT_MAGENTA]: '#ff00ff',
      [ANSI_COLORS.BRIGHT_CYAN]: '#00ffff',
      [ANSI_COLORS.RED]: '#800000',
      [ANSI_COLORS.GREEN]: '#008000',
      [ANSI_COLORS.BLUE]: '#000080',
      [ANSI_COLORS.YELLOW]: '#808000',
      [ANSI_COLORS.MAGENTA]: '#800080',
      [ANSI_COLORS.CYAN]: '#008080',
      [ANSI_COLORS.WHITE]: '#ffffff',
      [ANSI_COLORS.BRIGHT_WHITE]: '#ffffff'
    };

    return colorMap[ansiColor] || '#ffffff';
  }

  /**
   * HTMLエスケープ
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * 設定を更新
   */
  updateConfig(updates: Partial<ColorManagerConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * エージェントの色をリセット
   */
  resetAgentColors(): void {
    this.agentColors.clear();
    this.colorIndex = 0;
  }

  /**
   * 現在の設定を取得
   */
  getConfig(): ColorManagerConfig {
    return { ...this.config };
  }

  /**
   * エージェントの色マッピングを取得
   */
  getAgentColors(): Map<string, string> {
    return new Map(this.agentColors);
  }
} 