/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import YAML from 'yaml';
import type { SubagentDefinition} from './executor.js';
import { SubagentRegistry } from './executor.js';

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
      const yamlContent = YAML.parse(content);

      // YAMLの検証と変換
      if (
        !yamlContent.name ||
        !yamlContent.description ||
        !yamlContent.specialty
      ) {
        throw new Error(
          '必須フィールドが不足しています: name, description, specialty',
        );
      }

      const definition: SubagentDefinition = {
        name: yamlContent.name,
        description: yamlContent.description,
        model: yamlContent.model || 'gemini-2.5-pro',
        color: yamlContent.color || 'blue',
        specialty: yamlContent.specialty,
        triggers: yamlContent.triggers || [],
        capabilities: yamlContent.capabilities || [],
        config: yamlContent.config || {},
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
    const definition: SubagentDefinition = {
      name,
      description,
      specialty,
      model: 'gemini-2.5-pro',
      color: 'blue',
      triggers: [`@${name}`],
      capabilities: [specialty],
    };

    const yamlContent = YAML.stringify(definition);
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
