# Gemini Codex MCP Server

The Gemini Codex MCP server exposes a lightweight interface for using Gemini
from [Codex](https://openai.com/index/introducing-codex/) and other Model
Context Protocol compatible clients. It wraps the Gemini CLI's non-interactive
flow and makes it accessible as a standard MCP tool.

## Features

- Single tool that generates responses with Gemini 2.x models
- Supports custom system instructions, conversation history, and file context
- Configurable generation parameters (temperature, topP, topK, max output
  tokens)
- Works with both the Gemini API and Vertex AI (via environment variables)

## Getting Started

Install dependencies and build the package:

```bash
cd mcp-servers/gemini-codex-mcp
npm install
npm run build
```

> The Gemini CLI repository already ships with workspaces configured. Running
> `npm install` from the repository root will also install this server's
> dependencies.

## Environment Variables

Set one of the following before starting the server:

- `GOOGLE_API_KEY` – Gemini API key (AI Studio)
- or `GOOGLE_GENAI_USE_VERTEXAI=true`, `GOOGLE_CLOUD_PROJECT`, and
  `GOOGLE_CLOUD_LOCATION` for Vertex AI

Optional variables:

- `GEMINI_MODEL` – default model (`gemini-2.0-flash-001` by default)
- `GEMINI_SYSTEM_INSTRUCTION` – default system instruction

## Running the Server

```bash
npm run build
npx gemini-codex-mcp
```

The server communicates over stdio and can be referenced from any MCP client.

### Example MCP Client Configuration

```json
{
  "mcpServers": {
    "gemini-codex": {
      "command": "node",
      "args": ["./mcp-servers/gemini-codex-mcp/dist/index.js"],
      "env": {
        "GOOGLE_API_KEY": "$GOOGLE_API_KEY"
      }
    }
  }
}
```

## Tool Schema

The server exposes a single tool named `gemini_generate_text`. The tool accepts
parameters such as `prompt`, `systemInstruction`, `history`, `files`, and
sampling controls. See `src/index.ts` for the full JSON schema.

## Using with Codex

Add the server to your Codex MCP configuration. Codex will discover the
`gemini_generate_text` tool and can call it directly. Supply prompts and
optional context to receive Gemini responses inside your Codex workflows.

---

## 🎯 Quick Demo (3 minutes)

### Demo 1: Code Review with Audit Trail

Generate an auditable code review summary:

```bash
# Build and start the server
cd mcp-servers/gemini-codex-mcp
npm run build

# In another terminal, use with Codex
codex --mcp-server ./dist/index.js

# Inside Codex:
> Use gemini_generate_text to review the following diff for security issues:
> [paste your git diff here]
```

**Output includes:**

- Issue severity classification
- Line-by-line annotations
- Remediation recommendations
- Timestamp for audit records

### Demo 2: Threat Model Draft

```bash
# With Gemini CLI + Codex MCP
gemini -p "Generate a threat model outline for a REST API with JWT auth" \
  --output-format json > examples/threat-model-output.json
```

### Demo 3: PR Summary for Compliance Review

```bash
# Via MCP tool call
{
  "tool": "gemini_generate_text",
  "params": {
    "prompt": "Summarize this PR for compliance review. Flag any changes to auth, logging, or data handling.",
    "files": ["./src/auth.ts", "./src/api/users.ts"]
  }
}
```

---

## Use Cases (Defense/Intel Focus)

| Use Case               | Description                                        |
| ---------------------- | -------------------------------------------------- |
| **Security Review**    | Automated code review with severity classification |
| **Compliance Summary** | PR summaries focused on audit-relevant changes     |
| **Threat Modeling**    | Draft threat models from architecture docs         |
| **Documentation QA**   | Verify docs match implementation                   |

> **Note**: For classified environments, ensure API credentials are managed per
> your organization's security policies. This server does not transmit data
> beyond the configured Gemini API endpoint.
