// Temporarily disabled to fix React 18 compatibility
// import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";
import Link from "next/link";
import { redirect as NextRedirect, usePathname as NextUsePathname, useRouter as NextUseRouter } from "next/navigation";

// Lightweight wrappers around Next.js' navigation
// APIs that consider the routing configuration
export type Locale = (typeof routing.locales)[number];

// Mock navigation functions
export { Link };
export const redirect = NextRedirect;
export const usePathname = NextUsePathname;
export const useRouter = NextUseRouter;
export const getPathname = (pathname: string) => pathname;
