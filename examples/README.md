# Reproducible Examples

This directory contains step-by-step demonstrations of zapabob fork's unique
capabilities. Each example is designed to be **reproducible** - you can run the
exact commands shown and verify the outputs.

## Quick Start

1. Ensure you have the CLI installed: `npm run install:global`
2. Set your API key: `export GEMINI_API_KEY="your-key"`
3. Follow any example below

---

## Examples

### [1. DeepResearch Demo](./01-deepresearch-demo.md)

Perform multi-level research with source validation and academic filtering.

**Key features demonstrated:**

- 3-level deep research analysis
- Source validation with citations
- Academic source filtering
- Research strategy selection (comprehensive/focused/exploratory)

### [2. Supervisor Multi-Agent Demo](./02-supervisor-demo.md)

Natural language parallel implementation with sub-agent orchestration.

**Key features demonstrated:**

- Automatic sub-agent generation (Planner, Implementer, Reviewer)
- Parallel execution coordination
- Multiple orchestration styles (democratic, autocratic, laissez-faire)
- Result integration and decision logging

### [3. Checkpoint & Recovery Demo](./03-checkpoint-recovery-demo.md)

Power failure protection with automatic session recovery.

**Key features demonstrated:**

- Automatic 5-minute checkpointing
- Emergency save on SIGINT/SIGTERM
- Session recovery after interruption
- Backup rotation management

---

## Running in CI/CD

These examples can be automated in GitHub Actions:

```yaml
- name: Run DeepResearch Example
  run: gemini /deepresearch "test query" --levels 1 --sources 3
  env:
    GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
```

## Contributing Examples

To add a new example:

1. Create `XX-example-name.md` with numbered prefix
2. Include: Purpose, Prerequisites, Commands, Expected Output
3. Update this README with a link

---

## Sample Outputs

The `sample-outputs/` directory contains real output examples:

- [threat-model-output.md](./sample-outputs/threat-model-output.md) - Threat
  model generated via Codex MCP

---

## Codex MCP Integration

For cross-tool orchestration with Codex, see:

- [mcp-servers/gemini-codex-mcp/README.md](../mcp-servers/gemini-codex-mcp/README.md)
