import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SideBar from "./SideBar";
import { useAuth } from "../context/AuthContext";
import { getClientEvents } from "../lib/api";
import { Alert } from "../types";

const DashView: React.FC = () => {
  const { user, clientData } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user === null) {
      return;
    }
    if (!user) {
      navigate('/login');
    }
    setIsLoading(false);
  }, [user, navigate]);

  useEffect(() => {
    const fetchUserAlerts = async () => {
      
      if (!user?.id) return;
      try {
        const events = await getClientEvents(user.id);
       
        const mapped: Alert[] = events.map((e) => ({
          id: e.id,
          user_id: e.client_id,
          message_text: e.message || 'Sensor triggered an alert',
          timestamp: e.created_at,
          media_url: e.image,
          status: e.metadata?.status || 'unread',
        }));
        setAlerts(mapped);
      } catch (error) {
        console.error("Failed to load alerts from Supabase:", error);
        setAlerts([]);
      }
    };

    if (user?.id) {
      fetchUserAlerts();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="font-mono text-xs font-bold uppercase tracking-wider">Loading Console...</span>
      </div>
    );
  }

  const unreadCount = Array.isArray(alerts) ? alerts.filter(alert => alert.status === 'unread').length : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col md:flex-row">
      {/* Sidebar Section */}
      <SideBar unreadCount={unreadCount} clientData={clientData} />

      {/* Dynamic Views Viewport */}
      <main className="flex-grow p-4 md:p-8 md:pl-[288px] overflow-y-auto max-w-7xl mx-auto w-full">
        <Outlet context={{ alerts, setAlerts, user, clientData }} />
      </main>
    </div>
  );
};

export default DashView;