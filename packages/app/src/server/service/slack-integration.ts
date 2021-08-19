import loggerFactory from '~/utils/logger';
import S2sMessage from '../models/vo/s2s-message';

import ConfigManager from './config-manager';
import { S2sMessagingService } from './s2s-messaging/base';
import { S2sMessageHandlable } from './s2s-messaging/handlable';

const logger = loggerFactory('growi:service:SlackBotService');

const { markdownSectionBlock } = require('@growi/slack');


type S2sMessageForSlackIntegration = S2sMessage & { updatedAt: Date };

export class SlackIntegrationService implements S2sMessageHandlable {

  crowi!: any;

  configManager!: ConfigManager;

  s2sMessagingService!: S2sMessagingService;

  lastLoadedAt?: Date;

  constructor(crowi) {
    this.crowi = crowi;
    this.configManager = crowi.configManager;
    this.s2sMessagingService = crowi.s2sMessagingService;

    this.initialize();
  }

  initialize() {
    this.lastLoadedAt = new Date();
  }

  /**
   * @inheritdoc
   */
  shouldHandleS2sMessage(s2sMessage: S2sMessageForSlackIntegration): boolean {
    const { eventName, updatedAt } = s2sMessage;
    if (eventName !== 'slackIntegrationServiceUpdated' || updatedAt == null) {
      return false;
    }

    return this.lastLoadedAt == null || this.lastLoadedAt < new Date(s2sMessage.updatedAt);
  }


  /**
   * @inheritdoc
   */
  async handleS2sMessage(): Promise<void> {
    const { configManager } = this.crowi;

    logger.info('Reset slack bot by pubsub notification');
    await configManager.loadConfigs();
    this.initialize();
  }

  async publishUpdatedMessage(): Promise<void> {
    const { s2sMessagingService } = this;

    if (s2sMessagingService != null) {
      const s2sMessage = new S2sMessage('slackIntegrationServiceUpdated', { updatedAt: new Date() });

      try {
        await s2sMessagingService.publish(s2sMessage);
      }
      catch (e) {
        logger.error('Failed to publish update message with S2sMessagingService: ', e.message);
      }
    }
  }

  hasSlackConfig(): boolean {
    // for legacy util
    const hasSlackToken = !!this.configManager.getConfig('notification', 'slack:token');
    const hasSlackIwhUrl = !!this.configManager.getConfig('notification', 'slack:incomingWebhookUrl');
    // for slackbot
    const hasSlackbotType = !!this.configManager.getConfig('crowi', 'slackbot:currentBotType');

    return hasSlackToken || hasSlackIwhUrl || hasSlackbotType;
  }

  /**
   * Handle /commands endpoint
   */
  async handleCommandRequest(command, client, body, ...opt) {
    let module;
    try {
      module = `./slack-command-handler/${command}`;
    }
    catch (err) {
      await this.notCommand(client, body);
    }

    try {
      const handler = require(module)(this.crowi);
      await handler.handleCommand(client, body, ...opt);
    }
    catch (err) {
      throw err;
    }
  }

  async handleBlockActionsRequest(client, payload) {
    const { action_id: actionId } = payload.actions[0];
    const commandName = actionId.split(':')[0];
    const handlerMethodName = actionId.split(':')[1];
    const module = `./slack-command-handler/${commandName}`;
    try {
      const handler = require(module)(this.crowi);
      await handler.handleBlockActions(client, payload, handlerMethodName);
    }
    catch (err) {
      throw err;
    }
    return;
  }

  async handleViewSubmissionRequest(client, payload) {
    const { callback_id: callbackId } = payload.view;
    const commandName = callbackId.split(':')[0];
    const handlerMethodName = callbackId.split(':')[1];
    const module = `./slack-command-handler/${commandName}`;
    try {
      const handler = require(module)(this.crowi);
      await handler.handleBlockActions(client, payload, handlerMethodName);
    }
    catch (err) {
      throw err;
    }
    return;
  }

  async notCommand(client, body) {
    logger.error('Invalid first argument');
    client.chat.postEphemeral({
      channel: body.channel_id,
      user: body.user_id,
      text: 'No command',
      blocks: [
        markdownSectionBlock('*No command.*\n Hint\n `/growi [command] [keyword]`'),
      ],
    });
    return;
  }

}
