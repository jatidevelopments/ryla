/**
 * Utility functions for step name to step ID conversion
 * Converts step names (e.g., "Choose Creation Method") to step IDs (e.g., "choose-creation-method")
 */

/**
 * Converts a step name to a step ID (kebab-case)
 * Example: "Choose Creation Method" -> "choose-creation-method"
 */
export function stepNameToStepId(stepName: string): string {
    return stepName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Converts a step ID back to a readable step name (title case)
 * Example: "choose-creation-method" -> "Choose Creation Method"
 */
export function stepIdToStepName(stepId: string): string {
    return stepId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

