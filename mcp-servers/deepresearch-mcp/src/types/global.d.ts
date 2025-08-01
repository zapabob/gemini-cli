/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// @google/generative-ai モジュールの型定義
declare module '@google/generative-ai' {
  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(config: { model: string }): GenerativeModel;
  }

  export interface GenerativeModel {
    generateContent(prompt: string): Promise<GenerateContentResult>;
  }

  export interface GenerateContentResult {
    response: Promise<GenerateContentResponse>;
  }

  export interface GenerateContentResponse {
    text(): string;
  }
}

// fs-extra モジュールの型定義
declare module 'fs-extra' {
  import * as fs from 'fs';
  import * as path from 'path';

  export interface FsExtra {
    // fs のメソッド
    readFile: (path: string, encoding?: string) => Promise<string>;
    writeFile: (path: string, data: string, options?: { encoding?: string }) => Promise<void>;
    stat: (path: string) => Promise<fs.Stats>;
    ensureDir: (dir: string) => Promise<void>;
    // その他の fs-extra 固有のメソッド
  }

  const fsExtra: FsExtra;
  export = fsExtra;
}

// node-fetch モジュールの型定義
declare module 'node-fetch' {
  interface Response {
    text(): Promise<string>;
    json(): Promise<any>;
    ok: boolean;
    status: number;
    statusText: string;
  }

  interface RequestInit {
    method?: string;
    headers?: Record<string, string>;
    body?: string | Buffer;
  }

  function fetch(url: string, init?: RequestInit): Promise<Response>;
  export = fetch;
}

// cheerio モジュールの型定義
declare module 'cheerio' {
  interface CheerioAPI {
    load(html: string): CheerioStatic;
  }

  interface CheerioStatic {
    (selector: string): Cheerio;
    (element: any): Cheerio;
    html(): string;
    html(html: string): Cheerio;
    text(): string;
    text(text: string): Cheerio;
    attr(name: string): string;
    attr(name: string, value: string): Cheerio;
    find(selector: string): Cheerio;
    first(): Cheerio;
  }

  interface Cheerio {
    text(): string;
    html(): string;
    attr(name: string): string;
    attr(name: string, value: string): Cheerio;
    find(selector: string): Cheerio;
    first(): Cheerio;
  }

  const cheerio: CheerioAPI;
  export = cheerio;
}

// glob モジュールの型定義
declare module 'glob' {
  interface GlobOptions {
    ignore?: string | string[];
    nodir?: boolean;
    cwd?: string;
  }

  function glob(pattern: string, options?: GlobOptions): Promise<string[]>;
  export { glob };
}

// ローカルモジュールの型定義
declare module '../utils/logger.js' {
  export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
  
  export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    data?: unknown;
  }

  export class Logger {
    constructor(
      logLevel?: LogLevel,
      enableConsole?: boolean,
      enableFile?: boolean,
      logFile?: string
    );
    
    debug(message: string, data?: unknown): void;
    info(message: string, data?: unknown): void;
    warn(message: string, data?: unknown): void;
    error(message: string, data?: unknown): void;
    
    setLogLevel(level: LogLevel): void;
    setConsoleOutput(enabled: boolean): void;
    setFileOutput(enabled: boolean, logFile?: string): void;
    
    getStats(): {
      logLevel: LogLevel;
      consoleEnabled: boolean;
      fileEnabled: boolean;
      logFile?: string;
    };
  }
}

declare module './webSearchService.js' {
  export interface WebSearchParams {
    query: string;
    max_results?: number;
    include_summary?: boolean;
  }

  export interface WebSearchResult {
    title: string;
    url: string;
    snippet: string;
    content?: string;
  }

  export class WebSearchService {
    constructor(logger: any);
    execute(params: WebSearchParams): Promise<{
      content: Array<{ type: 'text'; text: string }>;
    }>;
  }
}

declare module './researchReportService.js' {
  export interface ResearchReportParams {
    topic: string;
    sources?: string[];
    report_type?: 'academic' | 'business' | 'technical' | 'comprehensive';
    include_citations?: boolean;
    output_format?: 'markdown' | 'html' | 'pdf';
  }

  export interface ResearchReportResult {
    title: string;
    content: string;
    summary: string;
    citations: string[];
    metadata: {
      topic: string;
      reportType: string;
      sourcesCount: number;
      generationTime: number;
      outputFormat: string;
    };
  }

  export class ResearchReportService {
    constructor(logger: any);
    execute(params: ResearchReportParams): Promise<{
      content: Array<{ type: 'text'; text: string }>;
    }>;
  }
}

declare module './documentAnalysisService.js' {
  export interface DocumentAnalysisParams {
    file_pattern?: string;
    analysis_type?: 'content' | 'structure' | 'code' | 'comprehensive';
    include_metadata?: boolean;
  }

  export interface DocumentAnalysisResult {
    filePath: string;
    fileName: string;
    fileSize: number;
    contentType: string;
    analysis: string;
    metadata?: {
      lines: number;
      characters: number;
      lastModified: Date;
      encoding: string;
    };
  }

  export class DocumentAnalysisService {
    constructor(logger: any);
    execute(params: DocumentAnalysisParams): Promise<{
      content: Array<{ type: 'text'; text: string }>;
    }>;
  }
} 