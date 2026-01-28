import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipAuth } from '../auth/decorators/skip-auth.decorator';

import { HealthService } from './services/health.service';

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Post('waitlist')
  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit waitlist signup' })
  @ApiResponse({ status: 200, description: 'Waitlist signup successful' })
  async submitWaitlist(
    @Body()
    body: {
      email: string;
      referralSource: string;
      referralSourceOther?: string;
      aiInfluencerExperience: string;
      customMessage?: string;
    }
  ) {
    // Get Slack webhook URL from environment
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_WAITLIST;

    if (!slackWebhookUrl) {
      console.error('SLACK_WEBHOOK_WAITLIST environment variable not set');
      return { success: true, message: 'Successfully joined waitlist' };
    }

    // Format referral source for display
    const referralSourceLabels: Record<string, string> = {
      tiktok: 'TikTok',
      reddit: 'Reddit',
      instagram: 'Instagram',
      google: 'Google',
      friend: 'Friend',
      other: 'Other',
    };

    const experienceLabels: Record<string, string> = {
      never: "I'm New Here",
      few: 'Some Experience',
      many: 'Very Experienced',
    };

    const referralDisplay =
      body.referralSource === 'other' && body.referralSourceOther
        ? `${
            referralSourceLabels[body.referralSource] || body.referralSource
          } (${body.referralSourceOther})`
        : referralSourceLabels[body.referralSource] || body.referralSource;

    // Format Slack message
    const slackMessage = {
      text: '🎉 New Waitlist Signup',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🎉 New Waitlist Signup',
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Email:*\n${body.email}`,
            },
            {
              type: 'mrkdwn',
              text: `*Heard From:*\n${referralDisplay}`,
            },
            {
              type: 'mrkdwn',
              text: `*Experience:*\n${
                experienceLabels[body.aiInfluencerExperience] ||
                body.aiInfluencerExperience
              }`,
            },
            {
              type: 'mrkdwn',
              text: `*Timestamp:*\n${new Date().toISOString()}`,
            },
          ],
        },
        ...(body.customMessage
          ? [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*Custom Message:*\n${body.customMessage}`,
                },
              },
            ]
          : []),
      ],
    };

    // Send to Slack
    try {
      const slackResponse = await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slackMessage),
      });

      if (!slackResponse.ok) {
        console.error(
          'Failed to send Slack notification:',
          await slackResponse.text()
        );
      }
    } catch (slackError) {
      console.error('Error sending Slack notification:', slackError);
      // Don't fail the request if Slack fails
    }

    return { success: true, message: 'Successfully joined waitlist' };
  }

  @Get('health')
  health(): string {
    return 'ok, application is working fine!!!';
  }

  @Get('database-check')
  @ApiOperation({ summary: 'Check database health' })
  @ApiResponse({
    status: 200,
    description: 'Returns the health status of the database',
  })
  async checkDatabase() {
    return await this.healthService.checkDatabase();
  }

  @Get('redis-check')
  @ApiOperation({ summary: 'Check Redis health' })
  @ApiResponse({
    status: 200,
    description: 'Returns the health status of Redis',
  })
  async checkRedis() {
    return await this.healthService.checkRedis();
  }

  @Get('redis-keys')
  async getRedisDataDefault(): Promise<Record<string, unknown>> {
    return await this.healthService.getRedisData(100);
  }

  @Get('redis-keys/:maxItems')
  @ApiParam({
    name: 'maxItems',
    required: false,
    type: Number,
  })
  async getRedisDataWithLimit(
    @Param('maxItems') maxItems: number
  ): Promise<Record<string, unknown>> {
    return await this.healthService.getRedisData(maxItems || 100);
  }
}
