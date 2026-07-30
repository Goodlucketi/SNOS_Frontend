import React, { useEffect, useState } from 'react';
import { Building2, Users, Bell } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const OrgOverview: React.FC = () => {
  const { organizationId, organizationName } = useAuth();
  const [homeCount, setHomeCount] = useState<number | null>(null);
  const [adminCount, setAdminCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      if (!organizationId) return;

      const { count: homes } = await supabase
        .from('homes')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId);

      const { count: admins } = await supabase
        .from('organization_admins')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId);

      setHomeCount(homes ?? 0);
      setAdminCount(admins ?? 0);
    };

    fetchCounts();
  }, [organizationId]);

  const stats = [
    { label: 'Properties', value: homeCount, icon: Building2 },
    { label: 'Admin Team', value: adminCount, icon: Users },
    { label: 'Open Alerts', value: null, icon: Bell },
  ];

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      <div>
        <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
          {organizationName || 'Organization'} Overview
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          A snapshot of security coverage across your organization.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
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

export default OrgOverview;
