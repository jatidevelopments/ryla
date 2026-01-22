import * as React from 'react';
import {
  Sparkles,
  Coins,
  CheckCircle2,
  XCircle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import type { ActivityItem } from '@ryla/shared';

interface ActivityMeta {
  icon: React.ReactNode;
  label: string;
  detail: string | null;
  color: string;
}

export function getActivityMeta(item: ActivityItem): ActivityMeta {
  switch (item.type) {
    case 'generation_completed':
      return {
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
        label: 'Generation completed',
        detail: item.imageCount
          ? `${item.imageCount} image${item.imageCount > 1 ? 's' : ''}`
          : null,
        color: 'emerald',
      };
    case 'generation_failed':
      return {
        icon: <XCircle className="h-5 w-5 text-red-400" />,
        label: 'Generation failed',
        detail: null,
        color: 'red',
      };
    case 'generation_started':
      return {
        icon: <Sparkles className="h-5 w-5 text-purple-400" />,
        label: 'Generation started',
        detail: null,
        color: 'purple',
      };
    case 'credits_added':
      return {
        icon: <ArrowUp className="h-5 w-5 text-emerald-400" />,
        label: 'Credits added',
        detail: item.creditAmount ? `+${item.creditAmount}` : null,
        color: 'emerald',
      };
    case 'credits_spent':
      return {
        icon: <ArrowDown className="h-5 w-5 text-orange-400" />,
        label: 'Credits used',
        detail: null, // Credit amount shown in orange badge instead
        color: 'orange',
      };
    case 'credits_refunded':
      return {
        icon: <ArrowUp className="h-5 w-5 text-blue-400" />,
        label: 'Credits refunded',
        detail: item.creditAmount ? `+${item.creditAmount}` : null,
        color: 'blue',
      };
    default:
      return {
        icon: <Coins className="h-5 w-5 text-gray-400" />,
        label: 'Activity',
        detail: null,
        color: 'gray',
      };
  }
}
