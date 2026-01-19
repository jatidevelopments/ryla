/**
 * Navigation Utilities
 *
 * Type-safe navigation helpers that work with Next.js router
 * and the centralized routes configuration.
 *
 * Usage:
 *   import { useNavigate } from '@/lib/navigation';
 *
 *   const navigate = useNavigate();
 *   navigate.toDashboard();
 *   navigate.toInfluencer('123');
 *   navigate.toStudio({ influencer: '123', imageId: '456' });
 */

'use client';

import { useRouter } from 'next/navigation';
import { routes, buildRoute } from './routes';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * Navigation helper class
 * Provides type-safe navigation methods
 */
class NavigationHelper {
  constructor(private router: AppRouterInstance) {}

  // Public routes
  toHome = () => this.router.push(routes.home);
  toLogin = (returnUrl?: string) => {
    if (returnUrl) {
      this.router.push(
        buildRoute(routes.login, { returnUrl: encodeURIComponent(returnUrl) })
      );
    } else {
      this.router.push(routes.login);
    }
  };
  toRegister = () => this.router.push(routes.register);
  toAuth = (returnUrl?: string) => {
    if (returnUrl) {
      this.router.push(
        buildRoute(routes.auth, { returnUrl: encodeURIComponent(returnUrl) })
      );
    } else {
      this.router.push(routes.auth);
    }
  };
  toForgotPassword = () => this.router.push(routes.forgotPassword);
  toResetPassword = () => this.router.push(routes.resetPassword);

  // Legal routes
  toLegal = () => this.router.push(routes.legal);
  toTerms = () => this.router.push(routes.terms);
  toPrivacy = () => this.router.push(routes.privacy);

  // Core app routes
  toDashboard = () => this.router.push(routes.dashboard);
  toPricing = () => this.router.push(routes.pricing);
  toBuyCredits = () => this.router.push(routes.buyCredits);

  // Wizard routes
  toWizard = {
    root: () => this.router.push(routes.wizard.root),
    step: (stepNumber: number) =>
      this.router.push(routes.wizard.step(stepNumber)),
    step0: () => this.router.push(routes.wizard.step0),
    step1: () => this.router.push(routes.wizard.step1),
    step2: () => this.router.push(routes.wizard.step2),
    step3: () => this.router.push(routes.wizard.step3),
    step4: () => this.router.push(routes.wizard.step4),
    step5: () => this.router.push(routes.wizard.step5),
    step6: () => this.router.push(routes.wizard.step6),
    step7: () => this.router.push(routes.wizard.step7),
    step8: () => this.router.push(routes.wizard.step8),
    step9: () => this.router.push(routes.wizard.step9),
    step10: () => this.router.push(routes.wizard.step10),
    step11: () => this.router.push(routes.wizard.step11),
    step12: () => this.router.push(routes.wizard.step12),
    step13: () => this.router.push(routes.wizard.step13),
    step14: () => this.router.push(routes.wizard.step14),
    step15: () => this.router.push(routes.wizard.step15),
    step16: () => this.router.push(routes.wizard.step16),
    step17: () => this.router.push(routes.wizard.step17),
    step18: () => this.router.push(routes.wizard.step18),
    step19: () => this.router.push(routes.wizard.step19),
    step20: () => this.router.push(routes.wizard.step20),
    step21: () => this.router.push(routes.wizard.step21),
    step22: () => this.router.push(routes.wizard.step22),
    baseImage: () => this.router.push(routes.wizard.baseImage),
    profilePictures: () => this.router.push(routes.wizard.profilePictures),
  };

  // Studio routes
  toStudio = (params?: { influencer?: string; imageId?: string }) => {
    if (params) {
      this.router.push(buildRoute(routes.studio, params));
    } else {
      this.router.push(routes.studio);
    }
  };

  // Templates routes
  toTemplates = () => this.router.push(routes.templates);

  // Activity routes
  toActivity = () => this.router.push(routes.activity);

  // Influencer routes
  toInfluencer = {
    detail: (id: string) => this.router.push(routes.influencer.detail(id)),
  };

  // Settings routes
  toSettings = () => this.router.push(routes.settings);

  // Onboarding routes
  toOnboarding = {
    root: () => this.router.push(routes.onboarding.root),
    step: (stepNumber: number) =>
      this.router.push(routes.onboarding.step(stepNumber)),
    complete: () => this.router.push(routes.onboarding.complete),
  };

  // Payment routes
  toPayment = {
    success: () => this.router.push(routes.payment.success),
    cancel: () => this.router.push(routes.payment.cancel),
    error: () => this.router.push(routes.payment.error),
  };

  // Preview routes
  toPreview = {
    outfitPicker: () => this.router.push(routes.preview.outfitPicker),
    outfitCompositionPicker: () =>
      this.router.push(routes.preview.outfitCompositionPicker),
  };

  // Generic navigation methods
  push = (path: string) => this.router.push(path);
  replace = (path: string) => this.router.replace(path);
  back = () => this.router.back();
  forward = () => this.router.forward();
  refresh = () => this.router.refresh();
}

/**
 * Hook to get type-safe navigation helper
 *
 * @example
 * const navigate = useNavigate();
 * navigate.toDashboard();
 * navigate.toInfluencer.detail('123');
 */
export function useNavigate(): NavigationHelper {
  const router = useRouter();
  return new NavigationHelper(router);
}
