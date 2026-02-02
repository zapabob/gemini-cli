/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  type CommandContext,
  type SlashCommand,
  type SlashCommandActionReturn,
  CommandKind,
} from './types.js';
import { MessageType } from '../types.js';
import {
  SupervisorAgent,
  type SupervisorConfig,
} from '@google/gemini-cli-core';

export const planCommand: SlashCommand = {
  name: 'plan',
  description:
    'Generate a structured implementation plan for a goal. Usage: /plan <goal>',
  kind: CommandKind.BUILT_IN,
  autoExecute: false,
  action: async (
    context: CommandContext,
    args: string,
  ): Promise<void | SlashCommandActionReturn> => {
    const goal = args.trim();
    if (!goal) {
      context.ui.addItem({
        type: MessageType.INFO,
        text: 'Usage: /plan <goal>. Example: /plan "Implement user auth with JWT"',
      });
      return;
    }

    context.ui.addItem({
      type: MessageType.INFO,
      text: `🧐 Analyzing goal and generating plan: "${goal}"...`,
    });

    try {
      // Configuration for the planning supervisor
      const config: SupervisorConfig = {
        role: {
          id: 'planner-supervisor',
          name: 'Tech Lead / Architect',
          description:
            'A supervisor focused on creating high-quality implementation plans.',
          responsibilities: [
            'Goal analysis',
            'Task decomposition',
            'Risk assessment',
          ],
          decisionMakingAuthority: 'high',
          coordinationStyle: 'democratic',
        },
        maxSubagents: 3,
        coordinationStrategy: 'sequential',
        decisionThreshold: 0.8,
        progressReporting: true,
        errorHandling: 'adaptive',
      };

      const supervisor = new SupervisorAgent(config);

      // We use a specific method or prompt to just get the plan.
      // Since superviseImplementation is already built, we use it with an empty/default set of subagents
      // to just leverage the supervisor's own planning capability.
      const result = await supervisor.superviseImplementation(goal, []);

      if (result.success) {
        return {
          type: 'message',
          messageType: 'info',
          content: `📝 **Implementation Plan Generated**\n\n${result.finalOutput}`,
        };
      } else {
        return {
          type: 'message',
          messageType: 'error',
          content: `Failed to generate plan: ${result.errors.join(', ')}`,
        };
      }
    } catch (error) {
      return {
        type: 'message',
        messageType: 'error',
        content: `Error during plan generation: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
};
