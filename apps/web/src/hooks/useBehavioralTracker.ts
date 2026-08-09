"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type {
  TelemetryEvent,
  RiskScoreResponse,
  TelemetryBatch,
} from "@/types/telemetry";
import { getWsBaseUrl } from "@/lib/api";

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

  const getWsEndpoint = useCallback(() => {
    if (!sessionId) return "";
    return `${getWsBaseUrl()}/ws/telemetry/${sessionId}`;
  }, [sessionId]);

  // Initialize WebSocket Stream
  useEffect(() => {
    // Guard: Do NOT open connection until sessionId is initialized
    if (!sessionId) return;

    let ws: WebSocket | null = null;
    let isMounted = true;
    let reconnectTimer: NodeJS.Timeout | null = null;

    const connect = async () => {
      try {
        const wsUrl = getWsEndpoint();
        if (!wsUrl) return;

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
            console.error("[SentryForm] Failed to parse WebSocket payload:", err);
          }
        };

        ws.onclose = (evt) => {
          if (!isMounted) return;
          setIsConnected(false);

          // Only reconnect if the closure wasn't intentional
          if (evt.code !== 1000) {
            reconnectTimer = setTimeout(() => {
              if (isMounted) connect();
            }, 2000);
          }
        };

        wsRef.current = ws;
      } catch (err) {
        console.error("[SentryForm] WebSocket setup failed:", err);
      }
    };

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null; // Prevent reconnect loop on clean unmount
        ws.close(1000, "Component unmounted");
      }
    };
  }, [sessionId, getWsEndpoint]);

  // Flush buffered events to WebSocket every 250ms for responsive scoring
  useEffect(() => {
    if (!sessionId) return;

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
    }, 250); // Lowered from 400ms to 250ms for hyper-responsive HUD updates

    return () => clearInterval(interval);
  }, [sessionId]);

  // Recording Handler with Client Buffer Cap
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

      // Prevent runaway array sizes on hyper-fast mouse moves
      if (eventBuffer.current.length > 100) {
        eventBuffer.current = eventBuffer.current.slice(-100);
      }
    },
    [],
  );

  return { recordEvent, riskData, isConnected };
}