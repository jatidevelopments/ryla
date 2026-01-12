import * as process from 'node:process';

import { Config } from './config.type';

// RYLA MVP Configuration
// Based on MDC backend structure, adapted for RYLA requirements
export default (): Config => ({
  app: {
    port: Number(process.env.APP_PORT) || 3001,
    host: process.env.APP_HOST || 'localhost',
    environment: process.env.APP_ENVIRONMENT || 'local',
  },
  postgres: {
    port: Number(process.env.POSTGRES_PORT) || 5432,
    host: process.env.POSTGRES_HOST || 'localhost',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    dbName: process.env.POSTGRES_DB || 'ryla',
    environment: process.env.POSTGRES_ENVIRONMENT || 'local',
  },
  redis: (() => {
    // Parse REDIS_URL if provided (Fly.io/Upstash format)
    // Format: redis://default:password@host:port or rediss://default:password@host:port
    if (process.env.REDIS_URL) {
      try {
        const url = new URL(process.env.REDIS_URL);
        return {
          port: Number(url.port) || 6379,
          host: url.hostname,
          password: url.password || '',
          environment: process.env.REDIS_ENVIRONMENT || 'production',
        };
      } catch (error) {
        console.warn('[Config] Failed to parse REDIS_URL, using individual variables:', error);
      }
    }
    // Fallback to individual variables
    return {
      port: Number(process.env.REDIS_PORT) || 6379,
      host: process.env.REDIS_HOST || 'localhost',
      password: process.env.REDIS_PASSWORD || '',
      environment: process.env.REDIS_ENVIRONMENT || 'local',
    };
  })(),
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'secret',
    accessExpiresIn: Number(process.env.JWT_ACCESS_EXPIRES_IN) || 3600,
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
    refreshExpiresIn: Number(process.env.JWT_REFRESH_EXPIRES_IN) || 86400,
    actionForgotPasswordSecret: process.env.JWT_ACTION_FORGOT_PASSWORD_SECRET || 'forgot-secret',
    actionForgotPasswordExpiresIn: Number(
      process.env.JWT_ACTION_FORGOT_PASSWORD_EXPIRES_IN,
    ) || 3600,
  },
  aws: {
    region: process.env.AWS_S3_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_S3_ACCESS_KEY || '',
    secretAccessKey: process.env.AWS_S3_SECRET_KEY || '',
    bucketName: process.env.AWS_S3_BUCKET_NAME || 'ryla-images',
    urlTtl: Number(process.env.AWS_S3_URL_TTL) || 3600,
    // Custom S3 endpoint for MinIO or other S3-compatible storage
    endpoint: process.env.AWS_S3_ENDPOINT || undefined,
    // Force path style for MinIO (bucket in path instead of subdomain)
    forcePathStyle: process.env.AWS_S3_FORCE_PATH_STYLE === 'true',
  },
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectURI: process.env.AUTH_REDIRECT_URI || '',
    callbackURL: process.env.APP_PORT
      ? `${process.env.APP_HOST}:${process.env.APP_PORT}/auth/google`
      : `${process.env.APP_HOST}/auth/google`,
  },
  swagger: {
    password: process.env.SWAGGER_PASSWORD || 'password',
  },
  millionVerifier: {
    apiKey: process.env.MILLIONVERIFIER_API_KEY || '',
    url: process.env.MILLIONVERIFIER_API_URL || '',
  },
  zerobounce: {
    apiKey: process.env.ZEROBOUNCE_API_KEY || '',
    url: 'https://api-us.zerobounce.net/v2/validate',
    maxAttempts: Number(process.env.ZEROBOUNCE_MAX_ATTEMPTS) || 3,
    attemptsTtl: Number(process.env.ZEROBOUNCE_ATTEMPTS_TTL) || 3600, // 1 hour in seconds
  },
  verifications: {
    frontendUrl: process.env.FRONTEND_URL || '',
  },
  brevo: {
    apiKey: process.env.BREVO_API_KEY || '',
    apiUrl: process.env.BREVO_API_URL || '',
  },
  characterCache: {
    ttl: Number(process.env.CHARACTER_CACHE_TTL) || 3600,
  },
  image: {
    signedUrl: process.env.SIGNED_BASE_URL || '',
  },
  message: {
    ttl: Number(process.env.MESSAGE_CACHE_TTL) || 3600,
  },
  urlLoader: {
    ttl: Number(process.env.NEXT_LLM_BALANCE_LOADER_URL_ID_TTL) || 3600,
  },
  llmChatCompletionPrompt: {
    url: process.env.LLM_CHAT_COMPLETION_PROMPT_PREPARATION_LAMBDA_URL || '',
    contextLength: Number(process.env.LLM_CONTEXT_LENGTH) || 4096,
    retryCount: Number(process.env.LLM_RETRY_COUNT) || 3,
    delay: Number(process.env.LLM_DELAY) || 1000,
    chatmlUrl:
      process.env.LLM_CHATML_CHAT_COMPLETION_PROMPT_PREPARATION_LAMBDA_URL || '',
    mistralUrl:
      process.env.LLM_MISTRAL_CHAT_COMPLETION_PROMPT_PREPARATION_LAMBDA_URL || '',
    alpacaUrl:
      process.env.LLM_ALPACA_CHAT_COMPLETION_PROMPT_PREPARATION_LAMBDA_URL || '',
  },
  llmParameters: {
    temperature: Number(process.env.LLM_PARAMS_TEMPERATURE) || 0.7,
    minP: Number(process.env.LLM_PARAMS_MIN_P) || 0.1,
    maxTokens: Number(process.env.LLM_PARAMS_MAX_TOKENS) || 1000,
    repetitionPenalty: Number(process.env.LLM_PARAMS_REPETITION_PENALTY) || 1.1,
    repetitionPenaltyRange: Number(
      process.env.LLM_PARAMS_REPETITION_PENALTY_RANGE,
    ) || 1024,
    summaryTemperature: Number(process.env.LLM_SUMMARY_PARAMS_TEMPERATURE) || 0.7,
    summaryMaxTokens: Number(process.env.LLM_SUMMARY_PARAMS_MAX_TOKENS) || 500,
  },
  slack: {
    urgentWebhookUrl: process.env.SLACK_URGENT_WEBHOOK_URL || '',
    generalWebhookUrl: process.env.SLACK_GENERAL_WEBHOOK_URL || '',
    salesWebhookUrl: process.env.SLACK_SALES_WEBHOOK_URL || '',
    customerSupportUrl: process.env.SLACK_CUSTOMER_SUPPORT_URL || '',
  },
  ttsConfig: {
    url: process.env.TTS_V2_LINK || '',
  },
  cdnConfig: {
    url: process.env.CDN_URL || '',
  },
  imageGeneration: {
    cost: Number(process.env.IMAGE_GENERATION_COST) || 1,
    cost5Tokens: Number(process.env.IMAGE_GENERATION_COST_5_TOKENS) || 5,
    cost3Tokens: Number(process.env.IMAGE_GENERATION_COST_3_TOKENS) || 3,
    upscale: Number(process.env.IMAGE_UPSCALE_COST) || 1,
    maxRetries: Number(process.env.IMAGE_GENERATION_MAX_RETRIES) || 3,
    retryDelay: Number(process.env.IMAGE_GENERATION_DELAY) || 1000,
    videoCost: Number(process.env.VIDEO_GENERATION_COST) || 10,
  },
  characterGeneration: {
    generationWithPresetsModel:
      process.env.CHARACTER_GENERATION_WITH_PRESETS_MODEL || '',
  },
  foundationalModel: {
    maxTokens: Number(process.env.FOUNDATIONAL_MODEL_MAX_TOKENS) || 1000,
    groqName: process.env.FOUNDATIONAL_MODEL_GROQ_NAME || '',
    groqModelForTts: process.env.FOUNDATIONAL_MODEL_GROQ_FOR_TTS || '',
    groqUrl: process.env.FOUNDATIONAL_MODEL_GROQ_URL || '',
    groqSecret: process.env.FOUNDATIONAL_MODEL_GROQ_SECRET || '',
    mistralName: process.env.FOUNDATIONAL_MODEL_MISTRAL_NAME || '',
    mistralUrl: process.env.FOUNDATIONAL_MODEL_MISTRAL_URL || '',
    mistralSecret: process.env.FOUNDATIONAL_MODEL_MISTRAL_SECRET || '',
  },
  openApiModeration: {
    url: process.env.OPEN_AI_MODERATION_URL || '',
    model: process.env.OPEN_AI_MODERATION_MODEL || '',
    secret: process.env.OPEN_AI_MODERATION_SECRET || '',
    customModerationModelAuthToken:
      process.env.CUSTOM_MODERATION_MODEL_AUTH_TOKEN || '',
    customModerationModelEndpoint: process.env.CUSTOM_MODRATION_MODEL_ENDPOINT || '',
  },
  awsBlurredConfig: {
    url: process.env.AWS_BLURRED_URL || '',
  },
  stripeConfig: {
    apiSecret: process.env.STRIPE_API_SECRET || '',
    webhookSecureSecret: process.env.STIRPE_WEBHOOK_SECURE_SECRET || '',
  },
  affiliateConfig: {
    url: process.env.AFFILIATE_API_URL || '',
    firstPromoterSecret: process.env.AFFILEATE_FIRST_PROMOTER_API_SECRET || '',
  },
  trustpayConfig: {
    url: process.env.TRUSTPAY_URL || '',
    tokenUrl: process.env.TRUSTPAY_UPDATE_TOKEN_URL || '',
    tpUsername: process.env.TRUSTPAY_USERNAME || '',
    tpSecret: process.env.TRUSTPAY_SECRET || '',
  },
  trustpayCacheConfig: {
    ttl: Number(process.env.TRUSTPAY_CACHE_TTL) || 3600,
  },
  metaConfig: {
    apiAccessToken: process.env.META_API_ACCESS_TOKEN || '',
  },
  externalAuth: {
    url: process.env.EXTERNAL_AUTH_URL || '',
  },
  abTestConfig: {
    minValue: Number(process.env.AB_TEST_MIN_VALUE) || 0,
    maxValue: Number(process.env.AB_TEST_MAX_VALUE) || 100,
    minValueAdultV3: Number(process.env.AB_TEST_MIN_VALUE_ADULT_V3) || 0,
    maxValueAdultV3: Number(process.env.AB_TEST_MAX_VALUE_ADULT_V3) || 100,
    ttl: Number(process.env.AB_TEST_REDIS_TTL) || 3600,
  },
  sentryConfig: {
    dsn: process.env.SENTRY_DSN || '',
    environment: process.env.SENTRY_ENVIRONMENT || 'local',
  },
  openrouter: {
    url: process.env.OPENROUTER_URL || '',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    model: process.env.OPENROUTER_MODEL || '',
    imageValidationModel: process.env.OPENROUTER_IMAGE_VALIDATION_MODEL || '',
    poseDetectionModel: process.env.OPENROUTER_POSE_DETECTION_MODEL || '',
  },
  googleAiStudio: {
    apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY || '',
    apiUrl: process.env.GOOGLE_AI_STUDIO_API_URL || '',
    model: process.env.GOOGLE_AI_STUDIO_API_MODEL || '',
    poseDetectionModel: process.env.GOOGLE_AI_STUDIO_POSE_DETECTION_MODEL || '',
  },
  paypalConfig: {
    url: process.env.PAYPAL_URL || '',
    clientId: process.env.PAYPAL_CLIENT_ID || '',
    clientSecret: process.env.PAYPAL_SECRET || '',
    webhookId: process.env.PAYPAL_WEBHOOK_ID || '',
  },
  discord: {
    clientID: process.env.DISCORD_CLIENT_ID || '',
    clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
    redirectURI: process.env.AUTH_REDIRECT_URI || '',
    scope: ['identify', 'email'],
  },
  twitter: {
    clientID: process.env.TWITTER_CLIENT_ID || '',
    clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
    redirectURI: process.env.AUTH_REDIRECT_URI || '',
    codeVerifier: 'your_code_verifier',
  },
  mixpanel: {
    token: process.env.MIXPANEL_TOKEN || '',
  },
  shift4Config: {
    apiUrl: process.env.SHIFT4_API_URL || '',
    webhookSecret: process.env.SHIFT4_WEBHOOK_SECRET || '',
    publishableKey: process.env.SHIFT4_PUBLISHABLE_KEY || '',
    tosUrl: process.env.SHIFT4_TOS_URL || '',
  },
  xaiConfig: {
    apiKey: process.env.XAI_API_KEY || '',
    apiUrl: process.env.XAI_API_URL || '',
    model: process.env.XAI_MODEL || '',
    modelForCharacterModeration: process.env.XAI_MODEL_FOR_CHARACTER_MODERATION || '',
  },
  fishAudioConfig: {
    apiKey: process.env.FISH_AUDIO_API_KEY || '',
    apiUrl: process.env.FISH_AUDIO_API_URL || '',
    model: process.env.FISH_AUDIO_MODEL || '',
  },
  mancerConfig: {
    apiKey: process.env.MANCER_API_KEY || '',
    url: process.env.MANCER_API_URL || '',
    model: process.env.MANCER_MODEL || '',
  },
  adminConfig: {
    domain: process.env.ADMIN_VERIFICATION_DOMAIN || '',
    code: process.env.ADMIN_VERIFICATION_CODE || '',
  },
  imageGalleryConfig: {
    albumPurchasePrice: Number(process.env.ALBUM_PURCHASE_PRICE) || 0,
    imagePromptPurchasePrice: Number(process.env.IMAGE_PROMPT_PURCHASE_PRICE) || 0,
  },
  finbyConfig: {
    projectId: process.env.FINBY_PROJECT_ID || '',
    secretKey: process.env.FINBY_SECRET_KEY || '',
    apiKey: process.env.FINBY_API_KEY || undefined,
    merchantId: process.env.FINBY_MERCHANT_ID || undefined,
    baseUrl: process.env.FINBY_BASE_URL || 'https://aapi.finby.eu',
    webhookSecret: process.env.FINBY_WEBHOOK_SECRET || undefined,
    apiVersion: (process.env.FINBY_API_VERSION as 'v1' | 'v3') || 'v1',
  },
});
