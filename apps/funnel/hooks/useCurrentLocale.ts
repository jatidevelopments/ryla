"use client";

import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export function useCurrentLocale() {
    const nextIntlLocale = useLocale();
    const searchParams = useSearchParams();
    const urlLocale = searchParams?.get("lang") || null;

    const currentLocale = useMemo(() => {
        return urlLocale || nextIntlLocale || "en";
    }, [urlLocale, nextIntlLocale]);

    return {
        locale: currentLocale,
        localeFromUrl: urlLocale,
        localeFromNextIntl: nextIntlLocale,
        isEnglish: currentLocale === "en",
        isSpanish: currentLocale === "es",
        isFrench: currentLocale === "fr",
    };
}
