import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";
import { ETHNICITY_OPTIONS_MAP, EthnicityValue } from "./ethnicity-options";

export type OptionRuleType =
    | "filter"           // Hide/filter options based on condition
    | "disable"          // Show but disable options
    | "highlight";       // Highlight certain options

export interface OptionRule {
    id: string;
    targetField: keyof FunnelSchema;  // Field to affect
    dependsOn: keyof FunnelSchema | Array<keyof FunnelSchema>;  // Field(s) that trigger this
    type: OptionRuleType;
    condition: (formValues: Partial<FunnelSchema>) => boolean;
    action: (formValues: Partial<FunnelSchema>, allOptions: any[]) => any[];
    resetOnChange?: boolean;  // Reset target field when dependency changes
}

// Helper to check if option value is in allowed list
function filterByAllowedValues<T extends { value: string }>(
    options: T[],
    allowedValues: string[]
): T[] {
    return options.filter(option => allowedValues.includes(option.value));
}

// Helper to mark options as disabled
function markAsDisabled<T extends { value: string }>(
    options: T[],
    valuesToDisable: string[],
    reason?: string
): Array<T & { disabled?: boolean; disabledReason?: string }> {
    return options.map(option => ({
        ...option,
        disabled: valuesToDisable.includes(option.value),
        disabledReason: valuesToDisable.includes(option.value) ? reason : undefined,
    }));
}

export const OPTION_RULES: OptionRule[] = [
    // Skin Color filtering by ethnicity
    {
        id: "skin-color-by-ethnicity",
        targetField: "influencer_skin_color",
        dependsOn: "influencer_ethnicity",
        type: "filter",
        condition: (values) => !!values.influencer_ethnicity,
        action: (values, allOptions) => {
            const ethnicity = values.influencer_ethnicity as EthnicityValue;
            if (!ethnicity || !ETHNICITY_OPTIONS_MAP[ethnicity]) {
                return allOptions;
            }
            const allowedColors = ETHNICITY_OPTIONS_MAP[ethnicity].skinColors;
            return filterByAllowedValues(allOptions, allowedColors);
        },
        resetOnChange: true,
    },

    // Eye Color filtering by ethnicity
    {
        id: "eye-color-by-ethnicity",
        targetField: "influencer_eye_color",
        dependsOn: "influencer_ethnicity",
        type: "filter",
        condition: (values) => !!values.influencer_ethnicity,
        action: (values, allOptions) => {
            const ethnicity = values.influencer_ethnicity as EthnicityValue;
            if (!ethnicity || !ETHNICITY_OPTIONS_MAP[ethnicity]) {
                return allOptions;
            }
            const allowedColors = ETHNICITY_OPTIONS_MAP[ethnicity].eyeColors;
            return filterByAllowedValues(allOptions, allowedColors);
        },
        resetOnChange: true,
    },

    // Hair Color filtering by ethnicity
    {
        id: "hair-color-by-ethnicity",
        targetField: "influencer_hair_color",
        dependsOn: "influencer_ethnicity",
        type: "filter",
        condition: (values) => !!values.influencer_ethnicity,
        action: (values, allOptions) => {
            const ethnicity = values.influencer_ethnicity as EthnicityValue;
            if (!ethnicity || !ETHNICITY_OPTIONS_MAP[ethnicity]) {
                return allOptions;
            }
            const allowedColors = ETHNICITY_OPTIONS_MAP[ethnicity].hairColors;
            return filterByAllowedValues(allOptions, allowedColors);
        },
        resetOnChange: true,
    },

    // Hair Style filtering by ethnicity
    {
        id: "hair-style-by-ethnicity",
        targetField: "influencer_hair_style",
        dependsOn: "influencer_ethnicity",
        type: "filter",
        condition: (values) => !!values.influencer_ethnicity,
        action: (values, allOptions) => {
            const ethnicity = values.influencer_ethnicity as EthnicityValue;
            if (!ethnicity || !ETHNICITY_OPTIONS_MAP[ethnicity]) {
                return allOptions;
            }
            const allowedStyles = ETHNICITY_OPTIONS_MAP[ethnicity].hairStyles;
            return filterByAllowedValues(allOptions, allowedStyles);
        },
        resetOnChange: true,
    },
];

