"use client";
import mixpanel from "mixpanel-browser";
import { SignUpEventProps, PaymentEventProps } from "@/utils/types/analytics";

const FUNNEL_NAME = process.env.NEXT_PUBLIC_FUNNEL_NAME || "funnel-adult-v3";
const FUNNEL_TYPE = process.env.NEXT_PUBLIC_FUNNEL_TYPE || "hard_paywall";

function getFunnelProps() {
    return { funnel_name: FUNNEL_NAME, funnel_type: FUNNEL_TYPE };
}

class AnalyticsService {
    private isInitialized = false;

    constructor() {
        this.initializeMixpanel();
    }

    private initializeMixpanel() {
        // Mixpanel disabled - tracking moved to PostHog
        // if (typeof window !== "undefined" && !this.isInitialized) {
        //     const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

        //     if (!token) {
        //         console.warn("Mixpanel token not found. Analytics tracking will be disabled.");
        //         return;
        //     }

        //     const isDevelopment = process.env.NODE_ENV === "development";

        //     mixpanel.init(token, {
        //         debug: isDevelopment,
        //         track_pageview: false,
        //         persistence: "localStorage",
        //     });

        //     try {
        //         const stored = localStorage.getItem("utm_params");
        //         if (stored) {
        //             const utm = JSON.parse(stored);
        //             mixpanel.register({ ...utm, tid: utm?.deal });
        //         }
        //     } catch {}

        //     mixpanel.register(getFunnelProps());

        //     this.isInitialized = true;
        //     console.log("[Mixpanel] initialized", getFunnelProps());
        // }
        this.isInitialized = false; // Keep false to disable all Mixpanel tracking
    }

    private isTrackingEnabled() {
        const isProduction = process.env.NODE_ENV === "production";
        const enableDevTracking = process.env.NEXT_PUBLIC_ENABLE_DEV_ANALYTICS === "true";
        return isProduction || enableDevTracking;
    }

    async trackSignUpEvent(eventName: string, props: SignUpEventProps): Promise<void> {
        // Mixpanel disabled - tracking moved to PostHog
        // if (!this.isInitialized || !this.isTrackingEnabled()) return;

        // const { distinct_id, tid, utmOnRegistration = {} } = props;
        // const payload = {
        //     distinct_id,
        //     tid: tid || utmOnRegistration?.deal || "",
        //     time: new Date(),
        //     ...getFunnelProps(),
        //     ...utmOnRegistration,
        // };

        // console.log("[Mixpanel signup]", eventName, payload);
        // mixpanel.track(eventName, payload);

        // try {
        //     if (utmOnRegistration?.deal) {
        //         (mixpanel as any).people?.set?.(distinct_id.toString(), {
        //             affiliateRef: utmOnRegistration.deal,
        //             tid: payload.tid,
        //             ...getFunnelProps(),
        //         });
        //     }
        // } catch {}
        console.log("[Mixpanel disabled] trackSignUpEvent:", eventName, props);
    }

    async trackPaymentEvent(eventName: string, props: PaymentEventProps): Promise<void> {
        // Mixpanel disabled - tracking moved to PostHog
        // if (!this.isInitialized || !this.isTrackingEnabled()) return;

        // const payload = {
        //     ...props,
        //     ...getFunnelProps(),
        //     time: new Date(),
        // };

        // console.log("[Mixpanel payment]", eventName, payload);
        // mixpanel.track(eventName, payload);
        console.log("[Mixpanel disabled] trackPaymentEvent:", eventName, props);
    }

    identify(userId: string) {
        // Mixpanel disabled - tracking moved to PostHog
        // if (!this.isInitialized) return;
        // console.log("[Mixpanel identify]", userId);
        // try {
        //     mixpanel.identify(userId);

        //     (mixpanel as any).people?.set?.(userId, getFunnelProps());
        // } catch {}
        console.log("[Mixpanel disabled] identify:", userId);
    }

    setUserProperties(userId: string, properties: Record<string, any>) {
        // Mixpanel disabled - tracking moved to PostHog
        // if (!this.isInitialized) return;
        // const merged = { ...getFunnelProps(), ...properties };
        // console.log("[Mixpanel setUserProperties]", userId, merged);
        // try {
        //     (mixpanel as any).people?.set?.(userId, merged);
        // } catch {}
        console.log("[Mixpanel disabled] setUserProperties:", userId, properties);
    }

    track(eventName: string, properties?: Record<string, any>) {
        // Mixpanel disabled - tracking moved to PostHog
        // if (!this.isInitialized || !this.isTrackingEnabled()) return;

        // const payload = { ...getFunnelProps(), ...properties, time: new Date() };
        // console.log("[Mixpanel track]", eventName, payload);
        // mixpanel.track(eventName, payload);
        console.log("[Mixpanel disabled] track:", eventName, properties);
    }
}

export const analyticsService = new AnalyticsService();
