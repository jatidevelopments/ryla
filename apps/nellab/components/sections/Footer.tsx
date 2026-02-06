import Link from 'next/link';
import { COMPANY } from '@/lib/constants';

const footerLinks = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Legal', href: '/imprint' },
  { label: 'Terms', href: '/terms' },
  { label: 'Contact', href: '/#contact' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--nel-border)] px-6 py-16">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-8 md:flex-row">
        <Link
          href="/"
          className="text-[17px] font-medium text-[var(--nel-text)] hover:opacity-80 transition-opacity"
        >
          {COMPANY.shortName}
        </Link>
        <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-2 text-[13px] text-[var(--nel-text-secondary)] hover:text-[var(--nel-text)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="mx-auto mt-8 max-w-4xl text-center text-[12px] text-[var(--nel-text-tertiary)]">
        © {year} {COMPANY.fullName}
      </p>
    </footer>
  );
}
