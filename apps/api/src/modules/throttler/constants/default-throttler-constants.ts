/**
 * Default throttle settings for general requests.
 * Controls the default rate limiting across the application.
 * 15 requests per minute.
 */
export const DEFAULT_THROTTLE = {
  ttl: 60000, // 1 minute
  limit: 15, // 15 requests per minute
};

/**
 * Throttle settings for user signup operations.
 * Multi-tiered rate limiting for user registration.
 * 5 requests per minute, 10 requests per hour.
 */
export const SIGNUP_THROTTLE = [
  {
    ttl: 60000, // 1 minute
    limit: 5, // 5 signups per minute
  },
  {
    ttl: 3600000, // 1 hour
    limit: 10, // 10 signups per hour
  },
];

/**
 * Throttle settings for user login operations.
 * Multi-tiered rate limiting for authentication.
 * 15 requests per minute, 40 requests per hour.
 */
export const LOGIN_THROTTLE = [
  {
    ttl: 60000, // 1 minute
    limit: 15, // 15 logins per minute
  },
  {
    ttl: 3600000, // 1 hour
    limit: 40, // 40 logins per hour
  },
];

/**
 * Throttle settings for image generation.
 * Multi-tiered rate limiting for image operations.
 * 64 requests per minute, 250 requests per 5 minutes.
 */
export const IMAGE_THROTTLE = [
  {
    ttl: 60000, // 1 minute
    limit: 64, // 64 images per minute
  },
  {
    ttl: 300000, // 5 minutes
    limit: 250, // 250 images per 5 minutes
  },
];

/**
 * Throttle settings for character creation.
 * Controls the rate of character creation operations.
 * 10 requests per minute.
 */
export const CHARACTER_CREATE_WITH_AI_THROTTLE = {
  ttl: 60000, // 1 minute
  limit: 10, // 10 requests per minute
};

/**
 * Throttle settings for character image regeneration.
 * Controls the rate of character profile image regeneration.
 * 25 requests per minute.
 */
export const CHARACTER_IMAGE_REGENERATE_THROTTLE = {
  ttl: 60000, // 1 minute
  limit: 25, // 25 requests per minute
};

