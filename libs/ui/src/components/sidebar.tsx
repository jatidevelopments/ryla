'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

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
      {children}
    </SidebarContext.Provider>
  );
}

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export function Sidebar({ children, className, ...props }: SidebarProps) {
  const { open, openMobile, isMobile, setOpenMobile } = useSidebar();

  // Mobile: Sheet/drawer overlay with glassmorphism
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
        {/* Mobile drawer with glassmorphism */}
        <aside
          className={cn(
            'fixed left-0 top-0 z-50 w-64 transform transition-transform duration-300 ease-out',
            // Glassmorphism styling
            'bg-[#121214]/80 backdrop-blur-2xl backdrop-saturate-150',
            'border-r border-white/[0.08]',
            'shadow-[4px_0_24px_-2px_rgba(0,0,0,0.12)]',
            openMobile ? 'translate-x-0' : '-translate-x-full',
            className
          )}
          style={{ height: '100dvh' }}
          {...props}
        >
          {children}
        </aside>
      </>
    );
  }

  // Desktop: Fixed sidebar with glassmorphism effect and rounded corners with margins
  return (
    <aside
      className={cn(
        'hidden md:flex flex-col fixed overflow-hidden transition-all duration-200 z-40',
        // Positioning with margins
        'left-3 top-3 bottom-3',
        // Glassmorphism styling with rounded corners
        'bg-[#121214]/70 backdrop-blur-2xl backdrop-saturate-150',
        'rounded-2xl',
        'border border-white/[0.08]',
        // Shadow for depth and floating effect
        'shadow-[0_8px_32px_-4px_rgba(0,0,0,0.3),0_4px_16px_-2px_rgba(0,0,0,0.2)]',
        open ? 'w-64' : 'w-20',
        className
      )}
      {...props}
    >
      {children}
    </aside>
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
        'shrink-0 p-4 border-b border-white/[0.08]',
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
      className={cn('flex-1 overflow-hidden px-3 py-4', className)}
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
      className={cn('p-4 border-t border-white/[0.08] mt-auto', className)}
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
