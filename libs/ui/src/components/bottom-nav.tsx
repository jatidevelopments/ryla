'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../lib/utils';

// Icons - inline SVG components
const ExploreIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className={cn('h-5 w-5', className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
    />
  </svg>
);

const ExploreIconFilled = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={cn('h-5 w-5', className)}
  >
    <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
    <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
  </svg>
);

const AiUserIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className={cn('h-5 w-5', className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
    />
  </svg>
);

const AiUserIconFilled = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={cn('h-5 w-5', className)}
  >
    <path
      fillRule="evenodd"
      d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
      clipRule="evenodd"
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
    className={cn('h-5 w-5', className)}
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

const SettingsIconFilled = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={cn('h-5 w-5', className)}
  >
    <path
      fillRule="evenodd"
      d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z"
      clipRule="evenodd"
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
    className={cn('h-4 w-4', className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.5v15m7.5-7.5h-15"
    />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    className={cn('h-4 w-4', className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const CharacterIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className={cn('h-5 w-5', className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
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
    className={cn('h-5 w-5', className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
    />
  </svg>
);

const BugIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className={cn('h-5 w-5', className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 12.75c.414 0 .75-.336.75-.75V9a.75.75 0 00-1.5 0v3c0 .414.336.75.75.75zM12 15a.75.75 0 100 1.5.75.75 0 000-1.5zM9.75 9.75a.75.75 0 00-1.5 0v.75a.75.75 0 001.5 0v-.75zM15.75 9.75a.75.75 0 011.5 0v.75a.75.75 0 01-1.5 0v-.75zM9.75 12.75a.75.75 0 00-1.5 0v.75a.75.75 0 001.5 0v-.75zM15.75 12.75a.75.75 0 011.5 0v.75a.75.75 0 01-1.5 0v-.75zM12 3a9 9 0 00-9 9v.75c0 2.485 2.015 4.5 4.5 4.5h9c2.485 0 4.5-2.015 4.5-4.5V12a9 9 0 00-9-9z"
    />
  </svg>
);

export interface UserProfile {
  name: string;
  avatarUrl?: string;
  tier: 'free' | 'starter' | 'pro' | 'unlimited';
}

export interface BottomNavProps extends React.HTMLAttributes<HTMLElement> {
  /** Force visibility even on excluded routes */
  forceVisible?: boolean;
  /** User profile data for the profile nav item */
  userProfile?: UserProfile;
  /** Callback when "Report Bug" is clicked */
  onReportBugClick?: () => void;
}

const menuItems = [
  {
    id: 1,
    title: 'My Influencers',
    url: '/dashboard',
    icon: AiUserIcon,
    activeIcon: AiUserIconFilled,
  },
  {
    id: 2,
    title: '',
    url: '',
    icon: null,
  },
  {
    id: 3,
    title: 'Studio',
    url: '/studio',
    icon: ImageIcon,
    activeIcon: ImageIcon,
  },
  {
    id: 4,
    title: 'Profile',
    url: '/settings',
    icon: SettingsIcon,
    activeIcon: SettingsIconFilled,
    isProfile: true,
  },
  {
    id: 5,
    title: 'Report Bug',
    url: '',
    icon: BugIcon,
    activeIcon: BugIcon,
    isAction: true, // Indicates this is an action button, not a link
  },
];

const addMenuItems = [
  {
    id: 1,
    title: 'AI Influencer',
    url: '/wizard/step-1',
    icon: CharacterIcon,
  },
  {
    id: 2,
    title: 'Content',
    url: '/dashboard',
    icon: ImageIcon,
  },
];

// Helper to get tier badge styling
const getTierBadgeStyle = (tier: UserProfile['tier']) => {
  switch (tier) {
    case 'pro':
    case 'unlimited':
      return 'bg-gradient-to-r from-[var(--purple-500)] to-[var(--pink-500)] text-white';
    case 'starter':
      return 'bg-[var(--purple-500)]/20 text-[var(--purple-400)]';
    default:
      return 'bg-white/10 text-white/60';
  }
};

// Helper to get tier display name
const getTierDisplayName = (tier: UserProfile['tier']) => {
  switch (tier) {
    case 'pro':
      return 'Pro';
    case 'unlimited':
      return 'Pro+';
    case 'starter':
      return 'Starter';
    default:
      return 'Free';
  }
};

const BottomNav = React.forwardRef<HTMLElement, BottomNavProps>(
  ({ className, forceVisible = false, userProfile, onReportBugClick, ...props }, ref) => {
    const pathname = usePathname();
    const [showAddMenu, setShowAddMenu] = React.useState(false);

    // Hide on wizard and login pages
    const shouldHide =
      pathname?.includes('/wizard') || pathname?.includes('/login');
    if (shouldHide && !forceVisible) return null;

    const handleAddClick = () => setShowAddMenu(true);
    const handleCloseAddMenu = () => setShowAddMenu(false);
    const handleAddMenuItemClick = () => setShowAddMenu(false);

    return (
      <nav
        ref={ref}
        className={cn(
          'block md:hidden fixed -bottom-1 left-0 z-50 w-full',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'bg-black shadow-lg transition-all duration-300 ease-out border-t border-white/10',
            showAddMenu ? 'px-5 py-8' : 'px-4 py-3'
          )}
        >
          {/* Add Menu Expanded */}
          {showAddMenu && (
            <div className="mb-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 items-center gap-3">
                {addMenuItems.map((item) => (
                  <Link
                    href={item.url}
                    key={item.id}
                    onClick={handleAddMenuItemClick}
                    className="flex flex-col items-center space-y-2 text-white/70 hover:text-white transition-colors group"
                  >
                    <div className="flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl p-4 transition-colors w-full">
                      <item.icon className="h-5 w-5" />
                      <span className="text-xs font-medium mt-2">
                        {item.title}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Credits Badge */}
          {!showAddMenu && (
            <div className="mb-3 flex items-center justify-center">
              <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--purple-700)]/80 to-[var(--purple-800)]/80 border border-[var(--purple-500)]/30 px-3 py-1.5">
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
            </div>
          )}

          {/* Main Nav Items */}
          <div className="flex items-center justify-around">
            {menuItems.map((item) => {
              const isActive = item.url && pathname?.startsWith(item.url);
              const isAddButton = item.id === 2;

              if (isAddButton) {
                return showAddMenu ? (
                  <div
                    key={item.id}
                    className="flex justify-center items-center"
                  >
                    <button
                      onClick={handleCloseAddMenu}
                      className="bg-white/5 h-8 w-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all duration-200"
                    >
                      <XIcon className="text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleAddClick}
                    key={item.id}
                    className="w-[60px] h-[60px] mx-auto flex items-center justify-center bg-white/5 rounded-full -mt-5 hover:bg-white/10 transition-all"
                  >
                    <div className="bg-gradient-to-r from-[var(--purple-500)] to-[var(--pink-500)] h-7 w-7 rounded-lg flex items-center justify-center hover:brightness-110 transition-all duration-200">
                      <PlusIcon className="text-white" />
                    </div>
                  </button>
                );
              }

              if (!item.icon) return null;

              // Profile item - show user avatar with tier badge
              if ((item as { isProfile?: boolean }).isProfile && userProfile) {
                return (
                  <Link
                    key={item.id}
                    href={item.url}
                    className={cn(
                      'flex flex-col items-center justify-center transition-all duration-300',
                      showAddMenu
                        ? 'opacity-0 pointer-events-none'
                        : 'opacity-100',
                      isActive
                        ? 'text-white'
                        : 'text-white/50 hover:text-white/70'
                    )}
                  >
                    <div className="relative mb-1">
                      {/* Avatar */}
                      <div className="h-7 w-7 rounded-full overflow-hidden bg-gradient-to-br from-[var(--purple-500)] to-[var(--pink-500)] flex items-center justify-center ring-2 ring-white/20">
                        {userProfile.avatarUrl ? (
                          <img
                            src={userProfile.avatarUrl}
                            alt={userProfile.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold text-white">
                            {userProfile.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      {/* Tier badge - positioned at bottom-right */}
                      <div 
                        className={cn(
                          'absolute -bottom-0.5 -right-1 px-1 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide',
                          getTierBadgeStyle(userProfile.tier)
                        )}
                      >
                        {getTierDisplayName(userProfile.tier)}
                      </div>
                    </div>
                    <span className="text-[10px] font-medium max-w-[60px] truncate">
                      {userProfile.name.split('-')[0] || userProfile.name.substring(0, 8)}
                    </span>
                  </Link>
                );
              }

              // Extract icon after null check for TypeScript
              const itemIcon = item.icon;
              const Icon = isActive ? item.activeIcon || itemIcon : itemIcon;

              // Action button (Report Bug)
              if ((item as { isAction?: boolean }).isAction) {
                return (
                  <button
                    key={item.id}
                    onClick={onReportBugClick}
                    className={cn(
                      'flex flex-col items-center justify-center transition-all duration-300',
                      showAddMenu
                        ? 'opacity-0 pointer-events-none'
                        : 'opacity-100',
                      'text-white/50 hover:text-white/70'
                    )}
                  >
                    <div className="mb-1">
                      <Icon />
                    </div>
                    <span className="text-[11px] font-medium">{item.title}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={item.url}
                  className={cn(
                    'flex flex-col items-center justify-center transition-all duration-300',
                    showAddMenu
                      ? 'opacity-0 pointer-events-none'
                      : 'opacity-100',
                    isActive
                      ? 'text-white'
                      : 'text-white/50 hover:text-white/70'
                  )}
                >
                  <div className="mb-1">
                    <Icon />
                  </div>
                  <span className="text-[11px] font-medium">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    );
  }
);

BottomNav.displayName = 'BottomNav';

export { BottomNav };
