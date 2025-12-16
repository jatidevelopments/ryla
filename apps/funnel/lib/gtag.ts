declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
        dataLayer?: any[];
    }
}

const ADS_ID = "AW-16515055993";
const SEND_TO = {
    purchase: `${ADS_ID}/VknOCJqP-ZIbEPmC_8I9`,
    signup: `${ADS_ID}/ztJvCKrt-ZIbEPmC_8I9`,
    email: `${ADS_ID}/ZG5eCPiy-pIbEPmC_8I9`,
};


const queue: Array<() => void> = [];
function flushQueue() {
    while (queue.length) queue.shift()?.();
}
function safeGtag(...args: any[]) {
    if (typeof window === "undefined") return;
    if (typeof window.gtag === "function") {
        window.gtag(...args);
        flushQueue();
    } else {
        queue.push(() => window.gtag?.(...args));
    }
}


const sentEventIds = new Set<string>();
function withDedup(eventId?: string, fn?: () => void) {
    if (!eventId) return fn?.();
    if (sentEventIds.has(eventId)) return;
    sentEventIds.add(eventId);
    fn?.();
}

type CallbackUrl = string | undefined;

/** PURCHASE */
export function reportPurchase(
    transactionId: string,
    opts?: { value?: number; currency?: string; url?: CallbackUrl; eventId?: string },
) {
    const { value, currency, url, eventId } = opts ?? {};
    const eventPayload: Record<string, any> = {
        send_to: SEND_TO.purchase,
        transaction_id: transactionId ?? "",
    };
    if (typeof value === "number") eventPayload.value = value;
    if (currency) eventPayload.currency = currency;

    const callback = () => {
        if (url) window.location.href = url;
    };

    withDedup(eventId, () => {
        safeGtag("event", "conversion", { ...eventPayload, event_callback: callback });
    });
}

/** SIGN UP */
export function reportSignUp(url?: CallbackUrl, eventId?: string) {
    const callback = () => {
        if (url) window.location.href = url;
    };
    withDedup(eventId, () => {
        safeGtag("event", "conversion", { send_to: SEND_TO.signup, event_callback: callback });
    });
}

/** EMAIL VERIFIED */
export function reportEmailVerified(url?: CallbackUrl, eventId?: string) {
    const callback = () => {
        if (url) window.location.href = url;
    };
    withDedup(eventId, () => {
        safeGtag("event", "conversion", { send_to: SEND_TO.email, event_callback: callback });
    });
}
