'use client';

import * as React from 'react';
import { isUuid } from '../utils';

interface Influencer {
  id: string;
  name: string;
  avatar?: string | null;
}

/**
 * Hook to prepare influencers array for useStudioImages hook
 * Filters and maps influencers to prevent infinite loops
 */
export function useInfluencersForHook(influencers: Influencer[]) {
  return React.useMemo(
    () =>
      influencers
        .filter((i) => isUuid(i.id))
        .map((i) => ({
          id: i.id,
          name: i.name,
          avatar: i.avatar || undefined,
        })),
    [influencers]
  );
}

