'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Button,
  Input,
  Label,
  RylaButton,
  MagicCard,
  FadeInUp,
} from '@ryla/ui';

import { login } from '../../lib/auth';
import { useAuth } from '../../lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated: isAuthenticatedContext, isLoading: authLoading } = useAuth();

  // Redirect if already logged in (use context, not just token check)
  useEffect(() => {
    if (!authLoading && isAuthenticatedContext) {
      const returnUrl = searchParams.get('returnUrl') || '/dashboard';
      router.push(returnUrl);
    }
  }, [authLoading, isAuthenticatedContext, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      // Refresh auth context
      await refreshUser();
      // Redirect to returnUrl or dashboard
      const returnUrl = searchParams.get('returnUrl') || '/dashboard';
      router.push(returnUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background image */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/background2.png)',
        }}
      />
      {/* Dark overlay */}
      <div className="pointer-events-none absolute inset-0 bg-black/95" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <FadeInUp>
          <div className="mb-10 text-center">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/logos/Ryla_Logo_white.png"
                alt="RYLA"
                width={140}
                height={48}
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-[var(--text-secondary)]">
              Create Your AI Influencer
            </p>
          </div>
        </FadeInUp>

        {/* Login Form */}
        <FadeInUp delay={100}>
          <MagicCard
            gradientFrom="rgba(255, 255, 255, 0.15)"
            gradientTo="rgba(255, 255, 255, 0.08)"
            gradientSize={400}
            gradientOpacity={0.3}
            gradientColor="rgba(255, 255, 255, 0.1)"
            className="rounded-3xl"
          >
            <div className="p-8">
              <h2 className="mb-6 text-center text-2xl font-bold text-[var(--text-primary)]">
                Welcome Back
              </h2>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label
                    htmlFor="email"
                    className="text-[var(--text-primary)] mb-2 block"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 rounded-xl bg-[var(--bg-primary)] border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--purple-500)] focus:ring-[var(--purple-500)]/20"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="password"
                    className="text-[var(--text-primary)] mb-2 block"
                  >
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 rounded-xl bg-[var(--bg-primary)] border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--purple-500)] focus:ring-[var(--purple-500)]/20"
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-[var(--text-secondary)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={isLoading}
                      className="rounded-md border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--purple-500)] focus:ring-[var(--purple-500)]/20"
                    />
                    Remember me
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[var(--purple-400)] hover:text-[var(--purple-300)] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <RylaButton
                  type="submit"
                  variant="glassy"
                  size="lg"
                  className="w-full h-12 rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </RylaButton>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-[var(--border-default)]" />
                <span className="text-xs text-[var(--text-muted)]">
                  OR CONTINUE WITH
                </span>
                <div className="h-px flex-1 bg-[var(--border-default)]" />
              </div>

              <Button
                variant="outline"
                disabled={isLoading}
                className="w-full h-12 rounded-xl border-[var(--border-default)] bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-hover)] text-[var(--text-primary)]"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </div>
          </MagicCard>
        </FadeInUp>

        {/* Sign Up Link */}
        <FadeInUp delay={200}>
          <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-[var(--purple-400)] hover:text-[var(--purple-300)] font-medium transition-colors"
            >
              Get started for free
            </Link>
          </p>
        </FadeInUp>
      </div>
    </div>
  );
}
