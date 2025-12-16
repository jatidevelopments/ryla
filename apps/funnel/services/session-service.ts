"use client";

import { createClient } from "@/utils/supabase/client";
import { CreateSessionData, UpdateSessionData, FunnelSession, FunnelOption } from "@/utils/types/session";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";

const SESSION_ID_KEY = "funnel_session_id";

/**
 * Check if Supabase operations are enabled
 * Disabled in development unless explicitly enabled via NEXT_PUBLIC_ENABLE_DEV_SUPABASE
 */
const isSupabaseEnabled = (): boolean => {
    if (typeof window === "undefined") return false;
    
    // In development, disable by default unless explicitly enabled
    if (process.env.NODE_ENV === "development") {
        return process.env.NEXT_PUBLIC_ENABLE_DEV_SUPABASE === "true";
    }
    
    // In production, always enabled
    return true;
};

/**
 * Check if Supabase debugging is enabled via environment variable
 */
const isDebugEnabled = (): boolean => {
    if (typeof window === "undefined") return false;
    return process.env.NEXT_PUBLIC_DEBUG_SUPABASE === "true";
};

/**
 * Debug logger for Supabase operations
 */
const debugLog = (message: string, data?: any) => {
    if (isDebugEnabled()) {
        console.log(`[Supabase Debug] ${message}`, data ? data : "");
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
 * Create a new session in Supabase
 */
export async function createSession(data: CreateSessionData): Promise<FunnelSession | null> {
    debugLog("Creating session", data);
    const startTime = Date.now();

    // Skip Supabase operations in development
    if (!isSupabaseEnabled()) {
        debugLog("⚠️ Supabase disabled in development - skipping session creation", { data });
        return null;
    }

    try {
        const supabase = createClient();
        const { data: session, error } = await supabase
            .from("funnel_sessions")
            .insert({
                session_id: data.session_id,
                current_step: data.current_step ?? null,
            })
            .select()
            .single();

        if (error) {
            // If session already exists, return it instead of erroring
            if (error.code === "23505") {
                // Unique constraint violation - session already exists
                debugLog("Session already exists, fetching existing session", { session_id: data.session_id });
                const { data: existingSession } = await supabase
                    .from("funnel_sessions")
                    .select()
                    .eq("session_id", data.session_id)
                    .single();

                debugLog("Retrieved existing session", { session: existingSession, duration: `${Date.now() - startTime}ms` });
                return existingSession as FunnelSession | null;
            }
            console.error("Error creating session:", error);
            debugLog("Failed to create session", { error, duration: `${Date.now() - startTime}ms` });
            return null;
        }

        debugLog("Session created successfully", { session, duration: `${Date.now() - startTime}ms` });
        return session as FunnelSession;
    } catch (error) {
        console.error("Error creating session:", error);
        debugLog("Exception creating session", { error, duration: `${Date.now() - startTime}ms` });
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

    // Skip Supabase operations in development
    if (!isSupabaseEnabled()) {
        debugLog("⚠️ Supabase disabled in development - skipping session update", { sessionId, data });
        return null;
    }

    try {
        const supabase = createClient();
        const updateData: Partial<UpdateSessionData> = {};

        if (data.email !== undefined) updateData.email = data.email;
        if (data.on_waitlist !== undefined) updateData.on_waitlist = data.on_waitlist;
        if (data.current_step !== undefined) updateData.current_step = data.current_step;

        debugLog("Sending update request", { sessionId, updateData });

        const { data: session, error } = await supabase
            .from("funnel_sessions")
            .update(updateData)
            .eq("session_id", sessionId)
            .select()
            .single();

        if (error) {
            console.error("Error updating session:", error);
            debugLog("Failed to update session", { sessionId, error, duration: `${Date.now() - startTime}ms` });
            return null;
        }

        debugLog("Session updated successfully", { sessionId, session, duration: `${Date.now() - startTime}ms` });
        return session as FunnelSession;
    } catch (error) {
        console.error("Error updating session:", error);
        debugLog("Exception updating session", { sessionId, error, duration: `${Date.now() - startTime}ms` });
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
 * Save a single option to Supabase
 */
export async function saveOption(
    sessionId: string,
    key: keyof FunnelSchema,
    value: any,
): Promise<boolean> {
    debugLog("Saving option", { sessionId, key, value });
    const startTime = Date.now();

    // Skip Supabase operations in development
    if (!isSupabaseEnabled()) {
        debugLog("⚠️ Supabase disabled in development - skipping option save", { sessionId, key, value });
        return true; // Return true to not break the flow
    }

    try {
        const supabase = createClient();
        const { error } = await supabase.from("funnel_options").upsert(
            {
                session_id: sessionId,
                option_key: key,
                option_value: value,
            },
            {
                onConflict: "session_id,option_key",
            },
        );

        if (error) {
            console.error("Error saving option:", error);
            debugLog("Failed to save option", { sessionId, key, error, duration: `${Date.now() - startTime}ms` });
            return false;
        }

        debugLog("Option saved successfully", { sessionId, key, duration: `${Date.now() - startTime}ms` });
        return true;
    } catch (error) {
        console.error("Error saving option:", error);
        debugLog("Exception saving option", { sessionId, key, error, duration: `${Date.now() - startTime}ms` });
        return false;
    }
}

/**
 * Save all options from form data
 */
export async function saveAllOptions(sessionId: string, formData: Partial<FunnelSchema>): Promise<boolean> {
    debugLog("Saving all options", { sessionId, optionCount: Object.keys(formData).length });
    const startTime = Date.now();

    // Skip Supabase operations in development
    if (!isSupabaseEnabled()) {
        debugLog("⚠️ Supabase disabled in development - skipping options save", { 
            sessionId, 
            optionCount: Object.keys(formData).length,
            keys: Object.keys(formData)
        });
        return true; // Return true to not break the flow
    }

    try {
        const supabase = createClient();
        const options = Object.entries(formData).map(([key, value]) => ({
            session_id: sessionId,
            option_key: key,
            option_value: value,
        }));

        if (options.length === 0) {
            debugLog("No options to save", { sessionId });
            return true;
        }

        debugLog("Upserting options", { sessionId, optionCount: options.length, keys: options.map(o => o.option_key) });

        const { error } = await supabase.from("funnel_options").upsert(options, {
            onConflict: "session_id,option_key",
        });

        if (error) {
            console.error("Error saving options:", error);
            debugLog("Failed to save options", { sessionId, error, optionCount: options.length, duration: `${Date.now() - startTime}ms` });
            return false;
        }

        debugLog("All options saved successfully", { sessionId, optionCount: options.length, duration: `${Date.now() - startTime}ms` });
        return true;
    } catch (error) {
        console.error("Error saving options:", error);
        debugLog("Exception saving options", { sessionId, error, duration: `${Date.now() - startTime}ms` });
        return false;
    }
}

/**
 * Get all options for a session
 */
export async function getSessionOptions(sessionId: string): Promise<FunnelOption[]> {
    debugLog("Fetching session options", { sessionId });
    const startTime = Date.now();

    // Skip Supabase operations in development
    if (!isSupabaseEnabled()) {
        debugLog("⚠️ Supabase disabled in development - skipping options fetch", { sessionId });
        return []; // Return empty array in development
    }

    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("funnel_options")
            .select()
            .eq("session_id", sessionId);

        if (error) {
            console.error("Error fetching options:", error);
            debugLog("Failed to fetch options", { sessionId, error, duration: `${Date.now() - startTime}ms` });
            return [];
        }

        const options = (data as FunnelOption[]) || [];
        debugLog("Fetched session options", { sessionId, optionCount: options.length, duration: `${Date.now() - startTime}ms` });
        return options;
    } catch (error) {
        console.error("Error fetching options:", error);
        debugLog("Exception fetching options", { sessionId, error, duration: `${Date.now() - startTime}ms` });
        return [];
    }
}

