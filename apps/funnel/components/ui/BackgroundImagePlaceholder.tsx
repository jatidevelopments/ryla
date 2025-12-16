"use client";

import { clsx } from "clsx";

interface BackgroundImagePlaceholderProps {
    description: string;
    className?: string;
    width?: number;
    height?: number;
}

export function BackgroundImagePlaceholder({
    description,
    className,
    width = 400,
    height = 400,
}: BackgroundImagePlaceholderProps) {
    return (
        <div
            className={clsx(
                "flex flex-col items-center justify-center",
                "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900",
                "border-2 border-dashed border-gray-300 dark:border-gray-600",
                "rounded-xl",
                "text-gray-600 dark:text-gray-400",
                "relative",
                "overflow-hidden",
                "shadow-inner",
                className,
            )}
            style={{ width, height }}
        >
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-20 dark:opacity-10">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
                        repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)
                    `,
                    }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
                {/* Icon placeholder */}
                <div className="mb-4 w-16 h-16 rounded-lg bg-gray-200/60 dark:bg-gray-700/60 backdrop-blur-sm flex items-center justify-center border border-gray-300/50 dark:border-gray-600/50">
                    <svg
                        className="w-8 h-8 text-gray-500 dark:text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                </div>

                {/* Description text */}
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[280px] leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    );
}
