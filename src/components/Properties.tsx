import React, { useEffect, useState } from 'react';
import { Building2, MapPin, Radio } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

interface Home {
  id: string;
  client_id: string;
  address?: string;
  metadata?: any;
  created_at?: string;
}

const Properties: React.FC = () => {
  const { organizationId, organizationName } = useAuth();
  const [homes, setHomes] = useState<Home[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomes = async () => {
      if (!organizationId) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('homes')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setHomes(data);
      }
      setLoading(false);
    };

    fetchHomes();
  }, [organizationId]);

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      <div>
        <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">Properties</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Every secured property under {organizationName || 'your organization'}.
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-slate-400 py-12 text-center">Loading properties...</div>
      ) : homes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-10 text-center">
          <Building2 className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No properties registered under this organization yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {homes.map((home) => (
            <div
              key={home.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-5 shadow-sm flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/10">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                  {home.metadata?.name || `Property ${home.id.slice(0, 8)}`}
                </h4>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {home.address || 'No address on file'}
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <Radio className="w-3.5 h-3.5" />
                  Client: {home.client_id.slice(0, 8)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Properties;
