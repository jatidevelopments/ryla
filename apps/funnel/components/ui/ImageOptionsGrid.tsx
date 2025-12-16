"use client";

import { ReactNode } from "react";
import { calculateGridLayout, getGridColumnsClass } from "@/utils/layout/calculateGridLayout";
import { cn } from "@/lib/utils";

export interface ImageOption {
    id: string | number;
    value: string;
    image: {
        src: string;
        alt: string;
        name?: string;
    };
    disabled?: boolean;
    disabledReason?: string;
}

interface ImageOptionsGridProps {
    options: ImageOption[];
    renderOption: (option: ImageOption, index: number) => ReactNode;
    className?: string;
    gap?: "sm" | "md" | "lg";
}

/**
 * Reusable image options grid component that automatically calculates
 * optimal grid layout based on number of options.
 * 
 * Layout examples:
 * - 2 options: 2x1 grid
 * - 3 options: 3x1 grid
 * - 4 options: 2x2 grid
 * - 5 options: 3x2 grid (3 in first row, 2 in second)
 * - 6 options: 3x2 grid
 * - And so on...
 * 
 * All items maintain square aspect ratio.
 */
export function ImageOptionsGrid({
    options,
    renderOption,
    className,
    gap = "md",
}: ImageOptionsGridProps) {
    const { columns } = calculateGridLayout(options.length);
    const gridColsClass = getGridColumnsClass(columns);

    const gapClass = {
        sm: "gap-[8px]",
        md: "gap-[10px]",
        lg: "gap-[12px]",
    }[gap];

    return (
        <div className={cn("w-full grid", gridColsClass, gapClass, className)}>
            {options.map((option, index) => (
                <div key={option.id} className="w-full">
                    {renderOption(option, index)}
                </div>
            ))}
        </div>
    );
}



