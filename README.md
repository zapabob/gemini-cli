# Gemini CLI

[![Gemini CLI CI](https://github.com/google-gemini/gemini-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/google-gemini/gemini-cli/actions/workflows/ci.yml)

![Gemini CLI Screenshot](./docs/assets/gemini-screenshot.png)

This repository contains the Gemini CLI, a command-line AI workflow tool that connects to your
tools, understands your code and accelerates your workflows.

With the Gemini CLI you can:

- Query and edit large codebases in and beyond Gemini's 1M token context window.
- Generate new apps from PDFs or sketches, using Gemini's multimodal capabilities.
- Automate operational tasks, like querying pull requests or handling complex rebases.
- Use tools and MCP servers to connect new capabilities, including [media generation with Imagen,
  Veo or Lyria](https://github.com/GoogleCloudPlatform/vertex-ai-creative-studio/tree/main/experiments/mcp-genmedia)
- Ground your queries with the [Google Search](https://ai.google.dev/gemini-api/docs/grounding)
  tool, built into Gemini.
- **🆕 Load Balancing**: Distribute requests across multiple Gemini API endpoints for improved reliability and performance
- **🆕 Sub-Agents**: Create specialized AI agents for different tasks and coordinate them seamlessly
- **🆕 Power Failure Protection**: Automatic checkpointing, emergency saves, and session recovery for uninterrupted workflows
- **🆕 DeepResearch**: Perform comprehensive multi-level research with source validation and topic exploration
- **🆕 Supervisor Command**: Natural language parallel implementation with sub-agent coordination
- **🆕 GitHub Actions Integration**: Automated code analysis and review with PR comments

## 🆕 Enhanced Features

### Supervisor Command
Execute parallel implementations using natural language with intelligent sub-agent coordination:

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
- Automatic sub-agent generation (DeepResearch Agent, Architecture Planner, Implementation Specialist)
- Parallel execution coordination with multiple strategies
- Real-time progress tracking and decision logging
- Result integration and comprehensive output

**Available Options:**
- **Styles**: autocratic, democratic, laissez-faire
- **Strategies**: sequential, parallel, hybrid
- **Custom Sub-agents**: Comma-separated custom agent names

### Load Balancer
Distribute your requests across multiple Gemini API endpoints for enhanced reliability and performance:

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
- Multiple load balancing algorithms (Round Robin, Least Connections, Weighted, IP Hash)
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

## Quickstart

You have multiple options to install Gemini CLI.

### With Node (Recommended)

1. **Prerequisites:** Ensure you have [Node.js version 20](https://nodejs.org/en/download) or higher installed.
2. **Install from source:**

   ```bash
   # Clone the repository
   git clone https://github.com/google-gemini/gemini-cli.git
   cd gemini-cli
   
   # Install dependencies
   npm install
   
   # Build the project
   npm run build
   
   # Install globally
   npm install -g .
   ```

3. **Verify installation:**

   ```bash
   gemini --version
   # Should output: 0.6.0
   ```

### With Homebrew

1. **Prerequisites:** Ensure you have Homebrew installed.
2. **Install the CLI:**

   ```bash
   brew install gemini-cli
   ```

3. **Run the CLI:**

   ```bash
   gemini
   ```

### Common Configuration steps

1. **Pick a color theme**
2. **Authenticate:** When prompted, sign in with your personal Google account. This will grant you up to 60 model requests per minute and 1,000 model requests per day using Gemini.

You are now ready to use the Gemini CLI!

### Use a Gemini API key:

The Gemini API provides a free tier with 100 requests per day using Gemini 2.5 Pro, control over which model you use, and access to higher rate limits (with a paid plan):

1. Generate a key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Set it as an environment variable in your terminal. Replace `YOUR_API_KEY` with your generated key:

   ```bash
   export GEMINI_API_KEY="YOUR_API_KEY"
   ```

3. (Optionally) Upgrade your Gemini API project to a paid plan on the API key page (will automatically unlock Tier 1 rate limits)

### Use a Vertex AI API key:

The Vertex AI API provides a free tier using express mode for Gemini 2.5 Pro, control over which model you use, and access to higher rate limits with a billing account:

1. Generate a key from [Google Cloud](https://console.cloud.google.com/apis/credentials).
2. Set it as an environment variable in your terminal. Replace `YOUR_API_KEY` with your generated key and set GOOGLE_GENAI_USE_VERTEXAI to true:

   ```bash
   export GOOGLE_API_KEY="YOUR_API_KEY"
   export GOOGLE_GENAI_USE_VERTEXAI=true
   ```

3. (Optionally) Add a billing account on your project to get access to higher usage limits

For other authentication methods, including Google Workspace accounts, see the [authentication guide](docs/cli/authentication.md).

## Examples

Once the CLI is running, you can start interacting with Gemini from your shell.

You can start a project from a new directory:

```bash
cd new-project/
gemini
> Write me a Gemini Discord bot that answers questions using a FAQ.md file I will provide
```

Or work with an existing project:

```bash
git clone https://github.com/google-gemini/gemini-cli
cd gemini-cli
gemini
> Give me a summary of all of the changes that went in yesterday
```

### Next steps

- Learn how to [contribute to or build from the source](CONTRIBUTING.md).
- Explore the available **[CLI Commands](docs/cli/commands.md)**.
- If you encounter any issues, review the **[troubleshooting guide](docs/cli/troubleshooting.md)**.
- For more comprehensive documentation, see the [full documentation](docs/).
- Take a look at some [popular tasks](#popular-tasks) for more inspiration.
- Check out our **[Official Roadmap](ROADMAP.md)**

### Troubleshooting

Head over to the [troubleshooting guide](docs/cli/troubleshooting.md) if you're having issues.

## Popular tasks

### Explore a new codebase

Start by `cd`ing into an existing or newly-cloned repository and running `gemini`.

```
> Describe the main pieces of this system's architecture.
```

```
> What security mechanisms are in place?
```

### Work with your existing code

```
> Implement a first draft for GitHub issue #123.
```

```
> Help me migrate this codebase to the latest version of Java. Start with a plan.
```

### Automate your workflows

Use MCP servers to integrate your local system tools with your enterprise collaboration suite.

```
> Make me a slide deck showing the git history from the last 7 days, grouped by feature and team member.
```

```
> Make a full-screen web app for a wall display to show our most interacted-with GitHub issues.
```

### Interact with your system

```
> Convert all the images in this directory to png, and rename them to use dates from the exif data.
```

```
> Organize my PDF invoices by month of expenditure.
```

### Uninstall

Head over to the [Uninstall guide](docs/cli/uninstall.md) for uninstallation instructions.

## Terms of Service and Privacy Notice

For details on the terms of service and privacy notice applicable to your use of Gemini CLI, see the [Terms of Service and Privacy Notice](docs/privacy.md).
