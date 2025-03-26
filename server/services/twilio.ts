import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

export class TwilioService {
  private client: twilio.Twilio | null = null;

  constructor() {
    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
    } else {
      console.warn('Twilio credentials not provided. SMS functionality will be disabled.');
    }
  }

  /**
   * Send an SMS notification
   * @param to Recipient phone number (E.164 format)
   * @param message Message content
   * @returns Promise with the message SID or error message
   */
  async sendSMS(to: string, message: string): Promise<{ success: boolean; sid?: string; error?: string }> {
    if (!this.client || !twilioPhoneNumber) {
      return { 
        success: false, 
        error: 'Twilio not configured. Check environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER' 
      };
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to: to
      });

      return { success: true, sid: result.sid };
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Send content notification
   * @param to Recipient phone number
   * @param contentTitle The content title
   * @param status The content status
   * @returns Promise with the message SID or error message
   */
  async sendContentNotification(to: string, contentTitle: string, status: string): Promise<{ success: boolean; sid?: string; error?: string }> {
    const message = `Your content "${contentTitle}" has been ${status.toLowerCase()}.`;
    return this.sendSMS(to, message);
  }

  /**
   * Send scheduled post reminder
   * @param to Recipient phone number
   * @param contentTitle The content title
   * @param scheduledTime The scheduled posting time
   * @returns Promise with the message SID or error message
   */
  async sendScheduledReminder(to: string, contentTitle: string, scheduledTime: Date): Promise<{ success: boolean; sid?: string; error?: string }> {
    const formattedTime = scheduledTime.toLocaleString();
    const message = `Reminder: Your content "${contentTitle}" is scheduled to be posted at ${formattedTime}.`;
    return this.sendSMS(to, message);
  }
}

export default new TwilioService();