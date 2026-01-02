"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { withCdn } from "@/lib/cdn";

export interface VideoProps extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, "src"> {
    /**
     * Video source URL (relative to public folder or absolute URL)
     */
    src: string;
    /**
     * Optional poster image URL (shown before video loads)
     */
    poster?: string;
    /**
     * Additional source elements for multiple formats
     */
    sources?: Array<{
        src: string;
        type: string;
    }>;
    /**
     * Object fit style (CSS object-fit)
     */
    objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
    /**
     * Aspect ratio (CSS aspect-ratio)
     */
    aspectRatio?: string;
    /**
     * Loading strategy (ignored - videos always load)
     * @deprecated This prop is ignored
     */
    loading?: "lazy" | "eager";
    /**
     * Quality setting (ignored)
     * @deprecated This prop is ignored
     */
    quality?: "low" | "medium" | "high" | number;
    /**
     * Priority loading (ignored)
     * @deprecated This prop is ignored
     */
    priority?: boolean;
}

/**
 * Simple Video component - just a video element with CDN support
 */
const Video = React.forwardRef<HTMLVideoElement, VideoProps>(
    (
        {
            src,
            poster,
            sources,
            className,
            objectFit = "cover",
            aspectRatio,
            style,
            ...props
        },
        ref
    ) => {
        // Apply CDN to all video sources
        const resolvedSrc = withCdn(src);
        const resolvedPoster = poster ? withCdn(poster) : undefined;
        const resolvedSources = sources?.map((source) => ({
            ...source,
            src: withCdn(source.src),
        }));

        // Build styles for objectFit and aspectRatio
        const videoStyle: React.CSSProperties = {
            ...style,
            objectFit,
            aspectRatio,
        };

        // Ensure autoplay works - play when video is ready
        const videoRef = React.useRef<HTMLVideoElement | null>(null);
        React.useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement);

        React.useEffect(() => {
            const video = videoRef.current;
            if (!video || !props.autoPlay) return;

            const playVideo = () => {
                // Ensure muted for autoplay policy
                if (props.autoPlay && !video.muted) {
                    video.muted = true;
                }
                video.play().catch(() => {
                    // Autoplay may be blocked - that's okay
                });
            };

            // Try to play when video is ready
            if (video.readyState >= 2) {
                playVideo();
            } else {
                const onCanPlay = () => {
                    playVideo();
                    video.removeEventListener("canplay", onCanPlay);
                };
                video.addEventListener("canplay", onCanPlay);

                return () => {
                    video.removeEventListener("canplay", onCanPlay);
                };
            }
        }, [props.autoPlay]);

        return (
            <video
                ref={(node) => {
                    videoRef.current = node;
                    if (typeof ref === "function") {
                        ref(node);
                    } else if (ref) {
                        ref.current = node;
                    }
                }}
                src={resolvedSrc}
                poster={resolvedPoster}
                className={cn("w-full h-full", className)}
                style={videoStyle}
                {...props}
            >
                {/* Multiple source formats support */}
                {resolvedSources?.map((source, index) => (
                    <source key={index} src={source.src} type={source.type} />
                ))}
                {/* Fallback message */}
                Your browser does not support the video tag.
            </video>
        );
    }
);

Video.displayName = "Video";

export { Video };
