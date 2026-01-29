/**
 * Finby Payment Service
 * 
 * Handles Finby payment integration following MDC's TrustPay service pattern.
 * Supports subscriptions (with Recurring: true) and credit purchases (with RegisterCard: true).
 */

import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// NOTE: @Cron removed temporarily to fix DI issue with ScheduleModule
// import { Cron, CronExpression } from '@nestjs/schedule';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, gte, lte } from 'drizzle-orm';
import * as schema from '@ryla/data/schema';
import { PaymentRepository } from '@ryla/data';
import { 
  createPaymentProvider, 
  type FinbyConfig,
  type CheckoutSessionParams,
  grantCredits,
  getCreditsForPlan,
} from '@ryla/payments';
import type { Config } from '../../../config/config.type';
import { SUBSCRIPTION_PLANS, CREDIT_PACKAGES } from '@ryla/shared';

export interface CreatePaymentSessionDto {
  userId: string; // Required - will be set from JWT in controller
  email?: string; // Optional - will use user email from JWT if not provided
  type: 'subscription' | 'credit';
  planId?: string; // For subscriptions
  packageId?: string; // For credits
  isYearly?: boolean; // For subscriptions
}

export interface PaymentSessionResponse {
  paymentUrl: string;
  paymentRequestId: string;
  reference: string;
}

@Injectable()
export class FinbyService {
  private readonly logger = new Logger(FinbyService.name);
  private readonly finbyConfig: FinbyConfig;
  private readonly appConfig: Config['app'];
  private readonly notificationUrl: string;
  private readonly notificationRecurringUrl: string;

  constructor(
    @Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>,
    @Inject(ConfigService) private readonly configService: ConfigService<Config>,
  ) {
    try {
      // Verify dependencies are injected
    if (!this.configService) {
        this.logger.error('ConfigService is not available. Make sure ConfigModule is imported.');
      throw new Error('ConfigService is not available. Make sure ConfigModule is imported.');
    }

      if (!this.db) {
        this.logger.error('Drizzle database is not available. Make sure DrizzleModule is imported.');
        throw new Error('Drizzle database is not available. Make sure DrizzleModule is imported.');
      }
      
      this.logger.log('FinbyService: Dependencies verified, initializing configuration...');
    
    // Get configs with proper error handling
    const finbyConfig = this.configService.get<FinbyConfig>('finbyConfig');
    const appConfig = this.configService.get<Config['app']>('app');
    
    // Finby config is optional - only throw if actually trying to use Finby
    // This allows the app to start even if Finby isn't configured yet
    if (!finbyConfig || !finbyConfig.projectId || !finbyConfig.secretKey) {
      this.logger.warn('Finby configuration not found. Finby payment features will be disabled. Please set FINBY_PROJECT_ID and FINBY_SECRET_KEY in environment variables.');
      // Set defaults to prevent errors
      this.finbyConfig = {
        projectId: '',
        secretKey: '',
        apiVersion: 'v1',
      } as FinbyConfig;
    } else {
      this.finbyConfig = finbyConfig;
        this.logger.log('FinbyService: Finby configuration loaded successfully');
    }
    
    if (!appConfig) {
        this.logger.error('App configuration not found.');
      throw new Error('App configuration not found.');
    }
    
    this.appConfig = appConfig;
    
    // Use full URL with protocol for notification URLs
    // Use FRONTEND_URL or fallback to app.ryla.ai for production, localhost for development
    const verificationsConfig = this.configService.get<Config['verifications']>('verifications');
    // Note: frontendUrl is computed but not used in constructor - kept for future use
    const _frontendUrl = verificationsConfig?.frontendUrl ||
      (this.appConfig.environment === 'production' 
        ? 'https://app.ryla.ai' 
        : `http://${this.appConfig.host}:3000`);
    
    // API base URL (for webhooks)
    const apiBaseUrl = this.appConfig.environment === 'production'
      ? 'https://end.ryla.ai'
      : `http://${this.appConfig.host}:${this.appConfig.port || 3001}`;
    
      this.notificationUrl = `${apiBaseUrl}/payments/finby/webhook`;
      this.notificationRecurringUrl = `${apiBaseUrl}/payments/finby/recurring-webhook`;
      
      this.logger.log(`FinbyService: Initialized successfully. Notification URLs: ${this.notificationUrl}`);
    } catch (error) {
      this.logger.error('FinbyService: Failed to initialize', error);
      // Re-throw to prevent service from being created in invalid state
      throw error;
    }
  }

