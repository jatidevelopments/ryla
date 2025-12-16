"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";
import { OPTION_RULES, OptionRule } from "@/constants/option-rules";

export interface FilteredOption<T = any> {
    option: T;
    disabled?: boolean;
    disabledReason?: string;
    highlighted?: boolean;
}

/**
 * Hook to dynamically filter options based on form values and rules
 */
export function useDynamicOptions<T extends { value: string }>(
    fieldName: keyof FunnelSchema,
    allOptions: T[]
): FilteredOption<T>[] {
    const form = useFormContext<FunnelSchema>();

    // Watch all form values to react to any dependency changes
    // This is necessary because we don't know which fields are dependencies
    const formValues = form.watch();

    return useMemo(() => {
        // Find rules that affect this field
        const relevantRules = OPTION_RULES.filter(
            (rule) => rule.targetField === fieldName
        );

        let filteredOptions: any[] = allOptions;

        // Apply each rule in sequence
        for (const rule of relevantRules) {
            // Check if dependency is satisfied
            const dependencies = Array.isArray(rule.dependsOn)
                ? rule.dependsOn
                : [rule.dependsOn];

            const hasAllDependencies = dependencies.every(
                (dep) => formValues[dep] !== undefined && formValues[dep] !== ""
            );

            if (hasAllDependencies && rule.condition(formValues)) {
                filteredOptions = rule.action(formValues, filteredOptions);
            }
        }

        // Convert to FilteredOption format
        return filteredOptions.map((option) => {
            // If option already has disabled/highlighted properties, preserve them
            if (typeof option === "object" && ("disabled" in option || "highlighted" in option)) {
                return {
                    option: option.option || option,
                    disabled: option.disabled,
                    disabledReason: option.disabledReason,
                    highlighted: option.highlighted,
                } as FilteredOption<T>;
            }
            // Otherwise, wrap it
            return { option } as FilteredOption<T>;
        });
    }, [fieldName, allOptions, formValues]);
}

/**
 * Specialized hook for ethnicity-based filtering
 * This is a convenience hook that uses useDynamicOptions internally
 */
export function useEthnicityFilteredOptions<T extends { value: string }>(
    allOptions: T[],
    fieldName: keyof FunnelSchema
): FilteredOption<T>[] {
    return useDynamicOptions(fieldName, allOptions);
}

