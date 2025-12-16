"use client";

import { cn } from "@/lib/utils";

interface RylaBadgeProps {
    className?: string;
    position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

export function RylaBadge({ className, position = "top-right" }: RylaBadgeProps) {
    const positionClasses = {
        "top-right": "top-2 right-2",
        "top-left": "top-2 left-2",
        "bottom-right": "bottom-2 right-2",
        "bottom-left": "bottom-2 left-2",
    };

    return (
        <div className={cn("absolute z-10", positionClasses[position], className)}>
            <div className="relative bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 backdrop-blur-md rounded-full px-3 py-1.5 shadow-xl shadow-purple-500/30 border border-white/20 flex items-center justify-center">
                <span className="text-white text-xs font-bold uppercase tracking-wider leading-none">
                    Ryla.ai
                </span>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
            </div>
        </div>
    );
}

