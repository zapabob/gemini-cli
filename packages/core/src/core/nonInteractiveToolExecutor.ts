/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Config } from '../config/config.js';
import {
  ToolExecutor,
  type ToolExecutionContext,
} from '../scheduler/tool-executor.js';
import type {
  ToolCallRequestInfo,
  ToolCallResponseInfo,
  ScheduledToolCall,
} from '../scheduler/types.js';

/**
 * Executes a tool call in a non-interactive manner.
 *
 * This function is intended for use in subagents or other non-interactive contexts
 * where a single tool needs to be executed without complex scheduling or user interaction.
 *
 * @param config The global runtime configuration.
 * @param request The tool call request information.
 * @param signal An AbortSignal to allow for cancellation of the tool execution.
 * @returns A promise that resolves to the tool call response information.
 * @throws {Error} If the tool is not found in the registry or if execution fails.
 */
export async function executeToolCall(
  config: Config,
  request: ToolCallRequestInfo,
  signal: AbortSignal,
): Promise<ToolCallResponseInfo> {
  const toolRegistry = config.getToolRegistry();
  const tool = toolRegistry.getTool(request.name);

  if (!tool) {
    throw new Error(`Tool "${request.name}" not found in registry.`);
  }

  const invocation = tool.build(request.args);
  const toolExecutor = new ToolExecutor(config);

  const scheduledCall: ScheduledToolCall = {
    status: 'scheduled',
    request,
    tool,
    invocation,
    startTime: Date.now(),
  };

  const context: ToolExecutionContext = {
    call: scheduledCall,
    signal,
    onUpdateToolCall: () => {
      // No-op for non-interactive execution updates
    },
  };

  const result = await toolExecutor.execute(context);
  return result.response;
}
