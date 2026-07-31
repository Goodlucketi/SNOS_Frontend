import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, ShieldAlert, Play, Eye, FileVideo, Clock, Calendar, AlertTriangle, ChevronDown, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Alert } from '../types';
import AlertDetailsModal from './AlertDetailsModal';

interface OutletContextType {
  events: Alert[];
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
  totalCount: number;
  onStatusUpdate: (eventId: string, status: Alert['status']) => void;
}

const Alerts: React.FC = () => {
  const {
    events = [],
    isLoadingMore,
    hasMore,
    loadMore,
    totalCount,
    onStatusUpdate,
  } = useOutletContext<OutletContextType>();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'in-progress' | 'complete'>('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<string | null>(null);

  const observerTargetRef = useRef<HTMLDivElement>(null);

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

  // Filter events by search query AND status tab
  const filteredEvents = events
    .filter(event => {
      const matchesSearch = event.message.toLowerCase().includes(searchQuery) ||
        event.code?.toLowerCase().includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-xs font-bold"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" /> UNREAD</span>;
      case 'in-progress':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold">RESPONDING</span>;
      case 'complete':
      case 'completed':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold">RESOLVED</span>;
      default:
        return null;
    }
  };

  const handleStatusChange = (eventId: string, newStatus: Alert['status'], e: React.MouseEvent) => {
    e.stopPropagation();
    setStatusDropdownOpen(null);
    onStatusUpdate(eventId, newStatus);
  };

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

        {/* Status Tab Filters */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/40 dark:border-slate-800/40 self-start sm:self-auto">
          {(['all', 'unread', 'in-progress', 'complete'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`py-2 px-3.5 rounded-lg text-xs font-bold capitalize transition-all ${statusFilter === tab ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              {tab === 'complete' ? 'resolved' : tab}
            </button>
          ))}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredEvents.map((event) => {
              const isVideo = event.media_url?.toLowerCase().endsWith(".mp4");
              const hasMedia = !!event.media_url;

              return (
                <motion.div
                  key={event.id}
                  layout
                  whileHover={{ y: -2 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-5 shadow-sm flex flex-col gap-4 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-800 transition-all cursor-pointer"
                  onClick={() => setSelectedAlert(event)}
                >
                  {/* Header with sensor code and status */}
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {/* {event.code && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-medium border border-slate-200 dark:border-slate-700">
                          <ShieldAlert className="w-3 h-3 mr-1 text-blue-500" />
                          {event.code}
                        </span>
                      )} */}
                      {getStatusBadge(event.status)}
                    </div>

                    {/* Status dropdown */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setStatusDropdownOpen(statusDropdownOpen === event.id ? null : event.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Change status"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {statusDropdownOpen === event.id && (
                        <div className="absolute right-0 top-full mt-1.5 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 z-20 animate-fade-in">
                          {(['unread', 'in-progress', 'complete'] as const).map((status) => (
                            <button
                              key={status}
                              onClick={(e) => handleStatusChange(event.id, status, e)}
                              className={`w-full px-3 py-2 text-left text-sm transition-colors ${event.status === status ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            >
                              {status === 'unread' && 'Mark Unread'}
                              {status === 'in-progress' && 'Responding'}
                              {status === 'complete' && 'Mark Resolved'}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Media frame */}
                  {hasMedia && (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 group">
                      {isVideo ? (
                        <video
                          controls={false}
                          muted
                          className="w-full h-full object-cover"
                        >
                          <source src={event.media_url} type="video/mp4" />
                          Your browser does not support video.
                        </video>
                      ) : (
                        <img
                          src={event.media_url}
                          alt="Sensor media frame"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                          referrerPolicy="no-referrer"
                        />
                      )}

                      {/* Interactive inspect indicator on hover */}
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold pointer-events-none">
                        <Eye className="w-4 h-4 text-blue-400" />
                        <span>Click to Inspect Signal</span>
                      </div>
                    </div>
                  )}

                  {/* Info and Content */}
                  <div className="flex-grow space-y-3">
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {event.occurred_at.split('T')[0]}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {event.occurred_at.split('T')[1]?.split('.')[0]}
                      </span>
                    </div>

                    <p className="text-lg font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                      {event.message}
                    </p>
                  </div>
                </motion.div>
              );
            })}

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
          </div>

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