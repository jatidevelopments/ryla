'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import type { StudioMode } from '../../../components/studio/generation';

const VALID_MODES: StudioMode[] = ['creating', 'editing', 'upscaling', 'variations'];

/**
 * Parse mode from query string
 */
function parseMode(modeParam: string | null): StudioMode {
  if (modeParam && VALID_MODES.includes(modeParam as StudioMode)) {
    return modeParam as StudioMode;
  }
  return 'creating';
}

export interface StudioQueryParams {
  influencerFromQuery: string | null;
  imageIdFromQuery: string | null;
  modeFromQuery: StudioMode;
  templateIdFromQuery: string | null;
}

/**
 * Hook for parsing and accessing studio query parameters
 * Memoized to prevent unnecessary rerenders
 */
export function useStudioQueryParams(): StudioQueryParams {
  const searchParams = useSearchParams();

  // Memoize parsed values to prevent unnecessary rerenders
  return React.useMemo(() => {
    const influencer = searchParams.get('influencer');
    const imageId = searchParams.get('imageId');
    const mode = parseMode(searchParams.get('mode'));
    const template = searchParams.get('template');

    return {
      influencerFromQuery: influencer,
      imageIdFromQuery: imageId,
      modeFromQuery: mode,
      templateIdFromQuery: template,
    };
  }, [searchParams]);
}

