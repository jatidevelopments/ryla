"use client";
import { clsx } from "clsx";
import { ComponentProps, createContext, useContext, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { OptionImagePlaceholder } from "@/components/ui/OptionImagePlaceholder";
import SpriteIcon from "@/components/SpriteIcon/SpriteIcon";

interface ImageCardContext {
    image: { src: string; alt: string; name?: string };
    isActive?: boolean;
}

const ImageCardContext = createContext<ImageCardContext | null>(null);

function useImageCardContext() {
    const ctx = useContext(ImageCardContext);
    if (!ctx) throw new Error("useImageCardContext must be used within ImageCard");
    return ctx;
}

type Props = ComponentProps<typeof Button> & ImageCardContext;

function ImageCardComponent(props: Props) {
    const { image, isActive = false, children, className, ...rest } = props;
    return (
        <ImageCardContext.Provider value={{ image, isActive }}>
            <Button
                variant="unstyled"
                className={clsx(
                    "p-[2px] w-full rounded-xl h-auto relative transition-all duration-200",
                    isActive 
                        ? "bg-primary-gradient shadow-lg shadow-purple-500/30" 
                        : "bg-black-2 hover:bg-white/5",
                    className,
                )}
                {...rest}
            >
                <div className="w-full h-full rounded-xl relative overflow-hidden">
                    {children}
                    {/* Shimmer effect when active */}
                    {isActive && (
                        <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-transparent via-white/30 via-transparent to-transparent pointer-events-none z-10" />
                    )}
                </div>
            </Button>
        </ImageCardContext.Provider>
    );
}

function useMeasure() {
    const ref = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const ro = new ResizeObserver((entries) => {
            const cr = entries[0]?.contentRect;
            if (cr) setSize({ w: Math.round(cr.width), h: Math.round(cr.height) });
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    return { ref, ...size };
}

function ImageCardImage({ className }: { className?: string }) {
    const { image } = useImageCardContext();

    const { ref, w, h } = useMeasure();

    // Show placeholder if image src is missing or invalid
    const hasValidImage = image?.src && image.src.trim() !== "";

    return (
        <div ref={ref} className="absolute inset-0">
            {w > 0 && h > 0 ? (
                hasValidImage ? (
                    <SpriteIcon
                        src={image.src}
                        fallbackAlt={image.alt || "image-placeholder"}
                        targetW={w}
                        targetH={h}
                        fit="cover"
                        imageClassName={clsx("rounded-xl", className)}
                        className="w-full h-full"
                    />
                ) : (
                    <OptionImagePlaceholder
                        description={`Image needed: ${image.alt || image.name || "option image"}`}
                        label={image.name}
                        className="rounded-xl"
                    />
                )
            ) : null}
        </div>
    );
}

function ImageCardOverlay({ className, ...rest }: ComponentProps<"div">) {
    return (
        <div
            {...rest}
            className={clsx(
                "absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/90",
                className,
            )}
        />
    );
}

function ImageCardName({ className, ...rest }: ComponentProps<"div">) {
    const { image } = useImageCardContext();
    return (
        <div
            {...rest}
            className={clsx(
                "absolute w-full text-wrap bottom-[5px] left-1/2 -translate-x-1/2 z-1 text-white font-semibold",
                className,
            )}
        >
            {image.name}
        </div>
    );
}

function ImageCardBadge({ className, ...rest }: ComponentProps<"div">) {
    const { image } = useImageCardContext();
    return (
        <div
            {...rest}
            className={clsx(
                "absolute top-1/2 left-1/2 -translate-[50%] z-1 text-white text-base font-semibold",
                "bg-[#000]/60 px-3 py-1 rounded-[10px]",
                className,
            )}
        >
            {image.name}
        </div>
    );
}

const ImageCard = Object.assign(ImageCardComponent, {
    Image: ImageCardImage,
    Overlay: ImageCardOverlay,
    Name: ImageCardName,
    Badge: ImageCardBadge,
});

export default ImageCard;
