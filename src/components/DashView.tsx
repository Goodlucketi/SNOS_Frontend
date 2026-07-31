import React, { useEffect, useState, useCallback, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SideBar from "./SideBar";
import { useAuth } from "../context/AuthContext";
import { getClientEvents, updateEventStatus, ClientEvent, PaginatedEvents } from "../lib/api";
import { Alert } from "../types";
import { supabase } from "../lib/supabaseClient";

const PAGE_SIZE = 25;

const mapEventToAlert = (e: ClientEvent): Alert => ({
  id: e.id,
  client_id: e.client_id,
  sensor_id: e.sensor_id ?? '',
  code: e.code,
  message: e.message || 'Sensor triggered an alert',
  occurred_at: e.occurred_at || new Date().toISOString(),
  media_url: e.image,
  status: e.metadata?.status || 'unread',
});

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

  // Fetch events with pagination
  const fetchEvents = useCallback(async (offset: number, append = false) => {
    if (!clientId) return;
    try {
      if (!append) setIsLoading(true);
      else setIsLoadingMore(true);

      const result: PaginatedEvents = await getClientEvents(clientId, { limit: PAGE_SIZE, offset });

      if (!isMountedRef.current) return;

      const mapped = result.data.map(mapEventToAlert);
      setHasMore(offset + mapped.length < result.count && mapped.length === PAGE_SIZE);
      setTotalCount(result.count);

      if (append) {
        setEvents(prev => [...prev, ...mapped]);
        offsetRef.current += mapped.length;
      } else {
        setEvents(mapped);
        offsetRef.current = mapped.length;
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