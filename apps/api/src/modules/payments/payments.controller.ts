/**
 * Payments Controller
 * 
 * Handles payment-related API endpoints
 */

import { Controller, Post, Body, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FinbyService, CreatePaymentSessionDto } from './services/finby.service';
import type { Request } from 'express';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly finbyService: FinbyService) {}

  @Post('session')
  @UseGuards(JwtAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment session for subscription or credit purchase' })
  @ApiResponse({ status: 200, description: 'Payment session created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createPaymentSession(
    @CurrentUser() user: { id: string; email: string },
    @Body() dto: CreatePaymentSessionDto
  ) {
    // Ensure userId matches authenticated user
    if (dto.userId !== user.id) {
      throw new Error('User ID mismatch');
    }

    return await this.finbyService.createPaymentSession({
      ...dto,
      email: dto.email || user.email,
    });
  }

  @Post('finby/webhook')
  @ApiOperation({ summary: 'Handle Finby payment webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handlePaymentWebhook(@Body() body: any, @Req() req: Request) {
    // TODO: Verify webhook signature
    await this.finbyService.handlePaymentWebhook(body);
    return { success: true };
  }

  @Post('finby/recurring-webhook')
  @ApiOperation({ summary: 'Handle Finby recurring payment webhook' })
  @ApiResponse({ status: 200, description: 'Recurring webhook processed successfully' })
  async handleRecurringWebhook(@Body() body: any, @Req() req: Request) {
    // TODO: Verify webhook signature
    await this.finbyService.handleRecurringWebhook(body);
    return { success: true };
  }
}

