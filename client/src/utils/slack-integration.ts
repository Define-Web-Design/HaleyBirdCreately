
import { WebClient } from '@slack/web-api';

/**
 * Slack integration utility for Creately application
 */
export class SlackIntegration {
  private client: WebClient;
  
  constructor(token: string) {
    this.client = new WebClient(token);
  }
  
  /**
   * Send a message to a Slack channel
   * @param channelId - The ID of the channel to send the message to
   * @param text - The message text
   * @param blocks - Optional Slack Block Kit blocks for rich formatting
   */
  async sendMessage(channelId: string, text: string, blocks?: any[]) {
    try {
      const result = await this.client.chat.postMessage({
        channel: channelId,
        text,
        blocks,
      });
      
      return result;
    } catch (error) {
      console.error('Error sending message to Slack:', error);
      throw error;
    }
  }
  
  /**
   * Get a list of channels in the workspace
   */
  async listChannels() {
    try {
      const result = await this.client.conversations.list();
      return result.channels;
    } catch (error) {
      console.error('Error listing Slack channels:', error);
      throw error;
    }
  }
  
  /**
   * Upload a file to a Slack channel
   * @param channelId - The ID of the channel to upload the file to
   * @param filePath - The path to the file to upload
   * @param title - Optional title for the file
   */
  async uploadFile(channelId: string, file: Buffer | ReadableStream, filename: string, title?: string) {
    try {
      const result = await this.client.files.upload({
        channels: channelId,
        file,
        filename,
        title,
      });
      
      return result;
    } catch (error) {
      console.error('Error uploading file to Slack:', error);
      throw error;
    }
  }
}

/**
 * Create a Slack integration instance from environment variable
 */
export const createSlackClient = () => {
  const token = process.env.SLACK_BOT_TOKEN;
  
  if (!token) {
    throw new Error('SLACK_BOT_TOKEN environment variable is not set');
  }
  
  return new SlackIntegration(token);
};
