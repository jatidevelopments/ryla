import { defineRouting } from "next-intl/routing";
import { locales } from "@/i18n/config";

export const routing = defineRouting({
    // A list of all locales that are supported
    locales: locales,

    // Used when no locale matches
    defaultLocale: "en",

    // Disable locale prefix in URLs
    localePrefix: "never",
});
