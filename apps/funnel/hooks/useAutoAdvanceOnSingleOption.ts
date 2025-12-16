"use client";

import { useStepperContext } from "@/components/stepper/Stepper.context";
import { useFormContext } from "react-hook-form";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";

/**
 * Hook to automatically advance to the next step when there's only one option available
 * @param options - Array of options (can be filtered options with disabled property)
 * @param onSelect - Handler function to call when option is selected
 * @returns Wrapped handler that auto-advances if there's only one enabled option
 */
export function useAutoAdvanceOnSingleOption<T extends Record<string, any>>(
    options: T[],
    onSelect: (value: any) => void
) {
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();

    return (value: any) => {
        // Check enabled options at click time (not at hook creation time)
        // This handles dynamic filtering correctly
        const enabledOptions = options.filter((opt) => !opt.disabled);
        const shouldAutoAdvance = enabledOptions.length === 1;

        // Debug logging
        if (process.env.NODE_ENV === "development") {
            console.log("[AutoAdvance] Options:", options.length, "Enabled:", enabledOptions.length, "Should advance:", shouldAutoAdvance);
        }

        // Call the select handler first (this sets the form value)
        onSelect(value);

        if (shouldAutoAdvance) {
            // Wait for form value to be set and React to process the update
            // Use a combination of requestAnimationFrame and setTimeout
            // to ensure form state is fully updated before advancing
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    // Additional delay to ensure form.setValue has completed
                    // and form state is fully updated
                    setTimeout(() => {
                        // Verify form value is set before calling nextStep
                        // This ensures validation will pass
                        const formValues = form.getValues();

                        if (process.env.NODE_ENV === "development") {
                            console.log("[AutoAdvance] Calling nextStep after form value set");
                        }

                        // Call nextStep which will handle validation internally
                        // The nextStep function will trigger validation and advance if it passes
                        nextStep();
                    }, 200);
                });
            });
        }
    };
}

