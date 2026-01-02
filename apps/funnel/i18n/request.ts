// Temporarily disabled to fix React 18 compatibility
// import { getRequestConfig } from "next-intl/server";
// import { hasLocale } from "next-intl";
import { routing } from "./routing";

// Mock implementation for now
type Locale = typeof routing.locales[number];
export default async function getRequestConfig({ requestLocale }: { requestLocale: Promise<string> }) {
    const locale = await requestLocale;
    const validLocale: Locale = (routing.locales as readonly string[]).includes(locale) ? (locale as Locale) : routing.defaultLocale;

    return {
        locale: validLocale,
        messages: (await import(`@/messages/${validLocale}.json`)).default,
    };
}
