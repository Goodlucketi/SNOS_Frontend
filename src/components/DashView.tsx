import React, { useEffect, useState, useCallback, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SideBar from "./SideBar";
import { useAuth } from "../context/AuthContext";
import {
  getClientEvents,
  getClientCameraEvents,
  updateEventStatus,
  ClientEvent,
  CameraEvent,
} from "../lib/api";
import { Alert, CameraAlert } from "../types";
import { supabase } from "../lib/supabaseClient";

const PAGE_SIZE = 25;

const mapEventToAlert = (e: ClientEvent): Alert => {
  const alert: Alert = {
    id: e.id,
    client_id: e.client_id,
    sensor_id: e.sensor_id ?? '',
    code: e.code,
    message: e.message || 'Sensor triggered an alert',
    occurred_at: e.occurred_at || new Date().toISOString(),
    media_url: e.image,
    status: e.metadata?.status || 'unread',
    source: 'rf' as const,
  };
  return alert;
};

const mapCameraEventToAlert = (e: CameraEvent): Alert => {
  const alert: CameraAlert = {
    id: e.id,
    client_id: e.client_id,
    gateway_id: e.gateway_id,
    camera_id: e.camera_id,
    camera_key: e.camera_key,
    home_id: e.home_id,
    label: e.label,
    zone: e.zone,
    score: e.score,
    started_at: e.started_at,
    ended_at: e.ended_at,
    thumbnail_ref: e.thumbnail_ref,
    clip_ref: e.clip_ref,
    message: `${e.label} detected in ${e.zone} (${Math.round(e.score * 100)}% confidence)`,
    media_url: e.thumbnail_ref ?? e.clip_ref ?? undefined,
    occurred_at: e.started_at,
    status: 'unread' as const,
    source: 'camera' as const,
  };
  return alert;
};

const mergeAndSortEvents = (rfEvents: Alert[], cameraEvents: Alert[]): Alert[] => {
  const all = [...rfEvents, ...cameraEvents];
  return all.sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
};

const DashView: React.FC = () => {
  const { user, clientData } = useAuth();
  const [events, setEvents] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const offsetRef = useRef(0);
  const cameraOffsetRef = useRef(0);
  const isMountedRef = useRef(true);

  const clientId = clientData?.id;

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  // Recalculate unread count when events change
  useEffect(() => {
    setUnreadCount(events.filter(e => e.status === 'unread').length);
  }, [events]);

  // Fetch events with pagination (both RF and camera)
  const fetchEvents = useCallback(async (_offset: number, append = false) => {
    if (!clientId) return;
    try {
      if (!append) setIsLoading(true);
      else setIsLoadingMore(true);

      // Fetch both RF and camera events in parallel
      const [rfResult, cameraResult] = await Promise.all([
        getClientEvents(clientId, { limit: Math.ceil(PAGE_SIZE / 2), offset: append ? offsetRef.current : 0 }),
        getClientCameraEvents(clientId, { limit: Math.ceil(PAGE_SIZE / 2), offset: append ? cameraOffsetRef.current : 0 }),
      ]);

      if (!isMountedRef.current) return;

      const rfMapped = rfResult.data.map(mapEventToAlert);
      const cameraMapped = cameraResult.data.map(mapCameraEventToAlert);
      const merged = mergeAndSortEvents(rfMapped, cameraMapped);

      // Update total count (sum of both)
      setTotalCount(rfResult.count + cameraResult.count);
      const rfHasMore = offsetRef.current + rfMapped.length < rfResult.count;
      const cameraHasMore = cameraOffsetRef.current + cameraMapped.length < cameraResult.count;
      setHasMore((rfHasMore || cameraHasMore) && merged.length > 0);

      if (append) {
        setEvents(prev => [...prev, ...merged]);
        offsetRef.current += rfMapped.length;
        cameraOffsetRef.current += cameraMapped.length;
      } else {
        setEvents(merged);
        offsetRef.current = rfMapped.length;
        cameraOffsetRef.current = cameraMapped.length;
      }
    } catch (error) {
      console.error("Failed to load events from Supabase:", error);
      if (!append) setEvents([]);
    } finally {
      if (!append) setIsLoading(false);
      else setIsLoadingMore(false);
    }
  }, [clientId]);

  // Initial load
  useEffect(() => {
    fetchEvents(0, false);
  }, [fetchEvents]);

  // Realtime subscription
  useEffect(() => {
    if (!clientId) return;

    const channel = supabase
      .channel(`rf_events:${clientId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'rf_events',
        filter: `client_id=eq.${clientId}`
      }, (payload) => {
        const newEvent = payload.new as ClientEvent;
        const newAlert = mapEventToAlert(newEvent);
        setEvents(prev => [newAlert, ...prev]);
        setTotalCount(prev => prev + 1);
        setUnreadCount(prev => prev + 1);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'rf_events',
        filter: `client_id=eq.${clientId}`
      }, (payload) => {
        const updatedEvent = payload.new as ClientEvent;
        const updatedAlert = mapEventToAlert(updatedEvent);
        setEvents(prev => prev.map(e => e.id === updatedAlert.id ? updatedAlert : e));
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [clientId]);

  // Auto-refresh fallback (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (clientId && !isLoading && !isLoadingMore) {
        fetchEvents(0, false);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [clientId, fetchEvents, isLoading, isLoadingMore]);

  // Load more for infinite scroll
  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      fetchEvents(offsetRef.current, true);
    }
  }, [fetchEvents, hasMore, isLoadingMore]);

  // Status update mutation
  const handleStatusUpdate = useCallback(async (eventId: string, status: Alert['status']) => {
    try {
      await updateEventStatus(eventId, status);
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status } : e));
    } catch (error) {
      console.error("Failed to update event status:", error);
    }
  }, []);

  // Handle auth
  useEffect(() => {
    if (user === null) return;
    if (!user) navigate('/login');
    setIsLoading(false);
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="font-mono text-xs font-bold uppercase tracking-wider">Loading Console...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col md:flex-row">
      {/* Sidebar Section */}
      <SideBar unreadCount={unreadCount} clientData={clientData} />

      {/* Dynamic Views Viewport */}
      <main className="flex-grow p-4 md:p-8 md:pl-[288px] overflow-y-auto max-w-7xl mx-auto w-full">
        <Outlet
          context={{
            events,
            setEvents,
            user,
            clientData,
            isLoadingMore,
            hasMore,
            loadMore,
            totalCount,
            onStatusUpdate: handleStatusUpdate,
          }}
        />
      </main>
    </div>
  );
};

export default DashView;