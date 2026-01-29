/**
 * Payments Controller
 * 
 * Handles payment-related API endpoints
 */

import { Controller, Post, Body, UseGuards, Req, Get, Param, Logger, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FinbyService, CreatePaymentSessionDto } from './services/finby.service';
import { FinbyFunnelSetupDto } from './dto/finby-funnel-setup.dto';
import { FinbyRefundDto } from './dto/finby-refund.dto';
import type { Request } from 'express';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    @Inject(FinbyService) private readonly finbyService: FinbyService,
  ) {
    // Extended debugging for DI issue
    this.logger.log('=== PaymentsController Constructor ===');
    this.logger.log(`  - finbyService type: ${typeof this.finbyService}`);
    this.logger.log(`  - finbyService value: ${this.finbyService}`);
    this.logger.log(`  - finbyService is FinbyService: ${this.finbyService instanceof FinbyService}`);
    
    if (!this.finbyService) {
      this.logger.error('FinbyService is not injected. Payment endpoints will not work.');
      this.logger.error('This is a NestJS dependency injection issue.');
    } else {
      this.logger.log('PaymentsController initialized with FinbyService');
    }
    this.logger.log('=====================================');
  }

  @Post('session')
  @UseGuards(JwtAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment session for subscription or credit purchase' })
  @ApiResponse({ status: 200, description: 'Payment session created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createPaymentSession(
    @CurrentUser() user: { userId: string; email: string },
    @Body() dto: CreatePaymentSessionDto
  ) {
    // Defensive check - verify service is available
    if (!this.finbyService) {
      this.logger.error('FinbyService is undefined. Dependency injection failed.');
      throw new Error('Payment service is not available. Please contact support.');
    }

    // Use authenticated user's ID from JWT token (userId in payload)
    // If dto.userId is provided, validate it matches the authenticated user
    const authenticatedUserId = user.userId;
    
    if (dto.userId && dto.userId !== authenticatedUserId) {
      throw new Error('User ID mismatch: provided userId does not match authenticated user');
    }

    this.logger.log(`Creating payment session for user ${authenticatedUserId}, type: ${dto.type}`);

    return await this.finbyService.createPaymentSession({
      ...dto,
      userId: authenticatedUserId, // Always use authenticated user ID from JWT
      email: dto.email || user.email,
    });
  }

  @Post('finby/webhook')
  @ApiOperation({ summary: 'Handle Finby payment webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handlePaymentWebhook(@Body() body: any, @Req() _req: Request) {
    if (!this.finbyService) {
      this.logger.error('FinbyService is undefined in webhook handler.');
      throw new Error('Payment service is not available.');
    }
    // TODO: Verify webhook signature
    await this.finbyService.handlePaymentWebhook(body);
    return { success: true };
  }

  @Post('finby/recurring-webhook')
  @ApiOperation({ summary: 'Handle Finby recurring payment webhook' })
  @ApiResponse({ status: 200, description: 'Recurring webhook processed successfully' })
  async handleRecurringWebhook(@Body() body: any, @Req() _req: Request) {
    if (!this.finbyService) {
      this.logger.error('FinbyService is undefined in recurring webhook handler.');
      throw new Error('Payment service is not available.');
    }
    // TODO: Verify webhook signature
    await this.finbyService.handleRecurringWebhook(body);
    return { success: true };
  }

  // Funnel-specific endpoints (no authentication required)
  @Post('finby/setup-payment')
  @ApiOperation({ summary: 'Setup Finby payment for funnel (funnel-specific, no auth required)' })
  @ApiResponse({ status: 200, description: 'Payment session created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async setupFunnelPayment(@Body() dto: FinbyFunnelSetupDto) {
    if (!this.finbyService) {
      this.logger.error('FinbyService is undefined.');
      throw new Error('Payment service is not available.');
    }

    this.logger.log(`Funnel payment setup requested: productId=${dto.productId}, email=${dto.email?.substring(0, 3)}***`);

    return await this.finbyService.setupFunnelPayment(dto);
  }

  @Get('finby/payment-status/:reference')
  @ApiOperation({ summary: 'Get payment status by reference (funnel-specific)' })
  @ApiResponse({ status: 200, description: 'Payment status retrieved successfully' })
  async getPaymentStatus(@Param('reference') reference: string) {
    if (!this.finbyService) {
      this.logger.error('FinbyService is undefined.');
      throw new Error('Payment service is not available.');
    }

    return await this.finbyService.getPaymentStatus(reference);
  }

  @Post('finby/refund')
  @ApiOperation({ summary: 'Process refund for funnel payment (funnel-specific)' })
  @ApiResponse({ status: 200, description: 'Refund processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async processFunnelRefund(@Body() dto: FinbyRefundDto) {
    if (!this.finbyService) {
      this.logger.error('FinbyService is undefined.');
      throw new Error('Payment service is not available.');
    }

    this.logger.log(`Funnel refund requested: reference=${dto.reference}, amount=${dto.amount}`);

    return await this.finbyService.processFunnelRefund(dto);
  }
}

