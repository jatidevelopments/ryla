'use client';

import { Button } from '@/components/ui/button';
import { AnnouncementBar } from '@/components/announcement-bar';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface LandingPageHeaderProps {
  title: string;
  icon: string;
  gradient: string;
  navigation: Array<{
    label: string;
    href: string;
  }>;
  ctaText: string;
  ctaHref?: string;
  variant?: 'default' | 'overlay';
}

export function LandingPageHeader({
  title,
  icon,
  gradient,
  navigation,
  ctaText,
  ctaHref = '#',
  variant = 'default',
}: LandingPageHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        const headerOffset = 140;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    } else {
      window.location.href = href;
    }
    setMobileMenuOpen(false);
  };

  const handleCTAClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ctaHref.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(ctaHref);
      if (element) {
        const headerOffset = 140;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    } else {
      window.location.href = ctaHref;
    }
  };

  const wrapperClasses =
    variant === 'overlay'
      ? `absolute top-0 left-0 right-0 z-30 transition-all duration-300 ${
          isScrolled
            ? 'bg-black/40 backdrop-blur-lg'
            : 'bg-black/20 backdrop-blur-md'
        }`
      : `sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-background/98 backdrop-blur-lg shadow-sm'
            : 'bg-background/95 backdrop-blur-md'
        }`;

  const headerClasses =
    variant === 'overlay'
      ? `border-b border-white/20 transition-all duration-300 ${
          isScrolled ? 'border-white/20' : 'border-white/10'
        }`
      : `border-b transition-all duration-300 ${
          isScrolled ? 'border-border' : 'border-border/50'
        }`;

  const textClasses = variant === 'overlay' ? 'text-white' : 'text-foreground';

  const navClasses =
    variant === 'overlay'
      ? 'text-white/90 hover:text-white transition-colors font-medium'
      : 'text-muted-foreground hover:text-foreground transition-colors font-medium';

  const buttonClasses =
    variant === 'overlay' ? 'text-white hover:bg-white/10 border-white/20' : '';

  return (
    <div className={wrapperClasses}>
      <AnnouncementBar variant={variant} />
      <header className={headerClasses}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <div
                className={`w-10 h-10 bg-linear-to-r ${gradient} rounded-lg flex items-center justify-center shadow-lg`}
              >
                <span className="text-white font-bold text-sm">{icon}</span>
              </div>
              <span className={`ml-3 text-xl font-bold ${textClasses}`}>
                {title}
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`${navClasses} px-4 py-2 rounded-lg text-sm transition-all hover:bg-foreground/5 dark:hover:bg-foreground/10`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <Button
                variant="ghost"
                className={buttonClasses}
                onClick={() => {
                  window.location.href = 'https://app.ryla.ai';
                }}
              >
                Sign In
              </Button>
              <Button
                className={`bg-linear-to-r ${gradient} hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all`}
                onClick={handleCTAClick}
              >
                {ctaText}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className={`md:hidden p-2 rounded-lg ${
                variant === 'overlay' ? 'text-white' : 'text-foreground'
              } hover:bg-foreground/5`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div
              className={`md:hidden border-t ${
                variant === 'overlay' ? 'border-white/20' : 'border-border'
              } py-4`}
            >
              <nav className="flex flex-col space-y-2">
                {navigation.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`${navClasses} px-4 py-2 rounded-lg text-sm`}
                  >
                    {item.label}
                  </a>
                ))}
                <div className="flex flex-col space-y-2 pt-2 border-t border-border/50">
                  <Button
                    variant="ghost"
                    className={`${buttonClasses} justify-start`}
                    onClick={() => {
                      window.location.href = 'https://app.ryla.ai';
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    className={`bg-linear-to-r ${gradient} hover:opacity-90 text-white justify-start`}
                    onClick={(e) => {
                      handleCTAClick(e);
                      setMobileMenuOpen(false);
                    }}
                  >
                    {ctaText}
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}
