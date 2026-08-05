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
const BOSCOTEC_BASE_URL = 'https://boscotec.org/api/events';
const VIDEO_PROXY_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL
  ? `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/video-proxy`
  : 'https://your-project.supabase.co/functions/v1/video-proxy';

// Utility to fetch media with auth and create object URL
const fetchMediaBlob = async (url: string): Promise<string | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return null;

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Failed to fetch media:', response.status, url);
      return null;
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error('Error fetching media blob:', err);
    return null;
  }
};

// For video clips, we need a proxy solution (e.g., Supabase Edge Function)
// that can stream the video with auth headers
// Currently storing the original URL; video will need proxy to play

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

const mapCameraEventToAlert = async (e: CameraEvent): Promise<Alert> => {
  const eventId = e.id;
  const thumbnailUrl = `${BOSCOTEC_BASE_URL}/${eventId}/thumbnail.jpg`;
  const clipUrl = `${BOSCOTEC_BASE_URL}/${eventId}/clip.mp4`;

  // Determine if we have a clip (video) or just thumbnail (image)
  const hasClip = !!e.clip_ref;
  const mediaType = hasClip ? 'video' as const : 'image' as const;

  // Fetch thumbnail as blob (works for images)
  let thumbnailBlobUrl: string | null = null;
  const { data: { session } } = await supabase.auth.getSession();
  const authToken = session?.access_token;

  if (authToken) {
    try {
      const thumbRes = await fetch(thumbnailUrl, {
        headers: { 'Authorization': `Bearer ${authToken}` },
        cache: 'no-store'
      });
      if (thumbRes.ok) {
        const blob = await thumbRes.blob();
        thumbnailBlobUrl = URL.createObjectURL(blob);
      }
      console.log('[BOSCOTEC] Thumbnail fetch:', eventId, { ok: thumbRes.ok, status: thumbRes.status, hasBlob: !!thumbnailBlobUrl });
    } catch (err) {
      console.error('[BOSCOTEC] Thumbnail fetch error:', err);
    }
  }

  // Build proxy URL for clip that includes auth via edge function
  const clipProxyUrl = hasClip ? `${VIDEO_PROXY_URL}?url=${encodeURIComponent(clipUrl)}` : undefined;

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
    event_id: eventId,
    message: `${e.label} detected in ${e.zone} (${Math.round(e.score * 100)}% confidence)`,
    media_url: hasClip ? clipProxyUrl : (thumbnailBlobUrl ?? thumbnailUrl),
    media_type: mediaType,
    thumbnail_url: thumbnailBlobUrl ?? thumbnailUrl,
    clip_url: clipProxyUrl ?? clipUrl,
    has_clip: hasClip,
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
  const { user, clientData, loading: authLoading } = useAuth();
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

      console.log('[BOSCOTEC] Raw camera events response:', {
        count: cameraResult.count,
        data: cameraResult.data
      });

      if (!isMountedRef.current) return;

      const rfMapped = rfResult.data.map(mapEventToAlert);
      const cameraMapped = await Promise.all(cameraResult.data.map(mapCameraEventToAlert));
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

  // Auto-refresh fallback (every 60 seconds - less aggressive)
  useEffect(() => {
    const interval = setInterval(() => {
      if (clientId && !isLoading && !isLoadingMore) {
        fetchEvents(0, false);
      }
    }, 60000);

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

  // Handle auth - only navigate to login if auth has fully loaded and no user
  useEffect(() => {
    if (authLoading) return; // Don't act until auth loading is complete
    if (!user) navigate('/login');
    setIsLoading(false);
  }, [user, navigate, authLoading]);

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