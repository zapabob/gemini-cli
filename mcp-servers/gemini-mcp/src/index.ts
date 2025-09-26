#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiMCPServer {
  private server: Server;
  private client: GoogleGenerativeAI;

  constructor() {
    this.server = new Server({ name: 'gemini-mcp-server', version: '0.1.0' });
    const apiKey = process.env.GOOGLE_API_KEY || '';
    this.client = new GoogleGenerativeAI(apiKey);
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'generate_text',
          description: 'Generate text from a prompt using Gemini',
          inputSchema: {
            type: 'object',
            properties: {
              prompt: {
                type: 'string',
                description: 'Prompt to send to Gemini'
              }
            },
            required: ['prompt']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params as any;
      switch (name) {
        case 'generate_text': {
          const model = this.client.getGenerativeModel({ model: 'gemini-1.5-flash' });
          const prompt: string = (args as any).prompt;
          const result = await model.generateContent(prompt);
          const text = result.response.text() ?? '';
          return { content: [{ type: 'text', text }] };
        }
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

new GeminiMCPServer().start().catch((err) => {
  console.error(err);
  process.exit(1);
});
