'use client';

import { cn } from '@/lib/utils';

interface MovingBorderProps {
  children: React.ReactNode;
  className?: string;
  as?: 'a' | 'button';
  href?: string;
  onClick?: () => void;
}

export function MovingBorder({
  children,
  className,
  as: Component = 'button',
  href,
  onClick,
}: MovingBorderProps) {
  const base =
    'relative inline-flex items-center justify-center rounded-full px-8 py-4 text-[17px] font-medium text-[var(--nel-text)] overflow-hidden transition-colors hover:text-black';

  return (
    <Component
      href={href}
      onClick={onClick}
      className={cn(base, className)}
      type={Component === 'button' ? 'button' : undefined}
    >
      <span
        className="absolute inset-0 rounded-full bg-[var(--nel-accent)]"
        aria-hidden
      />
      <span
        className="absolute inset-0 rounded-full border-2 border-transparent bg-[length:200%_100%]"
        style={{
          backgroundImage: 'linear-gradient(90deg, var(--nel-accent), var(--nel-accent-hover), var(--nel-accent))',
          animation: 'shimmer 3s linear infinite',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: '2px',
        }}
        aria-hidden
      />
      <span className="relative z-10">{children}</span>
    </Component>
  );
}
