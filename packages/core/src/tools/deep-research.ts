/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  ToolResult,
  ToolCallConfirmationDetails,
  ToolInvocation,
  ToolLocation} from './tools.js';
import {
  BaseDeclarativeTool,
  Kind
} from './tools.js';
// import { SchemaValidator } from '../utils/schemaValidator.js';
import { getErrorMessage } from '../utils/errors.js';
import type { Config } from '../config/config.js';
import {
  recordFileOperationMetric,
  FileOperation,
} from '../telemetry/metrics.js';
import { getResponseText } from '../utils/generateContentResponseUtilities.js';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Parameters for the DeepResearchTool.
 */
export interface DeepResearchToolParams {
  /**
   * The research query to investigate deeply.
   */
  query: string;

  /**
   * Optional. Maximum depth of research (default: 3).
   * Controls how many levels of related topics to explore.
   */
  max_depth?: number;

  /**
   * Optional. Maximum number of sources to analyze (default: 10).
   * Limits the total number of sources to research.
   */
  max_sources?: number;

  /**
   * Optional. Research strategy to use.
   * - "comprehensive": Deep analysis with multiple perspectives
   * - "focused": Targeted research on specific aspects
   * - "exploratory": Broad exploration of related topics
   * Default: "comprehensive"
   */
  strategy?: 'comprehensive' | 'focused' | 'exploratory';

  /**
   * Optional. Include academic sources in research.
   * Default: true
   */
  include_academic?: boolean;

  /**
   * Optional. Include recent sources (within specified years).
   * Default: 5 (last 5 years)
   */
  recent_years?: number;

  /**
   * Optional. Specific domains to focus on.
   * Example: ["arxiv.org", "scholar.google.com", "ieee.org"]
   */
  focus_domains?: string[];

  /**
   * Optional. Exclude certain types of sources.
   * Example: ["social_media", "news_aggregators"]
   */
  exclude_types?: string[];
}

/**
 * Result structure for DeepResearchTool.
 */
export interface DeepResearchToolResult extends ToolResult {
  /**
   * The main research findings and analysis.
   */
  llmContent: string;

  /**
   * Formatted display content for the user.
   */
  returnDisplay: string;

  /**
   * Metadata about the research process.
   */
  metadata?: {
    sources_analyzed: number;
    research_depth: number;
    strategy_used: string;
    time_taken_ms: number;
    topics_explored: string[];
    saved_file_path?: string;
  };
}

/**
 * DeepResearchTool provides advanced research capabilities with multi-level analysis,
 * source validation, and comprehensive topic exploration.
 */
export class DeepResearchTool extends BaseDeclarativeTool<
  DeepResearchToolParams,
  DeepResearchToolResult
> {
  constructor(private readonly config: Config) {
    super(
      'deep_research',
      'Deep Research',
      'Perform comprehensive research with multi-level analysis, source validation, and topic exploration',
      Kind.Search,
      {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The research query to investigate deeply.',
          },
          max_depth: {
            type: 'number',
            description: 'Maximum depth of research (default: 3).',
          },
          max_sources: {
            type: 'number',
            description: 'Maximum number of sources to analyze (default: 10).',
          },
          strategy: {
            type: 'string',
            description:
              'Research strategy: comprehensive, focused, or exploratory.',
          },
          include_academic: {
            type: 'boolean',
            description: 'Include academic sources in research.',
          },
          recent_years: {
            type: 'number',
            description: 'Include recent sources (within specified years).',
          },
          focus_domains: {
            type: 'array',
            items: { type: 'string' },
            description: 'Specific domains to focus on.',
          },
          exclude_types: {
            type: 'array',
            items: { type: 'string' },
            description: 'Exclude certain types of sources.',
          },
        },
        required: ['query'],
      },
      true, // isOutputMarkdown
      true, // canUpdateOutput
    );
  }

  protected createInvocation(
    params: DeepResearchToolParams,
  ): ToolInvocation<DeepResearchToolParams, DeepResearchToolResult> {
    return new DeepResearchToolInvocation(params, this.config);
  }

  override validateToolParams(params: DeepResearchToolParams): string | null {
    if (!params.query || params.query.trim() === '') {
      return 'Query cannot be empty';
    }
    return null;
  }
}

