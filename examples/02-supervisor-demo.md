# Supervisor Multi-Agent Demo

This example demonstrates the Supervisor command for natural language parallel
implementation with sub-agent orchestration.

## Purpose

The Supervisor feature enables:

1. Natural language goal specification
2. Automatic sub-agent role creation
3. Parallel task execution
4. Coordinated result integration

## Prerequisites

```bash
# Ensure CLI is installed
gemini --version

# Set API key
export GEMINI_API_KEY="your-api-key"
```

## Example 1: Three-Role Implementation

This example shows a typical development workflow with Planner, Implementer, and
Reviewer roles.

```bash
gemini /supervisor "Implement a user authentication system with JWT tokens"
```

### Expected Output Structure

```
🎯 Supervisor: Implement a user authentication system with JWT tokens
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Goal Analysis
├── Primary objective: JWT-based authentication
├── Identified components: Login, Token generation, Validation, Refresh
└── Estimated complexity: Medium

🤖 Sub-Agent Generation
├── DeepResearch Agent
│   └── Task: Research JWT best practices and security considerations
├── Architecture Planner
│   └── Task: Design authentication flow and component structure
└── Implementation Specialist
    └── Task: Generate code for authentication components

⚡ Parallel Execution (democratic style)
├── [Research] Completed in 12.3s
│   └── Findings: RS256 recommended, 15-min access tokens, secure refresh rotation
├── [Planning] Completed in 8.7s
│   └── Architecture: Middleware pattern with separate token service
└── [Implementation] Completed in 24.1s
    └── Generated: auth.service.ts, middleware.ts, token.utils.ts

🗳️ Decision Integration
├── Consensus reached on: Token expiration strategy
├── Adopted approach: Short-lived access (15min) + secure refresh (7 days)
└── Security recommendations incorporated

📦 Final Output
├── Files generated: 3
├── Total lines: 247
└── Test coverage suggested: 85%
```

## Example 2: Custom Sub-Agents

Specify your own specialized agents:

```bash
gemini /supervisor "目標: セキュアな認証システムの実装
コンテキスト: React + Node.js + PostgreSQL
サブエージェント: セキュリティ研究者, アーキテクト, 開発者
スタイル: democratic
戦略: hybrid"
```

### Sub-Agent Specification

| Parameter          | Options                                     | Description              |
| ------------------ | ------------------------------------------- | ------------------------ |
| `スタイル`         | `autocratic`, `democratic`, `laissez-faire` | Decision-making approach |
| `戦略`             | `sequential`, `parallel`, `hybrid`          | Execution strategy       |
| `サブエージェント` | Custom list                                 | Specialized agent names  |

## Example 3: Autocratic Style (Fast Decisions)

```bash
gemini /supervisor "Create API endpoints for user management" \
  --style autocratic \
  --strategy parallel
```

Autocratic style:

- Faster execution (no consensus needed)
- Single decision-maker
- Best for well-defined tasks

## Example 4: Laissez-Faire Style (Creative Tasks)

```bash
gemini /supervisor "Design innovative UI for dashboard" \
  --style laissez-faire \
  --strategy hybrid
```

Laissez-faire style:

- Maximum agent autonomy
- Multiple alternative solutions
- Best for creative/exploratory work

## Verification

To verify the multi-agent coordination:

1. **Check decision logs**: Each agent's contribution is logged
2. **Trace dependencies**: See how agents built on each other's work
3. **Consensus records**: Democratic decisions show voting
4. **Timing breakdown**: Parallel vs sequential execution times

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Supervisor                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │
│  │  Research   │ │   Planner   │ │  Implementer    │   │
│  │   Agent     │ │   Agent     │ │     Agent       │   │
│  └──────┬──────┘ └──────┬──────┘ └───────┬─────────┘   │
│         │               │                │             │
│         └───────────────┴────────────────┘             │
│                         │                              │
│              ┌──────────┴──────────┐                   │
│              │  Result Integrator  │                   │
│              └─────────────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

## Troubleshooting

| Issue                    | Solution                                   |
| ------------------------ | ------------------------------------------ |
| "Agent timeout"          | Reduce task complexity or increase timeout |
| "Consensus failed"       | Switch to `autocratic` style               |
| "Incomplete integration" | Use `hybrid` strategy for dependencies     |

## Related Commands

- `/subagents create` - Create standalone sub-agents
- `/subagents coordinate` - Coordinate existing agents
- `/loadbalancer` - Distribute requests across endpoints
