import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

interface Props extends React.ComponentProps<typeof ProgressPrimitive.Root> {
    indicatorProps?: React.ComponentProps<typeof ProgressPrimitive.Indicator>;
}

function Progress({ className, value, indicatorProps = { className: "" }, ...props }: Props) {
    const { className: indicatorClassName, ...rest } = indicatorProps;

    return (
        <ProgressPrimitive.Root
            data-slot="progress"
            className={cn("bg-white/5 relative h-1 w-full overflow-hidden rounded-full", className)}
            {...props}
        >
            <ProgressPrimitive.Indicator
                data-slot="progress-indicator"
                className={cn(
                    "bg-secondary-gradient h-full w-full flex-1 transition-all rounded-full",
                    indicatorClassName,
                )}
                style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
                {...rest}
            />
        </ProgressPrimitive.Root>
    );
}

export { Progress };
