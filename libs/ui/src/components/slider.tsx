'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '../lib/utils';

export interface SliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
  showTooltip?: boolean;
  formatValue?: (n: number) => string;
}

function SliderBase({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  showTooltip = false,
  formatValue = (n) => String(n),
  ...props
}: SliderProps) {
  const _values = React.useMemo(
    () => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min]),
    [value, defaultValue, min]
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        'relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="bg-white/10 relative grow overflow-hidden rounded-full h-2 w-full"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute h-full slider-range-bg"
        />
      </SliderPrimitive.Track>

      {showTooltip ? (
        <>
          {Array.from({ length: _values.length }, (_, index) => {
            const currentVal = (Array.isArray(value) ? value : _values)[index];
            const percentage = ((currentVal - min) / (max - min)) * 100;

            return (
              <div key={`value-${index}`} className="absolute w-full pointer-events-none">
                <div
                  className="absolute left-0 -translate-x-1/2 -top-9 bg-zinc-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
                  style={{ left: `${percentage}%` }}
                >
                  {typeof currentVal === 'number' ? formatValue(currentVal) : ''}
                </div>
              </div>
            );
          })}
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            className="cursor-pointer border-white/10 bg-zinc-900 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 hover:ring-white/20 focus-visible:ring-4 focus-visible:ring-white/20 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 flex items-center justify-center"
          >
            <span className="inline-block size-[10px] bg-white rounded-full" />
          </SliderPrimitive.Thumb>
        </>
      ) : (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          className="cursor-pointer border-white/10 bg-zinc-900 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 hover:ring-white/20 focus-visible:ring-4 focus-visible:ring-white/20 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 flex items-center justify-center"
        >
          <span className="inline-block size-[10px] bg-white rounded-full" />
        </SliderPrimitive.Thumb>
      )}
    </SliderPrimitive.Root>
  );
}

const Slider = React.memo(SliderBase);
Slider.displayName = 'Slider';

export { Slider };

