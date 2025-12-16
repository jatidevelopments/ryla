import { FUNNEL_STEPS, type StepInfo } from "@/features/funnel/config/steps";

/**
 * Hook to get ordered steps from static config
 * Database functionality has been removed - using config as single source of truth
 */
export function useOrderedSteps() {
    // Return steps directly from config - no database needed
    const orderedSteps = FUNNEL_STEPS;
    const isLoading = false;
    
    // No-op refresh function for compatibility
    const refresh = () => {
        // No-op - steps come from static config
    };

    return { orderedSteps, isLoading, refresh };
}

