import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, ShieldAlert, Eye, Clock, Calendar, RefreshCw, Cpu, Radio, Play, FileImage, FileVideo } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Alert, CameraAlert } from '../types';
import AlertDetailsModal from './AlertDetailsModal';
import { formatDateGMT1, formatTimeGMT1 } from '../lib/timezone';

interface OutletContextType {
  events: Alert[];
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
  totalCount: number;
}

// Type guard for CameraAlert
const isCameraAlert = (event: Alert): event is CameraAlert => event.source === 'camera';

// Helper to expand camera events with both thumbnail and clip into separate display entries
const expandEventsForDisplay = (events: Alert[]): Alert[] => {
  const expanded: Alert[] = [];

  for (const event of events) {
    if (isCameraAlert(event)) {
      // If camera event has both thumbnail and clip, create two separate entries
      if (event.has_clip && event.thumbnail_url && event.clip_url) {
        // Entry 1: Thumbnail/Image card
        expanded.push({
          ...event,
          id: `${event.id}-thumb`,
          media_type: 'image' as const,
          media_url: event.thumbnail_url,
          thumbnail_url: event.thumbnail_url,
          has_clip: false, // This card is for image only
        } as CameraAlert);

        // Entry 2: Video/Clip card
        expanded.push({
          ...event,
          id: `${event.id}-clip`,
          media_type: 'video' as const,
          media_url: event.clip_url,
          clip_url: event.clip_url,
          has_clip: true,
        } as CameraAlert);
      } else {
        // Keep as-is for other camera events
        expanded.push(event);
      }
    } else {
      // Keep as-is for RF events
      expanded.push(event);
    }
  }

  return expanded;
};

const Alerts: React.FC = () => {
  const {
    events = [],
    isLoadingMore,
    hasMore,
    loadMore,
    totalCount,
  } = useOutletContext<OutletContextType>();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const observerTargetRef = useRef<HTMLDivElement>(null);

  // Expand camera events with both thumbnail and clip into separate cards
  const expandedEvents = useMemo(() => expandEventsForDisplay(events), [events]);

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (observerTargetRef.current) {
      observer.observe(observerTargetRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMore]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  // Filter events by search query only (no status filter)
  const filteredEvents = expandedEvents
    .filter(event => {
      const matchesSearch = event.message.toLowerCase().includes(searchQuery) ||
        (event.source === 'rf' && event.code?.toLowerCase().includes(searchQuery));
      return matchesSearch;
    })
    .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">Security Alerts Terminal</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review live media streams and triggers sent by your LoT sensory system.</p>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400 dark:text-slate-600" />
          <input
            type="search"
            placeholder="Search triggers, messages, or sensor codes..."
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 rounded-2xl flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-950 text-slate-400 dark:text-slate-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">{events.length === 0 ? 'No signals received yet' : 'No signals matched your filters'}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              {events.length === 0
                ? 'Your LoT sensors will appear here when they trigger.'
                : 'Try resetting the status tab or searching other phrases.'}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const cameraEvent = isCameraAlert(event);
              const isVideo = cameraEvent && event.media_type === 'video'
                || (!cameraEvent && event.media_url?.toLowerCase().endsWith(".mp4"));
              const hasMedia = !!event.media_url;

              return (
                <motion.div
                  key={event.id}
                  layout
                  whileHover={{ y: -2 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-5 shadow-sm flex flex-col gap-4 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-800 transition-all cursor-pointer h-full"
                  onClick={() => setSelectedAlert(event)}
                >
                  {/* Header */}
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-medium border ${
                        event.source === 'camera'
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                      }`}>
                        {event.source === 'camera' ? (
                          <>
                            <Radio className="w-3 h-3 mr-1" />
                            CAM
                          </>
                        ) : (
                          <>
                            <Cpu className="w-3 h-3 mr-1" />
                            RF
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Media frame - always present, default for sensors */}
                  {/* Get thumbnail URL safely for camera events */}
                  {(() => {
                    const thumbUrl = cameraEvent ? event.thumbnail_url : undefined;
                    const isVideo = cameraEvent && event.media_type === 'video'
                      || (!cameraEvent && event.media_url?.toLowerCase().endsWith(".mp4"));
                    const hasMedia = !!event.media_url;

                    return (
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 group flex-shrink-0">
                        {isVideo && event.media_url ? (
                          // Video clip card - using proxy URL
                          <div className="relative w-full h-full">
                            <video
                              src={event.media_url}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                              preload="metadata"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                                <Play className="w-6 h-6 ml-1" />
                              </div>
                            </div>
                            <div className="absolute bottom-2 left-2 text-xs font-medium text-white bg-slate-950/70 px-1.5 py-0.5 rounded">
                              Clip
                            </div>
                          </div>
                        ) : thumbUrl || event.media_url ? (
                          // Image/thumbnail card
                          <img
                            src={thumbUrl || event.media_url}
                            alt={event.source === 'camera' ? 'Camera snapshot' : 'Sensor media frame'}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                            referrerPolicy="no-referrer"
                          />
                        ) : !cameraEvent && hasMedia ? (
                          // RF sensor event with media (fallback)
                          <img
                            src={event.media_url}
                            alt="Sensor media frame"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          // Default sensor icon for RF events without media
                          <div className="flex items-center justify-center h-full w-full bg-slate-50 dark:bg-slate-900">
                            <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-slate-500">
                              <Cpu className="w-16 h-16 text-blue-500 opacity-60" />
                              <span className="text-sm font-medium">LoT Sensor</span>
                              <span className="text-xs text-slate-500 dark:text-slate-600">No media captured</span>
                            </div>
                          </div>
                        )}

                        {/* Media type badge */}
                        <div className="absolute top-2 right-2 px-2 py-1 rounded bg-slate-950/70 text-white text-xs font-medium">
                          {isVideo ? <FileVideo className="w-3 h-3 inline mr-1" /> : <FileImage className="w-3 h-3 inline mr-1" />}
                          {isVideo ? 'Clip' : 'Snapshot'}
                        </div>

                        {/* Interactive inspect indicator on hover */}
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold pointer-events-none">
                          <Eye className="w-4 h-4 text-blue-400" />
                          <span>{isVideo ? 'Click to Play Clip' : 'Click to View Snapshot'}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Info and Content */}
                  <div className="flex-grow space-y-3 flex flex-col">
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDateGMT1(event.occurred_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTimeGMT1(event.occurred_at)}
                      </span>
                    </div>

                    <p className="text-base font-semibold text-slate-800 dark:text-slate-100 leading-relaxed line-clamp-2">
                      {event.message}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Infinite scroll trigger */}
          {hasMore && (
            <div ref={observerTargetRef} className="col-span-full flex justify-center py-4">
              {isLoadingMore ? (
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Loading more signals...
                </div>
              ) : (
                <button
                  onClick={loadMore}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
                >
                  Load more
                </button>
              )}
            </div>
          )}

          {/* Total count indicator */}
          <div className="text-center py-2 text-xs text-slate-500 dark:text-slate-400">
            Showing {filteredEvents.length} of {totalCount} signal{totalCount !== 1 ? 's' : ''}
          </div>
        </>
      )}

      {/* Full detail Inspection Modal overlay */}
      <AnimatePresence>
        {selectedAlert && (
          <AlertDetailsModal
            alert={selectedAlert}
            onClose={() => setSelectedAlert(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Alerts;