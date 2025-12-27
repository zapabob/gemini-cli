/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import type { SubagentDefinition } from './executor.js';
import { SubagentRegistry } from './executor.js';

type YamlModule = {
  parse: <T = unknown>(input: string) => T;
  stringify: (value: unknown) => string;
};

let yamlModule: YamlModule | null = null;

async function loadYamlModule(): Promise<YamlModule> {
  if (yamlModule) {
    return yamlModule;
  }

  try {
    const loaded = (await import('yaml')) as unknown as YamlModule;
    yamlModule = loaded;
    return loaded;
  } catch (error) {
    throw new Error(
      `YAML support is required to load subagents. Install the "yaml" package to continue. (Original error: ${error instanceof Error ? error.message : String(error)})`,
    );
  }
}

/**
 * YAMLベースのサブエージェント定義を読み込むローダー
 */
export class YamlAgentLoader {
  private agentsDir: string;
  private registry: SubagentRegistry;

  constructor(agentsDir: string = './.gemini/agents') {
    this.agentsDir = agentsDir;
    this.registry = SubagentRegistry.getInstance();
  }

  /**
   * すべてのサブエージェント定義を読み込む
   */
  async loadAllAgents(): Promise<void> {
    if (!existsSync(this.agentsDir)) {
      console.log(
        `サブエージェントディレクトリが存在しません: ${this.agentsDir}`,
      );
      return;
    }

    const files = readdirSync(this.agentsDir);
    const yamlFiles = files.filter(
      (file) => extname(file) === '.yaml' || extname(file) === '.yml',
    );

    for (const file of yamlFiles) {
      try {
        const definition = await this.loadAgentDefinition(file);
        if (definition) {
          this.registry.register(definition);
          console.log(`サブエージェントを登録しました: ${definition.name}`);
        }
      } catch (error) {
        console.error(
          `サブエージェント定義の読み込みに失敗しました: ${file}`,
          error,
        );
      }
    }
  }

  /**
   * 個別のサブエージェント定義を読み込む
   */
  private async loadAgentDefinition(
    filename: string,
  ): Promise<SubagentDefinition | null> {
    const filePath = join(this.agentsDir, filename);

    try {
      const content = readFileSync(filePath, 'utf-8');
      const yaml = await loadYamlModule();
      const yamlContent = yaml.parse<
        Partial<SubagentDefinition> & Record<string, unknown>
      >(content);

      const name =
        typeof yamlContent.name === 'string' ? yamlContent.name : undefined;
      const description =
        typeof yamlContent.description === 'string'
          ? yamlContent.description
          : undefined;
      const specialty =
        typeof yamlContent.specialty === 'string'
          ? yamlContent.specialty
          : undefined;
      const model =
        typeof yamlContent.model === 'string'
          ? yamlContent.model
          : 'gemini-3.0-pro';
      const color =
        typeof yamlContent.color === 'string' ? yamlContent.color : 'blue';
      const triggers = Array.isArray(yamlContent.triggers)
        ? yamlContent.triggers.map(String)
        : [];
      const capabilities = Array.isArray(yamlContent.capabilities)
        ? yamlContent.capabilities.map(String)
        : [];
      const config =
        yamlContent.config && typeof yamlContent.config === 'object'
          ? (yamlContent.config as Record<string, unknown>)
          : {};

      // YAMLの検証と変換
      if (!name || !description || !specialty) {
        throw new Error(
          '必須フィールドが不足しています: name, description, specialty',
        );
      }

      const definition: SubagentDefinition = {
        name,
        description,
        model,
        color,
        specialty,
        triggers,
        capabilities,
        config,
      };

      return definition;
    } catch (error) {
      console.error(`YAMLファイルのパースに失敗しました: ${filename}`, error);
      return null;
    }
  }

  /**
   * 新しいサブエージェント定義を作成する
   */
  async createAgentDefinition(
    name: string,
    specialty: string,
    description: string,
  ): Promise<string> {
    const yaml = await loadYamlModule();
    const definition: SubagentDefinition = {
      name,
      description,
      specialty,
      model: 'gemini-3.0-pro',
      color: 'blue',
      triggers: [`@${name}`],
      capabilities: [specialty],
    };

    const yamlContent = yaml.stringify(definition);
    const filename = `${name}.yaml`;
    const filePath = join(this.agentsDir, filename);

    // ディレクトリが存在しない場合は作成
    if (!existsSync(this.agentsDir)) {
      const fs = await import('node:fs');
      fs.mkdirSync(this.agentsDir, { recursive: true });
    }

    const fs = await import('node:fs');
    fs.writeFileSync(filePath, yamlContent, 'utf-8');

    return filePath;
  }

  /**
   * サブエージェント定義を削除する
   */
  async deleteAgentDefinition(name: string): Promise<boolean> {
    const filename = `${name}.yaml`;
    const filePath = join(this.agentsDir, filename);

    try {
      if (existsSync(filePath)) {
        const fs = await import('node:fs');
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`サブエージェント定義の削除に失敗しました: ${name}`, error);
      return false;
    }
  }
}
