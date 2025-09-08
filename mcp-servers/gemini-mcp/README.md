# Gemini MCP Server

Simple Model Context Protocol server that wraps the Gemini API so it can be used from Codex CLI or other MCP compatible clients.

## Setup

```bash
npm install
npm run build
```

## Configuration

Set the `GOOGLE_API_KEY` environment variable with your API key.

To use the server from Codex CLI, add an entry to your `mcp-config.json`:

```json
{
  "mcpServers": {
    "gemini": {
      "command": "node",
      "args": ["/absolute/path/to/gemini-mcp/dist/index.js"]
    }
  }
}
```

## Available tools

### `generate_text`
Generates text from a prompt using Gemini.

Input schema:
```json
{
  "prompt": "string"
}
```
