/**
 * Funnel types for session and option management
 */

export interface FunnelSession {
  id: string;
  sessionId: string;
  email: string | null;
  onWaitlist: boolean | null;
  currentStep: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FunnelOption {
  id: string;
  sessionId: string;
  optionKey: string;
  optionValue: any; // JSONB can contain any JSON-serializable value
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSessionData {
  sessionId: string;
  currentStep?: number;
}

export interface UpdateSessionData {
  email?: string | null | undefined;
  onWaitlist?: boolean | undefined;
  currentStep?: number | null | undefined;
}
