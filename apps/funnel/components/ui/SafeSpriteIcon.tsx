"use client";

import { useState, useEffect, useRef } from "react";
import SpriteIcon from "@/components/SpriteIcon/SpriteIcon";
import { OptionImagePlaceholder } from "@/components/ui/OptionImagePlaceholder";

interface SafeSpriteIconProps {
    src?: string;
    fallbackAlt?: string;
    title?: string;
    targetW: number;
    targetH: number;
    center?: boolean;
    className?: string;
    description?: string;
    label?: string;
    [key: string]: any;
}

export function SafeSpriteIcon({
    src,
    fallbackAlt,
    title,
    targetW,
    targetH,
    center = false,
    className,
    description,
    label,
    ...rest
}: SafeSpriteIconProps) {
    const [imageError, setImageError] = useState(false);
    const spriteIconRef = useRef<HTMLDivElement>(null);

    // Check if src is missing or empty
    const hasValidSrc = src && src.trim() !== "";

    useEffect(() => {
        setImageError(false);
    }, [src]);

    // Check if SpriteIcon rendered content (it returns null when image not found)
    useEffect(() => {
        if (hasValidSrc && spriteIconRef.current) {
            // Check if SpriteIcon rendered anything by checking if container is empty
            const checkImage = setTimeout(() => {
                const container = spriteIconRef.current;
                if (container && container.children.length === 0) {
                    // SpriteIcon returned null, image not found
                    setImageError(true);
                }
            }, 100);
            return () => clearTimeout(checkImage);
        }
    }, [src, hasValidSrc]);

    // Show placeholder if no src or if there's an error
    if (!hasValidSrc || imageError) {
        return (
            <div className={className} style={{ width: targetW, height: targetH }}>
                <OptionImagePlaceholder
                    description={description || `Image needed: ${fallbackAlt || title || "image"}`}
                    label={label}
                    className="w-full h-full"
                />
            </div>
        );
    }

    return (
        <div
            ref={spriteIconRef}
            className={className}
            style={{
                width: center ? "100%" : targetW,
                height: center ? "100%" : targetH,
            }}
        >
            <SpriteIcon
                src={src}
                fallbackAlt={fallbackAlt}
                title={title}
                targetW={targetW}
                targetH={targetH}
                center={center}
                {...rest}
            />
        </div>
    );
}
