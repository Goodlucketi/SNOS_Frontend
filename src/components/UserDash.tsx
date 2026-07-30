import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Bell, ShieldAlert, CheckCircle2, Clock, MapPin, KeyRound, Radio, Signal } from 'lucide-react';
import { motion } from 'motion/react';
import { Alert, User } from '../types';

interface OutletContextType {
  alerts: Alert[];
  user: User;
}

const UserDash: React.FC = () => {
  const { alerts = [], user = {} as User } = useOutletContext<OutletContextType>();

  const unreadCount = alerts.filter(alert => alert.status === 'unread').length;
  const inProgressCount = alerts.filter(alert => alert.status === 'in-progress').length;
  const completedCount = alerts.filter(alert => alert.status === 'complete' || alert.status === 'completed').length;

  // Generate a friendly local greeting
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good morning";
    if (hours < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-8 font-sans animate-fade-in">
      
      {/* Header Profile Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-800 relative overflow-hidden shadow-xl">
        {/* Abstract Background Design */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(37,99,235,0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-wider">{getGreeting()}, Console Operator</p>
            <h2 className="text-3xl font-display font-extrabold tracking-tight">
              Welcome, {user?.name || "Client User"}
            </h2>
            <p className="text-sm text-slate-400 max-w-lg leading-relaxed">
              Your SNOS sensory nodes are active. You are connected to the central Lagos Security Gateway network.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-semibold">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse animate-duration-1000" />
              <span>Link Status: </span>
              <span className="text-emerald-400 font-bold">STABLE</span>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-semibold">
              <Signal className="w-4 h-4 text-blue-400" />
              <span>Gateway Power: </span>
              <span className="text-blue-400 font-bold">98%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Counts + Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Unread Alerts Card */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl shadow-sm flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Unread Signals</span>
            <p className="text-3xl font-display font-extrabold text-slate-950 dark:text-white mt-1">{unreadCount}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${unreadCount > 0 ? 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-950 dark:text-slate-600'}`}>
            <ShieldAlert className={`w-6 h-6 ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
          </div>
        </motion.div>

        {/* In-Progress Alerts Card */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl shadow-sm flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">In Response</span>
            <p className="text-3xl font-display font-extrabold text-slate-950 dark:text-white mt-1">{inProgressCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Completed Alerts Card */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl shadow-sm flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Resolved Signals</span>
            <p className="text-3xl font-display font-extrabold text-slate-950 dark:text-white mt-1">{completedCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </motion.div>

      </div>

      {/* Monitored Assets Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white">Active Monitored Perimeter</h3>
          <span className="text-xs font-semibold text-slate-400 uppercase font-mono">Bound Node: {user?.user_id}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Asset 1: LoT */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-855 rounded-2xl shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Location (LoT)</span>
            </div>
            <div>
              <h4 className="font-display font-bold text-base text-slate-900 dark:text-white truncate">{user?.location || "Unspecified Area"}</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 truncate">{user?.address || "Lagos, Nigeria"}</p>
            </div>
            <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-[10px]">
              <span className="font-mono text-slate-400">STATUS: SENSORS ARMED</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </div>

          {/* Asset 2: OoT */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-855 rounded-2xl shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Object (OoT)</span>
            </div>
            <div>
              <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">Commercial Properties</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Vehicle Fleet & Vault Locks</p>
            </div>
            <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-[10px]">
              <span className="font-mono text-slate-400">STATUS: NO BREACHES</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </div>

          {/* Asset 3: PoT */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-855 rounded-2xl shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Point (PoT)</span>
            </div>
            <div>
              <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">Secure Safe / Fence Line</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Main Entry Gates & Sector 3 Fence</p>
            </div>
            <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-[10px]">
              <span className="font-mono text-slate-400">STATUS: RE-SECURED</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default UserDash;
