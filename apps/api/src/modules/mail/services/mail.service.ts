import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { Config, BrevoConfig } from '../../../config/config.type';
import { RedisService } from '../../redis/services/redis.service';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<Config>,
    private readonly redisService: RedisService,
  ) {}

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
      const response = await firstValueFrom(
        this.httpService.post(
          `${brevoConfig.apiUrl}/v3/smtp/email`,
          {
            sender: {
              name: 'RYLA',
              email: 'noreply@ryla.ai', // TODO: Configure from env
            },
            to: [{ email: to }],
            subject,
            htmlContent,
            textContent: textContent || this.stripHtml(htmlContent),
          },
          {
            headers: {
              'api-key': brevoConfig.apiKey,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      this.logger.log(`Email sent to ${to}: ${subject}`);
      return (response.data as any);
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

