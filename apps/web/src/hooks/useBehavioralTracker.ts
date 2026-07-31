"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { TelemetryEvent, RiskScoreResponse, TelemetryBatch } from "@/types/telemetry";

export function useBehavioralTracker(sessionId: string, applicantName?: string) {
  const [riskData, setRiskData] = useState<RiskScoreResponse | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const eventBuffer = useRef<TelemetryEvent[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const applicantNameRef = useRef(applicantName);

  // Keep the applicant name ref updated in real-time as the user types
  useEffect(() => {
    applicantNameRef.current = applicantName;
  }, [applicantName]);

  // Initialize Reconnecting WebSocket Stream
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `ws://localhost:8000/ws/telemetry/${sessionId}`;
    let ws: WebSocket | null = null;

    const connect = () => {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data: RiskScoreResponse = JSON.parse(event.data);
          setRiskData(data);
        } catch (err) {
          console.error("[SentryForm] Failed to parse WebSocket payload:", err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Attempt reconnect after 2 seconds if unmounted
        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.CLOSED) {
            connect();
          }
        }, 2000);
      };

      wsRef.current = ws;
    };

    connect();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [sessionId]);

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
      extra?: { key_code?: string; cursor_x?: number; cursor_y?: number }
    ) => {
      const event: TelemetryEvent = {
        event_type: type,
        field_id: fieldId,
        timestamp_ms: Date.now(),
        ...extra,
      };
      eventBuffer.current.push(event);
    },
    []
  );

  return { recordEvent, riskData, isConnected };
}