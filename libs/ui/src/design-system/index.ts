/**
 * RYLA Design System
 *
 * Export all design tokens, theme utilities, and component variants
 */

export * from './tokens';

// Export variants individually to avoid conflicts with component exports
// (buttonVariants is exported from button.tsx component instead)
export {
  inputVariants,
  cardVariants,
  badgeVariants,
  textVariants,
  avatarVariants,
  skeletonVariants,
  optionCardVariants,
  progressVariants,
  progressIndicatorVariants,
  switchVariants,
  type InputVariants,
  type CardVariants,
  type BadgeVariants,
  type TextVariants,
  type AvatarVariants,
  type SkeletonVariants,
  type OptionCardVariants,
  type ProgressVariants,
  type SwitchVariants,
} from './variants';

// Export design system buttonVariants with a different name to avoid conflict
export { buttonVariants as dsButtonVariants, type ButtonVariants as DSButtonVariants } from './variants';

