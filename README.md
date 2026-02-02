# Gemini CLI

[![Gemini CLI CI](https://github.com/google-gemini/gemini-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/google-gemini/gemini-cli/actions/workflows/ci.yml)
[![Gemini CLI E2E (Chained)](https://github.com/google-gemini/gemini-cli/actions/workflows/chained_e2e.yml/badge.svg)](https://github.com/google-gemini/gemini-cli/actions/workflows/chained_e2e.yml)
[![Version](https://img.shields.io/npm/v/@google/gemini-cli)](https://www.npmjs.com/package/@google/gemini-cli)
[![License](https://img.shields.io/github/license/google-gemini/gemini-cli)](https://github.com/google-gemini/gemini-cli/blob/main/LICENSE)
[![View Code Wiki](https://assets.codewiki.google/readme-badge/static.svg)](https://codewiki.google/github.com/google-gemini/gemini-cli?utm_source=badge&utm_medium=github&utm_campaign=github.com/google-gemini/gemini-cli)

![Gemini CLI Screenshot](./docs/assets/gemini-screenshot.png)

## 🔥 What's New in zapabob Fork (TL;DR)

This is a **feature-enhanced fork** of
[google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli),
designed for **production-grade, auditable AI operations**.

> **[View upstream diff →](https://github.com/google-gemini/gemini-cli/compare/main...zapabob:gemini-cli:main)**

### Operational Capabilities

| Capability                | Operational Requirement                | Implementation                                   |
| ------------------------- | -------------------------------------- | ------------------------------------------------ |
| **DeepResearch**          | Reproducible, citation-backed analysis | Multi-level research with source validation      |
| **Supervisor**            | Auditable multi-agent orchestration    | Parallel sub-agents with decision logging        |
| **Load Balancing**        | High availability & fault tolerance    | Circuit breaker, health checks, failover         |
| **Checkpoint/Recovery**   | Session continuity under interruption  | Auto-save, emergency checkpoint, session restore |
| **Codex MCP Integration** | Cross-tool orchestration               | MCP server for Gemini ↔ Codex interop           |

### Defense/Intel Relevant Features

- **Air-gapped operation**: Checkpoint/recovery enables offline session
  continuity
- **Audit trail**: All tool invocations logged with timestamps
- **Data sovereignty**: No external transmission beyond configured API
- **Reproducibility**: Research outputs include full citation chains

### Upstream Merge Policy

- Weekly sync with `google-gemini/gemini-cli@main`
- Custom features preserved via isolated modules
- Conflict resolution: upstream infra fixes → custom logic preserved

> **📋 [Full patch documentation →](./ZAPABOB_PATCHES.md)** — Detailed breakdown
> of all unique features

---

Gemini CLI is an open-source AI agent that brings the power of Gemini directly
into your terminal. It provides lightweight access to Gemini, giving you the
most direct path from your prompt to our model.

Learn all about Gemini CLI in our [documentation](https://geminicli.com/docs/).

## 🚀 Why Gemini CLI?

### Core Features

- **🎯 Free tier**: 60 requests/min and 1,000 requests/day with personal Google
  account
- **🧠 Powerful Gemini 3.0 Pro**: Access to 1M token context window- **🔧 Built-in tools**: Google Search grounding, file operations, shell
  commands, web fetching
- **🔌 Extensible**: MCP (Model Context Protocol) support for custom
  integrations
- **💻 Terminal-first**: Designed for developers who live in the command line

### Advanced Capabilities

- Query and edit large codebases in and beyond Gemini's 1M token context window.
- Generate new apps from PDFs or sketches, using Gemini's multimodal
  capabilities.
- Automate operational tasks, like querying pull requests or handling complex
  rebases.
- Integrate with GitHub: Use the
  [Gemini CLI GitHub Action](https://github.com/google-github-actions/run-gemini-cli)
  for automated PR reviews, issue triage, and on-demand AI assistance directly
  in your repositories.
- Use tools and MCP servers to connect new capabilities, including
  [media generation with Imagen, Veo or Lyria](https://github.com/GoogleCloudPlatform/vertex-ai-creative-studio/tree/main/experiments/mcp-genmedia)
- Ground your queries with the
  [Google Search](https://ai.google.dev/gemini-api/docs/grounding) tool, built
  into Gemini.

### 🆕 Enhanced Features (Custom Extensions) - v0.11.0

- **🆕 Load Balancing**: Distribute requests across multiple Gemini API
  endpoints for improved reliability and performance
- **🆕 Sub-Agents**: Create specialized AI agents for different tasks and
  coordinate them seamlessly
- **🆕 Power Failure Protection**: Automatic checkpointing, emergency saves, and
  session recovery for uninterrupted workflows
- **🆕 DeepResearch**: Perform comprehensive multi-level research with source
  validation and topic exploration
- **🆕 Supervisor Command**: Natural language parallel implementation with
  sub-agent coordination
- **🆕 GitHub Actions Integration**: Automated code analysis and review with PR
  comments
- **🆕 Release Preparation System**: Automated deployment preparation and
  quality assurance
- **🆕 Continuous Development Platform**: Enhanced development workflow and
  modular architecture
- **🆕 Global Installation System**: One-command installation and management
  with advanced features
- **🆕 Natural Language CLI**: Intuitive command interface with natural language
  processing
- **🆕 Advanced Error Handling**: Comprehensive error classification and
  recovery systems

## 🆕 Latest Features (v0.11.0) - Official Integration Complete

**🆕 Official Integration**: Successfully integrated latest official updates
while preserving unique features **🆕 Enhanced IDE Integration**: Improved
VSCode companion with latest official features **🆕 Advanced Configuration**:
Unified configuration system with upstream compatibility **🆕 Strategic Merge**:
Preserved custom features while adopting latest improvements

### Global Installation System

One-command installation and management with advanced features:

```bash
# Quick global installation
npm run install:global

# Uninstall with cleanup
npm run uninstall:global

# Check current version
npm run version:current

# Update to latest version
npm run update:auto
```

**Features:**

- One-command global installation and uninstallation
- Automatic version management and updates
- Advanced error handling and recovery
- Progress tracking and status monitoring
- System information collection for troubleshooting

### Natural Language CLI

Intuitive command interface with natural language processing:

```bash
# Natural language commands
gemini-natural "Webアプリケーションのユーザー認証システムを実装したい"

# Interactive mode with natural language
gemini-natural
> このコードベースのセキュリティ問題を分析して
```

**Features:**

- Natural language command processing
- Interactive mode with conversational interface
- Context-aware command interpretation
- Multi-language support (Japanese/English)
- Intelligent command suggestions

### Advanced Error Handling

Comprehensive error classification and recovery systems:

```bash
# Analyze system errors
npm run error:analyze

# Get system information
npm run error:system-info

# Demo progress tracking
npm run progress:demo
```

**Error Categories:**

- Installation Errors (権限、依存関係、ネットワーク)
- Configuration Errors (設定ファイル、環境変数)
- Runtime Errors (API制限、メモリ不足)
- Network Errors (接続、タイムアウト)
- Permission Errors (ファイル、ディレクトリ)
- Dependency Errors (パッケージ、バージョン)
- System Errors (OS、ハードウェア)

## 🆕 Enhanced Features

### Supervisor Command

Execute parallel implementations using natural language with intelligent
sub-agent coordination:

```bash
# Simple implementation request
gemini /supervisor "Webアプリケーションのユーザー認証システムを実装したい"

# Detailed specification
gemini /supervisor "目標: セキュアな認証システムの実装
コンテキスト: React + Node.js + PostgreSQL
サブエージェント: セキュリティ研究者, アーキテクト, 開発者
スタイル: democratic
戦略: hybrid"
```

**Features:**

- Natural language goal parsing and analysis
- Automatic sub-agent generation (DeepResearch Agent, Architecture Planner,
  Implementation Specialist)
- Parallel execution coordination with multiple strategies
- Real-time progress tracking and decision logging
- Result integration and comprehensive output

**Available Options:**

- **Styles**: autocratic, democratic, laissez-faire
- **Strategies**: sequential, parallel, hybrid
- **Custom Sub-agents**: Comma-separated custom agent names

### Load Balancer

Distribute your requests across multiple Gemini API endpoints for enhanced
reliability and performance:

```bash
# Configure load balancer endpoints
gemini /loadbalancer add-endpoint "Primary API" "https://api.gemini.com" "your-api-key" 100
gemini /loadbalancer add-endpoint "Backup API" "https://backup-api.gemini.com" "backup-key" 50

# View load balancer statistics
gemini /loadbalancer stats

# Execute requests through load balancer
gemini /loadbalancer request "Analyze this codebase"
```

**Features:**

- Multiple load balancing algorithms (Round Robin, Least Connections, Weighted,
  IP Hash)
- Health checks and automatic failover
- Circuit breaker pattern for fault tolerance
- Real-time statistics and monitoring

### Sub-Agents

Create specialized AI agents for different tasks and coordinate them:

```bash
# Create specialized agents
gemini /subagents create "Code Reviewer" "Expert in code review and security analysis"
gemini /subagents create "Documentation Writer" "Specialist in technical documentation"

# Coordinate multiple agents
gemini /subagents coordinate "Code Reviewer, Documentation Writer" "Review this code and create documentation"
```

**Features:**

- Specialized agent creation and management
- Multi-agent coordination and communication
- Task delegation and result aggregation
- Agent performance tracking

### Power Failure Protection

Never lose your work with advanced protection features:

```bash
# Enable checkpointing
gemini --checkpointing

# Automatic features:
# - 5-minute interval auto-saves
# - Emergency saves on Ctrl+C
# - Session recovery on restart
# - Backup rotation (max 10 backups)
```

**Protection Features:**

- **Automatic Checkpointing**: Saves every 5 minutes
- **Emergency Saves**: Automatic saves on interruption
- **Session Recovery**: Resume from last session
- **Backup Management**: Rotating backup system
- **Signal Handling**: SIGINT, SIGTERM, SIGBREAK support
- **Data Integrity**: JSON + Pickle composite storage

### Release Preparation System

Automated deployment preparation and quality assurance for production releases:

```bash
# Run preflight checks before release
npm run preflight

# Build and test all packages
npm run build && npm run test:ci

# Prepare release package
npm run prepare:package
```

**Features:**

- Automated build verification and testing
- Dependency updates and compatibility checks
- Pre-release quality assurance
- Automated documentation updates
- Release package preparation

### Continuous Development Platform

Enhanced development workflow and modular architecture for ongoing development:

```bash
# Development workflow
npm run build:all
npm run test:ci
npm run lint:ci
npm run typecheck
```

**Features:**

- Modular architecture enhancement
- Improved test framework
- Optimized development workflow
- Automated scripts for development tasks
- Enhanced build system

### DeepResearch

Perform comprehensive multi-level research with source validation:

```bash
# Multi-level research
gemini /deepresearch "AI in healthcare" --levels 3 --sources 10

# Focused research with academic sources
gemini /deepresearch "Machine learning applications" --strategy focused --academic --recent 5
```

**Features:**

- Up to 3-level deep research analysis
- Maximum 10 sources per level
- Three research strategies (comprehensive/focused/exploratory)
- Academic source inclusion option
- Recent years specification
- Domain-specific focus
- Source type exclusion

### GitHub Actions Integration

Automated code analysis and review with PR comments:

```yaml
# .github/workflows/gemini-cli-action.yml
name: Gemini CLI Code Analysis
on:
  pull_request:
    paths: ['**/*.{js,ts,py,java,cpp,c,go,rs}']
  push:
    branches: [main]
    paths: ['**/*.{js,ts,py,java,cpp,c,go,rs}']

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-gemini-cli
      - name: Analyze Code
        run: gemini analyze --output-format markdown
```

## 📦 Installation

### Pre-requisites before installation

- Node.js version 20 or higher
- macOS, Linux, or Windows

### Quick Install

#### Run instantly with npx

```bash
# Using npx (no installation required)
npx @google/gemini-cli
```

#### Install globally with npm

```bash
npm install -g @google/gemini-cli
```

#### Install globally with Homebrew (macOS/Linux)

```bash
brew install gemini-cli
```

#### Install globally with MacPorts (macOS)

```bash
sudo port install gemini-cli
```

#### Install with Anaconda (for restricted environments)

```bash
# Create and activate a new environment
conda create -y -n gemini_env -c conda-forge nodejs
conda activate gemini_env

# Install Gemini CLI globally via npm (inside the environment)
npm install -g @google/gemini-cli
```

### From Source (Advanced)

1. **Prerequisites:** Ensure you have
   [Node.js version 20](https://nodejs.org/en/download) or higher installed.
2. **Install from source:**

   ```bash
   # Clone the repository
   git clone https://github.com/google-gemini/gemini-cli.git
   cd gemini-cli

   # Install dependencies
   npm install

   # Build the project
   npm run build

   # Install globally (NEW: One-command installation)
   npm run install:global
   ```

3. **Verify installation:**

   ```bash
   gemini --version
   # Should output: 0.7.0

   # Test natural language CLI
   gemini-natural --version
   ```

### With Homebrew

1. **Prerequisites:** Ensure you have [Homebrew](https://brew.sh/) installed.
2. **Install the CLI:** Execute the following command in your terminal:

   ```bash
   brew install gemini-cli
   ```

3. **Run the CLI:**

   ```bash
   gemini
   ```

### Global Installation (NEW)

For advanced users who want one-command installation and management:

```bash
# Quick global installation with all features
npm run install:global

# Check installation status
npm run version:current

# Update to latest version
npm run update:auto

# Uninstall with cleanup
npm run uninstall:global
```

### Common Configuration steps

1. **Pick a color theme**
2. **Authenticate:** When prompted, sign in with your personal Google account.
   This will grant you up to 60 model requests per minute and 1,000 model
   requests per day using Gemini.

You are now ready to use the Gemini CLI!

### Use a Gemini API key:

The Gemini API provides a free tier with 100 requests per day using Gemini 3.0
Pro, control over which model you use, and access to higher rate limits (with a
paid plan):

1. Generate a key from
   [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Set it as an environment variable in your terminal. Replace `YOUR_API_KEY`
   with your generated key:

   ```bash
   export GEMINI_API_KEY="YOUR_API_KEY"
   ```

3. (Optionally) Upgrade your Gemini API project to a paid plan on the API key
   page (will automatically unlock Tier 1 rate limits)

### Use a Vertex AI API key:

The Vertex AI API provides a free tier using express mode for Gemini 3.0 Pro,
control over which model you use, and access to higher rate limits with a
billing account:

1. Generate a key from
   [Google Cloud](https://console.cloud.google.com/apis/credentials).
2. Set it as an environment variable in your terminal. Replace `YOUR_API_KEY`
   with your generated key and set GOOGLE_GENAI_USE_VERTEXAI to true:

   ```bash
   export GOOGLE_API_KEY="YOUR_API_KEY"
   export GOOGLE_GENAI_USE_VERTEXAI=true
   ```

3. (Optionally) Add a billing account on your project to get access to higher
   usage limits

For other authentication methods, including Google Workspace accounts, see the
[authentication guide](docs/cli/authentication.md).

## Examples

Once the CLI is running, you can start interacting with Gemini from your shell.

You can start a project from a new directory:

```bash
cd new-project/
gemini
> Write me a Gemini Discord bot that answers questions using a FAQ.md file I will provide
```

## Release Cadence and Tags

See [Releases](./docs/releases.md) for more details.

### Preview

New preview releases will be published each week at UTC 2359 on Tuesdays. These
releases will not have been fully vetted and may contain regressions or other
outstanding issues. Please help us test and install with `preview` tag.

```bash
npm install -g @google/gemini-cli@preview
```

### Stable

- New stable releases will be published each week at UTC 2000 on Tuesdays, this
  will be the full promotion of last week's `preview` release + any bug fixes
  and validations. Use `latest` tag.

```bash
npm install -g @google/gemini-cli@latest
```

### Nightly

- New releases will be published each day at UTC 0000. This will be all changes
  from the main branch as represented at time of release. It should be assumed
  there are pending validations and issues. Use `nightly` tag.

```bash
npm install -g @google/gemini-cli@nightly
```

## 📋 Key Features

### Code Understanding & Generation

- Query and edit large codebases
- Generate new apps from PDFs, images, or sketches using multimodal capabilities
- Debug issues and troubleshoot with natural language

### Automation & Integration

- Automate operational tasks like querying pull requests or handling complex
  rebases
- Use MCP servers to connect new capabilities, including
  [media generation with Imagen, Veo or Lyria](https://github.com/GoogleCloudPlatform/vertex-ai-creative-studio/tree/main/experiments/mcp-genmedia)
- Run non-interactively in scripts for workflow automation

### Advanced Capabilities

- Ground your queries with built-in
  [Google Search](https://ai.google.dev/gemini-api/docs/grounding) for real-time
  information
- Conversation checkpointing to save and resume complex sessions
- Custom context files (GEMINI.md) to tailor behavior for your projects

### GitHub Integration

Integrate Gemini CLI directly into your GitHub workflows with
[**Gemini CLI GitHub Action**](https://github.com/google-github-actions/run-gemini-cli):

- **Pull Request Reviews**: Automated code review with contextual feedback and
  suggestions
- **Issue Triage**: Automated labeling and prioritization of GitHub issues based
  on content analysis
- **On-demand Assistance**: Mention `@gemini-cli` in issues and pull requests
  for help with debugging, explanations, or task delegation
- **Custom Workflows**: Build automated, scheduled and on-demand workflows
  tailored to your team's needs

## 🔐 Authentication Options

Choose the authentication method that best fits your needs:

### Option 1: Login with Google (OAuth login using your Google Account)

**✨ Best for:** Individual developers as well as anyone who has a Gemini Code
Assist License. (see
[quota limits and terms of service](https://cloud.google.com/gemini/docs/quotas)
for details)

**Benefits:**

- **Free tier**: 60 requests/min and 1,000 requests/day
- **Gemini 3.0 Pro** with 1M token context window- **No API key management** - just sign in with your Google account
- **Automatic updates** to latest models

#### Start Gemini CLI, then choose _Login with Google_ and follow the browser authentication flow when prompted

```bash
gemini
```

#### If you are using a paid Code Assist License from your organization, remember to set the Google Cloud Project

```bash
# Set your Google Cloud Project
export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"
gemini
```

### Option 2: Gemini API Key

**✨ Best for:** Developers who need specific model control or paid tier access

**Benefits:**

- **Free tier**: 100 requests/day with Gemini 3.0 Pro- **Model selection**: Choose specific Gemini models
- **Usage-based billing**: Upgrade for higher limits when needed

```bash
# Get your key from https://aistudio.google.com/apikey
export GEMINI_API_KEY="YOUR_API_KEY"
gemini
```

### Option 3: Vertex AI

**✨ Best for:** Enterprise teams and production workloads

**Benefits:**

- **Enterprise features**: Advanced security and compliance
- **Scalable**: Higher rate limits with billing account
- **Integration**: Works with existing Google Cloud infrastructure

```bash
# Get your key from Google Cloud Console
export GOOGLE_API_KEY="YOUR_API_KEY"
export GOOGLE_GENAI_USE_VERTEXAI=true
gemini
```

For Google Workspace accounts and other authentication methods, see the
[authentication guide](./docs/get-started/authentication.md).

## 🚀 Getting Started

### Basic Usage

#### Start in current directory

```bash
gemini
```

#### Include multiple directories

```bash
gemini --include-directories ../lib,../docs
```

#### Use specific model

```bash
gemini -m gemini-3.0-flash
```

#### Non-interactive mode for scripts

Get a simple text response:

```bash
gemini -p "Explain the architecture of this codebase"
```

For more advanced scripting, including how to parse JSON and handle errors, use
the `--output-format json` flag to get structured output:

```bash
gemini -p "Explain the architecture of this codebase" --output-format json
```

For real-time event streaming (useful for monitoring long-running operations),
use `--output-format stream-json` to get newline-delimited JSON events:

```bash
gemini -p "Run tests and deploy" --output-format stream-json
```

### Quick Examples

#### Start a new project

```bash
cd new-project/
gemini
> Write me a Discord bot that answers questions using a FAQ.md file I will provide
```

#### Analyze existing code

```bash
git clone https://github.com/google-gemini/gemini-cli
cd gemini-cli
gemini
> Give me a summary of all of the changes that went in yesterday
```

### Natural Language Examples (NEW)

Use the natural language CLI for more intuitive interactions:

```bash
# Natural language commands
gemini-natural "このプロジェクトのアーキテクチャを分析して"

# Interactive mode
gemini-natural
> セキュリティの問題点を教えて
> パフォーマンスの改善点は？
> テストカバレッジを向上させるには？
```

## 📚 Documentation

### Getting Started

- [**Quickstart Guide**](./docs/get-started/index.md) - Get up and running
  quickly.
- [**Authentication Setup**](./docs/get-started/authentication.md) - Detailed
  auth configuration.
- [**Configuration Guide**](./docs/get-started/configuration.md) - Settings and
  customization.
- [**Keyboard Shortcuts**](./docs/cli/keyboard-shortcuts.md) - Productivity
  tips.

### Next Steps

- Learn how to [contribute to or build from the source](CONTRIBUTING.md).
- Explore the available **[CLI Commands](docs/cli/commands.md)**.
- **Try the [Reproducible Examples](./examples/)** - DeepResearch, Supervisor,
  Checkpoint demos.
- If you encounter any issues, review the
  **[troubleshooting guide](docs/cli/troubleshooting.md)**.
- For more comprehensive documentation, see the [full documentation](docs/).
- Take a look at some [popular tasks](#popular-tasks) for more inspiration.
- Check out our **[Official Roadmap](ROADMAP.md)**

### Advanced Error Handling and System Diagnostics

```bash
# Analyze current errors
npm run error:analyze

# Get system information
npm run error:system-info

# Check for updates
npm run update:check
```

### Core Features

- [**Commands Reference**](./docs/cli/commands.md) - All slash commands
  (`/help`, `/chat`, etc).
- [**Custom Commands**](./docs/cli/custom-commands.md) - Create your own
  reusable commands.
- [**Context Files (GEMINI.md)**](./docs/cli/gemini-md.md) - Provide persistent
  context to Gemini CLI.
- [**Checkpointing**](./docs/cli/checkpointing.md) - Save and resume
  conversations.
- [**Token Caching**](./docs/cli/token-caching.md) - Optimize token usage.

### Tools & Extensions

- [**Built-in Tools Overview**](./docs/tools/index.md)
  - [File System Operations](./docs/tools/file-system.md)
  - [Shell Commands](./docs/tools/shell.md)
  - [Web Fetch & Search](./docs/tools/web-fetch.md)
- [**MCP Server Integration**](./docs/tools/mcp-server.md) - Extend with custom
  tools.
- [**Custom Extensions**](./docs/extensions/index.md) - Build and share your own
  commands.

### Advanced Topics

- [**Headless Mode (Scripting)**](./docs/cli/headless.md) - Use Gemini CLI in
  automated workflows.
- [**Architecture Overview**](./docs/architecture.md) - How Gemini CLI works.
- [**IDE Integration**](./docs/ide-integration/index.md) - VS Code companion.
- [**Sandboxing & Security**](./docs/cli/sandbox.md) - Safe execution
  environments.
- [**Trusted Folders**](./docs/cli/trusted-folders.md) - Control execution
  policies by folder.
- [**Enterprise Guide**](./docs/cli/enterprise.md) - Deploy and manage in a
  corporate environment.
- [**Telemetry & Monitoring**](./docs/cli/telemetry.md) - Usage tracking.
- [**Tools API Development**](./docs/core/tools-api.md) - Create custom tools.
- [**Local development**](./docs/local-development.md) - Local development
  tooling.

### Troubleshooting & Support

- [**Troubleshooting Guide**](./docs/troubleshooting.md) - Common issues and
  solutions.
- [**FAQ**](./docs/faq.md) - Frequently asked questions.
- Use `/bug` command to report issues directly from the CLI.

### Using MCP Servers

Configure MCP servers in `~/.gemini/settings.json` to extend Gemini CLI with
custom tools:

```text
> @github List my open pull requests
> @slack Send a summary of today's commits to #dev channel
> @database Run a query to find inactive users
```

See the [MCP Server Integration guide](./docs/tools/mcp-server.md) for setup
instructions.

> 💡 **Use Gemini with Codex:** The repository includes a ready-to-run MCP
> server for Codex in
> [`mcp-servers/gemini-codex-mcp`](./mcp-servers/gemini-codex-mcp). Build it
> with `npm run build` and launch it via `npx gemini-codex-mcp` to make Gemini
> available to Codex (and other MCP clients) through the `gemini_generate_text`
> tool.

## 🔒 Security & Operations

This section documents security considerations and operational guardrails for
production use.

### Logging Policy

| Recorded                       | NOT Recorded             |
| ------------------------------ | ------------------------ |
| Command history                | API keys and tokens      |
| Checkpoint states              | Model responses with PII |
| Session metadata               | External data fetched    |
| Tool invocations (audit trail) | User credentials         |

### Secrets Management

- Use environment variables for API keys (`GEMINI_API_KEY`, `GOOGLE_API_KEY`)
- `.gitignore` includes `.env` and credential files by default
- Pre-commit hooks via Husky prevent accidental secret commits
- No secrets are logged or transmitted beyond the Gemini API

### Operational Guardrails

- **Confirmation required**: Dangerous operations (file deletion, system
  commands) require explicit user approval
- **Approval modes**: `--approval-mode` controls auto-execution behavior
  (`default`, `auto_edit`, `yolo`)
- **Privilege separation**: Shell commands run with user permissions only
- **Circuit breaker**: Load balancer includes automatic failover and health
  checks

### Air-Gapped / Classified Environments

For disconnected or classified networks:

- Disable external API calls via environment configuration
- Use checkpoint/recovery for offline session continuity
- All tool invocations are auditable via local logs
- Session state stored locally (JSON + metadata)

> **Note**: This CLI is designed for developer productivity. For classified
> workloads, ensure compliance with your organization's security policies.

## 🤝 Contributing

We welcome contributions! Gemini CLI is fully open source (Apache 2.0), and we
encourage the community to:

- Report bugs and suggest features.
- Improve documentation.
- Submit code improvements.
- Share your MCP servers and extensions.

See our [Contributing Guide](./CONTRIBUTING.md) for development setup, coding
standards, and how to submit pull requests.

Check our [Official Roadmap](https://github.com/orgs/google-gemini/projects/11)
for planned features and priorities.

## 📖 Resources

- **[Official Roadmap](./ROADMAP.md)** - See what's coming next.
- **[Changelog](./docs/changelogs/index.md)** - See recent notable updates.
- **[NPM Package](https://www.npmjs.com/package/@google/gemini-cli)** - Package
  registry.
- **[GitHub Issues](https://github.com/google-gemini/gemini-cli/issues)** -
  Report bugs or request features.
- **[Security Advisories](https://github.com/google-gemini/gemini-cli/security/advisories)** -
  Security updates.

### Uninstall

See the [Uninstall Guide](docs/cli/uninstall.md) for removal instructions.

## 📄 Legal

- **License**: [Apache License 2.0](LICENSE)
- **Terms of Service**: [Terms & Privacy](./docs/tos-privacy.md)
- **Security**: [Security Policy](SECURITY.md)

---

<p align="center">
  Built with ❤️ by Google and the open source community
</p>
