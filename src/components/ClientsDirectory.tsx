import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface ClientRow {
  id: string;
  name?: string;
  email?: string;
  organization_id?: string | null;
}

const ClientsDirectory: React.FC = () => {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email, organization_id')
        .order('created_at', { ascending: false });

      if (!error && data) setClients(data);
      setLoading(false);
    };

    fetchClients();
  }, []);

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      <div>
        <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">All Clients</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Every client account across standalone and organization-affiliated properties.
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-slate-400 py-12 text-center">Loading clients...</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl divide-y divide-slate-100 dark:divide-slate-850 overflow-hidden">
          {clients.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/10">
                  <User className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{c.name || c.email || c.id.slice(0, 8)}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{c.email}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                {c.organization_id ? 'Org-affiliated' : 'Standalone'}
              </span>
            </div>
          ))}
          {clients.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-400">No clients yet.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientsDirectory;
