"use client";

import axios from "@/lib/axios";
import { CreateSessionData, UpdateSessionData, FunnelSession, FunnelOption } from "@/utils/types/session";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";

const SESSION_ID_KEY = "funnel_session_id";

/**
 * Check if backend API operations are enabled
 * Disabled in development unless explicitly enabled via NEXT_PUBLIC_ENABLE_DEV_FUNNEL_API
 */
const isBackendApiEnabled = (): boolean => {
    if (typeof window === "undefined") return false;
    
    // In development, disable by default unless explicitly enabled
    if (process.env.NODE_ENV === "development") {
        return process.env.NEXT_PUBLIC_ENABLE_DEV_FUNNEL_API === "true";
    }
    
    // In production, always enabled
    return true;
};

/**
 * Check if backend API debugging is enabled via environment variable
 */
const isDebugEnabled = (): boolean => {
    if (typeof window === "undefined") return false;
    return process.env.NEXT_PUBLIC_DEBUG_FUNNEL_API === "true";
};

/**
 * Debug logger for backend API operations
 */
const debugLog = (message: string, data?: any) => {
    if (isDebugEnabled()) {
        console.log(`[Funnel API Debug] ${message}`, data ? data : "");
    }
};

/**
 * Generate or retrieve session ID from localStorage
 */
