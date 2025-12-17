'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

const SIDEBAR_WIDTH = '280px';
const SIDEBAR_WIDTH_COLLAPSED = '80px';
const SIDEBAR_COOKIE_NAME = 'ryla_sidebar_state';

type SidebarContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
}

// Hook to detect mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

interface SidebarProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function SidebarProvider({
  children,
  defaultOpen = true,
}: SidebarProviderProps) {
  const isMobile = useIsMobile();
  const [open, setOpenState] = React.useState(defaultOpen);
  const [openMobile, setOpenMobile] = React.useState(false);

  // Persist to cookie
  const setOpen = React.useCallback((value: boolean) => {
    setOpenState(value);
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${value}; path=/; max-age=${
      60 * 60 * 24 * 7
    }`;
  }, []);

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((prev) => !prev);
    } else {
      setOpen(!open);
    }
  }, [isMobile, open, setOpen]);

  // Close mobile sidebar on resize to desktop
  React.useEffect(() => {
    if (!isMobile && openMobile) {
      setOpenMobile(false);
    }
  }, [isMobile, openMobile]);

  const contextValue = React.useMemo(
    () => ({
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
    }),
    [open, setOpen, openMobile, isMobile, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        className="flex min-h-screen w-full"
        style={
          {
            '--sidebar-width': SIDEBAR_WIDTH,
            '--sidebar-width-collapsed': SIDEBAR_WIDTH_COLLAPSED,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export function Sidebar({ children, className, ...props }: SidebarProps) {
  const { open, openMobile, isMobile, setOpenMobile } = useSidebar();

  // Mobile: Sheet/drawer overlay
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {openMobile && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpenMobile(false)}
          />
        )}
        {/* Mobile drawer */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-[280px] border-r border-white/10 transform transition-transform duration-300 ease-out',
            openMobile ? 'translate-x-0' : '-translate-x-full',
            className
          )}
          style={{ backgroundColor: '#121214' }}
          {...props}
        >
          {children}
        </aside>
      </>
    );
  }

  // Desktop: Fixed sidebar
  return (
    <>
      {/* Gap placeholder - ensures main content is pushed right */}
      <div
        className={cn(
          'hidden md:block shrink-0 transition-all duration-200',
          open
            ? 'w-[var(--sidebar-width)]'
            : 'w-[var(--sidebar-width-collapsed)]'
        )}
        aria-hidden="true"
      />
      {/* Fixed sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col fixed inset-y-0 left-0 z-40 border-r border-white/10 transition-all duration-200',
          open
            ? 'w-[var(--sidebar-width)]'
            : 'w-[var(--sidebar-width-collapsed)]',
          className
        )}
        style={{ backgroundColor: '#121214' }}
        {...props}
      >
        {children}
      </aside>
    </>
  );
}

export function SidebarHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 p-4 border-b border-white/10',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SidebarContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex-1 overflow-y-auto px-3 py-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function SidebarFooter({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('p-4 border-t border-white/10 mt-auto', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function SidebarMenu({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul className={cn('flex flex-col gap-1', className)} {...props}>
      {children}
    </ul>
  );
}

export function SidebarMenuItem({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li className={cn('relative', className)} {...props}>
      {children}
    </li>
  );
}

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  asChild?: boolean;
}

export function SidebarMenuButton({
  children,
  className,
  isActive = false,
  ...props
}: SidebarMenuButtonProps) {
  const { open, openMobile, isMobile } = useSidebar();
  const isExpanded = isMobile ? openMobile : open;

  return (
    <button
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        isExpanded ? 'justify-start' : 'justify-center',
        isActive
          ? 'bg-white/10 text-white'
          : 'text-white/60 hover:bg-white/5 hover:text-white',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface SidebarTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function SidebarTrigger({ className, ...props }: SidebarTriggerProps) {
  const { toggleSidebar, open, isMobile } = useSidebar();

  return (
    <button
      onClick={toggleSidebar}
      className={cn(
        'flex items-center justify-center rounded-lg p-2 text-white/60 hover:bg-white/5 hover:text-white transition-colors',
        className
      )}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className={cn(
          'h-5 w-5 transition-transform',
          !isMobile && !open && 'rotate-180'
        )}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 19.5L8.25 12l7.5-7.5"
        />
      </svg>
    </button>
  );
}

// Mobile hamburger trigger
export function SidebarMobileTrigger({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      onClick={toggleSidebar}
      className={cn(
        'md:hidden flex items-center justify-center rounded-lg p-2 text-white/60 hover:bg-white/5 hover:text-white transition-colors',
        className
      )}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
        />
      </svg>
    </button>
  );
}
