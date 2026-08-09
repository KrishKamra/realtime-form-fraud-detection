/**
 * Resolve API / WebSocket base URLs with local + production fallbacks.
 */
export function getApiBaseUrl(): string {
  let raw = process.env.NEXT_PUBLIC_API_URL;

  if (!raw && typeof window !== "undefined") {
    const host = window.location.hostname;
    const isLocal = host === "localhost" || host === "127.0.0.1";
    raw = isLocal
      ? "http://localhost:8000"
      : "https://realtime-form-fraud-detection.onrender.com";
  }

  return (raw || "http://localhost:8000").replace(/\/$/, "");
}

export function getWsBaseUrl(): string {
  let raw = process.env.NEXT_PUBLIC_WS_URL;

  if (!raw && typeof window !== "undefined") {
    const host = window.location.hostname;
    const isLocal = host === "localhost" || host === "127.0.0.1";
    raw = isLocal
      ? "ws://localhost:8000"
      : "wss://realtime-form-fraud-detection.onrender.com";
  }

  return (raw || "ws://localhost:8000").replace(/\/$/, "");
}
