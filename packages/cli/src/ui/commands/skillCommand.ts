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

export const skillCommand: SlashCommand = {
  name: 'skill',
  description: 'Execute a specific agent skill. Usage: /skill <name> [args]',
  kind: CommandKind.BUILT_IN,
  autoExecute: false,
  action: async (
    context: CommandContext,
    args: string,
  ): Promise<void | SlashCommandActionReturn> => {
    const trimmedArgs = args.trim();
    if (!trimmedArgs) {
      context.ui.addItem({
        type: MessageType.INFO,
        text: 'Usage: /skill <name> [args]. Use "/skills list" to see available skills.',
      });
      return;
    }

    const [skillName, ...skillArgs] = trimmedArgs.split(/\s+/);
    const skillManager = context.services.config?.getSkillManager();

    if (!skillManager) {
      context.ui.addItem({
        type: MessageType.ERROR,
        text: 'Could not retrieve skill manager.',
      });
      return;
    }

    const skill = skillManager.getSkill(skillName);
    if (!skill) {
      context.ui.addItem({
        type: MessageType.ERROR,
        text: `Skill "${skillName}" not found.`,
      });
      return;
    }

    if (skill.disabled) {
      context.ui.addItem({
        type: MessageType.ERROR,
        text: `Skill "${skillName}" is currently disabled. Use "/skills enable ${skillName}" to enable it.`,
      });
      return;
    }

    // Execute the skill logic (this usually involves sending the skill body as a prompt)
    // For now, we mimic a prompt that includes the skill's instructions.
    const query = skillArgs.join(' ');

    // We can't directly "execute" a skill like a tool, but we can set up the context.
    // However, the user expectation for /skill is often "apply this skill to this problem".

    context.ui.addItem({
      type: MessageType.INFO,
      text: `Executing skill "${skillName}"...`,
    });

    // We return a message that will be "sent" to the model with the skill context.
    // In a real implementation, we might want to use a specific specialized agent.
    // For now, we'll just output the intent.

    return {
      type: 'message',
      messageType: 'info',
      content: `Skill "${skillName}" activated. Context prepared for: ${query || 'General task'}`,
    };
  },
  completion: async (context, partialArg) => {
    const skillManager = context.services.config?.getSkillManager();
    if (!skillManager) return [];
    return skillManager
      .getSkills()
      .filter((s) => s.name.startsWith(partialArg))
      .map((s) => s.name);
  },
};