export function getOrCreateSessionId(): string {
    if (typeof window === "undefined") {
        // Generate a temporary ID for server-side (won't be used)
        return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    let sessionId = localStorage.getItem(SESSION_ID_KEY);

    if (!sessionId) {
        // Generate a unique session ID
        sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(SESSION_ID_KEY, sessionId);
        debugLog("Created new session ID", { sessionId });
    } else {
        debugLog("Retrieved existing session ID", { sessionId });
    }

    return sessionId;
}

/**
 * Create a new session in backend API
 */
export async function createSession(data: CreateSessionData): Promise<FunnelSession | null> {
    debugLog("Creating session", data);
    const startTime = Date.now();

    // Skip backend API operations in development
    if (!isBackendApiEnabled()) {
        debugLog("⚠️ Backend API disabled in development - skipping session creation", { data });
        return null;
    }

    try {
        const response = await axios.post<FunnelSession>("/funnel/sessions", {
            sessionId: data.session_id,
            currentStep: data.current_step,
        });

        debugLog("Session created successfully", { session: response.data, duration: `${Date.now() - startTime}ms` });
        return response.data;
    } catch (error: any) {
        console.error("Error creating session:", error);
        debugLog("Failed to create session", { error: error.message, duration: `${Date.now() - startTime}ms` });
        return null;
    }
}

/**
 * Update session with email, waitlist status, or current step
 */
export async function updateSession(
    sessionId: string,
    data: UpdateSessionData,
): Promise<FunnelSession | null> {
    debugLog("Updating session", { sessionId, data });
    const startTime = Date.now();

    // Skip backend API operations in development
    if (!isBackendApiEnabled()) {
        debugLog("⚠️ Backend API disabled in development - skipping session update", { sessionId, data });
        return null;
    }

    try {
        const updateData: Partial<{
            email: string | null;
            onWaitlist: boolean;
            currentStep: number | null;
        }> = {};

        if (data.email !== undefined) updateData.email = data.email;
        if (data.on_waitlist !== undefined) updateData.onWaitlist = data.on_waitlist;
        if (data.current_step !== undefined) updateData.currentStep = data.current_step;

        debugLog("Sending update request", { sessionId, updateData });

        const response = await axios.put<FunnelSession>(`/funnel/sessions/${sessionId}`, updateData);

        debugLog("Session updated successfully", { sessionId, session: response.data, duration: `${Date.now() - startTime}ms` });
        return response.data;
    } catch (error: any) {
        console.error("Error updating session:", error);
        debugLog("Failed to update session", { sessionId, error: error.message, duration: `${Date.now() - startTime}ms` });
        return null;
    }
}

/**
 * Update session email
 */
export async function updateSessionEmail(sessionId: string, email: string): Promise<boolean> {
    debugLog("Updating session email", { sessionId, email });
    const result = await updateSession(sessionId, { email });
    const success = result !== null;
    debugLog(success ? "Email updated successfully" : "Failed to update email", { sessionId, email, success });
    return success;
}

/**
 * Update session waitlist status
 */
export async function updateSessionWaitlist(sessionId: string, onWaitlist: boolean): Promise<boolean> {
    debugLog("Updating session waitlist status", { sessionId, onWaitlist });
    const result = await updateSession(sessionId, { on_waitlist: onWaitlist });
    const success = result !== null;
    debugLog(success ? "Waitlist status updated successfully" : "Failed to update waitlist status", { sessionId, onWaitlist, success });
    return success;
}

/**
 * Update session current step
 */
export async function updateSessionStep(sessionId: string, step: number): Promise<boolean> {
    debugLog("Updating session step", { sessionId, step });
    const result = await updateSession(sessionId, { current_step: step });
    const success = result !== null;
    debugLog(success ? "Step updated successfully" : "Failed to update step", { sessionId, step, success });
    return success;
}

/**
 * Save a single option to backend API
 */
export async function saveOption(
    sessionId: string,
    key: keyof FunnelSchema,
    value: any,
): Promise<boolean> {
    debugLog("Saving option", { sessionId, key, value });
    const startTime = Date.now();

    // Skip backend API operations in development
    if (!isBackendApiEnabled()) {
        debugLog("⚠️ Backend API disabled in development - skipping option save", { sessionId, key, value });
        return true; // Return true to not break the flow
    }

    try {
        const response = await axios.post<{ success: boolean }>(`/funnel/sessions/${sessionId}/options`, {
            optionKey: key,
            optionValue: value,
        });

        if (!response.data.success) {
            debugLog("Failed to save option", { sessionId, key, duration: `${Date.now() - startTime}ms` });
            return false;
        }

        debugLog("Option saved successfully", { sessionId, key, duration: `${Date.now() - startTime}ms` });
        return true;
    } catch (error: any) {
        console.error("Error saving option:", error);
        debugLog("Exception saving option", { sessionId, key, error: error.message, duration: `${Date.now() - startTime}ms` });
        return false;
    }
}

/**
 * Save all options from form data
 */
export async function saveAllOptions(sessionId: string, formData: Partial<FunnelSchema>): Promise<boolean> {
    debugLog("Saving all options", { sessionId, optionCount: Object.keys(formData).length });
    const startTime = Date.now();

    // Skip backend API operations in development
    if (!isBackendApiEnabled()) {
        debugLog("⚠️ Backend API disabled in development - skipping options save", { 
            sessionId, 
            optionCount: Object.keys(formData).length,
            keys: Object.keys(formData)
        });
        return true; // Return true to not break the flow
    }

    try {
        if (Object.keys(formData).length === 0) {
            debugLog("No options to save", { sessionId });
            return true;
        }

        debugLog("Saving options batch", { sessionId, optionCount: Object.keys(formData).length, keys: Object.keys(formData) });

        const response = await axios.post<{ success: boolean }>(`/funnel/sessions/${sessionId}/options/batch`, {
            options: formData,
        });

        if (!response.data.success) {
            debugLog("Failed to save options", { sessionId, optionCount: Object.keys(formData).length, duration: `${Date.now() - startTime}ms` });
            return false;
        }

        debugLog("All options saved successfully", { sessionId, optionCount: Object.keys(formData).length, duration: `${Date.now() - startTime}ms` });
        return true;
    } catch (error: any) {
        console.error("Error saving options:", error);
        debugLog("Exception saving options", { sessionId, error: error.message, duration: `${Date.now() - startTime}ms` });
        return false;
    }
}

/**
 * Get all options for a session
 */
export async function getSessionOptions(sessionId: string): Promise<FunnelOption[]> {
    debugLog("Fetching session options", { sessionId });
    const startTime = Date.now();

    // Skip backend API operations in development
    if (!isBackendApiEnabled()) {
        debugLog("⚠️ Backend API disabled in development - skipping options fetch", { sessionId });
        return []; // Return empty array in development
    }

    try {
        const response = await axios.get<FunnelOption[]>(`/funnel/sessions/${sessionId}/options`);

        const options = response.data || [];
        debugLog("Fetched session options", { sessionId, optionCount: options.length, duration: `${Date.now() - startTime}ms` });
        return options;
    } catch (error: any) {
        console.error("Error fetching options:", error);
        debugLog("Failed to fetch options", { sessionId, error: error.message, duration: `${Date.now() - startTime}ms` });
        return [];
    }
}
