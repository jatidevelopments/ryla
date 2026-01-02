// Temporarily disabled to fix React 18 compatibility
// import { defineRouting } from "next-intl/routing";
import { locales } from "@/i18n/config";

// Mock routing config
export const routing = {
    // A list of all locales that are supported
    locales: locales,

    // Used when no locale matches
    defaultLocale: "en" as const,

    // Disable locale prefix in URLs
    localePrefix: "never" as const,
};
