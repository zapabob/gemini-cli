/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Config } from '@google/gemini-cli-core';
import {
  GeminiEventType,
  ApprovalMode,
  type ToolCallConfirmationDetails,
} from '@google/gemini-cli-core';
import type {
  TaskStatusUpdateEvent,
  SendStreamingMessageSuccessResponse,
} from '@a2a-js/sdk';
import type express from 'express';
import type { Server } from 'node:http';
import request from 'supertest';
import {
  afterAll,
  afterEach,
  beforeEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { createApp } from './app.js';
import {
  assertUniqueFinalEventIsLast,
  assertTaskCreationAndWorkingStatus,
  createStreamMessageRequest,
  createMockConfig,
} from '../utils/testing_utils.js';
import { MockTool } from '@google/gemini-cli-core';

const mockToolConfirmationFn = async () =>
  ({}) as unknown as ToolCallConfirmationDetails;

const streamToSSEEvents = (
  stream: string,
): SendStreamingMessageSuccessResponse[] =>
  stream
    .split('\n\n')
    .filter(Boolean) // Remove empty strings from trailing newlines
    .map((chunk) => {
      const dataLine = chunk
        .split('\n')
        .find((line) => line.startsWith('data: '));
      if (!dataLine) {
        throw new Error(`Invalid SSE chunk found: "${chunk}"`);
      }
      return JSON.parse(dataLine.substring(6));
    });

const findToolCallEvent = (
  events: SendStreamingMessageSuccessResponse[],
  status: string,
  callId?: string,
): TaskStatusUpdateEvent | undefined =>
  events
    .map((event) => event.result as TaskStatusUpdateEvent)
    .find((result) => {
      if (result.kind !== 'status-update') {
        return false;
      }
      const part = result.status.message?.parts?.[0] as
        | { data?: { status?: string; request?: { callId?: string } } }
        | undefined;
      if (!part || typeof part !== 'object') {
        return false;
      }
      if (part.data?.status !== status) {
        return false;
      }
      if (callId && part.data?.request?.callId !== callId) {
        return false;
      }
      return true;
    });

const findStateChangeEvent = (
  events: SendStreamingMessageSuccessResponse[],
  state: string,
): TaskStatusUpdateEvent | undefined =>
  events
    .map((event) => event.result as TaskStatusUpdateEvent)
    .find(
      (result) =>
        result.kind === 'status-update' &&
        result.status.state === state &&
        result.metadata?.['coderAgent']?.kind === 'state-change',
    );

// Mock the logger to avoid polluting test output
// Comment out to debug tests
vi.mock('../utils/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

let config: Config;
const getToolRegistrySpy = vi.fn().mockReturnValue(ApprovalMode.DEFAULT);
const getApprovalModeSpy = vi.fn();
const getShellExecutionConfigSpy = vi.fn();
vi.mock('../config/config.js', async () => {
  const actual = await vi.importActual('../config/config.js');
  return {
    ...actual,
    loadConfig: vi.fn().mockImplementation(async () => {
      const mockConfig = createMockConfig({
        getToolRegistry: getToolRegistrySpy,
        getApprovalMode: getApprovalModeSpy,
        getShellExecutionConfig: getShellExecutionConfigSpy,
      });
      config = mockConfig as Config;
      return config;
    }),
  };
});

// Mock the GeminiClient to avoid actual API calls
const sendMessageStreamSpy = vi.fn();
vi.mock('@google/gemini-cli-core', async () => {
  const actual = await vi.importActual('@google/gemini-cli-core');
  return {
    ...actual,
    GeminiClient: vi.fn().mockImplementation(() => ({
      sendMessageStream: sendMessageStreamSpy,
      getUserTier: vi.fn().mockReturnValue('free'),
      initialize: vi.fn(),
    })),
  };
});

describe('E2E Tests', () => {
  let app: express.Express;
  let server: Server;

  beforeAll(async () => {
    app = await createApp();
    server = app.listen(0); // Listen on a random available port
  });

  beforeEach(() => {
    getApprovalModeSpy.mockReturnValue(ApprovalMode.DEFAULT);
  });

  afterAll(
    () =>
      new Promise<void>((resolve) => {
        server.close(() => {
          resolve();
        });
      }),
  );

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new task and stream status updates (text-content) via POST /', async () => {
    sendMessageStreamSpy.mockImplementation(async function* () {
      yield* [{ type: 'content', value: 'Hello how are you?' }];
    });

    const agent = request.agent(app);
    const res = await agent
      .post('/')
      .send(createStreamMessageRequest('hello', 'a2a-test-message'))
      .set('Content-Type', 'application/json')
      .expect(200);

    const events = streamToSSEEvents(res.text);

    assertTaskCreationAndWorkingStatus(events);

    // Status update: text-content
    const textContentEvent = events[2].result as TaskStatusUpdateEvent;
    expect(textContentEvent.kind).toBe('status-update');
    expect(textContentEvent.status.state).toBe('working');
    expect(textContentEvent.metadata?.['coderAgent']).toMatchObject({
      kind: 'text-content',
    });
    expect(textContentEvent.status.message?.parts).toMatchObject([
      { kind: 'text', text: 'Hello how are you?' },
    ]);

    // Status update: input-required (final)
    const finalEvent = events[3].result as TaskStatusUpdateEvent;
    expect(finalEvent.kind).toBe('status-update');
    expect(finalEvent.status?.state).toBe('input-required');
    expect(finalEvent.final).toBe(true);

    assertUniqueFinalEventIsLast(events);
    expect(events.length).toBe(4);
  });

  it('should create a new task, schedule a tool call, and wait for approval', async () => {
    // First call yields the tool request
    sendMessageStreamSpy.mockImplementationOnce(async function* () {
      yield* [
        {
          type: GeminiEventType.ToolCallRequest,
          value: {
            callId: 'test-call-id',
            name: 'test-tool',
            args: {},
          },
        },
      ];
    });
    // Subsequent calls yield nothing
    sendMessageStreamSpy.mockImplementation(async function* () {
      yield* [];
    });

    const mockTool = new MockTool({
      name: 'test-tool',
      shouldConfirmExecute: vi.fn(mockToolConfirmationFn),
    });

    getToolRegistrySpy.mockReturnValue({
      getAllTools: vi.fn().mockReturnValue([mockTool]),
      getToolsByServer: vi.fn().mockReturnValue([]),
      getTool: vi.fn().mockReturnValue(mockTool),
    });

    const agent = request.agent(app);
    const res = await agent
      .post('/')
      .send(createStreamMessageRequest('run a tool', 'a2a-tool-test-message'))
      .set('Content-Type', 'application/json')
      .expect(200);

    const events = streamToSSEEvents(res.text);
    assertTaskCreationAndWorkingStatus(events);

    // Status update: working
    const workingEvent2 = findStateChangeEvent(events, 'working');
    expect(workingEvent2).toBeDefined();

    // Status update: tool-call-update
    const toolCallUpdateEvent = findToolCallEvent(
      events,
      'validating',
      'test-call-id',
    );
    expect(toolCallUpdateEvent).toBeDefined();
    expect(toolCallUpdateEvent?.metadata?.['coderAgent']).toMatchObject({
      kind: 'tool-call-update',
    });

    // State update: awaiting_approval update
    const toolCallConfirmationEvent = findToolCallEvent(
      events,
      'awaiting_approval',
      'test-call-id',
    );
    expect(toolCallConfirmationEvent).toBeDefined();
    expect(['tool-call-update', 'tool-call-confirmation']).toContain(
      toolCallConfirmationEvent?.metadata?.['coderAgent']?.kind,
    );

    assertUniqueFinalEventIsLast(events);
    expect(events.length).toBe(6);
  });

  it('should handle multiple tool calls in a single turn', async () => {
    // First call yields the tool request
    sendMessageStreamSpy.mockImplementationOnce(async function* () {
      yield* [
        {
          type: GeminiEventType.ToolCallRequest,
          value: {
            callId: 'test-call-id-1',
            name: 'test-tool-1',
            args: {},
          },
        },
        {
          type: GeminiEventType.ToolCallRequest,
          value: {
            callId: 'test-call-id-2',
            name: 'test-tool-2',
            args: {},
          },
        },
      ];
    });
    // Subsequent calls yield nothing
    sendMessageStreamSpy.mockImplementation(async function* () {
      yield* [];
    });

    const mockTool1 = new MockTool({
      name: 'test-tool-1',
      displayName: 'Test Tool 1',
      shouldConfirmExecute: vi.fn(mockToolConfirmationFn),
    });
    const mockTool2 = new MockTool({
      name: 'test-tool-2',
      displayName: 'Test Tool 2',
      shouldConfirmExecute: vi.fn(mockToolConfirmationFn),
    });

    getToolRegistrySpy.mockReturnValue({
      getAllTools: vi.fn().mockReturnValue([mockTool1, mockTool2]),
      getToolsByServer: vi.fn().mockReturnValue([]),
      getTool: vi.fn().mockImplementation((name: string) => {
        if (name === 'test-tool-1') return mockTool1;
        if (name === 'test-tool-2') return mockTool2;
        return undefined;
      }),
    });

    const agent = request.agent(app);
    const res = await agent
      .post('/')
      .send(
        createStreamMessageRequest(
          'run two tools',
          'a2a-multi-tool-test-message',
        ),
      )
      .set('Content-Type', 'application/json')
      .expect(200);

    const events = streamToSSEEvents(res.text);
    assertTaskCreationAndWorkingStatus(events);

    // Second working update
    const workingEvent = findStateChangeEvent(events, 'working');
    expect(workingEvent).toBeDefined();

    // State Update: Validate each tool call
    const toolCallValidateEvent1 = findToolCallEvent(
      events,
      'validating',
      'test-call-id-1',
    );
    expect(toolCallValidateEvent1).toBeDefined();
    expect(toolCallValidateEvent1?.metadata?.['coderAgent']).toMatchObject({
      kind: 'tool-call-update',
    });
    const toolCallValidateEvent2 = findToolCallEvent(
      events,
      'validating',
      'test-call-id-2',
    );
    expect(toolCallValidateEvent2).toBeDefined();
    expect(toolCallValidateEvent2?.metadata?.['coderAgent']).toMatchObject({
      kind: 'tool-call-update',
    });

    // State Update: Set each tool call to awaiting
    const toolCallAwaitEvent1 = findToolCallEvent(
      events,
      'awaiting_approval',
      'test-call-id-1',
    );
    expect(toolCallAwaitEvent1).toBeDefined();
    expect(['tool-call-update', 'tool-call-confirmation']).toContain(
      toolCallAwaitEvent1?.metadata?.['coderAgent']?.kind,
    );

    assertUniqueFinalEventIsLast(events);
    expect(events.length).toBe(7);
  });

  it('should handle tool calls that do not require approval', async () => {
    // First call yields the tool request
    sendMessageStreamSpy.mockImplementationOnce(async function* () {
      yield* [
        {
          type: GeminiEventType.ToolCallRequest,
          value: {
            callId: 'test-call-id-no-approval',
            name: 'test-tool-no-approval',
            args: {},
          },
        },
      ];
    });
    // Second call, after the tool runs, yields the final text
    sendMessageStreamSpy.mockImplementationOnce(async function* () {
      yield* [{ type: 'content', value: 'Tool executed successfully.' }];
    });

    const mockTool = new MockTool({
      name: 'test-tool-no-approval',
      displayName: 'Test Tool No Approval',
      execute: vi.fn().mockResolvedValue({
        llmContent: 'Tool executed successfully.',
        returnDisplay: 'Tool executed successfully.',
      }),
    });

    getToolRegistrySpy.mockReturnValue({
      getAllTools: vi.fn().mockReturnValue([mockTool]),
      getToolsByServer: vi.fn().mockReturnValue([]),
      getTool: vi.fn().mockReturnValue(mockTool),
    });

    const agent = request.agent(app);
    const res = await agent
      .post('/')
      .send(
        createStreamMessageRequest(
          'run a tool without approval',
          'a2a-no-approval-test-message',
        ),
      )
      .set('Content-Type', 'application/json')
      .expect(200);

    const events = streamToSSEEvents(res.text);
    assertTaskCreationAndWorkingStatus(events);

    // Status update: working
    const workingEvent2 = findStateChangeEvent(events, 'working');
    expect(workingEvent2).toBeDefined();

    // Status update: tool-call-update (validating)
    const validatingEvent = findToolCallEvent(
      events,
      'validating',
      'test-call-id-no-approval',
    );
    expect(validatingEvent).toBeDefined();
    expect(validatingEvent?.metadata?.['coderAgent']).toMatchObject({
      kind: 'tool-call-update',
    });

    // Status update: tool-call-update (scheduled)
    const scheduledEvent = findToolCallEvent(
      events,
      'scheduled',
      'test-call-id-no-approval',
    );
    expect(scheduledEvent).toBeDefined();
    expect(scheduledEvent?.metadata?.['coderAgent']).toMatchObject({
      kind: 'tool-call-update',
    });

    // Status update: tool-call-update (executing)
    const executingEvent = findToolCallEvent(
      events,
      'executing',
      'test-call-id-no-approval',
    );
    expect(executingEvent).toBeDefined();
    expect(executingEvent?.metadata?.['coderAgent']).toMatchObject({
      kind: 'tool-call-update',
    });

    // Status update: tool-call-update (success)
    const successEvent = findToolCallEvent(
      events,
      'success',
      'test-call-id-no-approval',
    );
    expect(successEvent).toBeDefined();
    expect(successEvent?.metadata?.['coderAgent']).toMatchObject({
      kind: 'tool-call-update',
    });

    // Status update: working (before sending tool result to LLM)
    const workingEvent3 = events[7].result as TaskStatusUpdateEvent;
    expect(workingEvent3.kind).toBe('status-update');
    expect(workingEvent3.status.state).toBe('working');

    // Status update: text-content (final LLM response)
    const textContentEvent = events[8].result as TaskStatusUpdateEvent;
    expect(textContentEvent.metadata?.['coderAgent']).toMatchObject({
      kind: 'text-content',
    });
    expect(textContentEvent.status.message?.parts).toMatchObject([
      { text: 'Tool executed successfully.' },
    ]);

    assertUniqueFinalEventIsLast(events);
    expect(events.length).toBe(10);
  });

  it('should bypass tool approval in YOLO mode', async () => {
    // First call yields the tool request
    sendMessageStreamSpy.mockImplementationOnce(async function* () {
      yield* [
        {
          type: GeminiEventType.ToolCallRequest,
          value: {
            callId: 'test-call-id-yolo',
            name: 'test-tool-yolo',
            args: {},
          },
        },
      ];
    });
    // Second call, after the tool runs, yields the final text
    sendMessageStreamSpy.mockImplementationOnce(async function* () {
      yield* [{ type: 'content', value: 'Tool executed successfully.' }];
    });

    // Set approval mode to yolo
    getApprovalModeSpy.mockReturnValue(ApprovalMode.YOLO);

    const mockTool = new MockTool({
      name: 'test-tool-yolo',
      displayName: 'Test Tool YOLO',
      execute: vi.fn().mockResolvedValue({
        llmContent: 'Tool executed successfully.',
        returnDisplay: 'Tool executed successfully.',
      }),
    });

    getToolRegistrySpy.mockReturnValue({
      getAllTools: vi.fn().mockReturnValue([mockTool]),
      getToolsByServer: vi.fn().mockReturnValue([]),
      getTool: vi.fn().mockReturnValue(mockTool),
    });

    const agent = request.agent(app);
    const res = await agent
      .post('/')
      .send(
        createStreamMessageRequest(
          'run a tool in yolo mode',
          'a2a-yolo-mode-test-message',
        ),
      )
      .set('Content-Type', 'application/json')
      .expect(200);

    const events = streamToSSEEvents(res.text);
    assertTaskCreationAndWorkingStatus(events);

    // Status update: working
    const workingEvent2 = findStateChangeEvent(events, 'working');
    expect(workingEvent2).toBeDefined();

    // Status update: tool-call-update (validating)
    const validatingEvent = findToolCallEvent(
      events,
      'validating',
      'test-call-id-yolo',
    );
    expect(validatingEvent).toBeDefined();
    expect(validatingEvent?.metadata?.['coderAgent']).toMatchObject({
      kind: 'tool-call-update',
    });

    // Status update: tool-call-update (scheduled)
    const awaitingEvent = findToolCallEvent(
      events,
      'scheduled',
      'test-call-id-yolo',
    );
    expect(awaitingEvent).toBeDefined();
    expect(awaitingEvent?.metadata?.['coderAgent']).toMatchObject({
      kind: 'tool-call-update',
    });

    // Status update: tool-call-update (executing)
    const executingEvent = findToolCallEvent(
      events,
      'executing',
      'test-call-id-yolo',
    );
    expect(executingEvent).toBeDefined();
    expect(executingEvent?.metadata?.['coderAgent']).toMatchObject({
      kind: 'tool-call-update',
    });

    // Status update: tool-call-update (success)
    const successEvent = findToolCallEvent(
      events,
      'success',
      'test-call-id-yolo',
    );
    expect(successEvent).toBeDefined();
    expect(successEvent?.metadata?.['coderAgent']).toMatchObject({
      kind: 'tool-call-update',
    });

    // Status update: working (before sending tool result to LLM)
    const workingEvent3 = events[7].result as TaskStatusUpdateEvent;
    expect(workingEvent3.kind).toBe('status-update');
    expect(workingEvent3.status.state).toBe('working');

    // Status update: text-content (final LLM response)
    const textContentEvent = events[8].result as TaskStatusUpdateEvent;
    expect(textContentEvent.metadata?.['coderAgent']).toMatchObject({
      kind: 'text-content',
    });
    expect(textContentEvent.status.message?.parts).toMatchObject([
      { text: 'Tool executed successfully.' },
    ]);

    assertUniqueFinalEventIsLast(events);
    expect(events.length).toBe(10);
  });
});
