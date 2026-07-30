import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, ShieldAlert, Play, Eye, FileVideo, Clock, Calendar, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Alert, User } from '../types';
import AlertDetailsModal from './AlertDetailsModal';

interface OutletContextType {
  alerts: Alert[];
  user: User;
}

const Alerts: React.FC = () => {
  const { alerts = [], user = {} as User } = useOutletContext<OutletContextType>();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'in-progress' | 'complete'>('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  // SECURITY/UX FIX: this component previously showed fabricated
  // "MOCK-1..4" intrusion alerts (fake break-ins, fake sensor triggers)
  // whenever the real alerts list was simply empty - which is a normal,
  // common state (e.g. a brand new account with no incidents yet), not
  // an error condition. For a security product, showing fake intrusion
  // alerts as if real could seriously and needlessly alarm someone.
  // The real empty state below (lines further down) already exists and
  // handles this correctly - it just never used to be reachable.
  const finalAlerts = alerts;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  // Filter alerts by search query AND status tab
  const filteredAlerts = finalAlerts
    .filter(alert => {
      const matchesSearch = alert.message_text.toLowerCase().includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

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
            placeholder="Search triggers or messages..."
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

      {/* Alerts Grid */}
      {filteredAlerts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 rounded-2xl flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-950 text-slate-400 dark:text-slate-600 flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">No signals matched your filters</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Try resetting the status tab or searching other phrases.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredAlerts.map((alert) => {
            const isVideo = alert.media_url?.toLowerCase().endsWith(".mp4");
            const isImage = alert.media_url?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);

            const hasMedia = !!alert.media_url;

            return (
              <motion.div
                key={alert.id}
                layout
                whileHover={{ y: -2 }}
                onClick={() => setSelectedAlert(alert)}
                className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-5 shadow-sm flex flex-col gap-4 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-800 transition-all cursor-pointer"
              >
                {/* Header for text-only card */}
                {!hasMedia && (
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      {getStatusBadge(alert.status)}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {alert.timestamp.split(' ')[0]}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {alert.timestamp.split(' ')[1] || alert.timestamp}
                      </span>
                    </div>
                  </div>
                )}

                {/* Media frame */}
                {hasMedia && (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 group">
                    {isVideo ? (
                      <video
                        controls={false}
                        muted
                        className="w-full h-full object-cover"
                      >
                        <source src={alert.media_url} type="video/mp4" />
                        Your browser does not support video.
                      </video>
                    ) : (
                      <img
                        src={alert.media_url}
                        alt="Intrusion media frame"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                        referrerPolicy="no-referrer"
                      />
                    )}

                    {/* Interactive inspect indicator on hover */}
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold pointer-events-none">
                      <Eye className="w-4 h-4 text-blue-400" />
                      <span>Click to Inspect Signal</span>
                    </div>

                    {/* Badges layered over media */}
                    <div className="absolute top-3 left-3 z-10">
                      {getStatusBadge(alert.status)}
                    </div>
                  </div>
                )}

                {/* Info and Content */}
                <div className="flex-grow space-y-3">
                  {hasMedia && (
                    <div className="flex items-center gap-4 text-xs font-mono text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {alert.timestamp.split(' ')[0]}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {alert.timestamp.split(' ')[1] || alert.timestamp}
                      </span>
                    </div>
                  )}

                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                    {alert.message_text}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
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
