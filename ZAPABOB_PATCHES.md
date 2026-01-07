# ZAPABOB Fork: Upstream Patches & Unique Features

This document describes the **differentiating value** of `zapabob/gemini-cli`
compared to the upstream `google-gemini/gemini-cli`.

> **[View full upstream diff →](https://github.com/google-gemini/gemini-cli/compare/main...zapabob:gemini-cli:main)**

---

## Design Philosophy

This fork extends `google-gemini/gemini-cli` for **production-grade, auditable
AI operations** with focus on:

- **Reproducibility**: All research outputs include citation chains
- **Fault tolerance**: Session continuity under any interruption
- **Auditability**: Tool invocation logging with timestamps
- **Orchestration**: Multi-agent coordination for complex workflows

---

## Unique Features (Not in Upstream)

### 1. DeepResearch

Multi-level research with source validation.

| Aspect             | Capability                           |
| ------------------ | ------------------------------------ |
| Research depth     | Up to 3 levels                       |
| Source validation  | Credibility scoring, citation chains |
| Strategies         | Comprehensive, focused, exploratory  |
| Academic filtering | Optional academic-only mode          |

**Command**:

```bash
gemini /deepresearch "topic" --levels 3 --sources 10 --academic
```

### 2. Supervisor (Multi-Agent Orchestration)

Natural language parallel implementation with sub-agent coordination.

| Aspect           | Capability                            |
| ---------------- | ------------------------------------- |
| Agent generation | Automatic role-based creation         |
| Execution styles | Democratic, autocratic, laissez-faire |
| Strategies       | Sequential, parallel, hybrid          |
| Logging          | Decision audit trail                  |

**Command**:

```bash
gemini /supervisor "Implement user authentication with JWT"
```

### 3. Load Balancing

Distribute requests across multiple API endpoints.

| Aspect          | Capability                                         |
| --------------- | -------------------------------------------------- |
| Algorithms      | Round robin, least connections, weighted, IP hash  |
| Fault tolerance | Circuit breaker, health checks, automatic failover |
| Monitoring      | Real-time statistics                               |

### 4. Checkpoint/Recovery (Power Failure Protection)

Session continuity under any interruption.

| Aspect          | Capability                |
| --------------- | ------------------------- |
| Auto-save       | 5-minute intervals        |
| Emergency save  | SIGINT, SIGTERM, SIGBREAK |
| Recovery        | Seamless session resume   |
| Backup rotation | Max 10 checkpoints        |

**Command**:

```bash
gemini --checkpointing
```

### 5. Codex MCP Integration

Cross-tool orchestration between Gemini and Codex.

**Location**: `mcp-servers/gemini-codex-mcp/`

---

## Defense/Intel Operational Focus

This fork specifically addresses operational requirements for sensitive
environments:

### Air-Gapped Operation

- Checkpoint/recovery enables offline session continuity
- No external transmission beyond configured API endpoint
- Local-only session state storage (JSON + metadata)

### Audit Trail

- All tool invocations logged with timestamps
- Decision logs for multi-agent orchestration
- Reproducible research with citation chains

### Data Sovereignty

- API key management via environment variables
- Pre-commit hooks prevent secret commits
- Configurable API endpoint (Gemini API or Vertex AI)

### Operational Guardrails

- Dangerous operations require explicit confirmation
- Approval modes: `default`, `auto_edit`, `yolo`
- Shell commands run with user permissions only

---

## Upstream Sync Policy

| Policy              | Description                                   |
| ------------------- | --------------------------------------------- |
| Sync frequency      | Weekly with `google-gemini/gemini-cli@main`   |
| Preservation        | Custom features in isolated modules           |
| Conflict resolution | Upstream infra fixes → custom logic preserved |

---

## Related Resources

- **Upstream**:
  [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli)
- **Examples**: [examples/](./examples/) - Reproducible demos
- **Codex MCP**:
  [mcp-servers/gemini-codex-mcp/](./mcp-servers/gemini-codex-mcp/)

---

## Contributing Upstream

If you find a bug fix or improvement that benefits all users, consider opening a
PR to the upstream repository. This fork maintains compatibility to facilitate
upstreaming.
