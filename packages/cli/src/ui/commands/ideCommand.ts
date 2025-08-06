/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { fileURLToPath } from 'url';
import path from 'path';
import { glob } from 'glob';
import child_process from 'child_process';
import {
  Config,
  DetectedIde,
  IDEConnectionStatus,
  getIdeDisplayName,
  getIdeInstaller,
} from '@google/gemini-cli-core';
import {
  CommandContext,
  SlashCommand,
  SlashCommandActionReturn,
  CommandKind,
} from './types.js';
import { SettingScope } from '../../config/settings.js';

// VSCode専用の定数（独自拡張用）
const VSCODE_COMMAND = 'code';
const VSCODE_COMPANION_EXTENSION_FOLDER = 'vscode-ide-companion';

export const ideCommand = (config: Config | null): SlashCommand | null => {
  // Configの拡張メソッド許容のためany型キャスト（型安全にできない設計）
  const configAny = config as any;
  if (!configAny?.getIdeModeFeature?.()) {
    return null;
  }
  const currentIDE = configAny.getIdeClient?.().getCurrentIde?.();
  if (!currentIDE) {
    return null;
  }

  const ideSlashCommand: SlashCommand = {
    name: 'ide',
    description: 'manage IDE integration',
    kind: CommandKind.BUILT_IN,
    subCommands: [],
  };

  // 公式の汎用サブコマンド
  const statusCommand: SlashCommand = {
    name: 'status',
    description: 'check status of IDE integration',
    kind: CommandKind.BUILT_IN,
    action: (_context: CommandContext): SlashCommandActionReturn => {
      const connection = configAny.getIdeClient().getConnectionStatus();
      switch (connection?.status) {
        case IDEConnectionStatus.Connected:
          return {
            type: 'message',
            messageType: 'info',
            content: `🟢 Connected to ${configAny.getIdeClient().getDetectedIdeDisplayName()}`,
          } as const;
        case IDEConnectionStatus.Connecting:
          return {
            type: 'message',
            messageType: 'info',
            content: `🟡 Connecting...`,
          } as const;
        default: {
          let content = `🔴 Disconnected`;
          if (connection?.details) {
            content += `: ${connection.details}`;
          }
          return {
            type: 'message',
            messageType: 'error',
            content,
          } as const;
        }
      }
    },
  };

  const installCommand: SlashCommand = {
    name: 'install',
    description: `install required IDE companion for ${configAny.getIdeClient().getDetectedIdeDisplayName()}`,
    kind: CommandKind.BUILT_IN,
    action: async (context) => {
      const installer = getIdeInstaller(currentIDE);
      if (!installer) {
        context.ui.addItem(
          {
            type: 'error',
            text: `No installer is available for ${configAny.getIdeClient().getDetectedIdeDisplayName()}. Please install the IDE companion manually from its marketplace.`,
          },
          Date.now(),
        );
        return;
      }
      context.ui.addItem(
        {
          type: 'info',
          text: `Installing IDE companion...`,
        },
        Date.now(),
      );
      const result = await installer.install();
      context.ui.addItem(
        {
          type: result.success ? 'info' : 'error',
          text: result.message,
        },
        Date.now(),
      );
    },
  };

  const enableCommand: SlashCommand = {
    name: 'enable',
    description: 'enable IDE integration',
    kind: CommandKind.BUILT_IN,
    action: async (context: CommandContext) => {
      context.services.settings.setValue(SettingScope.User, 'ideMode', true);
      configAny.setIdeMode?.(true);
      configAny.setIdeClientConnected?.();
    },
  };

  const disableCommand: SlashCommand = {
    name: 'disable',
    description: 'disable IDE integration',
    kind: CommandKind.BUILT_IN,
    action: async (context: CommandContext) => {
      context.services.settings.setValue(SettingScope.User, 'ideMode', false);
      configAny.setIdeMode?.(false);
      configAny.setIdeClientDisconnected?.();
    },
  };

  // VSCode専用の独自サブコマンド（VSIXインストール）
  if (getIdeDisplayName(currentIDE) === 'VS Code') {
    const vsixInstallCommand: SlashCommand = {
      name: 'install-vsix',
      description: 'install required VS Code companion extension (local VSIX)',
      kind: CommandKind.BUILT_IN,
      action: async (context) => {
        // VSIXファイルの探索とインストール処理
        const bundleDir = require.main?.filename 
          ? path.dirname(path.dirname(require.main.filename))
          : process.cwd();
        let vsixFiles = glob.sync(path.join(bundleDir, '*.vsix'));
        if (vsixFiles.length === 0) {
          const devPath = path.join(
            '..', '..', '..', '..', '..',
            VSCODE_COMPANION_EXTENSION_FOLDER,
            '*.vsix',
          );
          vsixFiles = glob.sync(devPath);
        }
        if (vsixFiles.length === 0) {
          context.ui.addItem(
            {
              type: 'error',
              text: 'Could not find the required VS Code companion extension. Please file a bug via /bug.',
            },
            Date.now(),
          );
          return;
        }
        const vsixPath = vsixFiles[0];
        const command = `${VSCODE_COMMAND} --install-extension ${vsixPath} --force`;
        context.ui.addItem(
          {
            type: 'info',
            text: `Installing VS Code companion extension...`,
          },
          Date.now(),
        );
        try {
          child_process.execSync(command, { stdio: 'pipe' });
          context.ui.addItem(
            {
              type: 'info',
              text: 'VS Code companion extension installed successfully. Restart gemini-cli in a fresh terminal window.',
            },
            Date.now(),
          );
        } catch (_error) {
          context.ui.addItem(
            {
              type: 'error',
              text: `Failed to install VS Code companion extension.`,
            },
            Date.now(),
          );
        }
      },
    };
    if (ideSlashCommand.subCommands) {
      ideSlashCommand.subCommands.push(vsixInstallCommand);
    }
  }

  // サブコマンドの組み立て（IDE有効/無効で切り替え）
  const ideModeEnabled = configAny.getIdeMode?.();
  if (ideSlashCommand.subCommands) {
    if (ideModeEnabled) {
      ideSlashCommand.subCommands.push(disableCommand, statusCommand, installCommand);
    } else {
      ideSlashCommand.subCommands.push(enableCommand, statusCommand, installCommand);
    }
  }

  return ideSlashCommand;
};
