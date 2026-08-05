import React from 'react';
import { X, Clock, Calendar, ShieldAlert, ArrowRight, Server, FileVideo, FileImage } from 'lucide-react';
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

  // Check if we have a blob URL (thumbnail loaded with auth)
  const hasBlobThumbnail = cameraAlert && alert.thumbnail_url?.startsWith('blob:');

  // Use media_type field if available (only on CameraAlert), otherwise fall back to URL extension check
  const isVideo = cameraAlert && alert.media_type === 'video'
    || (!cameraAlert && alert.media_url?.toLowerCase().endsWith(".mp4"));
  const hasMedia = hasBlobThumbnail || (cameraAlert && !!alert.thumbnail_url) || !!alert.media_url;

  // Source type label
  const SourceIcon = cameraAlert ? FileVideo : ShieldAlert;
  const sourceLabel = cameraAlert ? 'CAMERA EVENT' : 'RF EVENT';
  const sourceColor = cameraAlert ? 'text-blue-400' : 'text-blue-500';
  const sourceBg = cameraAlert ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-500/10 border-blue-500/20';

  // Determine what to show in modal
  const showThumbnail = hasBlobThumbnail || (cameraAlert && !!alert.thumbnail_url);
  const thumbUrl = hasBlobThumbnail ? alert.thumbnail_url : (cameraAlert ? alert.thumbnail_url : alert.media_url);
  const showVideo = cameraAlert && isVideo && (alert.has_clip || alert.clip_url);

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
        /* Immersive High-Fidelity Media View - Side by Side Layout */
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.45 }}
          className="relative w-full max-w-6xl flex flex-col lg:flex-row z-10 max-h-[92vh] gap-4 lg:gap-6"
        >
          {/* Left Panel: Media Showcase */}
          <div className="relative flex-1 lg:flex-[0_0_55%] min-w-0 flex flex-col">
            <div className="relative aspect-video lg:aspect-[4/3] w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl flex items-center justify-center group flex-1">
              {showVideo && alert.clip_url ? (
                // Video clip with proxy URL - playable in modal
                <video
                  src={alert.clip_url}
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-contain"
                  poster={showThumbnail ? thumbUrl : undefined}
                >
                  Your browser does not support video streaming.
                </video>
              ) : showThumbnail ? (
                // High-res thumbnail
                <img
                  src={thumbUrl}
                  alt="High-resolution breach snapshot"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                // Fallback for camera events with only video URL but no clip
                <video
                  src={alert.media_url}
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-contain"
                >
                  Your browser does not support video streaming.
                </video>
              )}

              {/* Float Badge: Media type */}
              <div className="absolute bottom-4 right-4 px-3.5 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-md">
                {showVideo && alert.clip_url ? (
                  <>
                    <FileVideo className="w-4.5 h-4.5 text-blue-400" />
                    <span>VIDEO CLIP (MP4)</span>
                  </>
                ) : showThumbnail ? (
                  <>
                    <FileImage className="w-4.5 h-4.5 text-emerald-400" />
                    <span>HIGH-RES CAPTURE (JPEG)</span>
                  </>
                ) : (
                  <>
                    <FileVideo className="w-4.5 h-4.5 text-blue-400" />
                    <span>LIVE SURVEILLANCE FEED (MP4)</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Details & Meta Information */}
          <div className="flex-1 lg:flex-[0_0_45%] min-w-0 flex flex-col bg-slate-900/80 backdrop-blur-md border border-slate-850 rounded-2xl shadow-xl overflow-y-auto lg:overflow-hidden p-5 md:p-6 space-y-4 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${sourceBg} flex items-center justify-center ${sourceColor} border`}>
                  <SourceIcon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold tracking-widest text-slate-550 uppercase block">Active Alert Segment</span>
                  <h3 className="text-sm font-mono font-extrabold text-white mt-0.5">
                    ID: {alert.id}
                  </h3>
                </div>
              </div>

              {/* Source Type Indicator */}
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold tracking-wider bg-slate-950/60 border-slate-800 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {sourceLabel}
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

            {/* Additional Details for Camera Events */}
            {cameraAlert && (
              <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl space-y-3">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Camera Details</span>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-500 block mb-0.5">Label</span>
                    <span className="text-white font-medium">{alert.label}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Zone</span>
                    <span className="text-white font-medium">{alert.zone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Confidence</span>
                    <span className="text-white font-medium">{Math.round(alert.score * 100)}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Gateway</span>
                    <span className="text-white font-medium">{alert.gateway_id}</span>
                  </div>
                  {alert.camera_id && (
                    <div className="col-span-2">
                      <span className="text-slate-500 block mb-0.5">Camera ID</span>
                      <span className="text-white font-medium">{alert.camera_id}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

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

            {/* Close Action at bottom */}
            <div className="flex items-center justify-end pt-2 mt-auto">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md hover:scale-98"
              >
                <span>Dismiss Entry</span>
                <ArrowRight className="w-4 h-4" />
              </button>
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
            <div className={`w-10 h-10 rounded-xl ${sourceBg} flex items-center justify-center ${sourceColor} border`}>
              <SourceIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">System Logs Logged</span>
              <h3 className="text-base font-display font-extrabold text-slate-900 dark:text-white mt-0.5">
                Textual Alarm: {alert.id}
              </h3>
            </div>
          </div>

          {/* Source Badge */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold tracking-wider bg-slate-100 dark:bg-slate-850 border-slate-200/50 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {sourceLabel}
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