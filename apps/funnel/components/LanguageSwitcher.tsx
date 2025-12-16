"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { locales } from "@/i18n/config";

export default function LanguageSwitcher() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentLang = searchParams?.get("lang") || "en";

    const switchLanguage = (locale: string) => {
        if (!searchParams) return;
        const params = new URLSearchParams(searchParams);
        params.set("lang", locale);
        router.push(`/?${params.toString()}`);
    };

    return (
        <div className="flex gap-2">
            {locales.map((locale) => (
                <Button
                    key={locale}
                    variant={currentLang === locale ? "default" : "outline"}
                    size="sm"
                    onClick={() => switchLanguage(locale)}
                >
                    {locale.toUpperCase()}
                </Button>
            ))}
        </div>
    );
}
