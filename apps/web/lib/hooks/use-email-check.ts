'use client';

import { useState, useCallback, useRef } from 'react';
import { checkEmailExists } from '../auth';

/**
 * Hook for checking if an email exists
 * Includes debouncing to prevent excessive API calls
 */
export function useEmailCheck() {
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const checkEmail = useCallback(
    async (email: string): Promise<boolean | null> => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        setError(null);
        return null;
      }

      return new Promise((resolve) => {
        debounceTimerRef.current = setTimeout(async () => {
          setIsChecking(true);
          setError(null);

          try {
            const exists = await checkEmailExists(email);
            setIsChecking(false);
            resolve(exists);
          } catch (err) {
            const errorMessage =
              err instanceof Error ? err.message : 'Failed to check email';
            setError(errorMessage);
            setIsChecking(false);
            resolve(null);
          }
        }, 300); // 300ms debounce
      });
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    checkEmail,
    isChecking,
    error,
    clearError,
  };
}

