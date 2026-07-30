import React, { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface Org {
  id: string;
  name: string;
  type: 'estate' | 'corporate';
  created_at?: string;
}

const Organizations: React.FC = () => {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrgs = async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) setOrgs(data);
      setLoading(false);
    };

    fetchOrgs();
  }, []);

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      <div>
        <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">Organizations</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Every estate and corporate account on the platform.
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-slate-400 py-12 text-center">Loading organizations...</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl divide-y divide-slate-100 dark:divide-slate-850 overflow-hidden">
          {orgs.map((org) => (
            <div key={org.id} className="flex items-center gap-3 p-4">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/10">
                <Building2 className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{org.name}</p>
                <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">{org.type}</p>
              </div>
            </div>
          ))}
          {orgs.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-400">No organizations registered yet.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Organizations;
