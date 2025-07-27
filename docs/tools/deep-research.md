# Deep Research Tool (`deep_research`)

This document describes the `deep_research` tool.

## Description

Use `deep_research` to perform comprehensive research with multi-level analysis, source validation, and topic exploration. This tool goes beyond simple web searches by providing iterative deepening research with multiple perspectives and comprehensive analysis.

### Arguments

`deep_research` takes the following arguments:

- `query` (string, required): The research query to investigate deeply.
- `max_depth` (number, optional): Maximum depth of research (default: 3). Controls how many levels of related topics to explore.
- `max_sources` (number, optional): Maximum number of sources to analyze (default: 10). Limits the total number of sources to research.
- `strategy` (string, optional): Research strategy to use:
  - `"comprehensive"`: Deep analysis with multiple perspectives (default)
  - `"focused"`: Targeted research on specific aspects
  - `"exploratory"`: Broad exploration of related topics
- `include_academic` (boolean, optional): Include academic sources in research (default: true).
- `recent_years` (number, optional): Include recent sources (within specified years, default: 5).
- `focus_domains` (array of strings, optional): Specific domains to focus on (e.g., ["arxiv.org", "scholar.google.com"]).
- `exclude_types` (array of strings, optional): Exclude certain types of sources (e.g., ["social_media", "news_aggregators"]).

## How to use `deep_research` with the Gemini CLI

The `deep_research` tool performs multi-level research analysis using Google Search grounding and provides comprehensive results with metadata about the research process.

Usage:

```
deep_research(query="Your research query", max_depth=3, strategy="comprehensive")
```

## `deep_research` examples

### Basic Research
```
deep_research(query="latest advancements in quantum computing")
```

### Focused Academic Research
```
deep_research(
  query="machine learning applications in healthcare",
  strategy="focused",
  include_academic=true,
  recent_years=3,
  focus_domains=["arxiv.org", "ieee.org", "scholar.google.com"]
)
```

### Exploratory Research
```
deep_research(
  query="artificial intelligence trends",
  strategy="exploratory",
  max_depth=5,
  max_sources=20,
  exclude_types=["social_media", "news_aggregators"]
)
```

### Comprehensive Analysis
```
deep_research(
  query="climate change impact on agriculture",
  strategy="comprehensive",
  max_depth=4,
  include_academic=true,
  recent_years=5,
  focus_domains=["nature.com", "science.org", "un.org"]
)
```

## Research Methodology

The Deep Research tool employs a sophisticated multi-level analysis approach:

### Level 1: Initial Exploration
- Basic query analysis and source identification
- Initial topic mapping and keyword extraction
- Source credibility assessment

### Level 2: Deep Dive
- Detailed analysis of key findings
- Cross-referencing and validation
- Identification of related topics and connections

### Level 3+: Synthesis and Validation
- Cross-validation of findings across multiple sources
- Synthesis of insights and identification of patterns
- Contradiction analysis and debate identification

## Output Format

The tool returns a structured response with:

### Research Summary
- Strategy used
- Depth achieved
- Sources analyzed
- Time taken
- Topics explored

### Key Topics
- Extracted topics from the research
- Related concepts and connections

### Detailed Analysis
- Multi-level research findings
- Source validation results
- Cross-referenced insights

### Research Methodology
- Explanation of the research approach
- Tools and techniques used

## Advanced Features

### Source Filtering
- Academic source prioritization
- Recent source filtering
- Domain-specific focus
- Source type exclusion

### Strategy Selection
- **Comprehensive**: Full analysis with multiple perspectives
- **Focused**: Targeted research on specific aspects
- **Exploratory**: Broad exploration of related topics

### Quality Control
- Source credibility assessment
- Cross-validation of findings
- Contradiction identification
- Bias detection

## Important Notes

- **Resource Intensive**: Deep research can be resource-intensive and may require user confirmation for complex queries
- **Time Requirements**: Multi-level analysis takes time, especially for deep research (3+ levels)
- **Source Limits**: Respects maximum source limits to manage API usage
- **Academic Focus**: Can prioritize academic and peer-reviewed sources
- **Real-time Data**: Uses Google Search grounding for current information

## Best Practices

1. **Start Simple**: Begin with basic queries and increase complexity
2. **Use Appropriate Strategy**: Choose strategy based on research goals
3. **Set Reasonable Limits**: Balance depth with resource constraints
4. **Focus Domains**: Use domain filtering for specialized research
5. **Review Results**: Always review and validate research findings

## Error Handling

The tool handles various error scenarios:
- API rate limiting
- Network connectivity issues
- Invalid parameters
- Source access restrictions

All errors are reported with clear explanations and suggestions for resolution. 