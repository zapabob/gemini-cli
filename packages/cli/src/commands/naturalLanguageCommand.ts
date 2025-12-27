/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import type {
  MainAgentInterfaceConfig,
  CollaborationMetrics,
  CollaborativeTaskResult,
} from '@google/gemini-cli-core';
import {
  Config,
  ApprovalMode,
  MainAgentInterface,
  SubagentGeminiClient,
} from '@google/gemini-cli-core';
import fs from 'node:fs';
import path from 'node:path';

export class NaturalLanguageCommand {
  private mainAgent?: MainAgentInterface;

  private async execute(
    prompt: string,
    options: {
      mode: string;
      timeout: number;
      context?: string;
      output?: string;
      verbose?: boolean;
    },
  ): Promise<void> {
    try {
      console.log('Starting natural language task...');
      console.log(`Prompt: ${prompt}`);
      console.log(`Mode: ${options.mode}`);

      const config = await this.initializeConfig(options);
      this.mainAgent = new MainAgentInterface(config);

      const startTime = Date.now();
      const result: CollaborativeTaskResult = await this.mainAgent.executeTask(
        prompt,
        options.context,
        options.mode as Parameters<MainAgentInterface['executeTask']>[2],
        {
          timeout: options.timeout * 1000,
        },
      );
      const executionTime = Date.now() - startTime;

      this.displayResult(result, executionTime, options);

      if (options.output) {
        await this.saveResult(result, prompt, options.output);
      }

      console.log('Natural language task finished.');
    } catch (error) {
      console.error('Natural language command failed:', error);
      process.exit(1);
    }
  }

  private async initializeConfig(options: {
    timeout: number;
    output?: string;
  }): Promise<MainAgentInterfaceConfig> {
    const apiKey = process.env['GEMINI_API_KEY'];
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    const geminiClient = new SubagentGeminiClient({
      apiKey,
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      defaultModel: 'models/gemini-3.0-pro',
      defaultTemperature: 0.7,
      defaultMaxTokens: 4096,
    });

    const config = new Config({
      sessionId: 'natural-language-session',
      targetDir: process.cwd(),
      cwd: process.cwd(),
      debugMode: false,
      model: 'models/gemini-3.0-pro',
      apiKey,
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      defaultModel: 'models/gemini-3.0-pro',
      approvalMode: ApprovalMode.DEFAULT,
      showMemoryUsage: false,
      accessibility: {},
      telemetry: { enabled: false },
      usageStatisticsEnabled: false,
      fileFiltering: {
        respectGitIgnore: true,
        respectGeminiIgnore: true,
        enableRecursiveFileSearch: false,
      },
      checkpointing: false,
      noBrowser: true,
      ideMode: false,
      maxSessionTurns: 100,
      listExtensions: false,
      extensions: [],
      blockedMcpServers: [],
      summarizeToolOutput: {},
    });

    const outputPath = path.resolve(options.output ?? './_docs');
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    return {
      geminiClient,
      config,
      enableAutonomousMode: true,
      enableSupervisorMode: true,
      enableNaturalLanguageProcessing: true,
      maxConcurrentSubagents: 5,
      autoAnalysisThreshold: 5,
      decisionTimeout: options.timeout * 1000,
      enableRealTimeCoordination: true,
      enableCheckpointing: true,
      researchOutputPath: outputPath,
    };
  }

  private displayResult(
    result: CollaborativeTaskResult,
    executionTime: number,
    options: {
      mode: string;
      timeout: number;
      context?: string;
      output?: string;
      verbose?: boolean;
    },
  ): void {
    console.log('\nResult:');
    console.log('------------------------------');
    console.log(`Success: ${result.success ? 'yes' : 'no'}`);
    console.log(`Task ID: ${result.taskId}`);
    console.log(`Execution time: ${executionTime}ms`);

    if (result.collaborationMetrics) {
      const metrics = result.collaborationMetrics as CollaborationMetrics;
      console.log(`Subagents used: ${metrics.subagentsUsed || 0}`);
      console.log(
        `Steps: ${metrics.successfulSteps || 0}/${metrics.totalSteps || 0}`,
      );
      console.log(`Avg response time: ${metrics.averageResponseTime || 0}ms`);
    }

    if (result.finalResult) {
      console.log('\nFinal result:');
      console.log('------------------------------');
      console.log(result.finalResult.finalResult);

      if (result.finalResult.recommendations?.length) {
        console.log('\nRecommendations:');
        result.finalResult.recommendations.forEach((rec, index) => {
          console.log(`${index + 1}. ${rec}`);
        });
      }
    }

    if (result.error) {
      console.log(`\nError: ${result.error}`);
    }

    if (options.verbose) {
      console.log('\nDetails:');
      console.log(JSON.stringify(result, null, 2));
    }
  }

  private async saveResult(
    result: CollaborativeTaskResult,
    prompt: string,
    outputPath: string,
  ): Promise<void> {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${timestamp}_natural_language_result_${result.taskId}.md`;
      const filepath = path.join(outputPath, filename);

      const content = `# Natural Language Result\n\n` +
        `## Date\n${new Date().toLocaleString('en-US')}\n\n` +
        `## Prompt\n${prompt}\n\n` +
        `## Result\n- Success: ${result.success ? 'yes' : 'no'}\n- Task ID: ${result.taskId}\n- Execution time: ${result.executionTime}ms\n\n` +
        `## Final Output\n${result.finalResult ? result.finalResult.finalResult : 'N/A'}\n\n` +
        (result.error ? `## Error\n${result.error}\n\n` : '') +
        `---\n` +
        `*Generated automatically*\n`;

      await fs.promises.writeFile(filepath, content, 'utf-8');
      console.log(`Saved result: ${filepath}`);
    } catch (error) {
      console.error('Failed to save result:', error);
    }
  }

  async run(args: string[]): Promise<void> {
    const argv = (await yargs(hideBin(args))
      .usage('$0 <prompt> [options]')
      .command(
        '$0 <prompt>',
        'Run a natural language prompt with collaborative agents',
        (yargs) =>
          yargs
            .positional('prompt', {
              describe: 'Natural language prompt',
              type: 'string',
              demandOption: true,
            })
            .option('context', {
              alias: 'c',
              describe: 'Additional context string',
              type: 'string',
            })
            .option('output', {
              alias: 'o',
              describe: 'Output directory',
              type: 'string',
              default: './_docs',
            })
            .option('mode', {
              alias: 'm',
              describe:
                'Execution mode (auto|natural_language|autonomous|supervisor|manual)',
              type: 'string',
              choices: [
                'auto',
                'natural_language',
                'autonomous',
                'supervisor',
                'manual',
              ],
              default: 'auto',
            })
            .option('timeout', {
              alias: 't',
              describe: 'Timeout in seconds',
              type: 'number',
              default: 300,
            })
            .option('verbose', {
              alias: 'v',
              describe: 'Enable verbose output',
              type: 'boolean',
              default: false,
            })
            .help()
            .alias('h', 'help'),
      ).argv) as unknown as {
      prompt: string;
      mode: string;
      timeout: number;
      context?: string;
      output?: string;
      verbose?: boolean;
    };

    await this.execute(argv.prompt, {
      mode: argv.mode,
      timeout: argv.timeout,
      context: argv.context,
      output: argv.output,
      verbose: argv.verbose,
    });
  }
}
