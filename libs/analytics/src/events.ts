/**
 * Analytics event definitions
 * Matches docs/analytics/TRACKING-PLAN.md
 */

// User lifecycle events
export const USER_EVENTS = {
  SIGNED_UP: 'user.signed_up',
  ACTIVATED: 'user.activated',
  RETURNED: 'user.returned',
  CHURNED: 'user.churned',
} as const;

// Onboarding events
export const ONBOARDING_EVENTS = {
  STARTED: 'onboarding.started',
  STEP_COMPLETED: 'onboarding.step_completed',
  COMPLETED: 'onboarding.completed',
  ABANDONED: 'onboarding.abandoned',
} as const;

// Core feature events
export const CORE_EVENTS = {
  ACTION_STARTED: 'core.action_started',
  ACTION_COMPLETED: 'core.action_completed',
  ACTION_FAILED: 'core.action_failed',
} as const;

// Conversion events
export const CONVERSION_EVENTS = {
  PAYWALL_VIEWED: 'paywall.viewed',
  TRIAL_STARTED: 'trial.started',
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
} as const;

// Error events
export const ERROR_EVENTS = {
  OCCURRED: 'error.occurred',
  API: 'error.api',
} as const;

// Activity events (EP-016)
export const ACTIVITY_EVENTS = {
  VIEWED: 'activity_viewed',
  FILTER_CHANGED: 'activity_filter_changed',
  ITEM_CLICKED: 'activity_item_clicked',
  LOAD_MORE: 'activity_load_more',
} as const;

// Tutorial events (EP-024)
export const TUTORIAL_EVENTS = {
  STARTED: 'tutorial.started',
  STEP_VIEWED: 'tutorial.step_viewed',
  COMPLETED: 'tutorial.completed',
  SKIPPED: 'tutorial.skipped',
  RESTARTED: 'tutorial.restarted',
} as const;

// Template Gallery events (IN-011: EP-047, EP-049)
export const TEMPLATE_GALLERY_EVENTS = {
  // Navigation
  TAB_CHANGED: 'template_gallery.tab_changed',
  SORT_CHANGED: 'template_gallery.sort_changed',
  CONTENT_TYPE_CHANGED: 'template_gallery.content_type_changed',
  CATEGORY_SELECTED: 'template_gallery.category_selected',
  EXPANDED: 'template_gallery.expanded',

  // Template interactions
  CARD_CLICKED: 'template_gallery.card_clicked',
  APPLY_MODAL_OPENED: 'template_gallery.apply_modal_opened',
  TEMPLATE_APPLIED: 'template_gallery.template_applied',

  // Likes
  TEMPLATE_LIKED: 'template_gallery.template_liked',
  TEMPLATE_UNLIKED: 'template_gallery.template_unliked',
  SET_LIKED: 'template_gallery.set_liked',
  SET_UNLIKED: 'template_gallery.set_unliked',

  // Sets
  SET_CREATED: 'template_gallery.set_created',
  SET_UPDATED: 'template_gallery.set_updated',
  SET_DELETED: 'template_gallery.set_deleted',
  SET_APPLIED: 'template_gallery.set_applied',
  SET_VIEWED: 'template_gallery.set_viewed',

  // Tags & Categories
  TAG_ADDED: 'template_gallery.tag_added',
  TAG_REMOVED: 'template_gallery.tag_removed',
  AUTO_TAGGED: 'template_gallery.auto_tagged',
} as const;