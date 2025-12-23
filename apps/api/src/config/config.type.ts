export type Config = {
  app: AppConfig;
  postgres: PostgresConfig;
  redis: RedisConfig;
  jwt: JwtConfig;
  aws: AwsConfig;
  google: GoogleConfig;
  swagger: SwaggerConfig;
  // ... other types mapped as any or defined if needed. 
  // For brevity/mvp, I'll include the ones defined in MDC configuration.ts 
  // but typed loosely where I missed copying the type exactly to avoid errors.
  // Actually, I have the full file content from read_file, I will use that.
  millionVerifier: MillionVerifierConfig;
  zerobounce: ZerobounceConfig;
  verifications: Verifications;
  brevo: BrevoConfig;
  characterCache: CharacterCacheConfig;
  image: ImageConfig;
  message: MessageCacheConfig;
  urlLoader: UrlLoaderCacheConfig;
  llmChatCompletionPrompt: LlmConfig;
  llmParameters: LlmParamConfig;
  slack: SlackConfig;
  ttsConfig: TtsConfig;
  cdnConfig: CDNConfig;
  imageGeneration: ImageGenerationCostConfig;
  characterGeneration: CharacterGenerationConfig;
  foundationalModel: FoundationalModelConfig;
  openApiModeration: OpenApiModerationConfig;
  awsBlurredConfig: AwsBlurredConfig;
  stripeConfig: StripeConfig;
  affiliateConfig: AffiliateConfig;
  trustpayConfig: TrustpayConfig;
  trustpayCacheConfig: TrustpayCacheConfig;
  metaConfig: MetaConfig;
  externalAuth: ExternalAuth;
  abTestConfig: AbTestConfig;
  sentryConfig: SentryConfig;
  openrouter: OpenrouterConfig;
  googleAiStudio: GoogleAiStudioConfig;
  paypalConfig: PaypalConfig;
  discord: DiscordConfig;
  twitter: TwitterConfig;
  adminConfig: AdminConfig;
  mixpanel: MixpanelConfig;
  shift4Config: Shift4Config;
  xaiConfig: XaiConfig;
  fishAudioConfig: FishAudioConfig;
  mancerConfig: MancerConfig;
  imageGalleryConfig: ImageGalleryConfig;
};

export type AppConfig = {
  port: number;
  host: string;
  environment: string;
};

export type PostgresConfig = {
  port: number;
  host: string;
  user: string;
  password: string;
  dbName: string;
  environment: string;
};

export type RedisConfig = {
  port: number;
  host: string;
  password: string;
  environment: string;
};

export type JwtConfig = {
  accessSecret: string;
  accessExpiresIn: number;
  refreshSecret: string;
  refreshExpiresIn: number;
  actionForgotPasswordSecret: string;
  actionForgotPasswordExpiresIn: number;
};

export type GoogleConfig = {
  clientID: string;
  clientSecret: string;
  redirectURI: string;
  callbackURL: string;
};

export type SwaggerConfig = {
  password: string;
};

export type MillionVerifierConfig = {
  apiKey: string;
  url: string;
};

export type Verifications = {
  frontendUrl: string;
};

export type BrevoConfig = {
  apiKey: string;
  apiUrl: string;
};

export type CharacterCacheConfig = {
  ttl: number;
};

export type ImageConfig = {
  signedUrl: string;
};

export type MessageCacheConfig = {
  ttl: number;
};

export type UrlLoaderCacheConfig = {
  ttl: number;
};

export type LlmConfig = {
  url: string; // TBD: remove
  chatmlUrl: string;
  mistralUrl: string;
  alpacaUrl: string;
  contextLength: number;
  retryCount: number;
  delay: number;
};

export type LlmParamConfig = {
  temperature: number;
  minP: number;
  maxTokens: number;
  repetitionPenalty: number;
  repetitionPenaltyRange: number;
  summaryMaxTokens: number;
  summaryTemperature: number;
};

export type SlackConfig = {
  urgentWebhookUrl: string;
  generalWebhookUrl: string;
  salesWebhookUrl: string;
  customerSupportUrl: string;
};

export type TtsConfig = {
  url: string;
};

export type CDNConfig = {
  url: string;
};

export type ImageGenerationCostConfig = {
  cost: number;
  cost5Tokens: number;
  cost3Tokens: number;
  upscale: number;
  maxRetries: number;
  retryDelay: number;
  videoCost: number;
};

export type AwsConfig = {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  urlTtl: number;
  /** Custom S3 endpoint for MinIO or other S3-compatible storage */
  endpoint?: string;
  /** Force path style for S3 (required for MinIO) */
  forcePathStyle?: boolean;
};
export type FoundationalModelConfig = {
  maxTokens: number;
  groqName: string;
  groqModelForTts: string;
  groqUrl: string;
  groqSecret: string;
  mistralName: string;
  mistralUrl: string;
  mistralSecret: string;
};
export type OpenApiModerationConfig = {
  url: string;
  model: string;
  secret: string;
  customModerationModelAuthToken: string;
  customModerationModelEndpoint: string;
};

export type AwsBlurredConfig = {
  url: string;
};

export type StripeConfig = {
  apiSecret: string;
  webhookSecureSecret: string;
};

export type AffiliateConfig = {
  url: string;
  firstPromoterSecret: string;
};

export type TrustpayConfig = {
  url: string;
  tokenUrl: string;
  tpUsername: string;
  tpSecret: string;
};

export type TrustpayCacheConfig = {
  ttl: number;
};

export type MetaConfig = {
  apiAccessToken: string;
};

export type ExternalAuth = {
  url: string;
};
export type AbTestConfig = {
  minValue: number;
  maxValue: number;
  minValueAdultV3: number;
  maxValueAdultV3: number;
  ttl: number;
};
export type SentryConfig = {
  dsn: string;
  environment: string;
};

export type OpenrouterConfig = {
  url: string;
  apiKey: string;
  model: string;
  imageValidationModel: string;
  poseDetectionModel: string;
};

export type GoogleAiStudioConfig = {
  apiKey: string;
  apiUrl: string;
  model: string;
  poseDetectionModel: string;
};

export type PaypalConfig = {
  url: string;
  clientId: string;
  clientSecret: string;
  webhookId: string;
};

export type DiscordConfig = {
  clientID: string;
  clientSecret: string;
  redirectURI: string;
  scope: string[];
};

export type TwitterConfig = {
  clientID: string;
  clientSecret: string;
  redirectURI: string;
  codeVerifier: string;
};

export type MixpanelConfig = {
  token: string;
};

export type Shift4Config = {
  apiUrl: string;
  // apiKey: string;
  // secretKey: string;
  webhookSecret: string;
  publishableKey: string;
  tosUrl: string;
};

export type XaiConfig = {
  apiKey: string;
  apiUrl: string;
  model: string;
  modelForCharacterModeration: string;
};

export type FishAudioConfig = {
  apiKey: string;
  apiUrl: string;
  model: string;
};

export type MancerConfig = {
  apiKey: string;
  url: string;
  model: string;
};

export type ZerobounceConfig = {
  apiKey: string;
  url: string;
  maxAttempts: number;
  attemptsTtl: number;
};

export type AdminConfig = {
  domain: string;
  code: string;
};

export type CharacterGenerationConfig = {
  generationWithPresetsModel: string;
};

export type ImageGalleryConfig = {
  albumPurchasePrice: number;
  imagePromptPurchasePrice: number;
};

