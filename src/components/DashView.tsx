import React, { useEffect, useState } from "react";
import axios from "axios";
import { Outlet, useNavigate } from "react-router-dom";
import SideBar from "./SideBar";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../types";

const DashView: React.FC = () => {
  const { user } = useAuth();
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
      if (!user?.user_id) return;
      try {
        const response = await axios.get(`/api/alerts/read.php?user_id=${user.user_id}`);
        if (Array.isArray(response.data)) {
          setAlerts(response.data);
        } else {
          // If response isn't an array or success is false, use empty array (will fallback to mock inside child view)
          setAlerts([]);
        }
      } catch (error) {
        console.error("Alerts API server error:", error);
        // Do not spam toast error on standard connection blockages, let children display mock data gracefully
        setAlerts([]);
      }
    };
    
    if (user?.user_id) {
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
      <SideBar unreadCount={unreadCount} />

      {/* Dynamic Views Viewport */}
      <main className="flex-grow p-4 md:p-8 md:pl-[288px] overflow-y-auto max-w-7xl mx-auto w-full">
        <Outlet context={{ alerts, setAlerts, user }} />
      </main>
    </div>
  );
};

export default DashView;
