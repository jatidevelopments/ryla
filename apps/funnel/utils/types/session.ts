export interface FunnelSession {
    id: string;
    session_id: string;
    email: string | null;
    on_waitlist: boolean;
    current_step: number | null;
    created_at: string;
    updated_at: string;
}

export interface FunnelOption {
    id: string;
    session_id: string;
    option_key: string;
    option_value: any; // JSONB can contain any JSON-serializable value
    created_at: string;
    updated_at: string;
}

export interface CreateSessionData {
    session_id: string;
    current_step?: number;
}

export interface UpdateSessionData {
    email?: string;
    on_waitlist?: boolean;
    current_step?: number;
}

