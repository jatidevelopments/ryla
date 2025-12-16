"use client";

import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";
import { OPTION_RULES } from "@/constants/option-rules";

/**
 * Hook to automatically reset fields when their dependencies change
 * and the current value becomes invalid
 */
export function useAutoReset() {
    const form = useFormContext<FunnelSchema>();
    const formValues = form.watch();
    const previousValuesRef = useRef<Partial<FunnelSchema>>({});

    useEffect(() => {
        const currentValues = formValues;
        const previousValues = previousValuesRef.current;

        // Find all rules that should reset fields
        const resetRules = OPTION_RULES.filter((rule) => rule.resetOnChange);

        for (const rule of resetRules) {
            const dependencies = Array.isArray(rule.dependsOn)
                ? rule.dependsOn
                : [rule.dependsOn];

            // Check if any dependency changed
            const dependencyChanged = dependencies.some(
                (dep) => previousValues[dep] !== currentValues[dep]
            );

            if (dependencyChanged) {
                const currentValue = form.getValues(rule.targetField);

                // Only reset if there's a current value
                if (currentValue && currentValue !== "") {
                    // Apply the rule to see if current value is still valid
                    const allOptions = [{ value: currentValue }];
                    const filteredOptions = rule.action(currentValues, allOptions);

                    // Check if current value is still in the filtered options
                    const isValid = filteredOptions.some((opt) => {
                        const optionValue =
                            typeof opt === "object" && "option" in opt
                                ? opt.option?.value
                                : opt?.value || opt;
                        return optionValue === currentValue;
                    });

                    // If current value is no longer valid, reset it
                    if (!isValid) {
                        form.setValue(rule.targetField, "" as any, {
                            shouldValidate: false,
                        });
                    }
                }
            }
        }

        // Update previous values
        previousValuesRef.current = { ...currentValues };
    }, [formValues, form]);
}

