/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Flicker frame data
 */
export interface FlickerFrame {
  timestamp: number;
  duration: number;
  severity: 'low' | 'medium' | 'high';
  component?: string;
}

/**
 * Record a flicker frame
 */
export function recordFlickerFrame(frame: FlickerFrame): void {
  // Log flicker detection for debugging
  console.debug(`[Flicker Detection] ${frame.severity} flicker detected:`, {
    duration: frame.duration,
    component: frame.component,
    timestamp: new Date(frame.timestamp).toISOString()
  });
}

/**
 * Flicker detector class
 */
export class FlickerDetector {
  private frames: FlickerFrame[] = [];
  private readonly maxFrames = 100;

  /**
   * Add a flicker frame
   */
  addFrame(frame: FlickerFrame): void {
    this.frames.push(frame);
    recordFlickerFrame(frame);

    // Keep only the last N frames
    if (this.frames.length > this.maxFrames) {
      this.frames = this.frames.slice(-this.maxFrames);
    }
  }

  /**
   * Get flicker statistics
   */
  getStats(): {
    totalFrames: number;
    averageDuration: number;
    severityCounts: Record<string, number>;
  } {
    const totalFrames = this.frames.length;
    const averageDuration = totalFrames > 0 
      ? this.frames.reduce((sum, frame) => sum + frame.duration, 0) / totalFrames 
      : 0;
    
    const severityCounts = this.frames.reduce((counts, frame) => {
      counts[frame.severity] = (counts[frame.severity] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return {
      totalFrames,
      averageDuration,
      severityCounts
    };
  }

  /**
   * Clear all frames
   */
  clear(): void {
    this.frames = [];
  }
}
