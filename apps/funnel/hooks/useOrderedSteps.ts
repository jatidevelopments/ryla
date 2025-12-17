import { buildFunnelSteps, FUNNEL_STEPS, type StepInfo } from "@/features/funnel/config/steps";
import { useFormContext } from "react-hook-form";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";
import { useMemo } from "react";

/**
 * Hook to get ordered steps from static config
 * Dynamically builds steps based on creation_method
 * Steps update reactively when creation_method changes
 */
export function useOrderedSteps() {
    // Try to get creation_method from form context if available
    let creationMethod: "presets" | "ai" | "custom" | undefined = undefined;

    try {
        const form = useFormContext<FunnelSchema>();
        const method = form.watch("creation_method");
        if (method === "ai" || method === "custom" || method === "presets") {
            creationMethod = method;
        }
    } catch {
        // Form context not available, use default (presets)
        creationMethod = "presets";
    }

    // Build steps based on creation method - memoized to avoid recalculation
    const orderedSteps: StepInfo[] = useMemo(() => {
        const stepsConfig = buildFunnelSteps(creationMethod);
        return stepsConfig.map((step, index) => ({
            ...step,
            index,
        }));
    }, [creationMethod]);

    const isLoading = false;

    // No-op refresh function for compatibility
    const refresh = () => {
        // No-op - steps come from static config
    };

    return { orderedSteps, isLoading, refresh };
}

