#!/usr/bin/env node
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { EventEmitter } from 'events';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * プログレスバークラス
 */
class ProgressBar extends EventEmitter {
  constructor(options = {}) {
    super();
    this.width = options.width || 40;
    this.total = options.total || 100;
    this.current = options.current || 0;
    this.title = options.title || '処理中';
    this.description = options.description || '';
    this.showPercentage = options.showPercentage !== false;
    this.showSpeed = options.showSpeed !== false;
    this.showETA = options.showETA !== false;
    this.showElapsed = options.showElapsed !== false;
    this.startTime = Date.now();
    this.lastUpdateTime = this.startTime;
    this.lastCurrent = 0;
    this.speed = 0;
    this.eta = 0;
    this.isComplete = false;
    this.isPaused = false;
    this.pauseStartTime = 0;
    this.totalPausedTime = 0;
  }

  /**
   * プログレスバーを更新
   */
  update(current, description = '') {
    if (this.isComplete) return;

    const now = Date.now();
    const elapsed = now - this.startTime - this.totalPausedTime;
    
    // 速度計算
    if (now - this.lastUpdateTime > 0) {
      const delta = current - this.lastCurrent;
      const timeDelta = now - this.lastUpdateTime;
      this.speed = delta / (timeDelta / 1000); // アイテム/秒
    }

    // ETA計算
    if (this.speed > 0) {
      const remaining = this.total - current;
      this.eta = remaining / this.speed;
    }

    this.current = Math.min(current, this.total);
    this.description = description;
    this.lastCurrent = current;
    this.lastUpdateTime = now;

    this.render();
    this.emit('progress', this.current, this.total, this.getPercentage());
  }

  /**
   * プログレスバーをインクリメント
   */
  increment(amount = 1, description = '') {
    this.update(this.current + amount, description);
  }

  /**
   * プログレスバーを完了
   */
  complete(description = '完了') {
    this.isComplete = true;
    this.current = this.total;
    this.description = description;
    this.render();
    this.emit('complete');
  }

  /**
   * プログレスバーを一時停止
   */
  pause() {
    if (!this.isPaused) {
      this.isPaused = true;
      this.pauseStartTime = Date.now();
      this.render();
      this.emit('pause');
    }
  }

