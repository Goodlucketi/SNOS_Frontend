import React, { useEffect, useState } from 'react';
import { Building2, Users, Home, Radio } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const PlatformOverview: React.FC = () => {
  const [counts, setCounts] = useState<{ [key: string]: number | null }>({
    organizations: null,
    clients: null,
    homes: null,
    sensors: null,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      const tables: Array<keyof typeof counts> = ['organizations', 'clients', 'homes', 'sensors'];
      const results = await Promise.all(
        tables.map((t) => supabase.from(t).select('*', { count: 'exact', head: true }))
      );
      const next: any = {};
      tables.forEach((t, i) => {
        next[t] = results[i].count ?? 0;
      });
      setCounts(next);
    };

    fetchCounts();
  }, []);

  const stats = [
    { label: 'Organizations', value: counts.organizations, icon: Building2 },
    { label: 'Clients', value: counts.clients, icon: Users },
    { label: 'Properties', value: counts.homes, icon: Home },
    { label: 'Active Sensors', value: counts.sensors, icon: Radio },
  ];

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      <div>
        <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">Platform Overview</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          System-wide visibility across every organization and client.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-5 shadow-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/10 mb-3">
              <Icon className="w-4.5 h-4.5" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {value === null ? '—' : value}
            </p>
            <p className="text-xs text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlatformOverview;
