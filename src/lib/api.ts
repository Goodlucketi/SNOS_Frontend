import axios from 'axios';
import { supabase, supabaseAnonKey, supabaseUrl } from './supabaseClient';

/**
 * Invokes a Supabase Edge Function securely via Axios.
 * Automatically injects the Anon Key and the User's JWT (if logged in).
 * 
 * @param functionName The name of the Edge Function to invoke.
 * @param payload The JSON payload to send (optional).
 * @param method The HTTP method (default: 'POST').
 * @returns The response data.
 */
export const invokeEdgeFunction = async (functionName: string, payload: any = {}, method: 'POST' | 'GET' | 'PUT' | 'DELETE' = 'POST') => {
  // Try to get the active session for the JWT
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || supabaseAnonKey;

  const url = `${supabaseUrl}/functions/v1/${functionName}`;

  try {
    const response = await axios({
      method,
      url,
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(`Error invoking edge function ${functionName}:`, error);
    // Propagate the specific error message from the Edge Function if available
    if (error.response && error.response.data && error.response.data.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
};

// ---------------------------------------------------------------------------
// Client profile
// ---------------------------------------------------------------------------

export interface ClientProfile {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  address?: string;
  metadata?: Record<string, any>;
}

export async function getClientProfile(id: string): Promise<ClientProfile | null> {
  const { data, error } = await supabase.from('clients').select('*').eq('id', id).maybeSingle();
  if (error) {
    console.error('Error fetching client profile:', error.message);
    throw error;
  }
  return data;
}

export async function updateClientProfile(id: string, updates: Partial<ClientProfile>): Promise<ClientProfile> {
  const { data, error } = await supabase.from('clients').update(updates).eq('id', id).select().single();
  if (error) {
    console.error('Error updating client profile:', error.message);
    throw error;
  }
  return data;
}

// ---------------------------------------------------------------------------
// Notification preferences + alert contacts
// These live inside clients.metadata (jsonb) as
// { notification_preferences: {...}, alert_contacts: [...] }.
// There's no server-side merge here (no RPC), so this reads the current
// metadata, merges the patch client-side, then writes the whole object back.
// Fine for a single-editor settings page; would need an RPC/upsert function
// instead if this ever needs concurrent-safe partial updates.
// ---------------------------------------------------------------------------

export interface NotificationPreferences {
  sms: boolean;
  email: boolean;
  whatsapp: boolean;
}

export interface AlertContact {
  id: string;
  name: string;
  channel: 'sms' | 'email' | 'whatsapp';
  value: string;
}

export interface ClientMetadata {
  notification_preferences?: NotificationPreferences;
  alert_contacts?: AlertContact[];
  [key: string]: any;
}

export async function getClientMetadata(id: string): Promise<ClientMetadata> {
  const { data, error } = await supabase.from('clients').select('metadata').eq('id', id).maybeSingle();
  if (error) {
    console.error('Error fetching client metadata:', error.message);
    throw error;
  }
  return data?.metadata || {};
}

export async function patchClientMetadata(id: string, patch: Partial<ClientMetadata>): Promise<ClientMetadata> {
  const existing = await getClientMetadata(id);
  const merged = { ...existing, ...patch };
  const { data, error } = await supabase
    .from('clients')
    .update({ metadata: merged })
    .eq('id', id)
    .select('metadata')
    .single();

  if (error) {
    console.error('Error saving client metadata:', error.message);
    throw error;
  }
  return data?.metadata || merged;
}

// ---------------------------------------------------------------------------
// Events (used as the "Alerts" feed on the client dashboard)
// ---------------------------------------------------------------------------

export interface ClientEvent {
  id: string;
  client_id: string;
  sensor_id?: string;
  snoc_user_id?: string;
  message?: string;
  image?: string;
  metadata?: { status?: 'unread' | 'in-progress' | 'complete' | 'completed'; [key: string]: any };
  created_at: string;
}

export async function getClientEvents(clientId: string): Promise<ClientEvent[]> {
  const { data, error } = await supabase
    .from('rf_events')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching client events:', error.message);
    throw error;
  }
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Public forms (newsletter + contact) — not tied to a logged-in user.
// NOTE: `newsletter_subscribers` and `contact_messages` are NOT part of the
// schema we've been working against — they didn't exist anywhere in the
// SNOS/Cencah/SPC schema visualizer. These are new tables. See the SQL
// migration provided alongside this change; both need an RLS policy that
// allows anonymous INSERT (and nothing else) since these forms run logged-out.
// ---------------------------------------------------------------------------

export async function subscribeToNewsletter(email: string): Promise<void> {
  const { error } = await supabase.from('newsletter_subscribers').insert({ email });
  if (error) {
    console.error('Error subscribing to newsletter:', error.message);
    throw error;
  }
}

export interface ContactMessagePayload {
  fullname: string;
  email: string;
  phone?: string;
  message: string;
}

export async function sendContactMessage(payload: ContactMessagePayload): Promise<void> {
  const { error } = await supabase.from('contact_messages').insert(payload);
  if (error) {
    console.error('Error sending contact message:', error.message);
    throw error;
  }
}