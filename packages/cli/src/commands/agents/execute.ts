/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {
  YamlAgentLoader,
  SubagentRegistry,
  SubagentExecutor,
  type Subagent,
  type SubagentDefinition,
  type SubagentTask,
} from '@google/gemini-cli-core';

export async function executeAgentCommand(args: string[]): Promise<void> {
  const argv = await yargs(hideBin(args))
    .option('name', {
      type: 'string',
      description: 'Subagent name to run',
      demandOption: true,
    })
    .option('task', {
      type: 'string',
      description: 'Task to run',
      demandOption: true,
    })
    .option('context', {
      type: 'string',
      description: 'Additional context',
    })
    .help().argv;

  try {
    const loader = new YamlAgentLoader();
    await loader.loadAllAgents();

    const registry = SubagentRegistry.getInstance();
    const agentDefinition = registry.getSubagent(argv.name);

    if (!agentDefinition) {
      process.stderr.write(`Subagent not found: ${argv.name}. Use: gemini agents list\n`);
      process.exit(1);
    }

    // Running subagent

    const executor = new SubagentExecutor();
    const subagent = createSubagentFromDefinition(agentDefinition);
    const task: SubagentTask = {
      id: `execute-${agentDefinition.name}-${Date.now()}`,
      task: argv.task,
      context: argv.context || '',
      priority: 'medium',
    };

    const result = await executor.executeTask(subagent, task);

    // Subagent execution completed successfully
  } catch (error) {
    process.stderr.write(`Subagent execution failed: ${error}\n`);
    process.exit(1);
  }
}

function createSubagentFromDefinition(
  definition: SubagentDefinition,
): Subagent {
  const now = new Date().toISOString();
  const config = definition.config ?? {};
  const systemPrompt =
    typeof (config as { systemPrompt?: unknown }).systemPrompt === 'string'
      ? (config as { systemPrompt: string }).systemPrompt
      : undefined;
  const maxTokens =
    typeof (config as { maxTokens?: unknown }).maxTokens === 'number'
      ? (config as { maxTokens: number }).maxTokens
      : 4000;
  const temperature =
    typeof (config as { temperature?: unknown }).temperature === 'number'
      ? (config as { temperature: number }).temperature
      : 0.7;

  return {
    id: `yaml-${definition.name}-${Date.now()}`,
    name: definition.name,
    description: definition.description,
    specialty: definition.specialty as Subagent['specialty'],
    prompt: '',
    systemPrompt,
    maxTokens,
    temperature,
    status: 'idle',
    createdAt: now,
    taskHistory: [],
    customTools: [],
    isActive: true,
  };
}