  /**
   * Create payment session for subscription or credit purchase
   * Similar to MDC's tpSession method
   * 
   * If PAYMENT_DEV_BYPASS=true, skips actual payment and grants credits/subscription directly
   */
  async createPaymentSession(dto: CreatePaymentSessionDto): Promise<PaymentSessionResponse> {
    this.logger.log(
      `Creating payment session for userId: ${dto.userId}, type: ${dto.type}, planId: ${dto.planId || dto.packageId}`
    );

    // Development bypass mode - skip payment and grant directly
    const devBypass = process.env.PAYMENT_DEV_BYPASS === 'true';
    if (devBypass) {
      this.logger.warn('⚠️ PAYMENT_DEV_BYPASS is enabled - skipping actual payment');
      return this.handleDevBypass(dto);
    }

    // Check if Finby is configured
    if (!this.finbyConfig.projectId || !this.finbyConfig.secretKey) {
      throw new Error('Finby payment is not configured. Please set FINBY_PROJECT_ID and FINBY_SECRET_KEY in environment variables.');
    }

    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, dto.userId),
    });

    if (!user) {
      throw new NotFoundException(`User not found: ${dto.userId}`);
    }

    const paymentRepo = new PaymentRepository(this.db);

    // Get current subscription if exists (reserved for upgrade/downgrade logic)
    const _currentSubscription = await paymentRepo.getCurrentSubscription(dto.userId);

    let amount: number;
    let reference: string;
    let metadata: Record<string, string> = {
      user_id: dto.userId,
    };

    if (dto.type === 'subscription') {
      if (!dto.planId) {
        throw new Error('planId is required for subscription');
      }

      const plan = SUBSCRIPTION_PLANS.find(p => p.id === dto.planId);
      if (!plan) {
        throw new NotFoundException(`Plan not found: ${dto.planId}`);
      }

      amount = dto.isYearly ? plan.priceYearly : plan.priceMonthly;
      reference = `subscription;user_id:${dto.userId};plan_id:${dto.planId};${dto.isYearly ? 'yearly' : 'monthly'}`;
      
      metadata = {
        ...metadata,
        isSubscription: 'true',
        planId: dto.planId,
        isYearly: dto.isYearly ? 'true' : 'false',
      };

      // Note: If user has existing subscription and wants to purchase credits,
      // we could use saved card for automatic payment, but for now we create a new session
    } else {
      // Credit purchase
      if (!dto.packageId) {
        throw new Error('packageId is required for credit purchase');
      }

      const creditPackage = CREDIT_PACKAGES.find(p => p.id === dto.packageId);
      if (!creditPackage) {
        throw new NotFoundException(`Credit package not found: ${dto.packageId}`);
      }

      amount = creditPackage.price;
      reference = `credit;user_id:${dto.userId};package_id:${dto.packageId}`;
      
      metadata = {
        ...metadata,
        isSubscription: 'false',
        packageId: dto.packageId,
      };
    }

    const finby = createPaymentProvider('finby', {
      projectId: this.finbyConfig.projectId,
      secretKey: this.finbyConfig.secretKey,
      apiKey: this.finbyConfig.apiKey,
      merchantId: this.finbyConfig.merchantId,
      baseUrl: this.finbyConfig.baseUrl,
      apiVersion: this.finbyConfig.apiVersion || 'v1',
    });

    // Use FRONTEND_URL from config (should be full URL like https://app.ryla.ai)
    // Fallback to app.ryla.ai for production, localhost for development
    const verificationsConfig = this.configService.get<Config['verifications']>('verifications');
    const frontendUrl = verificationsConfig?.frontendUrl ||
      (this.appConfig.environment === 'production' 
        ? 'https://app.ryla.ai' 
        : `http://${this.appConfig.host}:3000`);
    
    // Ensure URLs are absolute and point to our website
    const successUrl = `${frontendUrl}/payment/success?reference=${encodeURIComponent(reference)}`;
    const cancelUrl = `${frontendUrl}/payment/cancel?reference=${encodeURIComponent(reference)}`;
    const errorUrl = `${frontendUrl}/payment/error?reference=${encodeURIComponent(reference)}`;

    const checkoutParams: CheckoutSessionParams = {
      priceId: dto.planId || dto.packageId || '',
      userId: dto.userId,
      email: dto.email,
      amount: amount * 100, // Convert to cents
      currency: 'EUR',
      successUrl,
      cancelUrl,
      errorUrl,
      notificationUrl: this.notificationUrl,
      mode: dto.type === 'subscription' ? 'subscription' : 'payment',
      metadata,
      reference,
    };

    this.logger.log(`Creating checkout session with params:`, JSON.stringify({
      type: dto.type,
      planId: dto.planId,
      packageId: dto.packageId,
      amount: checkoutParams.amount,
      currency: checkoutParams.currency,
      successUrl: checkoutParams.successUrl,
      cancelUrl: checkoutParams.cancelUrl,
      errorUrl: checkoutParams.errorUrl,
      notificationUrl: checkoutParams.notificationUrl,
      mode: checkoutParams.mode,
      reference: checkoutParams.reference,
    }));

    const session = await finby.createCheckoutSession(checkoutParams);

    this.logger.log(`Payment session created successfully:`, JSON.stringify({
      paymentUrl: session.url?.substring(0, 100) + '...', // Truncate for logging
      paymentRequestId: session.id,
      reference: session.reference || reference,
    }));

    return {
      paymentUrl: session.url,
      paymentRequestId: session.id,
      reference: session.reference || reference,
    };
  }

  /**
   * Development bypass - skip actual payment and grant credits/subscription directly
   * Only works when PAYMENT_DEV_BYPASS=true
   */
  private async handleDevBypass(dto: CreatePaymentSessionDto): Promise<PaymentSessionResponse> {
    this.logger.log(`[DEV BYPASS] Processing ${dto.type} for user ${dto.userId}`);

    const paymentRepo = new PaymentRepository(this.db);
    const reference = `dev_bypass_${Date.now()}`;

    if (dto.type === 'subscription') {
      if (!dto.planId) {
        throw new Error('planId is required for subscription');
      }

      const plan = SUBSCRIPTION_PLANS.find(p => p.id === dto.planId);
      if (!plan) {
        throw new NotFoundException(`Plan not found: ${dto.planId}`);
      }

      // Calculate period end based on yearly/monthly
      const now = new Date();
      const periodEnd = new Date(now);
      if (dto.isYearly) {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      // Create subscription record
      await paymentRepo.createSubscription({
        userId: dto.userId,
        tier: dto.planId as any, // Map planId to tier (e.g., 'starter', 'pro', 'unlimited')
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        finbySubscriptionId: reference,
      });

      // Grant credits for the plan
      const credits = getCreditsForPlan(dto.planId as any);
      if (credits > 0 && credits !== Infinity) {
        await grantCredits(this.db, {
          userId: dto.userId,
          amount: credits,
          type: 'subscription_grant',
          description: `Dev bypass subscription credits (${dto.planId})`,
          referenceType: 'dev_bypass',
          referenceId: reference,
        });
        this.logger.log(`[DEV BYPASS] Granted ${credits} credits for plan ${dto.planId}`);
      }

      this.logger.log(`[DEV BYPASS] Created subscription: ${dto.planId} (${dto.isYearly ? 'yearly' : 'monthly'})`);

      // Return a fake success URL that will show success page
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return {
        paymentUrl: `${frontendUrl}/payment/success?reference=${encodeURIComponent(reference)}&type=subscription&dev_bypass=true`,
        paymentRequestId: reference,
        reference,
      };
    } else {
      // Credit purchase
      if (!dto.packageId) {
        throw new Error('packageId is required for credit purchase');
      }

      const creditPackage = CREDIT_PACKAGES.find(p => p.id === dto.packageId);
      if (!creditPackage) {
        throw new NotFoundException(`Credit package not found: ${dto.packageId}`);
      }

      // Grant credits directly
      await grantCredits(this.db, {
        userId: dto.userId,
        amount: creditPackage.credits,
        type: 'purchase',
        description: `Dev bypass credit purchase (${dto.packageId})`,
        referenceType: 'dev_bypass',
        referenceId: reference,
      });
      this.logger.log(`[DEV BYPASS] Granted ${creditPackage.credits} credits for package ${dto.packageId}`);

      // Return a fake success URL
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return {
        paymentUrl: `${frontendUrl}/payment/success?reference=${encodeURIComponent(reference)}&type=credit&dev_bypass=true`,
        paymentRequestId: reference,
        reference,
      };
    }
  }

  /**
   * Handle payment webhook (initial subscription or credit purchase)
   * Similar to MDC's paymentWebhook method
   */
  async handlePaymentWebhook(webhookData: any): Promise<void> {
    this.logger.log('Payment webhook received:', JSON.stringify(webhookData));
    
    // Parse reference to determine type
    const reference = webhookData.PaymentInformation?.References?.MerchantReference || 
                      webhookData.reference || 
                      webhookData.subscriptionId;
    
    if (!reference) {
      this.logger.warn('No reference found in webhook data');
      return;
    }

    const parsed = this.parsePaymentReference(reference);
    if (!parsed) {
      this.logger.warn(`Invalid payment reference: ${reference}`);
      return;
    }

    const status = webhookData.PaymentInformation?.Status || webhookData.status;
    if (status !== 'Authorized' && status !== 'Succeeded') {
      this.logger.warn(`Payment not successful. Status: ${status}`);
      return;
    }

    const paymentRequestId = webhookData.PaymentInformation?.References?.PaymentRequestId || 
                             webhookData.PaymentRequestId || 
                             webhookData.id;

    if (parsed.type === 'subscription') {
      await this.handleSubscriptionPayment(parsed, paymentRequestId, webhookData);
    } else if (parsed.type === 'credit') {
      await this.handleCreditPayment(parsed, paymentRequestId, webhookData);
    }
  }

  /**
   * Handle subscription payment (initial or renewal)
   */
  private async handleSubscriptionPayment(
    parsed: { type: string; userId: string; planId?: string },
    paymentRequestId: string,
    webhookData: any
  ): Promise<void> {
    const paymentRepo = new PaymentRepository(this.db);
    
    if (!parsed.planId) {
      this.logger.error('Plan ID missing from subscription payment reference');
      return;
    }

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === parsed.planId);
    if (!plan) {
      this.logger.error(`Plan not found: ${parsed.planId}`);
      return;
    }

    const isYearly = parsed.planId?.includes('yearly') || false;
    const credits = getCreditsForPlan(parsed.planId);

    // Calculate period end
    const now = new Date();
    const currentPeriodStart = now;
    const currentPeriodEnd = new Date(now);
    if (isYearly) {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }

    // Check if this is initial payment or renewal
    const existingSubscription = await paymentRepo.getSubscriptionByFinbyId(paymentRequestId);
    
    if (existingSubscription) {
      // Renewal - update existing subscription
      await paymentRepo.updateSubscription(existingSubscription.id, {
        currentPeriodStart,
        currentPeriodEnd,
        status: 'active',
        updatedAt: new Date(),
      });
      
      this.logger.log(`Subscription renewed: ${existingSubscription.id}`);
    } else {
      // Initial payment - create new subscription
      // Cancel any existing active subscriptions
      const currentSub = await paymentRepo.getCurrentSubscription(parsed.userId);
      if (currentSub) {
        await paymentRepo.updateSubscription(currentSub.id, {
          status: 'cancelled',
          cancelledAt: new Date(),
          expiredAt: currentSub.currentPeriodEnd || new Date(),
        });
      }

      const newSubscription = await paymentRepo.createSubscription({
        userId: parsed.userId,
        finbySubscriptionId: paymentRequestId,
        tier: plan.id as any,
        status: 'active',
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: false,
      });

      this.logger.log(`New subscription created: ${newSubscription.id}`);
    }

    // Grant credits
    if (credits > 0) {
      await grantCredits(this.db, {
        userId: parsed.userId,
        amount: credits,
        type: 'subscription_grant',
        description: `Subscription credits (${parsed.planId})`,
        referenceType: 'subscription',
        referenceId: paymentRequestId,
      });
      
      this.logger.log(`Granted ${credits} credits to user ${parsed.userId}`);
    }

    // Save card if RegisterCard was used (shouldn't be for subscriptions, but check anyway)
    const cardHash = webhookData.PaymentInformation?.Card?.Token || webhookData.cardHash;
    if (cardHash && webhookData.PaymentInformation?.CardTransaction?.RegisterCard) {
      await this.saveCard(parsed.userId, cardHash, webhookData);
    }
  }

  /**
   * Handle credit purchase payment
   */
  private async handleCreditPayment(
    parsed: { type: string; userId: string; packageId?: string },
    paymentRequestId: string,
    webhookData: any
  ): Promise<void> {
    if (!parsed.packageId) {
      this.logger.error('Package ID missing from credit payment reference');
      return;
    }

    const creditPackage = CREDIT_PACKAGES.find(p => p.id === parsed.packageId);
    if (!creditPackage) {
      this.logger.error(`Credit package not found: ${parsed.packageId}`);
      return;
    }

    // Grant credits
    await grantCredits(this.db, {
      userId: parsed.userId,
      amount: creditPackage.credits,
      type: 'purchase',
      description: `Credit purchase (${parsed.packageId})`,
      referenceType: 'credit_purchase',
      referenceId: paymentRequestId,
    });

    this.logger.log(`Granted ${creditPackage.credits} credits to user ${parsed.userId}`);

    // Save card (RegisterCard: true for credit purchases)
    const cardHash = webhookData.PaymentInformation?.Card?.Token || webhookData.cardHash;
    if (cardHash) {
      await this.saveCard(parsed.userId, cardHash, webhookData);
    }
  }

  /**
   * Handle recurring payment webhook
   * Similar to MDC's recurringPaymentWebhook method
   */
  async handleRecurringWebhook(webhookData: any): Promise<void> {
    this.logger.log('Recurring payment webhook received:', JSON.stringify(webhookData));

    const paymentRepo = new PaymentRepository(this.db);
    
    const originalPaymentRequestId = webhookData.PaymentInformation?.References?.OriginalPaymentRequestId ||
                                     webhookData.OriginalPaymentRequestId;
    
    if (!originalPaymentRequestId) {
      this.logger.warn('No OriginalPaymentRequestId found in recurring webhook');
      return;
    }

    // Find subscription by original payment request ID
    const subscription = await paymentRepo.getSubscriptionByFinbyId(originalPaymentRequestId);
    if (!subscription) {
      this.logger.warn(`Subscription not found for OriginalPaymentRequestId: ${originalPaymentRequestId}`);
      return;
    }

    const status = webhookData.PaymentInformation?.Status || webhookData.status;
    if (status !== 'Authorized' && status !== 'Succeeded') {
      this.logger.warn(`Recurring payment failed. Status: ${status}`);
      // Update subscription status to past_due if needed
      await paymentRepo.updateSubscription(subscription.id, {
        status: 'past_due',
        updatedAt: new Date(),
      });
      return;
    }

    // Update subscription period
    const now = new Date();
    const currentPeriodStart = subscription.currentPeriodEnd || now;
    const currentPeriodEnd = new Date(currentPeriodStart);
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

    await paymentRepo.updateSubscription(subscription.id, {
      currentPeriodStart,
      currentPeriodEnd,
      status: 'active',
      updatedAt: new Date(),
    });

    // Grant monthly credits
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.tier);
    if (plan) {
      const credits = getCreditsForPlan(plan.id);
      if (credits > 0) {
        await grantCredits(this.db, {
          userId: subscription.userId,
          amount: credits,
          type: 'subscription_grant',
          description: `Monthly subscription credits renewal (${plan.id})`,
          referenceType: 'subscription_renewal',
          referenceId: originalPaymentRequestId,
        });
        
        this.logger.log(`Granted ${credits} credits for subscription renewal`);
      }
    }
  }

  /**
   * Charge recurring payments (cron job)
   * Similar to MDC's chargeRecurringPayments method
   * 
   * NOTE: @Cron decorator removed temporarily to fix DI issue.
   * This should be called via external cron (GitHub Actions, Vercel Cron) at /cron/payments/recurring
   */
  // @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async chargeRecurringPayments(): Promise<void> {
    this.logger.log('Starting recurring payment charge job');

    const paymentRepo = new PaymentRepository(this.db);
    const finby = createPaymentProvider('finby', {
      projectId: this.finbyConfig.projectId,
      secretKey: this.finbyConfig.secretKey,
      apiKey: this.finbyConfig.apiKey,
      merchantId: this.finbyConfig.merchantId,
      baseUrl: this.finbyConfig.baseUrl,
      apiVersion: this.finbyConfig.apiVersion || 'v1',
    });

    // Get all active subscriptions that need renewal
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const subscriptions = await this.db
      .select()
      .from(schema.subscriptions)
      .where(
        and(
          eq(schema.subscriptions.status, 'active'),
          gte(schema.subscriptions.currentPeriodEnd, now),
          lte(schema.subscriptions.currentPeriodEnd, tomorrow)
        )
      );

    this.logger.log(`Found ${subscriptions.length} subscriptions to charge`);

    for (const subscription of subscriptions) {
      try {
        // Check if subscription is cancelled
        if (subscription.cancelAtPeriodEnd) {
          await paymentRepo.updateSubscription(subscription.id, {
            status: 'cancelled',
            cancelledAt: new Date(),
            expiredAt: subscription.currentPeriodEnd || new Date(),
          });
          continue;
        }

        // Get user
        const user = await this.db.query.users.findFirst({
          where: eq(schema.users.id, subscription.userId),
        });

        if (!user) {
          this.logger.warn(`User not found for subscription: ${subscription.id}`);
          continue;
        }

        // Get plan
        if (!subscription.tier) {
          this.logger.warn(`Subscription tier is null: ${subscription.id}`);
          continue;
        }

        const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.tier);
        if (!plan) {
          this.logger.warn(`Plan not found for subscription: ${subscription.id}`);
          continue;
        }

        // Get default card
        const defaultCard = await paymentRepo.getDefaultCard(subscription.userId);
        if (!defaultCard) {
          this.logger.warn(`No default card found for user: ${subscription.userId}`);
          // Could create a payment session for user to enter new card
          continue;
        }

        // Create recurring payment using OriginalPaymentRequestId
        const isYearly = subscription.tier.includes('yearly');
        const amount = isYearly ? plan.priceYearly : plan.priceMonthly;
        
        // Cast to FinbyProvider to access createRecurringPayment
        const finbyProvider = finby as any; // Type assertion needed since method is not in interface
        const recurringSession = await finbyProvider.createRecurringPayment({
          amount: amount * 100, // Convert to cents
          currency: 'EUR',
          userId: subscription.userId,
          email: user.email,
          originalPaymentRequestId: subscription.finbySubscriptionId || '',
          cardHash: defaultCard.cardHash,
          notificationUrl: this.notificationRecurringUrl,
        });

        this.logger.log(`Recurring payment initiated for subscription: ${subscription.id}, PaymentRequestId: ${recurringSession.id}`);
      } catch (error) {
        this.logger.error(`Failed to charge recurring payment for subscription ${subscription.id}:`, error);
        // Update subscription status to past_due on failure
        await paymentRepo.updateSubscription(subscription.id, {
          status: 'past_due',
          updatedAt: new Date(),
        });
      }
    }
  }

  /**
   * Save card to database
   */
  private async saveCard(userId: string, cardHash: string, webhookData: any): Promise<void> {
    const paymentRepo = new PaymentRepository(this.db);
    
    // Check if card already exists
    const existingCard = await paymentRepo.findCardByHash(userId, cardHash);
    if (existingCard) {
      this.logger.log(`Card already exists for user: ${userId}`);
      return;
    }

    // Extract card info from webhook
    const last4 = webhookData.PaymentInformation?.Card?.Last4Digits || 
                  webhookData.cardLast4 || 
                  webhookData.last4;
    const cardType = webhookData.PaymentInformation?.Card?.CardType || 
                     webhookData.cardType;
    const expiryDate = webhookData.PaymentInformation?.Card?.ExpiryDate || 
                       webhookData.expiryDate;

    // Check if user has any cards - if not, set as default
    const userCards = await paymentRepo.getUserCards(userId);
    const isDefault = userCards.length === 0;

    await paymentRepo.saveCard({
      userId,
      cardHash,
      last4: last4 || undefined,
      cardType: cardType || undefined,
      expiryDate: expiryDate || undefined,
      isDefault,
    });

    this.logger.log(`Card saved for user: ${userId}, isDefault: ${isDefault}`);
  }

  /**
   * Parse payment reference
   */
  private parsePaymentReference(reference: string): { type: string; userId: string; planId?: string; packageId?: string } | null {
    // Format: "subscription;user_id:xxx;plan_id:yyy;monthly" or "credit;user_id:xxx;package_id:yyy"
    const parts = reference.split(';');
    if (parts.length < 2) {
      return null;
    }

    const type = parts[0];
    const userIdMatch = parts.find(p => p.startsWith('user_id:'));
    const planIdMatch = parts.find(p => p.startsWith('plan_id:'));
    const packageIdMatch = parts.find(p => p.startsWith('package_id:'));

    if (!userIdMatch) {
      return null;
    }

    const userId = userIdMatch.split(':')[1];
    const planId = planIdMatch?.split(':')[1];
    const packageId = packageIdMatch?.split(':')[1];

    return {
      type,
      userId,
      planId,
      packageId,
    };
  }

  /**
   * Setup payment for funnel (not authenticated, uses productId)
   * This is for the funnel app which doesn't require user authentication
   */
  async setupFunnelPayment(dto: {
    productId: number;
    email: string;
    userId?: string;
    cardHolder?: string;
    billingStreet?: string;
    billingCity?: string;
    billingPostcode?: string;
    billingCountry?: string;
    returnUrl?: string;
    cancelUrl?: string;
    errorUrl?: string;
    notificationUrl?: string;
  }): Promise<{ paymentUrl: string; reference: string; transactionId?: string; requestId?: string }> {
    this.logger.log(`Setting up funnel payment for productId: ${dto.productId}, email: ${dto.email}`);

    // Check if Finby is configured
    if (!this.finbyConfig.projectId || !this.finbyConfig.secretKey) {
      throw new Error('Finby payment is not configured. Please set FINBY_PROJECT_ID and FINBY_SECRET_KEY in environment variables.');
    }

    // Funnel products (hardcoded for now - matches apps/funnel/constants/products.ts)
    const funnelProducts = [
      {
        id: 1,
        name: 'Monthly AI Influencer Subscription',
        amount: 2900, // $29.00 in cents
        currency: 'USD',
        durationMonths: 1,
      },
    ];

    const product = funnelProducts.find((p) => p.id === dto.productId);
    if (!product) {
      throw new NotFoundException(`Product with id ${dto.productId} not found`);
    }

    const finby = createPaymentProvider('finby', {
      projectId: this.finbyConfig.projectId,
      secretKey: this.finbyConfig.secretKey,
      apiVersion: 'v3',
    });

    // Generate reference with RYLAFL prefix for funnel
    const userId = dto.userId || dto.email;
    const reference = `RYLAFL-${Date.now()}-${userId}`;

    const sessionParams = {
      priceId: product.id.toString(),
      userId: userId,
      email: dto.email,
      productId: dto.productId,
      amount: product.amount,
      currency: product.currency || 'USD',
      successUrl: dto.returnUrl || '/payment-callback',
      cancelUrl: dto.cancelUrl || '/payment-callback',
      errorUrl: dto.errorUrl,
      notificationUrl: dto.notificationUrl || this.notificationUrl,
      cardHolder: dto.cardHolder,
      billingStreet: dto.billingStreet,
      billingCity: dto.billingCity,
      billingPostcode: dto.billingPostcode,
      billingCountry: dto.billingCountry,
    };

    const session = await finby.createCheckoutSession(sessionParams);

    if (!session || !session.url || !session.reference) {
      throw new Error('Invalid session response from payment provider');
    }

    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.logger.log(`Funnel payment session created: ${session.reference}`);

    return {
      paymentUrl: session.url,
      reference: session.reference,
      transactionId: session.transactionId || session.reference,
      requestId,
    };
  }

  /**
   * Get payment status by reference
   * Note: This is a simplified implementation - in production should query database or Finby API
   */
  async getPaymentStatus(reference: string): Promise<{
    reference: string;
    status: string;
    resultCode: number;
    paid_status: string;
    resultMessage: string;
  }> {
    this.logger.log(`Getting payment status for reference: ${reference}`);

    // TODO: In production, query database or Finby API for actual status
    // For now, returning pending status
    return {
      reference,
      status: 'pending',
      resultCode: 1, // 1 = Pending
      paid_status: 'pending',
      resultMessage: 'Payment status check not fully implemented. Check Finby merchant portal or implement status checking.',
    };
  }

  /**
   * Process refund for funnel payment
   */
  async processFunnelRefund(dto: {
    paymentRequestId: string;
    reference: string;
    amount: number;
    currency: string;
  }): Promise<{ success: boolean; refundId?: string; error?: string }> {
    this.logger.log(`Processing refund for reference: ${dto.reference}, amount: ${dto.amount}`);

    // Check if Finby is configured
    if (!this.finbyConfig.projectId || !this.finbyConfig.secretKey) {
      throw new Error('Finby payment is not configured.');
    }

    // Verify reference belongs to funnel (must start with RYLAFL prefix)
    const { isFunnelReference } = await import('@ryla/payments');
    if (!isFunnelReference(dto.reference)) {
      this.logger.error(`Refund blocked: Reference does not belong to funnel: ${dto.reference}`);
      throw new Error('Refund not allowed: Payment reference does not belong to this funnel');
    }

    // Convert amount from cents to decimal
    const amountDecimal = (dto.amount / 100).toFixed(2);

    // Call Finby refund API
    const refundUrl = `https://aapi.finby.eu/api/Payments/Payment/${dto.paymentRequestId}/Refund`;
    const apiKey = this.finbyConfig.apiKey || this.finbyConfig.secretKey;

    const refundPayload = {
      MerchantIdentification: {
        ProjectId: this.finbyConfig.projectId,
      },
      PaymentInformation: {
        Amount: {
          Amount: parseFloat(amountDecimal),
          Currency: dto.currency,
        },
        References: {
          MerchantReference: dto.reference,
        },
      },
    };

    const response = await fetch(refundUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(refundPayload),
    });

    let responseData;
    try {
      responseData = await response.json();
    } catch {
      const errorText = await response.text();
      responseData = { error: errorText };
    }

    const hasError = responseData?.ResultInfo && 
                    responseData.ResultInfo.ResultCode && 
                    responseData.ResultInfo.ResultCode !== 0;

    if (!response.ok || hasError) {
      const errorMessage = responseData.ResultInfo?.ResultMessage || 
                          responseData.error || 
                          `Refund failed: ${response.statusText}`;
      this.logger.error(`Refund failed: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    this.logger.log(`Refund processed successfully for reference: ${dto.reference}`);

    return {
      success: true,
      refundId: responseData.RefundId || responseData.id,
    };
  }
}

