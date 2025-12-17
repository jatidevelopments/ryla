'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@ryla/ui';
import { cn } from '@ryla/ui';

// Icons
const UsersIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className={cn('h-5 w-5 shrink-0', className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
    />
  </svg>
);

const PlusCircleIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className={cn('h-5 w-5 shrink-0', className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const PhotoIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className={cn('h-5 w-5 shrink-0', className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
    />
  </svg>
);

const CogIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className={cn('h-5 w-5 shrink-0', className)}
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

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={cn('h-5 w-5 shrink-0', className)}
  >
    <path
      fillRule="evenodd"
      d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z"
      clipRule="evenodd"
    />
  </svg>
);

const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    className={cn('h-4 w-4 shrink-0', className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 19.5L8.25 12l7.5-7.5"
    />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    className={cn('h-4 w-4 shrink-0', className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 4.5l7.5 7.5-7.5 7.5"
    />
  </svg>
);

const menuItems = [
  {
    title: 'My Influencers',
    url: '/dashboard',
    icon: UsersIcon,
    isActive: (pathname: string) => pathname === '/dashboard',
  },
  {
    title: 'Create',
    url: '/wizard/step-0',
    icon: PlusCircleIcon,
    isActive: (pathname: string) => pathname.startsWith('/wizard'),
    highlight: true,
  },
  {
    title: 'Studio',
    url: '/studio',
    icon: PhotoIcon,
    isActive: (pathname: string) => pathname.startsWith('/studio'),
  },
];

const secondaryItems = [
  {
    title: 'Settings',
    url: '/settings',
    icon: CogIcon,
    isActive: (pathname: string) => pathname === '/settings',
  },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const { open, setOpen, openMobile, isMobile, setOpenMobile } = useSidebar();
  const isExpanded = isMobile ? openMobile : open;

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const toggleSidebar = () => {
    if (!isMobile) {
      setOpen(!open);
    }
  };

  return (
    <Sidebar>
      {/* Header with Logo */}
      <SidebarHeader className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            onClick={handleLinkClick}
            className="flex items-center"
          >
            <Image
              src="/logos/Ryla_Logo_white.png"
              alt="RYLA"
              width={100}
              height={32}
              className={cn(
                'transition-all duration-300',
                isExpanded ? 'h-8 w-auto' : 'h-7 w-auto'
              )}
            />
          </Link>

          {/* Collapse toggle - desktop only */}
          {!isMobile && isExpanded && (
            <button
              onClick={toggleSidebar}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-all"
            >
              <ChevronLeftIcon />
            </button>
          )}
        </div>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent className="px-4 py-4">
        <div className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = item.isActive(pathname || '');
            return (
              <Link
                key={item.title}
                href={item.url}
                onClick={handleLinkClick}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-white/70 hover:bg-white/5 hover:text-white',
                  item.highlight &&
                    !isActive &&
                    'bg-gradient-to-r from-[var(--purple-600)]/15 to-[var(--pink-500)]/15 text-[var(--purple-300)] hover:from-[var(--purple-600)]/25 hover:to-[var(--pink-500)]/25',
                  !isExpanded && 'justify-center px-0'
                )}
              >
                <item.icon
                  className={cn(
                    'transition-colors shrink-0',
                    isActive
                      ? 'text-[var(--purple-400)]'
                      : item.highlight
                      ? 'text-[var(--purple-400)]'
                      : 'text-white/70'
                  )}
                />
                {isExpanded && <span className="truncate">{item.title}</span>}
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-white/5" />

        {/* Secondary Navigation */}
        <div className="space-y-1.5">
          {secondaryItems.map((item) => {
            const isActive = item.isActive(pathname || '');
            return (
              <Link
                key={item.title}
                href={item.url}
                onClick={handleLinkClick}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-white/70 hover:bg-white/5 hover:text-white',
                  !isExpanded && 'justify-center px-0'
                )}
              >
                <item.icon
                  className={cn(
                    'transition-colors shrink-0',
                    isActive ? 'text-[var(--purple-400)]' : 'text-white/70'
                  )}
                />
                {isExpanded && <span className="truncate">{item.title}</span>}
              </Link>
            );
          })}
        </div>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="px-4 pb-5 border-t border-white/5">
        {/* Expand button when collapsed */}
        {!isMobile && !isExpanded && (
          <button
            onClick={toggleSidebar}
            className="flex h-10 w-full items-center justify-center rounded-xl bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all mb-3"
          >
            <ChevronRightIcon />
          </button>
        )}

        {/* Premium CTA */}
        <button
          className={cn(
            'w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
            'bg-gradient-to-r from-[var(--purple-600)]/15 to-[var(--pink-500)]/15',
            'hover:from-[var(--purple-600)]/25 hover:to-[var(--pink-500)]/25',
            'border border-white/5 hover:border-white/10',
            !isExpanded && 'justify-center px-0'
          )}
        >
          <SparklesIcon className="text-[var(--purple-400)] shrink-0" />
          {isExpanded && (
            <span className="bg-gradient-to-r from-[var(--purple-400)] to-[var(--pink-400)] bg-clip-text text-transparent font-semibold">
              Upgrade to Pro
            </span>
          )}
        </button>

        {/* Credits display */}
        {isExpanded && (
          <div className="mt-3 flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--purple-700)]/80 to-[var(--purple-800)]/80 border border-[var(--purple-500)]/30 px-3 py-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-[var(--purple-500)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-3.5 w-3.5 text-white"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.21z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-white">250</span>
            <span className="text-xs text-white/60">credits</span>
          </div>
        )}

        {/* Legal links - only when expanded */}
        {isExpanded && (
          <div className="mt-4 flex justify-center gap-3 text-[11px] text-white/50">
            <Link
              href="/legal"
              className="hover:text-white/70 transition-colors"
            >
              Terms
            </Link>
            <span className="text-white/20">•</span>
            <Link
              href="/legal"
              className="hover:text-white/70 transition-colors"
            >
              Privacy
            </Link>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
