"use client";

import Image from "next/image";
import { SPRITE_ITEMS, SPRITE_URL, SPRITE_W, SPRITE_H } from "@/constants/sprite";
import { withCdn } from "@/lib/cdn";

type SizeProps =
    | { size: number; targetW?: never; targetH?: never }
    | { size?: never; targetW: number; targetH: number };

type Props = SizeProps & {
    id?: string;
    src?: string;

    title?: string;

    center?: boolean;

    fit?: "contain" | "cover";

    fallbackSrc?: string;
    fallbackAlt?: string;

    className?: string;
    imageClassName?: string;

    frame?: boolean;
};

function srcToId(src?: string) {
    if (!src) return undefined;
    return src
        .replace(/^\/?images\//, "")
        .replace(/^\/?public\//, "")
        .replace(/\.[^.]+$/, "")
        .replace(/[/\\]/g, "-");
}

export default function SpriteIcon(props: Props) {
    const {
        id,
        src,
        title,
        center = true,
        fit = "contain",
        fallbackSrc,
        fallbackAlt,
        className,
        imageClassName,
        frame = false,
    } = props;

    const targetW = "size" in props && props.size ? props.size : (props as any).targetW;
    const targetH = "size" in props && props.size ? props.size : (props as any).targetH;

    const finalId = id ?? srcToId(src);
    const item = finalId ? SPRITE_ITEMS.find((b) => b.id === finalId) : undefined;
    const spriteUrl = withCdn(SPRITE_URL);

    // Debug logging
    const DEBUG_CDN = process.env.NEXT_PUBLIC_DEBUG_CDN === "true" || (typeof window !== "undefined" && (window as any).__DEBUG_CDN__);
    if (DEBUG_CDN && src) {
        const cdnUrl = withCdn(src);
        if (cdnUrl !== src) {
            console.log(`[SpriteIcon] Using CDN for: ${src} → ${cdnUrl}`);
        }
    }

    if (!item) {
        const eff = fallbackSrc ?? src;
        if (process.env.NODE_ENV !== "production") {
            console.warn(`[SpriteIcon] Missing in sprite: ${finalId}`);
        }
        return eff ? (
            <Image
                src={withCdn(eff)}
                alt={fallbackAlt ?? title ?? finalId ?? ""}
                width={targetW}
                height={targetH}
                className={imageClassName}
                style={{
                    display: "block",
                    objectFit: fit,
                    width: targetW,
                    height: targetH,
                }}
                sizes={`${targetW}px`}
                loading="lazy"
                quality={85}
            />
        ) : null;
    }

    const s =
        fit === "cover"
            ? Math.max(targetW / item.w, targetH / item.h)
            : Math.min(targetW / item.w, targetH / item.h, 1);

    const wImg = Math.round(item.w * s);
    const hImg = Math.round(item.h * s);
    const posX = Math.round(-item.x * s);
    const posY = Math.round(-item.y * s);
    const sizeW = Math.round(SPRITE_W * s);
    const sizeH = Math.round(SPRITE_H * s);

    return (
        <div
            className={className}
            style={{
                width: targetW,
                height: targetH,
                display: center ? "flex" : undefined,
                alignItems: center ? "center" : undefined,
                justifyContent: center ? "center" : undefined,
            }}
        >
            <span
                role="img"
                aria-label={title ?? item.title}
                title={title ?? item.title}
                className={imageClassName}
                style={{
                    display: "block",
                    width: frame ? targetW : wImg,
                    height: frame ? targetH : hImg,

                    backgroundImage: `url(${spriteUrl})`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: `${posX}px ${posY}px`,
                    backgroundSize: `${sizeW}px ${sizeH}px`,
                    imageRendering: "auto",
                    overflow: frame ? "hidden" : undefined,
                }}
            />
        </div>
    );
}
