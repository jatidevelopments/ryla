import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Config, BrevoConfig } from '../../../config/config.type';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService<Config>,
  ) { }

  /**
   * Send email via Brevo (formerly Sendinblue)
   */
  public async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string,
  ): Promise<void> {
    const brevoConfig = this.configService.get<BrevoConfig>('brevo');
    if (!brevoConfig) {
      this.logger.error('Brevo config not found');
      throw new Error('Email service not configured');
    }

    try {
      const response = await fetch(`${brevoConfig.apiUrl}/v3/smtp/email`, {
        method: 'POST',
        headers: {
          'api-key': brevoConfig.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: 'RYLA',
            email: 'noreply@ryla.ai',
          },
          to: [{ email: to }],
          subject,
          htmlContent,
          textContent: textContent || this.stripHtml(htmlContent),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      this.logger.log(`Email sent to ${to}: ${subject}`);
      return await response.json();
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send welcome email
   */
  public async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const htmlContent = `
      <h1>Welcome to RYLA, ${name}!</h1>
      <p>Thank you for joining us. Start creating your AI Influencer today!</p>
    `;
    await this.sendEmail(to, 'Welcome to RYLA', htmlContent);
  }

  /**
   * Send password reset email
   */
  public async sendPasswordResetEmail(
    to: string,
    resetLink: string,
  ): Promise<void> {
    const htmlContent = `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    `;
    await this.sendEmail(to, 'Reset Your Password', htmlContent);
  }

  /**
   * Strip HTML tags for plain text fallback
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}

