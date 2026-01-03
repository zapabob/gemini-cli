/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { YamlAgentLoader } from '@google/gemini-cli-core';

const normalizeAgentName = (input: string): string => {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || `agent-${Date.now()}`;
};

/**
 * Creates a sub-agent definition from a natural-language prompt.
 */
export async function createNaturalLanguageAgentCommand(
  args: string[],
): Promise<void> {
  if (args.length === 0) {
    process.stdout.write(
      'Usage: gemini agents create-natural "<agent description>"\n',
    );
    process.stdout.write('\nExample:\n');
    process.stdout.write(
      '  gemini agents create-natural "Code review specialist focused on security and performance."\n',
    );
    return;
  }

  const prompt = args.join(' ').trim();
  const name = normalizeAgentName(prompt);

  try {
    const loader = new YamlAgentLoader();
    const filePath = await loader.createAgentDefinition(
      name,
      'general',
      prompt,
    );

    process.stdout.write(`Created agent "${name}".\n`);
    process.stdout.write(`Config: ${filePath}\n`);
  } catch (error) {
    process.stderr.write(`Failed to create agent: ${error}\n`);
    process.exit(1);
  }
}
