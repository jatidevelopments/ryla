"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const avatarVariants = cva("relative flex size-8 shrink-0 overflow-hidden rounded-full", {
    variants: {
        size: {
            "2xl": "size-[70px] text-4xl",
            xl: "size-20 text-2xl",
            lg: "size-[42px] text-lg",
            md: "size-10 text-base",
            sm: "size-9 text-sm",
            xs: "size-6 text-sm",
        },
    },
    defaultVariants: {
        size: "md",
    },
});

function Avatar({
    className,
    size,
    ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & VariantProps<typeof avatarVariants>) {
    return (
        <AvatarPrimitive.Root
            data-slot="avatar"
            className={cn(avatarVariants({ size, className }))}
            {...props}
        />
    );
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
    return (
        <AvatarPrimitive.Image
            data-slot="avatar-image"
            className={cn("aspect-square size-full", className)}
            {...props}
        />
    );
}

function AvatarFallback({
    className,
    ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
    return (
        <AvatarPrimitive.Fallback
            data-slot="avatar-fallback"
            className={cn(
                "bg-muted flex size-full items-center justify-center rounded-full",
                className,
            )}
            {...props}
        />
    );
}

export { Avatar, AvatarImage, AvatarFallback };
