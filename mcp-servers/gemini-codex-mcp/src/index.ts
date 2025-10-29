#!/usr/bin/env node

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { promises as fs } from 'node:fs';
import { resolve, isAbsolute } from 'node:path';

import { GoogleGenAI, type GenerateContentConfig, type Content, type Part } from '@google/genai';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

interface HistoryMessage {
  role: string;
  content: string;
}

interface FileAttachment {
  path: string;
  label?: string;
  encoding?: string;
}

interface GenerateTextArguments {
  prompt?: unknown;
  model?: unknown;
  systemInstruction?: unknown;
  system?: unknown;
  systemPrompt?: unknown;
  temperature?: unknown;
  topP?: unknown;
  topK?: unknown;
  maxOutputTokens?: unknown;
  history?: unknown;
  files?: unknown;
  workingDirectory?: unknown;
  responseFormat?: unknown;
  context?: unknown;
}

class GeminiCodexMCPServer {
  private readonly server: Server;
  private readonly client: GoogleGenAI;

  constructor() {
    this.server = new Server({ name: 'gemini-codex-mcp', version: '0.1.0' });
    this.client = this.createClient();
    this.registerHandlers();
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }

  private createClient(): GoogleGenAI {
    const useVertex = process.env.GOOGLE_GENAI_USE_VERTEXAI === 'true';

    if (useVertex) {
      const project = process.env.GOOGLE_CLOUD_PROJECT;
      const location = process.env.GOOGLE_CLOUD_LOCATION;
      if (!project || !location) {
        throw new Error(
          'GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_LOCATION must be set when GOOGLE_GENAI_USE_VERTEXAI is true.',
        );
      }
      return new GoogleGenAI({
        vertexai: true,
        project,
        location,
      });
    }

    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY environment variable is required.');
    }
    return new GoogleGenAI({ apiKey });
  }

  private registerHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'gemini_generate_text',
          description:
            'Generate a Gemini response with optional system instruction, history, and file context for Codex workflows.',
          inputSchema: {
            type: 'object',
            properties: {
              prompt: {
                type: 'string',
                description: 'The user prompt to send to Gemini.',
              },
              model: {
                type: 'string',
                description:
                  'Optional Gemini model identifier. Defaults to GEMINI_MODEL environment variable or gemini-2.0-flash-001.',
              },
              systemInstruction: {
                type: 'string',
                description: 'Optional system instruction to steer the model response.',
              },
              system: {
                type: 'string',
                description: 'Alias for systemInstruction.',
              },
              systemPrompt: {
                type: 'string',
                description: 'Alias for systemInstruction.',
              },
              temperature: {
                type: 'number',
                description: 'Sampling temperature between 0 and 2.',
                minimum: 0,
                maximum: 2,
              },
              topP: {
                type: 'number',
                description: 'Top-p nucleus sampling probability (0-1).',
                minimum: 0,
                maximum: 1,
              },
              topK: {
                type: 'number',
                description: 'Top-k sampling cutoff (>=0).',
                minimum: 0,
              },
              maxOutputTokens: {
                type: 'integer',
                description: 'Maximum number of tokens to generate (>0).',
                minimum: 1,
              },
              history: {
                type: 'array',
                description: 'Optional prior conversation history.',
                items: {
                  type: 'object',
                  required: ['role', 'content'],
                  properties: {
                    role: {
                      type: 'string',
                      description: 'Message role: user, assistant, model, or system.',
                      enum: ['user', 'assistant', 'model', 'system'],
                    },
                    content: {
                      type: 'string',
                      description: 'Plain text content of the message.',
                    },
                  },
                },
              },
              files: {
                type: 'array',
                description:
                  'Optional list of files to include as context. Strings are treated as paths. Objects can provide label and encoding.',
                items: {
                  anyOf: [
                    { type: 'string' },
                    {
                      type: 'object',
                      required: ['path'],
                      properties: {
                        path: {
                          type: 'string',
                          description: 'Path to the file to include.',
                        },
                        label: {
                          type: 'string',
                          description: 'Optional label displayed before the file contents.',
                        },
                        encoding: {
                          type: 'string',
                          description: 'File encoding (only utf-8 is supported).',
                          enum: ['utf-8', 'utf8'],
                        },
                      },
                    },
                  ],
                },
              },
              workingDirectory: {
                type: 'string',
                description: 'Base directory for resolving relative file paths.',
              },
              responseFormat: {
                type: 'string',
                description: 'Format of the returned response.',
                enum: ['text', 'json'],
                default: 'text',
              },
              context: {
                anyOf: [
                  { type: 'string' },
                  {
                    type: 'array',
                    items: { type: 'string' },
                  },
                ],
                description: 'Additional context strings prepended before the prompt.',
              },
            },
            required: ['prompt'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: rawArguments } = request.params;
      if (name !== 'gemini_generate_text') {
        throw new Error(`Unknown tool: ${name}`);
      }

      return this.handleGenerateText(rawArguments as GenerateTextArguments);
    });
  }

  private async handleGenerateText(args: GenerateTextArguments) {
    const prompt = this.normalizeString(args.prompt);
    if (!prompt) {
      throw new Error('The prompt field is required and must be a non-empty string.');
    }

    const model = this.normalizeString(args.model) || process.env.GEMINI_MODEL || 'gemini-2.0-flash-001';

    const systemInstruction =
      this.normalizeString(args.systemInstruction) ||
      this.normalizeString(args.system) ||
      this.normalizeString(args.systemPrompt) ||
      this.normalizeString(process.env.GEMINI_SYSTEM_INSTRUCTION);

    const config = this.buildGenerationConfig({ ...args, systemInstruction });
    const contents = await this.buildContents({ ...args, prompt });

    const response = await this.client.models.generateContent({
      model,
      contents,
      config,
    });

    const responseFormat = this.normalizeResponseFormat(args.responseFormat);
    const usageText = this.formatUsage(response.usageMetadata);
    const responseText = response.text ?? '';

    if (responseFormat === 'json') {
      try {
        const json = responseText ? JSON.parse(responseText) : {};
        const content: Array<
          | { type: 'json'; json: unknown }
          | { type: 'text'; text: string }
        > = [{ type: 'json', json }];
        if (usageText) {
          content.push({ type: 'text', text: usageText });
        }
        return { content };
      } catch (error) {
        const message = (error as Error).message;
        const textParts = [
          'Failed to parse model output as JSON. Returning raw text instead.',
          `Parse error: ${message}`,
          responseText,
        ];
        if (usageText) {
          textParts.push(usageText);
        }
        return {
          content: [
            {
              type: 'text' as const,
              text: textParts.join('\n\n'),
            },
          ],
        };
      }
    }

    const textParts = [] as string[];
    if (responseText) {
      textParts.push(responseText);
    }
    if (usageText) {
      textParts.push(usageText);
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: textParts.join('\n\n'),
        },
      ],
    };
  }

  private buildGenerationConfig(args: GenerateTextArguments & { systemInstruction?: string | null }): GenerateContentConfig {
    const config: GenerateContentConfig = {};

    if (args.systemInstruction) {
      config.systemInstruction = args.systemInstruction;
    }

    const temperature = this.parseNumber(args.temperature);
    if (temperature !== undefined) {
      if (temperature < 0 || temperature > 2) {
        throw new Error('temperature must be between 0 and 2.');
      }
      config.temperature = temperature;
    }

    const topP = this.parseNumber(args.topP);
    if (topP !== undefined) {
      if (topP < 0 || topP > 1) {
        throw new Error('topP must be between 0 and 1.');
      }
      config.topP = topP;
    }

    const topK = this.parseInteger(args.topK);
    if (topK !== undefined) {
      if (topK < 0) {
        throw new Error('topK must be greater than or equal to 0.');
      }
      config.topK = topK;
    }

    const maxOutputTokens = this.parseInteger(args.maxOutputTokens);
    if (maxOutputTokens !== undefined) {
      if (maxOutputTokens <= 0) {
        throw new Error('maxOutputTokens must be greater than 0.');
      }
      config.maxOutputTokens = maxOutputTokens;
    }

    return config;
  }

  private async buildContents(args: GenerateTextArguments & { prompt: string }): Promise<Content[]> {
    const contents: Content[] = [];

    const history = Array.isArray(args.history)
      ? (args.history as HistoryMessage[])
      : [];

    for (const entry of history) {
      if (!entry || typeof entry !== 'object') {
        continue;
      }
      const text = this.normalizeString(entry.content);
      const role = this.normalizeString(entry.role);
      if (!text || !role) {
        continue;
      }
      contents.push({ role: this.mapRole(role), parts: [this.toTextPart(text)] });
    }

    const additionalContext = this.collectContext(args.context);
    const fileSections = await this.loadFileSections(args.files, args.workingDirectory);

    const userParts: Part[] = [];
    for (const section of [...additionalContext, ...fileSections]) {
      userParts.push(this.toTextPart(section));
    }
    userParts.push(this.toTextPart(args.prompt));

    contents.push({ role: 'user', parts: userParts });

    return contents;
  }

  private collectContext(context: unknown): string[] {
    if (!context) {
      return [];
    }
    if (typeof context === 'string') {
      return context.trim() ? [context] : [];
    }
    if (Array.isArray(context)) {
      return context
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .map((item) => item);
    }
    return [];
  }

  private async loadFileSections(files: unknown, workingDirectory: unknown): Promise<string[]> {
    if (!files) {
      return [];
    }
    const fileInputs = Array.isArray(files) ? files : [files];

    const baseDir = this.resolveWorkingDirectory(workingDirectory);
    const sections: string[] = [];

    for (const entry of fileInputs) {
      let descriptor: FileAttachment | undefined;
      if (typeof entry === 'string') {
        descriptor = { path: entry, label: entry };
      } else if (entry && typeof entry === 'object' && 'path' in entry) {
        const candidate = entry as FileAttachment;
        descriptor = {
          path: candidate.path,
          label: candidate.label || candidate.path,
          encoding: candidate.encoding,
        };
      }

      if (!descriptor || !descriptor.path) {
        continue;
      }

      const absolutePath = isAbsolute(descriptor.path)
        ? descriptor.path
        : resolve(baseDir, descriptor.path);

      const encoding = this.normalizeEncoding(descriptor.encoding);

      let fileContent: string;
      try {
        fileContent = await fs.readFile(absolutePath, { encoding });
      } catch (error) {
        throw new Error(
          `Failed to read file "${descriptor.path}": ${(error as Error).message}`,
        );
      }

      sections.push(`File: ${descriptor.label ?? descriptor.path}\n${fileContent}`);
    }

    return sections;
  }

  private resolveWorkingDirectory(candidate: unknown): string {
    if (typeof candidate === 'string' && candidate.trim()) {
      return resolve(process.cwd(), candidate);
    }
    return process.cwd();
  }

  private normalizeEncoding(value: string | undefined): BufferEncoding {
    if (!value) {
      return 'utf8';
    }
    const normalized = value.toLowerCase();
    if (normalized === 'utf8' || normalized === 'utf-8') {
      return 'utf8';
    }
    throw new Error(`Unsupported encoding "${value}". Only utf-8 is supported.`);
  }

  private toTextPart(text: string): Part {
    return { text };
  }

  private mapRole(role: string): 'user' | 'model' {
    const normalized = role.toLowerCase();
    if (normalized === 'assistant' || normalized === 'model') {
      return 'model';
    }
    return 'user';
  }

  private normalizeString(value: unknown): string | undefined {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }
    return undefined;
  }

  private parseNumber(value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
    return undefined;
  }

  private parseInteger(value: unknown): number | undefined {
    const parsed = this.parseNumber(value);
    if (parsed === undefined) {
      return undefined;
    }
    return Math.round(parsed);
  }

  private normalizeResponseFormat(value: unknown): 'text' | 'json' {
    if (typeof value !== 'string') {
      return 'text';
    }
    const normalized = value.toLowerCase();
    return normalized === 'json' ? 'json' : 'text';
  }

  private formatUsage(usage: unknown): string | undefined {
    if (!usage || typeof usage !== 'object') {
      return undefined;
    }
    const maybeUsage = usage as {
      promptTokenCount?: number;
      candidatesTokenCount?: number;
      totalTokenCount?: number;
    };

    const segments: string[] = [];
    if (typeof maybeUsage.promptTokenCount === 'number') {
      segments.push(`prompt_tokens=${maybeUsage.promptTokenCount}`);
    }
    if (typeof maybeUsage.candidatesTokenCount === 'number') {
      segments.push(`candidate_tokens=${maybeUsage.candidatesTokenCount}`);
    }
    if (typeof maybeUsage.totalTokenCount === 'number') {
      segments.push(`total_tokens=${maybeUsage.totalTokenCount}`);
    }

    if (segments.length === 0) {
      return undefined;
    }

    return `Usage: ${segments.join(', ')}`;
  }
}

new GeminiCodexMCPServer()
  .start()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
