import React from 'react';
import { X, Clock, Calendar, ShieldAlert, AlertTriangle, ArrowRight, Server, FileVideo, FileImage } from 'lucide-react';
import { motion } from 'motion/react';
import { Alert, CameraAlert } from '../types';
import { formatDateGMT1, formatTimeGMT1 } from '../lib/timezone';

interface AlertDetailsModalProps {
  alert: Alert;
  onClose: () => void;
}

const AlertDetailsModal: React.FC<AlertDetailsModalProps> = ({ alert, onClose }) => {
  // Type guard for CameraAlert
  const isCameraAlert = (event: Alert): event is CameraAlert => event.source === 'camera';
  const cameraAlert = isCameraAlert(alert);

  // Use media_type field if available (only on CameraAlert), otherwise fall back to URL extension check
  const isVideo = cameraAlert && alert.media_type === 'video'
    || (!cameraAlert && alert.media_url?.toLowerCase().endsWith(".mp4"));
  const hasMedia = !!alert.media_url;

  // Parse status badge
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'unread':
        return {
          bg: 'bg-red-500/15 text-red-400 border-red-500/30',
          indicator: 'bg-red-500',
          text: 'CRITICAL UNREAD BREACH',
          ping: true
        };
      case 'in-progress':
        return {
          bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          indicator: 'bg-amber-500',
          text: 'DISPATCH RESPONDING ACTIVE',
          ping: false
        };
      case 'complete':
      case 'completed':
        return {
          bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          indicator: 'bg-emerald-500',
          text: 'SECTOR SECURED / RESOLVED',
          ping: false
        };
      default:
        return {
          bg: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
          indicator: 'bg-slate-500',
          text: 'UNKNOWN STATUS',
          ping: false
        };
    }
  };

  const statusConfig = getStatusConfig(alert.status);

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4 md:p-6 bg-slate-950/85 backdrop-blur-xl">
      {/* Click outside to close wrapper */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Floating Top-Right Close Button for Immersive Feel */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 md:top-8 md:right-8 z-50 p-3 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-all border border-slate-800/80 backdrop-blur-md shadow-lg hover:shadow-red-500/10 active:scale-95"
        aria-label="Close modal terminal"
      >
        <X className="w-6 h-6" />
      </button>

      {hasMedia ? (
        /* Immersive High-Fidelity Media View Overlay (Full Window focus) */
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.45 }}
          className="relative w-full max-w-4xl flex flex-col z-10 max-h-[92vh]"
        >
          {/* Main Media Showcase Container */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl flex items-center justify-center group">
            {isVideo ? (
              <video
                controls
                autoPlay
                muted
                loop
                className="w-full h-full object-contain"
              >
                <source src={alert.media_url} type="video/mp4" />
                Your browser does not support video streaming.
              </video>
            ) : (
              <img
                src={alert.media_url}
                alt="High-resolution breach snapshot"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            )}

            {/* Float Badge: Media type */}
            <div className="absolute bottom-4 right-4 px-3.5 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-md">
              {isVideo ? (
                <>
                  <FileVideo className="w-4.5 h-4.5 text-blue-400" />
                  <span>LIVE SURVEILLANCE FEED (MP4)</span>
                </>
              ) : (
                <>
                  <FileImage className="w-4.5 h-4.5 text-emerald-400" />
                  <span>HIGH-RES CAPTURE (JPEG)</span>
                </>
              )}
            </div>
          </div>

          {/* Translucent Meta Information Overlay beneath Media */}
          <div className="mt-4 p-5 bg-slate-900/80 backdrop-blur-md border border-slate-850 rounded-2xl shadow-xl space-y-4 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                  <ShieldAlert className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold tracking-widest text-slate-550 uppercase block">Active Alert Segment</span>
                  <h3 className="text-sm font-mono font-extrabold text-white mt-0.5">
                    ID: {alert.id}
                  </h3>
                </div>
              </div>

              {/* Status Indicator Bar */}
              <div className="flex items-center gap-2.5">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold tracking-wider ${statusConfig.bg}`}>
                  {statusConfig.ping && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                    </span>
                  )}
                  {!statusConfig.ping && <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.indicator}`} />}
                  {statusConfig.text}
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/60 border border-slate-800 text-slate-400 text-[11px] font-mono font-bold">
                  <Server className="w-3.5 h-3.5" />
                  GATEWAY: {alert.client_id}
                </span>
              </div>
            </div>

            {/* Message Frame */}
            <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">Incident Description</span>
              <p className="text-sm font-bold text-slate-200 leading-relaxed">
                {alert.message}
              </p>
            </div>

            {/* Timestamps */}
            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-850 pt-3">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>Detection: <strong className="text-slate-200 font-semibold">{formatDateGMT1(alert.occurred_at)}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>System Time: <strong className="text-slate-200 font-mono font-semibold">{formatTimeGMT1(alert.occurred_at)} (GMT+1)</strong></span>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Text-Only Elegant Minimalist Card View */
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10 p-6 md:p-8 space-y-6"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">System Logs Logged</span>
              <h3 className="text-base font-display font-extrabold text-slate-900 dark:text-white mt-0.5">
                Textual Alarm: {alert.id}
              </h3>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold tracking-wider ${statusConfig.bg}`}>
              {statusConfig.ping && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                </span>
              )}
              {!statusConfig.ping && <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.indicator}`} />}
              {statusConfig.text}
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-mono font-bold">
              <Server className="w-3.5 h-3.5" />
              GATEWAY: {alert.client_id}
            </span>
          </div>

          {/* Description details */}
          <div className="bg-slate-55 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-850 p-5 rounded-2xl">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 block mb-1">Command Summary</span>
            <p className="text-base font-extrabold text-slate-900 dark:text-white leading-relaxed">
              {alert.message}
            </p>
          </div>

          {/* Times Grid */}
          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/80 pt-5">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-500 uppercase">Detection Date</span>
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-750 dark:text-slate-200">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>{formatDateGMT1(alert.occurred_at)}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-500 uppercase">Detection Time</span>
              <div className="flex items-center gap-1.5 text-sm font-mono font-bold text-slate-750 dark:text-slate-200">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>{formatTimeGMT1(alert.occurred_at)} (GMT+1)</span>
              </div>
            </div>
          </div>

          {/* Close Action */}
          <div className="flex items-center justify-end pt-2">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-650 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md hover:scale-98"
            >
              <span>Dismiss Entry</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AlertDetailsModal;
