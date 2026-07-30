import React, { useEffect, useState } from 'react';
import { UserPlus, Trash2, ShieldCheck, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

interface AdminRow {
  id: string;
  client_id: string;
  tier: 'org_admin' | 'sub_admin';
  clients?: { name?: string; email?: string } | null;
}

const Team: React.FC = () => {
  const { organizationId, isPrimaryOrgAdmin } = useAuth();
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');

  const fetchAdmins = async () => {
    if (!organizationId) return;
    const { data, error } = await supabase
      .from('organization_admins')
      .select('id, client_id, tier, clients(name, email)')
      .eq('organization_id', organizationId);

    if (!error && data) {
      setAdmins(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, [organizationId]);

  const handleRemove = async (adminId: string) => {
    const { error } = await supabase
      .from('organization_admins')
      .delete()
      .eq('id', adminId);

    if (error) {
      toast.error('Could not remove admin — RLS may be blocking this action.');
    } else {
      toast.success('Admin removed from organization.');
      fetchAdmins();
    }
  };

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      <div>
        <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">Admin Team</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Manage who has administrative access to your organization's properties.
        </p>
      </div>

      {!isPrimaryOrgAdmin && (
        <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/10 rounded-xl p-4 text-xs text-amber-700 dark:text-amber-400">
          You have sub-admin access — only the primary org admin can invite or remove team members.
        </div>
      )}

      {isPrimaryOrgAdmin && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-5 shadow-sm max-w-lg">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Invite a sub-admin by email
          </label>
          <div className="flex gap-2 mt-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="teammate@company.com"
              className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <Button
              text="Invite"
              variant="primary"
              size="sm"
              onClick={() => toast.info('Wire this up to an invite Edge Function that creates the client + organization_admins row.')}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-sm text-slate-400 py-12 text-center">Loading team...</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl divide-y divide-slate-100 dark:divide-slate-850 overflow-hidden">
          {admins.map((admin) => (
            <div key={admin.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/10">
                  {admin.tier === 'org_admin' ? <ShieldCheck className="w-4.5 h-4.5" /> : <Shield className="w-4.5 h-4.5" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">
                    {admin.clients?.name || admin.clients?.email || admin.client_id.slice(0, 8)}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">
                    {admin.tier === 'org_admin' ? 'Primary Org Admin' : 'Sub Admin'}
                  </p>
                </div>
              </div>
              {isPrimaryOrgAdmin && admin.tier !== 'org_admin' && (
                <button
                  onClick={() => handleRemove(admin.id)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Remove admin"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {admins.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
              <UserPlus className="w-6 h-6 text-slate-300 dark:text-slate-700" />
              No admins on the team yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Team;
