export type EventType = "keydown" | "keyup" | "mousemove" | "paste" | "focus" | "blur";

export interface TelemetryEvent {
  event_type: EventType;
  field_id: string;
  timestamp_ms: number;
  key_code?: string;
  cursor_x?: number;
  cursor_y?: number;
  meta?: Record<string, unknown>;
}

export interface TelemetryBatch {
  session_id: string;
  applicant_name?: string;
  events: TelemetryEvent[];
}

export interface RiskScoreResponse {
  session_id: string;
  applicant_name?: string;
  risk_score: number;      // Range: [0.0 - 100.0]
  is_anomalous: boolean;
  latency_ms: number;
  triggers: string[];      // e.g., ["SUSPICIOUS_PASTE_DETECTED", "BOT_LIKE_TYPING_SPEED"]
  event_count?: number;
  last_updated?: string;
}