  /**
   * プログレスバーを再開
   */
  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.totalPausedTime += Date.now() - this.pauseStartTime;
      this.render();
      this.emit('resume');
    }
  }

  /**
   * プログレスバーを停止
   */
  stop() {
    this.isComplete = true;
    this.render();
    this.emit('stop');
  }

  /**
   * パーセンテージを取得
   */
  getPercentage() {
    return Math.round((this.current / this.total) * 100);
  }

  /**
   * 経過時間を取得
   */
  getElapsedTime() {
    const elapsed = Date.now() - this.startTime - this.totalPausedTime;
    return this.formatTime(elapsed);
  }

  /**
   * 残り時間を取得
   */
  getETATime() {
    return this.formatTime(this.eta * 1000);
  }

  /**
   * 時間をフォーマット
   */
  formatTime(ms) {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.round((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }

  /**
   * プログレスバーをレンダリング
   */
  render() {
    const percentage = this.getPercentage();
    const filledWidth = Math.round((this.width * percentage) / 100);
    const emptyWidth = this.width - filledWidth;

    // プログレスバーの作成
    const filled = '█'.repeat(filledWidth);
    const empty = '░'.repeat(emptyWidth);
    const bar = filled + empty;

    // 基本情報
    let output = `\r${this.title}: [${bar}] ${percentage}%`;

    // 追加情報
    const info = [];
    
    if (this.showSpeed && this.speed > 0) {
      info.push(`${this.speed.toFixed(1)}/s`);
    }
    
    if (this.showETA && this.eta > 0) {
      info.push(`ETA: ${this.getETATime()}`);
    }
    
    if (this.showElapsed) {
      info.push(`経過: ${this.getElapsedTime()}`);
    }

    if (info.length > 0) {
      output += ` (${info.join(', ')})`;
    }

    // 説明
    if (this.description) {
      output += ` - ${this.description}`;
    }

    // 一時停止表示
    if (this.isPaused) {
      output += ' [一時停止]';
    }

    // 完了表示
    if (this.isComplete) {
      output += '\n';
    }

    // 出力
    process.stdout.write(output);
  }

  /**
   * プログレスバーをクリア
   */
  clear() {
    process.stdout.write('\r' + ' '.repeat(process.stdout.columns) + '\r');
  }
}

/**
 * マルチプログレスバー管理クラス
 */
class MultiProgressBar {
  constructor() {
    this.bars = new Map();
    this.isRendering = false;
  }

  /**
   * 新しいプログレスバーを追加
   */
  addBar(id, options = {}) {
    const bar = new ProgressBar(options);
    this.bars.set(id, bar);
    
    bar.on('complete', () => {
      this.render();
    });
    
    bar.on('progress', () => {
      this.render();
    });

    return bar;
  }

  /**
   * プログレスバーを取得
   */
  getBar(id) {
    return this.bars.get(id);
  }

  /**
   * プログレスバーを削除
   */
  removeBar(id) {
    const bar = this.bars.get(id);
    if (bar) {
      bar.clear();
      this.bars.delete(id);
      this.render();
    }
  }

  /**
   * すべてのプログレスバーをレンダリング
   */
  render() {
    if (this.isRendering) return;
    this.isRendering = true;

    // カーソルを上に移動
    const barCount = this.bars.size;
    if (barCount > 0) {
      process.stdout.write('\x1b[' + barCount + 'A');
    }

    // 各バーをレンダリング
    for (const [id, bar] of this.bars) {
      bar.render();
    }

    this.isRendering = false;
  }

  /**
   * すべてのプログレスバーをクリア
   */
  clear() {
    for (const [id, bar] of this.bars) {
      bar.clear();
    }
    this.bars.clear();
  }
}

/**
 * スピナー付きプログレスバー
 */
class SpinnerProgressBar extends ProgressBar {
  constructor(options = {}) {
    super(options);
    this.spinnerChars = options.spinnerChars || ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    this.spinnerIndex = 0;
    this.spinnerInterval = null;
    this.startSpinner();
  }

  /**
   * スピナーを開始
   */
  startSpinner() {
    this.spinnerInterval = setInterval(() => {
      this.spinnerIndex = (this.spinnerIndex + 1) % this.spinnerChars.length;
      if (!this.isComplete && !this.isPaused) {
        this.render();
      }
    }, 100);
  }

  /**
   * スピナーを停止
   */
  stopSpinner() {
    if (this.spinnerInterval) {
      clearInterval(this.spinnerInterval);
      this.spinnerInterval = null;
    }
  }

  /**
   * プログレスバーをレンダリング（オーバーライド）
   */
  render() {
    const spinner = this.spinnerChars[this.spinnerIndex];
    const percentage = this.getPercentage();
    const filledWidth = Math.round((this.width * percentage) / 100);
    const emptyWidth = this.width - filledWidth;

    const filled = '█'.repeat(filledWidth);
    const empty = '░'.repeat(emptyWidth);
    const bar = filled + empty;

    let output = `\r${spinner} ${this.title}: [${bar}] ${percentage}%`;

    if (this.description) {
      output += ` - ${this.description}`;
    }

    if (this.isComplete) {
      output += '\n';
      this.stopSpinner();
    }

    process.stdout.write(output);
  }

  /**
   * 完了（オーバーライド）
   */
  complete(description = '完了') {
    super.complete(description);
    this.stopSpinner();
  }

  /**
   * 停止（オーバーライド）
   */
  stop() {
    super.stop();
    this.stopSpinner();
  }
}

/**
 * 使用例とテスト関数
 */
function createExample() {
  console.log('🚀 プログレスバーの例を開始します...\n');

  // 単一プログレスバー
  const bar = new ProgressBar({
    width: 30,
    total: 100,
    title: 'ファイル処理',
    showPercentage: true,
    showSpeed: true,
    showETA: true,
    showElapsed: true
  });

  let current = 0;
  const interval = setInterval(() => {
    current += Math.random() * 10;
    if (current >= 100) {
      current = 100;
      clearInterval(interval);
      bar.complete('ファイル処理が完了しました');
      
      // マルチプログレスバーの例
      setTimeout(() => {
        createMultiProgressExample();
      }, 1000);
    } else {
      bar.update(current, `ファイル ${Math.round(current)} を処理中`);
    }
  }, 200);
}

function createMultiProgressExample() {
  console.log('\n🔄 マルチプログレスバーの例を開始します...\n');

  const multiBar = new MultiProgressBar();

  // 複数のプログレスバーを作成
  const bar1 = multiBar.addBar('download', {
    width: 25,
    total: 50,
    title: 'ダウンロード',
    showSpeed: true
  });

  const bar2 = multiBar.addBar('process', {
    width: 25,
    total: 30,
    title: '処理',
    showETA: true
  });

  const bar3 = multiBar.addBar('upload', {
    width: 25,
    total: 20,
    title: 'アップロード',
    showElapsed: true
  });

  // ダウンロードバー
  let downloadCurrent = 0;
  const downloadInterval = setInterval(() => {
    downloadCurrent += Math.random() * 3;
    if (downloadCurrent >= 50) {
      downloadCurrent = 50;
      clearInterval(downloadInterval);
      bar1.complete('ダウンロード完了');
    } else {
      bar1.update(downloadCurrent, `${Math.round(downloadCurrent)}MB`);
    }
  }, 300);

  // 処理バー
  let processCurrent = 0;
  const processInterval = setInterval(() => {
    processCurrent += Math.random() * 2;
    if (processCurrent >= 30) {
      processCurrent = 30;
      clearInterval(processInterval);
      bar2.complete('処理完了');
    } else {
      bar2.update(processCurrent, `ステップ ${Math.round(processCurrent)}`);
    }
  }, 400);

  // アップロードバー
  let uploadCurrent = 0;
  const uploadInterval = setInterval(() => {
    uploadCurrent += Math.random() * 1.5;
    if (uploadCurrent >= 20) {
      uploadCurrent = 20;
      clearInterval(uploadInterval);
      bar3.complete('アップロード完了');
      
      setTimeout(() => {
        console.log('\n✅ すべての処理が完了しました！');
      }, 1000);
    } else {
      bar3.update(uploadCurrent, `${Math.round(uploadCurrent)}MB`);
    }
  }, 500);
}

// エクスポート
export { ProgressBar, MultiProgressBar, SpinnerProgressBar };

// テスト実行
if (import.meta.url === `file://${process.argv[1]}`) {
  createExample();
} 