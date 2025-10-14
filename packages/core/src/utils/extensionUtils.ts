/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Extension update event types
 */
export enum ExtensionUpdateEvent {
  INSTALL = 'install',
  UPDATE = 'update',
  UNINSTALL = 'uninstall',
  ENABLE = 'enable',
  DISABLE = 'disable'
}

/**
 * Extension update event data
 */
export interface ExtensionUpdateEventData {
  extensionId: string;
  extensionName: string;
  version?: string;
  event: ExtensionUpdateEvent;
  timestamp: Date;
  success: boolean;
  error?: string;
}

/**
 * Log extension update event
 */
export function logExtensionUpdateEvent(data: ExtensionUpdateEventData): void {
  console.log(`[Extension Update] ${data.event}: ${data.extensionName} (${data.extensionId})`, {
    version: data.version,
    success: data.success,
    error: data.error,
    timestamp: data.timestamp.toISOString()
  });
}
