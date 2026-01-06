import { cn } from '@ryla/ui';
import type { AspectRatio } from '../types';
import { ASPECT_RATIOS } from '../types';

interface AspectRatioIconProps {
  ratio: AspectRatio;
  className?: string;
}

export function AspectRatioIcon({ ratio, className }: AspectRatioIconProps) {
  const ratioConfig = ASPECT_RATIOS.find(r => r.value === ratio);
  const iconClass = cn('shrink-0', className);
  
  if (ratioConfig?.icon === 'portrait') {
    return <div className={cn(iconClass, 'h-4 w-2.5 border border-current rounded-sm')} />;
  }
  if (ratioConfig?.icon === 'landscape') {
    return <div className={cn(iconClass, 'h-2.5 w-4 border border-current rounded-sm')} />;
  }
  // Square
  return <div className={cn(iconClass, 'h-3 w-3 border border-current rounded-sm')} />;
}

