"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface StripedPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  direction?: "left" | "right";
  className?: string;
}

export function StripedPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  direction = "left",
  className,
  ...props
}: StripedPatternProps) {
  const id = useId();

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-none stroke-purple-500/20",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <line
            x1={direction === "left" ? width : 0}
            y1="0"
            x2={direction === "left" ? 0 : width}
            y2={height}
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

export default StripedPattern;