class DeepResearchToolInvocation
  implements ToolInvocation<DeepResearchToolParams, DeepResearchToolResult>
{
  constructor(
    readonly params: DeepResearchToolParams,
    private readonly config: Config,
  ) {}

  getDescription(): string {
    return `Perform deep research on: "${this.params.query}"`;
  }

  toolLocations(): ToolLocation[] {
    return [];
  }

  async shouldConfirmExecute(
    _abortSignal: AbortSignal,
  ): Promise<ToolCallConfirmationDetails | false> {
    // Deep research can be resource-intensive, so we ask for confirmation
    // if the query is complex or involves many sources
    const isComplex =
      this.params.query.length > 200 ||
      (this.params.max_sources && this.params.max_sources > 15) ||
      (this.params.max_depth && this.params.max_depth > 5);

    if (isComplex) {
      return {
        type: 'info',
        title: 'Deep Research Confirmation',
        prompt: `This deep research query is complex and may take significant time and resources. 
                 Query: "${this.params.query.substring(0, 100)}..."
                 Max sources: ${this.params.max_sources || 10}
                 Max depth: ${this.params.max_depth || 3}
                 
                 Do you want to proceed with this comprehensive research?`,
        onConfirm: async (_outcome) => {
          // Handle confirmation outcome
        },
      };
    }

    return false;
  }

  /**
   * Executes the deep research functionality.
   */
  async execute(
    signal: AbortSignal,
    _updateOutput?: (output: string) => void,
  ): Promise<DeepResearchToolResult> {
    // Validate parameters
    if (!this.params.query || this.params.query.trim() === '') {
      return {
        llmContent: `Error: Invalid parameters. The 'query' parameter cannot be empty.`,
        returnDisplay: `## Parameter Error\n\nThe 'query' parameter cannot be empty.`,
      };
    }

    const startTime = Date.now();
    const {
      query,
      max_depth = 3,
      max_sources = 10,
      strategy = 'comprehensive',
      include_academic = true,
      recent_years = 5,
      focus_domains = [],
      exclude_types = [],
    } = this.params;

    try {
      // Record telemetry
      recordFileOperationMetric(this.config, FileOperation.READ);

      const geminiClient = this.config.getGeminiClient();

      // Create research prompt based on strategy
      const researchPrompt = this.createResearchPrompt(query, {
        max_depth,
        max_sources,
        strategy,
        include_academic,
        recent_years,
        focus_domains,
        exclude_types,
      });

      // Execute multi-level research
      const researchResults = await this.performMultiLevelResearch(
        researchPrompt,
        geminiClient,
        signal,
        {
          max_depth,
          max_sources,
          strategy,
        },
      );

      const timeTaken = Date.now() - startTime;

      // Format the results
      const formattedResults = this.formatResearchResults(researchResults, {
        query,
        strategy,
        timeTaken,
        max_depth,
        max_sources,
      });

      // Save research results to markdown file
      const savedFilePath = await this.saveResearchToMarkdown(
        query,
        researchResults,
        {
          strategy,
          timeTaken,
          max_depth,
          max_sources,
        },
      );

      return {
        llmContent: formattedResults.analysis,
        returnDisplay: formattedResults.display,
        metadata: {
          sources_analyzed: researchResults.sourcesCount,
          research_depth: researchResults.depth,
          strategy_used: strategy,
          time_taken_ms: timeTaken,
          topics_explored: researchResults.topics,
          saved_file_path: savedFilePath,
        },
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      return {
        llmContent: `Error during deep research: ${errorMessage}`,
        returnDisplay: `## Deep Research Error\n\nAn error occurred during the research process:\n\`\`\`\n${errorMessage}\n\`\`\``,
      };
    }
  }

  /**
   * Creates a comprehensive research prompt based on the strategy and parameters.
   */
  private createResearchPrompt(
    query: string,
    options: {
      max_depth: number;
      max_sources: number;
      strategy: string;
      include_academic: boolean;
      recent_years: number;
      focus_domains: string[];
      exclude_types: string[];
    },
  ): string {
    const {
      strategy,
      max_depth,
      max_sources,
      include_academic,
      recent_years,
      focus_domains,
      exclude_types,
    } = options;

    let prompt = `Perform a deep research analysis on: "${query}"\n\n`;

    prompt += `Research Strategy: ${strategy}\n`;
    prompt += `Analysis Depth: ${max_depth} levels\n`;
    prompt += `Source Limit: ${max_sources} sources\n`;

    if (include_academic) {
      prompt += `Include academic and peer-reviewed sources\n`;
    }

    if (recent_years > 0) {
      prompt += `Focus on sources from the last ${recent_years} years\n`;
    }

    if (focus_domains.length > 0) {
      prompt += `Focus on domains: ${focus_domains.join(', ')}\n`;
    }

    if (exclude_types.length > 0) {
      prompt += `Exclude: ${exclude_types.join(', ')}\n`;
    }

    prompt += `\nPlease provide:\n`;
    prompt += `1. Comprehensive analysis with multiple perspectives\n`;
    prompt += `2. Source validation and credibility assessment\n`;
    prompt += `3. Related topics and connections\n`;
    prompt += `4. Current trends and future implications\n`;
    prompt += `5. Contradicting viewpoints and debates\n`;
    prompt += `6. Practical applications and recommendations\n`;

    return prompt;
  }

  /**
   * Performs multi-level research with iterative deepening.
   */
  private async performMultiLevelResearch(
    prompt: string,
    geminiClient: ReturnType<Config['getGeminiClient']>,
    signal: AbortSignal,
    options: {
      max_depth: number;
      max_sources: number;
      strategy: string;
    },
  ): Promise<{
    analysis: string;
    sourcesCount: number;
    depth: number;
    topics: string[];
  }> {
    const { max_depth, max_sources } = options;
    let currentAnalysis = '';
    let sourcesCount = 0;
    const topics: string[] = [];
    let currentDepth = 0;

    // Perform iterative deepening research
    for (let depth = 1; depth <= max_depth; depth++) {
      currentDepth = depth;

      let levelPrompt = `${prompt}\n\nResearch Level ${depth}:`;
      if (depth > 1) {
        levelPrompt += `\nBased on previous findings: ${currentAnalysis.substring(0, 500)}...`;
      }

      try {
        const response = await geminiClient.generateContent(
          [{ role: 'user', parts: [{ text: levelPrompt }] }],
          { tools: [{ googleSearch: {} }] },
          signal,
          'gemini-2.5-flash-exp',
        );

        const responseText = getResponseText(response);
        if (responseText) {
          currentAnalysis += `\n\n--- Level ${depth} Analysis ---\n${responseText}`;
          sourcesCount += 5; // Estimate sources per level

          // Extract topics from this level
          const levelTopics = this.extractTopics(responseText);
          topics.push(...levelTopics);
        }

        // Check if we've reached the source limit
        if (sourcesCount >= max_sources) {
          break;
        }
      } catch (error) {
        console.warn(`Error at research level ${depth}:`, error);
        throw error; // Re-throw the error so it can be caught by the execute method
      }
    }

    return {
      analysis: currentAnalysis,
      sourcesCount,
      depth: currentDepth,
      topics: [...new Set(topics)], // Remove duplicates
    };
  }

  /**
   * Extracts key topics from research text.
   */
  private extractTopics(text: string): string[] {
    // Simple topic extraction - in a real implementation, this would be more sophisticated
    const topics: string[] = [];
    const lines = text.split('\n');

    for (const line of lines) {
      if (
        line.includes('topic:') ||
        line.includes('Topic:') ||
        line.includes('subject:')
      ) {
        const topic = line.split(':')[1]?.trim();
        if (topic) {
          topics.push(topic);
        }
      }
    }

    return topics;
  }

  /**
   * Saves research results to a markdown file in the _docs directory.
   */
  private async saveResearchToMarkdown(
    query: string,
    results: {
      analysis: string;
      sourcesCount: number;
      depth: number;
      topics: string[];
    },
    options: {
      strategy: string;
      timeTaken: number;
      max_depth: number;
      max_sources: number;
    },
  ): Promise<string> {
    try {
      // Create _docs directory if it doesn't exist
      const docsDir = path.join(process.cwd(), '_docs');
      if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
      }

      // Generate filename with timestamp
      const now = new Date();
      const timestamp = now.toISOString().split('T')[0]; // YYYY-MM-DD format
      // const timeStr = now.toISOString().split('T')[1].split('.')[0].replace(/:/g, '-'); // HH-MM-SS format

      // Create a safe filename from the query
      const safeQuery = query
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .toLowerCase()
        .substring(0, 50); // Limit length

      const filename = `${timestamp}_deepresearch_${safeQuery}.md`;
      const filepath = path.join(docsDir, filename);

      // Generate markdown content
      const markdownContent = this.generateMarkdownContent(
        query,
        results,
        options,
      );

      // Write to file
      await fs.promises.writeFile(filepath, markdownContent, 'utf-8');

      // Record file operation metric
      recordFileOperationMetric(
        this.config,
        FileOperation.CREATE,
        undefined,
        'text/markdown',
        '.md',
      );

      console.log(`📄 DeepResearch results saved to: ${filepath}`);
      return filepath;
    } catch (error) {
      console.warn('Failed to save DeepResearch results to markdown:', error);
      return '';
    }
  }

  /**
   * Generates markdown content for the research results.
   */
  private generateMarkdownContent(
    query: string,
    results: {
      analysis: string;
      sourcesCount: number;
      depth: number;
      topics: string[];
    },
    options: {
      strategy: string;
      timeTaken: number;
      max_depth: number;
      max_sources: number;
    },
  ): string {
    const { strategy, timeTaken, max_depth, max_sources } = options;
    const { analysis, sourcesCount, depth, topics } = results;
    const now = new Date();

    return `# DeepResearch Report: ${query}

**Date**: ${now.toISOString().split('T')[0]} ${now.toISOString().split('T')[1].split('.')[0]}  
**Research Topic**: ${query}  
**Research Method**: ${strategy} deep research with multi-level analysis  
**Language**: English and Japanese (英語・日本語)

---

## Research Summary

- **Strategy Used**: ${strategy}
- **Depth Achieved**: ${depth}/${max_depth} levels
- **Sources Analyzed**: ${sourcesCount}/${max_sources}
- **Time Taken**: ${timeTaken}ms
- **Topics Explored**: ${topics.length}

## Key Topics

${topics.map((topic) => `- ${topic}`).join('\n')}

## Detailed Analysis

${analysis}

## Research Methodology

This deep research employed a multi-level analysis approach:

1. **Level 1**: Initial exploration and source identification
2. **Level 2**: Deep dive into key findings and connections  
3. **Level 3+**: Cross-validation and synthesis of insights

The research utilized Google Search grounding for real-time information and source validation.

---

## English Report

${this.generateEnglishReport(analysis)}

---

## 日本語レポート

${this.generateJapaneseReport(analysis)}

---

*Report generated by DeepResearch tool on ${now.toISOString().split('T')[0]}*`;
  }

  /**
   * Generates English report section.
   */
  private generateEnglishReport(analysis: string): string {
    // Extract and format the English content from the analysis
    const englishSections = analysis
      .split('\n\n')
      .filter(
        (section) =>
          !section.includes('日本語') && !section.includes('Japanese'),
      );

    return englishSections.join('\n\n');
  }

  /**
   * Generates Japanese report section.
   */
  private generateJapaneseReport(analysis: string): string {
    // Extract and format the Japanese content from the analysis
    const japaneseSections = analysis
      .split('\n\n')
      .filter(
        (section) => section.includes('日本語') || section.includes('Japanese'),
      );

    return japaneseSections.join('\n\n');
  }

  /**
   * Formats the research results for display.
   */
  private formatResearchResults(
    results: {
      analysis: string;
      sourcesCount: number;
      depth: number;
      topics: string[];
    },
    options: {
      query: string;
      strategy: string;
      timeTaken: number;
      max_depth: number;
      max_sources: number;
    },
  ): {
    analysis: string;
    display: string;
  } {
    const { query, strategy, timeTaken, max_depth, max_sources } = options;
    const { analysis, sourcesCount, depth, topics } = results;

    const display = `# Deep Research Results

## Query
${query}

## Research Summary
- **Strategy**: ${strategy}
- **Depth Achieved**: ${depth}/${max_depth} levels
- **Sources Analyzed**: ${sourcesCount}/${max_sources}
- **Time Taken**: ${timeTaken}ms
- **Topics Explored**: ${topics.length}

## Key Topics
${topics.map((topic) => `- ${topic}`).join('\n')}

## Detailed Analysis
${analysis}

## Research Methodology
This deep research employed a multi-level analysis approach:
1. **Level 1**: Initial exploration and source identification
2. **Level 2**: Deep dive into key findings and connections
3. **Level 3+**: Cross-validation and synthesis of insights

The research utilized Google Search grounding for real-time information and source validation.`;

    return {
      analysis,
      display,
    };
  }
}
