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
  type SubagentResult,
} from '@google/gemini-cli-core';

export async function executeParallelAgentsCommand(
  args: string[],
): Promise<void> {
  const argv = await yargs(hideBin(args))
    .option('task', {
      type: 'string',
      description: 'Task to run',
      demandOption: true,
    })
    .option('agents', {
      type: 'array',
      description: 'Subagent names to run (default: all)',
      default: [],
    })
    .option('max-concurrent', {
      type: 'number',
      description: 'Max concurrent agents',
      default: 5,
    })
    .option('timeout', {
      type: 'number',
      description: 'Timeout in seconds',
      default: 300,
    })
    .help().argv;

  try {
    const loader = new YamlAgentLoader();
    await loader.loadAllAgents();

    const registry = SubagentRegistry.getInstance();
    let targetAgents = registry.getAllSubagents();

    if (argv.agents && argv.agents.length > 0) {
      targetAgents = targetAgents.filter((agent) =>
        (argv.agents as string[]).includes(agent.name),
      );

      if (targetAgents.length === 0) {
        console.log(`No matching subagents: ${argv.agents.join(', ')}`);
        console.log('List subagents: gemini agents list');
        process.exit(1);
      }
    }

    if (targetAgents.length === 0) {
      process.stdout.write('No subagents available. Create one with: gemini agents create\n');
      process.exit(1);
    }

    // Starting parallel execution

    const startTime = Date.now();
    const results = await executeParallelTasks(targetAgents, argv.task, {
      maxConcurrent: argv['max-concurrent'],
      timeout: argv.timeout * 1000,
    });

    const executionTime = Date.now() - startTime;

    // Parallel execution completed
  } catch (error) {
    console.error('Parallel execution failed:', error);
    process.exit(1);
  }
}

async function executeParallelTasks(
  agents: SubagentDefinition[],
  task: string,
  options: { maxConcurrent: number; timeout: number },
): Promise<
  Array<{
    success: boolean;
    result?: string;
    error?: string;
    executionTime: number;
  }>
> {
  const results: Array<{
    success: boolean;
    result?: string;
    error?: string;
    executionTime: number;
  }> = [];
  const semaphore = new Semaphore(options.maxConcurrent);
  const subagents = agents.map(createSubagentFromDefinition);

  const promises = subagents.map(async (subagent, index) => {
    await semaphore.acquire();

    try {
      console.log('Running: ' + subagent.name);

      const executor = new SubagentExecutor({
        maxConcurrent: 3,
        timeout: options.timeout,
      });

      const startTime = Date.now();
      const taskRequest: SubagentTask = {
        id: `parallel-${subagent.name}-${Date.now()}`,
        task,
        context: '',
        priority: 'medium',
      };
      const result = (await Promise.race([
        executor.executeTask(subagent, taskRequest),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error(`Timeout ${options.timeout}ms`)),
            options.timeout,
          ),
        ),
      ])) as SubagentResult;

      const executionTime = Date.now() - startTime;
      if (result.status === 'success') {
        results[index] = {
          success: true,
          result: result.result,
          executionTime,
        };
      } else {
        results[index] = {
          success: false,
          error: result.error ?? result.result,
          executionTime,
        };
      }
    } catch (error) {
      results[index] = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: 0,
      };
    } finally {
      semaphore.release();
    }
  });

  await Promise.all(promises);
  return results;
}

class Semaphore {
  private permits: number;
  private waiting: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    return new Promise((resolve) => {
      this.waiting.push(resolve);
    });
  }

  release(): void {
    this.permits++;
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift()!;
      this.permits--;
      resolve();
    }
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
