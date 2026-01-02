'use client';

import { useEffect } from 'react';
import { initConsoleLogBuffer } from '@ryla/shared';

/**
 * Initialize console log buffer on app startup
 * This component should be mounted once in the app root
 */
export function ConsoleLogBufferInit() {
  useEffect(() => {
    // Initialize console log buffer on app startup
    initConsoleLogBuffer();
  }, []);

  return null;
}

