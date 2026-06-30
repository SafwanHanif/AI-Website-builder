"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useProjectStore } from "@/store/projectStore";
import { useAuthStore } from "@/store/authStore";
import type { GenerationProgress } from "@/types";

export function useGeneration(projectId: string | undefined) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { addProgress, setIsGenerating, setPreviewCode } = useProjectStore();
  const token = useAuthStore((state) => state.token);

  const connect = useCallback(() => {
    if (!projectId || !token) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api";
    const ws = new WebSocket(`${wsUrl}/projects/${projectId}/ws?token=${token}`);

    ws.onopen = () => {
      setIsConnected(true);
      // Start keepalive
      const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send("ping");
        }
      }, 30000);
      wsRef.current = ws as any;
      (ws as any)._keepalive = interval;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "pong") return;

        const progress: GenerationProgress = {
          step: data.step,
          status: data.status,
          component: data.component,
          data: data.data,
          message: data.message,
          index: data.index,
          total: data.total,
        };

        addProgress(progress);

        // Update generating state
        if (data.step === "done" && data.status === "complete") {
          setIsGenerating(false);
        }
        if (data.step === "error" && data.status === "failed") {
          setIsGenerating(false);
        }
      } catch (e) {
        // Ignore parse errors
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      if ((ws as any)._keepalive) clearInterval((ws as any)._keepalive);

      // Auto-reconnect after 3s
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [projectId, token, addProgress, setIsGenerating]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        if ((wsRef.current as any)._keepalive) {
          clearInterval((wsRef.current as any)._keepalive);
        }
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { isConnected };
}
