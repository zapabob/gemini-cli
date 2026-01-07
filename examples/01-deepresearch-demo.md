# DeepResearch Demo

This example demonstrates the DeepResearch feature for multi-level research with
source validation.

## Purpose

DeepResearch performs comprehensive research by:

1. Querying multiple sources at each level
2. Validating source credibility
3. Exploring related topics hierarchically
4. Providing citation trails for verification

## Prerequisites

```bash
# Ensure CLI is installed
gemini --version

# Set API key
export GEMINI_API_KEY="your-api-key"
```

## Example 1: Basic Research

```bash
gemini /deepresearch "AI in healthcare diagnostics" --levels 2 --sources 5
```

### Expected Output Structure

```
🔍 DeepResearch: AI in healthcare diagnostics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Level 1 Analysis
├── Source 1: [Nature Medicine] AI diagnostic accuracy study (2024)
│   ├── Credibility: ★★★★★ (Peer-reviewed)
│   └── Key finding: 94.5% accuracy in radiology screening
├── Source 2: [JAMA Network] Clinical implementation challenges
│   ├── Credibility: ★★★★★ (Peer-reviewed)
│   └── Key finding: Integration requires 18-month average
...

📊 Level 2 Analysis (Deeper exploration)
├── Topic: Radiology AI implementations
│   └── Sources: 5 additional papers analyzed
├── Topic: Clinical validation requirements
│   └── Sources: 3 regulatory documents reviewed
...

📋 Summary
├── Total sources analyzed: 15
├── Academic sources: 12 (80%)
├── Validation score: 92%
└── Research depth: Level 2/3
```

## Example 2: Focused Academic Research

```bash
gemini /deepresearch "machine learning drug discovery" \
  --strategy focused \
  --academic \
  --recent 3
```

This limits research to:

- Focused strategy (depth over breadth)
- Academic sources only
- Publications from the last 3 years

## Example 3: Exploratory Research

```bash
gemini /deepresearch "quantum computing applications" \
  --strategy exploratory \
  --levels 3 \
  --sources 10
```

Exploratory mode discovers unexpected connections between topics.

## Verification

To verify the research quality:

1. **Check citation links**: All sources include URLs or DOIs
2. **Credibility scores**: Each source shows peer-review status
3. **Recency**: Dates are shown for temporal context
4. **Cross-validation**: Related sources confirm key findings

## Troubleshooting

| Issue                 | Solution                                    |
| --------------------- | ------------------------------------------- |
| "Rate limited"        | Reduce `--sources` count or wait            |
| "No academic sources" | Remove `--academic` flag for broader search |
| "Shallow results"     | Increase `--levels` to 3                    |

## Related Commands

- `/search` - Quick single-query search
- `/web` - Fetch specific URLs
- Google Search grounding (built-in) - Real-time information
