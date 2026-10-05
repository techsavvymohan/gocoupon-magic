/**
 * @file src/context/RealtimeContext.tsx
 * @description GoCoupon Global Realtime Event Bus & State Synchronization Provider.
 *
 * Implements dual-channel live sync:
 *   1. Server-Sent Events (SSE) connection to /api/realtime/events
 *   2. BroadcastChannel ("gocoupon_realtime_sync") for instant sub-millisecond cross-tab sync
 *
 * When any deal, store, or coupon is updated, submitted, or clicked:
 *   - Automatically invalidates TanStack Query caches for instantaneous UI updates
 *   - Invalidates in-memory store catalog cache for search bar autocomplete
 *   - Broadcasts the update to all open tabs and windows
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateStoreCatalogCache } from "@/lib/store-catalog-helper";
import { toast } from "sonner";

export interface RealtimeEvent {
  type: string;
  payload?: any;
  timestamp: string;
}

interface RealtimeContextValue {
  isConnected: boolean;
  isSyncing: boolean;
  lastEvent: RealtimeEvent | null;
  broadcastLocalEvent: (type: string, payload?: any) => void;
  triggerManualRefresh: () => Promise<void>;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  isConnected: false,
  isSyncing: false,
  lastEvent: null,
  broadcastLocalEvent: () => {},
  triggerManualRefresh: async () => {},
});

export const useRealtime = () => useContext(RealtimeContext);

const BROADCAST_CHANNEL_NAME = "gocoupon_realtime_sync";

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);

  // BroadcastChannel for instant multi-tab communication
  const channel = useMemo(() => {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        return new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      } catch {
        return null;
      }
    }
    return null;
  }, []);

  // Central query and cache invalidation handler
  const handleRealtimeInvalidation = useCallback(
    (event: RealtimeEvent, isRemote = true) => {
      setLastEvent(event);

      // Invalidate store catalog cache for NavbarSearch & HeroStoreDealSearch
      invalidateStoreCatalogCache();

      switch (event.type) {
        case "deal:created":
        case "deal:updated":
        case "deal:deleted":
        case "deal:submitted":
          queryClient.invalidateQueries({ queryKey: ["deals"] });
          queryClient.invalidateQueries({ queryKey: ["international-deals"] });
          queryClient.invalidateQueries({ queryKey: ["popular-brands"] });
          queryClient.invalidateQueries({ queryKey: ["submissions"] });
          if (event.type === "deal:submitted" && isRemote) {
            toast.info(
              `⚡ Live Update: New coupon for "${event.payload?.storeName || "Partner Store"}" added!`,
              { duration: 4000 }
            );
          }
          break;

        case "store:created":
        case "store:updated":
        case "store:deleted":
          queryClient.invalidateQueries({ queryKey: ["stores"] });
          queryClient.invalidateQueries({ queryKey: ["popular-brands"] });
          break;

        case "sync:completed":
          queryClient.invalidateQueries({ queryKey: ["deals"] });
          queryClient.invalidateQueries({ queryKey: ["international-deals"] });
          queryClient.invalidateQueries({ queryKey: ["stores"] });
          break;

        case "deal:clicked":
          // Realtime click counter animation update
          queryClient.setQueriesData({ queryKey: ["deals"] }, (old: any) => {
            if (!old || !Array.isArray(old.deals)) return old;
            return {
              ...old,
              deals: old.deals.map((d: any) =>
                d.id === event.payload?.dealId
                  ? { ...d, usesCount: (d.usesCount || 0) + 1 }
                  : d
              ),
            };
          });
          break;

        default:
          break;
      }
    },
    [queryClient]
  );

  // Broadcast an event locally across all tabs
  const broadcastLocalEvent = useCallback(
    (type: string, payload?: any) => {
      const event: RealtimeEvent = {
        type,
        payload,
        timestamp: new Date().toISOString(),
      };
      handleRealtimeInvalidation(event, false);
      if (channel) {
        try {
          channel.postMessage(event);
        } catch {}
      }
    },
    [channel, handleRealtimeInvalidation]
  );

  // Manual refresh trigger
  const triggerManualRefresh = useCallback(async () => {
    setIsSyncing(true);
    try {
      invalidateStoreCatalogCache();
      await Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: ["deals"] }),
        queryClient.invalidateQueries({ queryKey: ["international-deals"] }),
        queryClient.invalidateQueries({ queryKey: ["stores"] }),
        queryClient.invalidateQueries({ queryKey: ["popular-brands"] }),
      ]);
      broadcastLocalEvent("sync:completed");
      toast.success("All deals, coupons & store catalogs refreshed in real time!");
    } finally {
      setIsSyncing(false);
    }
  }, [queryClient, broadcastLocalEvent]);

  // 1. Listen for BroadcastChannel events from other open tabs
  useEffect(() => {
    if (!channel) return;
    const handleChannelMessage = (e: MessageEvent) => {
      if (e.data && e.data.type) {
        handleRealtimeInvalidation(e.data, true);
      }
    };
    channel.addEventListener("message", handleChannelMessage);
    return () => {
      channel.removeEventListener("message", handleChannelMessage);
    };
  }, [channel, handleRealtimeInvalidation]);

  // 2. Connect to Server-Sent Events (SSE) stream
  useEffect(() => {
    if (typeof window === "undefined" || !("EventSource" in window)) return;

    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;
    let isMounted = true;

    function connect() {
      try {
        eventSource = new EventSource("/api/realtime/events");

        eventSource.onopen = () => {
          if (isMounted) setIsConnected(true);
        };

        eventSource.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data: RealtimeEvent = JSON.parse(event.data);
            if (data.type === "ping") return;
            handleRealtimeInvalidation(data, true);
            // Re-broadcast to other tabs
            if (channel) {
              channel.postMessage(data);
            }
          } catch {}
        };

        eventSource.onerror = () => {
          if (isMounted) setIsConnected(false);
          eventSource?.close();
          // Auto-reconnect with exponential backoff (every 5s)
          reconnectTimeout = setTimeout(() => {
            if (isMounted) connect();
          }, 5000);
        };
      } catch {
        if (isMounted) setIsConnected(false);
      }
    }

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      eventSource?.close();
    };
  }, [channel, handleRealtimeInvalidation]);

  return (
    <RealtimeContext.Provider
      value={{
        isConnected,
        isSyncing,
        lastEvent,
        broadcastLocalEvent,
        triggerManualRefresh,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}
