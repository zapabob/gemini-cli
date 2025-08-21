/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Export config
export * from './config/config.js';
export * from './config/agents.js';
export * from './config/active-agent.js';
export * from './config/subagents.js';
export * from './config/loadBalancer.js';

// Export Core Logic
export * from './core/client.js';
export * from './core/contentGenerator.js';
export * from './core/loggingContentGenerator.js';
export * from './core/geminiChat.js';
export * from './core/logger.js';
export * from './core/prompts.js';
export * from './core/tokenLimits.js';
export * from './core/turn.js';
export * from './core/geminiRequest.js';
export * from './core/coreToolScheduler.js';
export * from './core/nonInteractiveToolExecutor.js';
export * from './code_assist/codeAssist.js';
export * from './code_assist/oauth2.js';
export * from './code_assist/server.js';
export * from './code_assist/types.js';

// Export core functionality
export * from './core/turn.js';
export * from './core/coreToolScheduler.js';
export * from './core/nonInteractiveToolExecutor.js';
export * from './core/contentGenerator.js';
export * from './core/client.js';
export * from './core/geminiChat.js';
export * from './core/logger.js';
export * from './core/tokenLimits.js';

// Export subagents
export * from './subagents/index.js';

// 協調エージェントシステム
export { CollaborativeAgentSystem } from './subagents/collaborativeAgent.js';
export type {
  CollaborativeTaskOptions,
  CollaborativeTaskResult,
  RealTimeCollaborationOptions,
  RealTimeCollaborationResult,
  TaskAnalysis,
  IntegratedResult,
  Subtask,
  CollaborationStep,
  CollaborationAction,
  CollaborationActionResult,
  CollaborationMetrics,
  CollaborationSessionResult,
  SituationAnalysis
} from './subagents/types.js';

// 強化版協調エージェントシステム（リアルタイム通信統合）
export { EnhancedCollaborativeAgentSystem } from './subagents/enhancedCollaborativeAgent.js';
export { RealTimeCommunicationSystem } from './subagents/realTimeCommunication.js';
export type {
  RealTimeMessage,
  RealTimeMessageType,
  RealTimeSessionConfig,
  RealTimeConnectionState,
  RealTimeCommunicationStats,
  TaskAssignmentMessage,
  TaskProgressMessage,
  TaskCompletionMessage,
  CoordinationRequestMessage,
  MainAgentDirectiveMessage,
  SubagentReportMessage,
  IntegrationRequestMessage,
  PerformanceMetricsMessage,
  SessionControlMessage
} from './subagents/types.js';

// Export utilities
export * from './utils/paths.js';
export * from './utils/schemaValidator.js';
export * from './utils/errors.js';
export * from './utils/getFolderStructure.js';
export * from './utils/memoryDiscovery.js';
export * from './utils/gitIgnoreParser.js';
export * from './utils/gitUtils.js';
export * from './utils/editor.js';
export * from './utils/quotaErrorDetection.js';
export * from './utils/fileUtils.js';
export * from './utils/retry.js';
export * from './utils/shell-utils.js';
export * from './utils/systemEncoding.js';
export * from './utils/textUtils.js';
export * from './utils/formatters.js';
export * from './utils/filesearch/fileSearch.js';
export * from './utils/errorParsing.js';

// Export services
export * from './services/fileDiscoveryService.js';
export * from './services/gitService.js';
export * from './services/chatRecordingService.js';
export * from './services/fileSystemService.js';

// Export IDE specific logic
export * from './ide/ide-client.js';
export * from './ide/ideContext.js';
export * from './ide/ide-installer.js';
export { getIdeInfo, DetectedIde, IdeInfo } from './ide/detect-ide.js';
export * from './ide/constants.js';

// Export Shell Execution Service
export * from './services/shellExecutionService.js';

// Export loadBalancerService (独自機能)
export * from './services/loadBalancerService.js';

// Export base tool definitions
export * from './tools/tools.js';
export * from './tools/tool-error.js';
export * from './tools/tool-registry.js';

// Export prompt logic
export * from './prompts/mcp-prompts.js';

// Export specific tool logic
export * from './tools/read-file.js';
export * from './tools/ls.js';
export * from './tools/grep.js';
export * from './tools/glob.js';
export * from './tools/edit.js';
export * from './tools/write-file.js';
export * from './tools/web-fetch.js';
export * from './tools/memoryTool.js';
export * from './tools/shell.js';
export * from './tools/web-search.js';
export * from './tools/read-many-files.js';
export * from './tools/mcp-client.js';
export * from './tools/mcp-tool.js';

// MCP OAuth
export { MCPOAuthProvider } from './mcp/oauth-provider.js';
export {
  MCPOAuthToken,
  MCPOAuthCredentials,
  MCPOAuthTokenStorage,
} from './mcp/oauth-token-storage.js';
export type { MCPOAuthConfig } from './mcp/oauth-provider.js';
export type {
  OAuthAuthorizationServerMetadata,
  OAuthProtectedResourceMetadata,
} from './mcp/oauth-utils.js';
export { OAuthUtils } from './mcp/oauth-utils.js';

// Re-export @google/genai types and values
export type { Part, PartListUnion, PartUnion, Content, FunctionCall, GenerateContentResponse } from '@google/genai';
export { FinishReason } from '@google/genai';

// Export telemetry functions
export * from './telemetry/index.js';
export { sessionId } from './utils/session.js';
export * from './utils/browser.js';
export { Storage } from './config/storage.js';
