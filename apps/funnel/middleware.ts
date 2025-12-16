import { NextRequest, NextResponse } from "next/server";
import { locales } from "./i18n/config";

export default function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Skip middleware for static files and Next.js internal routes
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/_vercel") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    // Get locale from various sources
    const locale = getLocale(request);

    // Set locale cookie for future requests
    const response = NextResponse.next();
    response.cookies.set("NEXT_LOCALE", locale);

    return response;
}

function getLocale(request: NextRequest): string {
    // 1. Check URL parameter first
    const urlParams = request.nextUrl.searchParams;
    const langParam = urlParams.get("lang");
    if (langParam && locales.includes(langParam as any)) {
        return langParam;
    }

    // 2. Check existing cookie
    const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
    if (cookieLocale && locales.includes(cookieLocale as any)) {
        return cookieLocale;
    }

    // 3. Check Accept-Language header
    const acceptLanguage = request.headers.get("accept-language");
    if (acceptLanguage) {
        const preferredLocale = acceptLanguage
            .split(",")
            .map((lang) => lang.split(";")[0].trim())
            .find((lang) => locales.includes(lang as any));

        if (preferredLocale) {
            return preferredLocale;
        }
    }

    // 4. Default to English
    return "en";
}

export const config = {
    matcher: [
        // Skip static files and Next.js internal routes
        "/((?!_next|_vercel|.*\\..*).*)",
    ],
};
