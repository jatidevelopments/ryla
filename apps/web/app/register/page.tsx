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

import { register } from '../../lib/auth';
import { useAuth } from '../../lib/auth-context';
import { PasswordStrength, isPasswordValid } from '../../components/password-strength';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser, isAuthenticated: isAuthenticatedContext, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    publicName: '',
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in (use context, not just token check)
  useEffect(() => {
    if (!authLoading && isAuthenticatedContext) {
      const returnUrl = searchParams.get('returnUrl') || '/dashboard';
      router.push(returnUrl);
    }
  }, [authLoading, isAuthenticatedContext, router, searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (!isPasswordValid(formData.password)) {
      setError('Password must be at least 8 characters with a lowercase letter and number');
      return;
    }

    if (!acceptedTerms) {
      setError('You must accept the Terms of Service');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        publicName: formData.publicName,
      });
      // Refresh auth context
      await refreshUser();
      // Redirect to returnUrl or dashboard
      const returnUrl = searchParams.get('returnUrl') || '/dashboard';
      router.push(returnUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
          <div className="mb-8 text-center">
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

        {/* Register Form */}
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
                Create Account
              </h2>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="name"
                      className="text-[var(--text-primary)] mb-2 block"
                    >
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="h-12 rounded-xl bg-[var(--bg-primary)] border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--purple-500)] focus:ring-[var(--purple-500)]/20"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="publicName"
                      className="text-[var(--text-primary)] mb-2 block"
                    >
                      Username
                    </Label>
                    <Input
                      id="publicName"
                      name="publicName"
                      type="text"
                      placeholder="johndoe"
                      value={formData.publicName}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="h-12 rounded-xl bg-[var(--bg-primary)] border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--purple-500)] focus:ring-[var(--purple-500)]/20"
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="email"
                    className="text-[var(--text-primary)] mb-2 block"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
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
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    minLength={8}
                    className="h-12 rounded-xl bg-[var(--bg-primary)] border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--purple-500)] focus:ring-[var(--purple-500)]/20"
                  />
                  {/* Password Strength Indicator */}
                  <PasswordStrength password={formData.password} className="mt-3" />
                </div>

                <div>
                  <Label
                    htmlFor="confirmPassword"
                    className="text-[var(--text-primary)] mb-2 block"
                  >
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    minLength={8}
                    className={`h-12 rounded-xl bg-[var(--bg-primary)] border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--purple-500)] focus:ring-[var(--purple-500)]/20 ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-red-500 focus:border-red-500'
                        : formData.confirmPassword && formData.password === formData.confirmPassword
                        ? 'border-green-500 focus:border-green-500'
                        : ''
                    }`}
                  />
                  {/* Password Match Indicator */}
                  {formData.confirmPassword && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      {formData.password === formData.confirmPassword ? (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-4 w-4 text-green-500"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-green-400">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-4 w-4 text-red-500"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-red-400">Passwords do not match</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <label className="flex items-start gap-3 text-[var(--text-secondary)] cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      disabled={isLoading}
                      className="mt-0.5 rounded-md border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--purple-500)] focus:ring-[var(--purple-500)]/20"
                    />
                    <span>
                      I agree to the{' '}
                      <Link
                        href="/terms"
                        className="text-[var(--purple-400)] hover:text-[var(--purple-300)]"
                      >
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link
                        href="/privacy"
                        className="text-[var(--purple-400)] hover:text-[var(--purple-300)]"
                      >
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                </div>

                <RylaButton
                  type="submit"
                  variant="glassy"
                  size="lg"
                  className="w-full h-12 rounded-xl mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
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

        {/* Sign In Link */}
        <FadeInUp delay={200}>
          <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-[var(--purple-400)] hover:text-[var(--purple-300)] font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </FadeInUp>
      </div>
    </div>
  );
}

