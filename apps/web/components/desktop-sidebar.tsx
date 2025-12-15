"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@ryla/ui";
import { cn } from "@ryla/ui";

// Icons
const ExploreIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className={cn("h-5 w-5 shrink-0", className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
    />
  </svg>
);

const AiUserIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className={cn("h-5 w-5 shrink-0", className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
    />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    className={cn("h-5 w-5 shrink-0", className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.5v15m7.5-7.5h-15"
    />
  </svg>
);

const ImageIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className={cn("h-5 w-5 shrink-0", className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
    />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className={cn("h-5 w-5 shrink-0", className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const CrownIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className={cn("h-5 w-5 shrink-0", className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 7l3 9h12l3-9-4.5 3L12 4l-4.5 6L3 7zm3 9v4h12v-4"
    />
  </svg>
);

const menuItems = [
  {
    title: "Explore",
    url: "/dashboard",
    icon: ExploreIcon,
    isActive: (pathname: string) => pathname === "/dashboard",
  },
  {
    title: "My AI",
    url: "/influencer",
    icon: AiUserIcon,
    isActive: (pathname: string) => pathname.startsWith("/influencer"),
  },
  {
    title: "Create",
    url: "/wizard/step-1",
    icon: PlusIcon,
    isActive: (pathname: string) => pathname.startsWith("/wizard"),
    highlight: true,
  },
  {
    title: "Studio",
    url: "/studio",
    icon: ImageIcon,
    isActive: (pathname: string) => pathname.startsWith("/studio"),
  },
];

const secondaryItems = [
  {
    title: "Settings",
    url: "/settings",
    icon: SettingsIcon,
    isActive: (pathname: string) => pathname === "/settings",
  },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const { open, openMobile, isMobile, setOpenMobile } = useSidebar();
  const isExpanded = isMobile ? openMobile : open;

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar>
      {/* Header with Logo */}
      <SidebarHeader className={cn(isExpanded ? "px-6" : "px-3")}>
        <Link
          href="/dashboard"
          onClick={handleLinkClick}
          className={cn(
            "flex items-center",
            isExpanded ? "justify-start" : "justify-center"
          )}
        >
          {isExpanded ? (
            <span className="text-2xl font-bold bg-gradient-to-r from-[#d5b9ff] to-[#b99cff] bg-clip-text text-transparent">
              RYLA
            </span>
          ) : (
            <span className="text-xl font-bold bg-gradient-to-r from-[#d5b9ff] to-[#b99cff] bg-clip-text text-transparent">
              R
            </span>
          )}
        </Link>
        {/* Collapse toggle - desktop only */}
        {!isMobile && (
          <SidebarTrigger className="absolute right-0 top-4 translate-x-1/2 bg-[#121214] border border-white/10 rounded-full p-1.5" />
        )}
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            const isActive = item.isActive(pathname || "");
            return (
              <SidebarMenuItem key={item.title}>
                <Link href={item.url} onClick={handleLinkClick}>
                  <SidebarMenuButton
                    isActive={isActive}
                    className={cn(
                      item.highlight &&
                        !isActive &&
                        "bg-gradient-to-r from-[#d5b9ff]/10 to-[#b99cff]/10 hover:from-[#d5b9ff]/20 hover:to-[#b99cff]/20 text-[#d5b9ff]"
                    )}
                  >
                    <item.icon />
                    {isExpanded && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        {/* Divider */}
        <div className="my-4 border-t border-white/10" />

        {/* Secondary Navigation */}
        <SidebarMenu>
          {secondaryItems.map((item) => {
            const isActive = item.isActive(pathname || "");
            return (
              <SidebarMenuItem key={item.title}>
                <Link href={item.url} onClick={handleLinkClick}>
                  <SidebarMenuButton isActive={isActive}>
                    <item.icon />
                    {isExpanded && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        {/* Premium CTA */}
        <button
          className={cn(
            "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors border border-white/10 hover:bg-white/5",
            isExpanded ? "justify-start" : "justify-center"
          )}
        >
          <CrownIcon className="text-[#d5b9ff]" />
          {isExpanded && (
            <span className="bg-gradient-to-r from-[#d5b9ff] to-[#b99cff] bg-clip-text text-transparent font-semibold">
              Upgrade
            </span>
          )}
        </button>

        {/* Credits display */}
        {isExpanded && (
          <div className="mt-3 flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
            <span className="text-xs text-white/60">Credits</span>
            <span className="text-sm font-semibold text-white">250</span>
          </div>
        )}

        {/* Legal links - only when expanded */}
        {isExpanded && (
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-[10px] text-white/40">
            <Link href="/legal" className="hover:text-white/60">
              Terms
            </Link>
            <span>•</span>
            <Link href="/legal" className="hover:text-white/60">
              Privacy
            </Link>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

