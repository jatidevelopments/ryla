"use client";

import { cn } from "@/lib/utils";
import SpriteIcon from "@/components/SpriteIcon/SpriteIcon";
import { useRef, useEffect, useState } from "react";

interface OutfitCardProps {
    image: {
        src: string;
        alt: string;
        name?: string;
    };
    isActive?: boolean;
    onClick?: () => void;
    className?: string;
}

export function OutfitCard({
    image,
    isActive = false,
    onClick,
    className,
}: OutfitCardProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setDimensions({ width: rect.width, height: rect.height });
            }
        };

        updateDimensions();
        const resizeObserver = new ResizeObserver(updateDimensions);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
    }, []);

    const hasValidImage = image?.src && image.src.trim() !== "";

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "relative w-full aspect-square rounded-xl overflow-hidden transition-all duration-200 group",
                "focus:outline-none focus:ring-2 focus:ring-purple-500/50",
                isActive
                    ? "ring-2 ring-purple-400/50 shadow-lg shadow-purple-500/30"
                    : "ring-1 ring-white/10 hover:ring-white/20",
                className
            )}
        >
            <div
                ref={containerRef}
                className="absolute inset-0 w-full h-full"
            >
                {/* Image */}
                {dimensions.width > 0 && dimensions.height > 0 && (
                    <>
                        {hasValidImage ? (
                            <SpriteIcon
                                src={image.src}
                                fallbackAlt={image.alt || "outfit"}
                                targetW={dimensions.width}
                                targetH={dimensions.height}
                                fit="cover"
                                imageClassName="rounded-xl"
                                className="w-full h-full"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5 rounded-xl flex items-center justify-center">
                                <span className="text-white/50 text-xs">{image.name || "Outfit"}</span>
                            </div>
                        )}
                    </>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded-xl" />

                {/* Shimmer effect when active */}
                {isActive && (
                    <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-transparent via-white/30 via-transparent to-transparent pointer-events-none z-10 rounded-xl" />
                )}

                {/* Selection Indicator */}
                {isActive && (
                    <div className="absolute top-2 left-2 z-20 w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                        >
                            <path
                                d="M10 3L4.5 8.5L2 6"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                )}

                {/* Label at bottom */}
                <div className="absolute bottom-0 left-0 right-0 z-10 p-2.5">
                    <p
                        className={cn(
                            "text-white text-xs font-semibold text-center leading-tight drop-shadow-lg",
                            isActive && "text-white"
                        )}
                    >
                        {image.name}
                    </p>
                </div>
            </div>
        </button>
    );
}

