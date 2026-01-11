'use client';

import { useMemo } from 'react';

export interface PasswordStrengthProps {
  password: string;
  className?: string;
}

interface Requirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: Requirement[] = [
  {
    label: 'At least 8 characters',
    test: (pw) => pw.length >= 8,
  },
  {
    label: 'Contains lowercase letter',
    test: (pw) => /[a-z]/.test(pw),
  },
  {
    label: 'Contains uppercase letter',
    test: (pw) => /[A-Z]/.test(pw),
  },
  {
    label: 'Contains a number',
    test: (pw) => /[0-9]/.test(pw),
  },
  {
    label: 'Contains special character',
    test: (pw) => /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/`~]/.test(pw),
  },
];

export function PasswordStrength({
  password,
  className = '',
}: PasswordStrengthProps) {
  const strength = useMemo(() => {
    if (!password) return { score: 0, passed: [] as boolean[] };

    const passed = requirements.map((req) => req.test(password));
    const score = passed.filter(Boolean).length;

    return { score, passed };
  }, [password]);

  const strengthPercentage = (strength.score / requirements.length) * 100;

  const getStrengthColor = () => {
    if (strength.score === 0) return 'bg-[var(--border-default)]';
    if (strength.score <= 2) return 'bg-red-500';
    if (strength.score <= 3) return 'bg-orange-500';
    if (strength.score <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    if (strength.score === 0) return '';
    if (strength.score <= 2) return 'Weak';
    if (strength.score <= 3) return 'Fair';
    if (strength.score <= 4) return 'Good';
    return 'Strong';
  };

  if (!password) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Strength Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--text-muted)]">Password strength</span>
          <span
            className={`font-medium ${
              strength.score <= 2
                ? 'text-red-400'
                : strength.score <= 3
                ? 'text-orange-400'
                : strength.score <= 4
                ? 'text-yellow-400'
                : 'text-green-400'
            }`}
          >
            {getStrengthLabel()}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-primary)]">
          <div
            className={`h-full transition-all duration-300 ease-out ${getStrengthColor()}`}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1.5">
        {requirements.map((req, index) => {
          const passed = strength.passed[index];
          return (
            <div key={req.label} className="flex items-center gap-2 text-xs">
              {passed ? (
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
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4 text-[var(--text-muted)]"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span
                className={
                  passed ? 'text-green-400' : 'text-[var(--text-muted)]'
                }
              >
                {req.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Check if password meets minimum requirements
 */
export function isPasswordValid(password: string): boolean {
  // At minimum: 8 chars, 1 lowercase, 1 number
  return (
    password.length >= 8 && /[a-z]/.test(password) && /[0-9]/.test(password)
  );
}

/**
 * Check if password is strong (all requirements met)
 */
export function isPasswordStrong(password: string): boolean {
  return requirements.every((req) => req.test(password));
}
