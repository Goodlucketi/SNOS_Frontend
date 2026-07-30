import React, { createContext, useContext, useEffect, useState } from "react";
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { useUI } from './UIContext';

export type AppRole = 'client' | 'sub_admin' | 'org_admin' | 'super_admin' | null;

export interface User {
  id: string;
  email?: string;
  user_id?: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isClient: boolean;
  clientData: any | null;
  // Role resolution
  appRole: AppRole;
  organizationId: string | null;
  organizationName: string | null;
  isSuperAdmin: boolean;
  isOrgAdmin: boolean;   // true for BOTH org_admin and sub_admin tiers (shared visibility)
  isPrimaryOrgAdmin: boolean; // true ONLY for org_admin tier (can manage sub_admins)
  logout: () => Promise<void>;
  markAsClient: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isClient: false,
  clientData: null,
  appRole: null,
  organizationId: null,
  organizationName: null,
  isSuperAdmin: false,
  isOrgAdmin: false,
  isPrimaryOrgAdmin: false,
  logout: async () => { },
  markAsClient: () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [clientData, setClientData] = useState<any | null>(null);

  const [appRole, setAppRole] = useState<AppRole>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string | null>(null);

  const { showLoader, hideLoader } = useUI();

  /**
   * Resolves which of the four user types this account belongs to.
   * Order matters: platform staff (snoc_users) is checked first since
   * it's the most privileged and structurally separate from clients.
   */
  const resolveUserRole = async (userId: string) => {
    // 1. Client row — everyone else (client, org_admin, sub_admin all live here)
    const { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    console.log("client", client)

    if (!client) {
      // No matching row anywhere — likely mid-onboarding
      setAppRole(null);
      setIsClient(false);
      setClientData(null);
      setOrganizationId(null);
      setOrganizationName(null);
      return;
    }

    setIsClient(true);
    setClientData(client);

    // 3. Check organization_admins junction for admin tier
    const { data: adminRow } = await supabase
      .from('organization_admins')
      .select('tier, organization_id, organizations(name)')
      .eq('client_id', userId)
      .maybeSingle();

    if (adminRow) {
      setAppRole(adminRow.tier === 'org_admin' ? 'org_admin' : 'sub_admin');
      setOrganizationId(adminRow.organization_id);
      setOrganizationName((adminRow as any).organizations?.name ?? null);
    } else {
      setAppRole('client');
      setOrganizationId(null);
      setOrganizationName(null);
    }
  };

  useEffect(() => {
    showLoader("Authenticating Session...");

    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error("Error getting session:", error.message);
        setUser(null);
        setLoading(false);
        hideLoader();
        return;
      }

      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || '',
          role: session.user.user_metadata?.role || 'user'
        });
        await resolveUserRole(session.user.id);
      } else {
        setUser(null);
        setAppRole(null);
        setIsClient(false);
      }
      setLoading(false);
      hideLoader();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
        });

        if (event === 'SIGNED_IN' || !clientData) {
          setLoading(true);
          await resolveUserRole(session.user.id);
        }
      } else {
        setUser(null);
        setAppRole(null);
        setIsClient(false);
        setClientData(null);
        setOrganizationId(null);
        setOrganizationName(null);
      }
      setLoading(false);
      hideLoader();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    showLoader("Logging out...");
    await supabase.auth.signOut();
    setUser(null);
    setAppRole(null);
    setIsClient(false);
    setClientData(null);
    setOrganizationId(null);
    setOrganizationName(null);
    hideLoader();
  };

  const markAsClient = async () => {
    if (user) {
      await resolveUserRole(user.id);
    } else {
      setIsClient(true);
    }
  };

  const isSuperAdmin = appRole === 'super_admin';
  const isOrgAdmin = appRole === 'org_admin' || appRole === 'sub_admin';
  const isPrimaryOrgAdmin = appRole === 'org_admin';

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isClient,
      clientData,
      appRole,
      organizationId,
      organizationName,
      isSuperAdmin,
      isOrgAdmin,
      isPrimaryOrgAdmin,
      logout,
      markAsClient,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
