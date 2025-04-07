
import express from 'express';
import { WebClient } from '@slack/web-api';
import { auth } from '../middleware/auth';
import * as dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const slackToken = process.env.SLACK_BOT_TOKEN;
const client = slackToken ? new WebClient(slackToken) : null;

/**
 * Send a message to a Slack channel
 * @route POST /api/slack/send-message
 * @access Private
 */
router.post('/send-message', auth, async (req, res) => {
  try {
    if (!client) {
      return res.status(500).json({ error: 'Slack client not configured. Please set SLACK_BOT_TOKEN environment variable.' });
    }

    const { channel, message, blocks } = req.body;

    if (!channel || !message) {
      return res.status(400).json({ error: 'Channel and message are required' });
    }

    const result = await client.chat.postMessage({
      channel,
      text: message,
      blocks: blocks || undefined,
    });

    return res.status(200).json({ 
      success: true, 
      messageId: result.ts,
      channel: result.channel 
    });
  } catch (error) {
    console.error('Error sending message to Slack:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to send message to Slack' 
    });
  }
});

/**
 * Get a list of channels in the workspace
 * @route GET /api/slack/channels
 * @access Private
 */
router.get('/channels', auth, async (req, res) => {
  try {
    if (!client) {
      return res.status(500).json({ error: 'Slack client not configured. Please set SLACK_BOT_TOKEN environment variable.' });
    }

    const result = await client.conversations.list();
    return res.status(200).json({ 
      success: true, 
      channels: result.channels 
    });
  } catch (error) {
    console.error('Error listing Slack channels:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to list Slack channels' 
    });
  }
});

export default router;
