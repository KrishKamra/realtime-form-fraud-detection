"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type {
  TelemetryEvent,
  RiskScoreResponse,
  TelemetryBatch,
} from "@/types/telemetry";

export function useBehavioralTracker(
  sessionId: string,
  applicantName?: string,
) {
  const [riskData, setRiskData] = useState<RiskScoreResponse | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const eventBuffer = useRef<TelemetryEvent[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const applicantNameRef = useRef(applicantName);

  // Keep applicant name ref updated in real-time
  useEffect(() => {
    applicantNameRef.current = applicantName;
  }, [applicantName]);

  // Construct WebSocket Endpoint URL correctly
  const getWsEndpoint = useCallback(() => {
    const rawWsUrl =
      process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
    const cleanBaseUrl = rawWsUrl.replace(/\/$/, "");
    return `${cleanBaseUrl}/ws/telemetry/${sessionId}`;
  }, [sessionId]);

  // Initialize Reconnecting WebSocket Stream
  useEffect(() => {
    let ws: WebSocket | null = null;
    let isMounted = true;

    const connect = async () => {
      try {
        // 1. Wake up Render container if it's sleeping (cold start)
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        await fetch(`${apiUrl}/health`).catch(() => {});

        if (!isMounted) return;

        // 2. Establish connection to /ws/telemetry/{session_id}
        const wsUrl = getWsEndpoint();
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          if (!isMounted) return;
          console.log(`🟢 [SentryForm] Connected to WebSocket: ${sessionId}`);
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data: RiskScoreResponse = JSON.parse(event.data);
            setRiskData(data);
          } catch (err) {
            console.error(
              "[SentryForm] Failed to parse WebSocket payload:",
              err,
            );
          }
        };

        ws.onclose = () => {
          if (!isMounted) return;
          setIsConnected(false);
          console.warn("[SentryForm] WebSocket disconnected. Reconnecting in 2s...");

          // Reconnect logic
          setTimeout(() => {
            if (isMounted) {
              connect();
            }
          }, 2000);
        };

        wsRef.current = ws;
      } catch (err) {
        console.error("[SentryForm] WebSocket connection setup failed:", err);
      }
    };

    connect();

    return () => {
      isMounted = false;
      if (ws) {
        ws.close();
      }
    };
  }, [sessionId, getWsEndpoint]);

  // Flush buffered events to WebSocket every 400ms
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        wsRef.current &&
        wsRef.current.readyState === WebSocket.OPEN &&
        eventBuffer.current.length > 0
      ) {
        const batch: TelemetryBatch = {
          session_id: sessionId,
          applicant_name: applicantNameRef.current || "Anonymous Applicant",
          events: [...eventBuffer.current],
        };

        wsRef.current.send(JSON.stringify(batch));
        eventBuffer.current = []; // Clear buffer post-flush
      }
    }, 400);

    return () => clearInterval(interval);
  }, [sessionId]);

  // Recording Handler attached to input fields
  const recordEvent = useCallback(
    (
      type: TelemetryEvent["event_type"],
      fieldId: string,
      extra?: { key_code?: string; cursor_x?: number; cursor_y?: number },
    ) => {
      const event: TelemetryEvent = {
        event_type: type,
        field_id: fieldId,
        timestamp_ms: Date.now(),
        ...extra,
      };
      eventBuffer.current.push(event);
    },
    [],
  );

  return { recordEvent, riskData, isConnected };
}