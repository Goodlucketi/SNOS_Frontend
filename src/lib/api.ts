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

export interface ClientProfileMetadata {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  account_type?: string;
  building_count?: string | number;
  primary_whatsapp?: string;
}

export async function getClientProfile(id: string): Promise<ClientProfile | null> {
  const { data, error } = await supabase.from('clients').select('*').eq('id', id).maybeSingle();
  if (error) {
    console.error('Error fetching client profile:', error.message);
    throw error;
  }
  return data;
}

export async function getClientProfileFromMetadata(id: string): Promise<ClientProfileMetadata> {
  const { data, error } = await supabase.from('clients').select('metadata').eq('id', id).maybeSingle();
  if (error) {
    console.error('Error fetching client profile from metadata:', error.message);
    throw error;
  }
  return data?.metadata?.profile || {};
}

export async function updateClientProfile(id: string, updates: Partial<ClientProfile>): Promise<ClientProfile> {
  const { data, error } = await supabase.from('clients').update(updates).eq('id', id).select().single();
  if (error) {
    console.error('Error updating client profile:', error.message);
    throw error;
  }
  return data;
}

export async function updateClientProfileInMetadata(id: string, updates: Partial<ClientProfileMetadata>): Promise<ClientProfileMetadata> {
  const existing = await getClientProfileFromMetadata(id);
  const merged = { ...existing, ...updates };
  const { data, error } = await supabase
    .from('clients')
    .update({ metadata: { profile: merged } })
    .eq('id', id)
    .select('metadata')
    .single();

  if (error) {
    console.error('Error updating client profile in metadata:', error.message);
    throw error;
  }
  return data?.metadata?.profile || merged;
}

// ---------------------------------------------------------------------------
// Client profile - complete update (direct columns + metadata)
// ---------------------------------------------------------------------------

export interface ClientProfileComplete {
  name?: string;
  emails?: string[];
  phones?: string[];
  whatsapps?: string[];
  location?: string;
  account_type?: string;
  building_count?: string | number;
  primary_whatsapp?: string;
}

export async function updateClientProfileComplete(id: string, updates: ClientProfileComplete): Promise<void> {
  // Build direct column updates - these are actual columns on the clients table
  const directUpdates: Record<string, any> = {};

  if (updates.name !== undefined) directUpdates.name = updates.name;
  if (updates.emails !== undefined) directUpdates.emails = updates.emails;
  if (updates.phones !== undefined) directUpdates.phones = updates.phones;
  if (updates.whatsapps !== undefined) directUpdates.whatsapps = updates.whatsapps;
  if (updates.location !== undefined) directUpdates.location = updates.location;
  if (updates.account_type !== undefined) directUpdates.account_type = updates.account_type;
  if (updates.primary_whatsapp !== undefined) {
    directUpdates.primary_whatsapp = updates.primary_whatsapp;
    // Also add to whatsapps array if not already there
    const existingWhatsapps = updates.whatsapps || [];
    if (!existingWhatsapps.includes(updates.primary_whatsapp)) {
      directUpdates.whatsapps = [...existingWhatsapps, updates.primary_whatsapp];
    }
  }
  // building_count is not a direct column, stays in metadata

  // Update direct columns if any
  if (Object.keys(directUpdates).length > 0) {
    const { error: directError } = await supabase
      .from('clients')
      .update(directUpdates)
      .eq('id', id);
    if (directError) {
      console.error('Error updating direct client profile columns:', directError.message);
      throw directError;
    }
  }

  // Also update metadata for building_count and any other metadata-only fields
  const metadataUpdates: Partial<ClientProfileMetadata> = {};
  if (updates.building_count !== undefined) metadataUpdates.building_count = updates.building_count;
  // Keep other fields in metadata for backward compatibility if they exist there
  if (updates.account_type !== undefined) metadataUpdates.account_type = updates.account_type;
  if (updates.primary_whatsapp !== undefined) metadataUpdates.primary_whatsapp = updates.primary_whatsapp;

  if (Object.keys(metadataUpdates).length > 0) {
    await updateClientProfileInMetadata(id, metadataUpdates);
  }
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
  phone: string;
  email: string;
  whatsapp: string;
}

export interface SecondaryContact {
  name: string;
  phone: string;
}

export interface ClientMetadata {
  notification_preferences?: NotificationPreferences;
  alert_contacts?: AlertContact[];
  secondary_contacts?: SecondaryContact[];
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
// Client settings - updates both metadata AND direct columns on clients table
// ---------------------------------------------------------------------------

export interface ClientSettings {
  notification_preferences?: NotificationPreferences;
  secondary_contacts?: SecondaryContact[];
  alert_contacts?: AlertContact[];
  primary_whatsapp?: string;
}

export async function updateClientSettings(id: string, settings: ClientSettings): Promise<void> {
  // First, fetch existing data to merge with new values
  const { data: existingClient, error: fetchError } = await supabase
    .from('clients')
    .select('phones, emails, whatsapps')
    .eq('id', id)
    .maybeSingle();

  if (fetchError) {
    console.error('Error fetching existing client data:', fetchError.message);
    throw fetchError;
  }

  // Build direct column updates with merging
  const directUpdates: Record<string, any> = {};

  // Get existing arrays (they are text[] in DB, so may be arrays or null)
  const existingPhones = existingClient?.phones || [];
  const existingEmails = existingClient?.emails || [];
  const existingWhatsapps = existingClient?.whatsapps || [];

  if (settings.notification_preferences) {
    directUpdates.alert_preference = settings.notification_preferences;
  }

  if (settings.alert_contacts && settings.alert_contacts.length > 0) {
    // Collect unique phones, emails, whatsapps from alert contacts
    const newPhones = [...new Set(settings.alert_contacts.map(c => c.phone).filter(Boolean))];
    const newEmails = [...new Set(settings.alert_contacts.map(c => c.email).filter(Boolean))];
    const newWhatsapps = [...new Set(settings.alert_contacts.map(c => c.whatsapp).filter(Boolean))];

    // Merge with existing (avoid duplicates)
    if (newPhones.length > 0) directUpdates.phones = [...new Set([...existingPhones, ...newPhones])];
    if (newEmails.length > 0) directUpdates.emails = [...new Set([...existingEmails, ...newEmails])];
    if (newWhatsapps.length > 0) directUpdates.whatsapps = [...new Set([...existingWhatsapps, ...newWhatsapps])];
  }

  if (settings.secondary_contacts && settings.secondary_contacts.length > 0) {
    const secondary = settings.secondary_contacts[0];
    if (secondary.phone) {
      directUpdates.phones = [...new Set([...(directUpdates.phones || existingPhones), secondary.phone])];
    }
  }

  if (settings.primary_whatsapp) {
    directUpdates.primary_whatsapp = settings.primary_whatsapp;
    directUpdates.whatsapps = [...new Set([...(directUpdates.whatsapps || existingWhatsapps), settings.primary_whatsapp])];
  }

  // Update direct columns if any
  if (Object.keys(directUpdates).length > 0) {
    const { error: directError } = await supabase
      .from('clients')
      .update(directUpdates)
      .eq('id', id);
    if (directError) {
      console.error('Error updating direct client columns:', directError.message);
      throw directError;
    }
  }

  // Also update metadata for backward compatibility and additional fields
  const metadataPatch: Partial<ClientMetadata> = {};
  if (settings.notification_preferences) metadataPatch.notification_preferences = settings.notification_preferences;
  if (settings.secondary_contacts) metadataPatch.secondary_contacts = settings.secondary_contacts;
  if (settings.alert_contacts) metadataPatch.alert_contacts = settings.alert_contacts;

  if (Object.keys(metadataPatch).length > 0) {
    await patchClientMetadata(id, metadataPatch);
  }
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export interface OrderItem {
  name?: string;
  quantity?: number;
  price?: number;
}

export interface Order {
  id: string;
  user_id: string;
  status: string;
  subtotal: number;
  shipping_fee: number;
  installation_fee: number;
  total_amount: number;
  cart_payload: OrderItem[] | { items?: OrderItem[] };
  client_metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  shipping_snapshot?: Record<string, any> | null;
}

export interface PaginatedOrders {
  data: Order[];
  count: number;
}

export async function getClientOrders(
  userId: string,
  options?: { limit?: number; offset?: number }
): Promise<PaginatedOrders> {
  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching client orders:', error.message);
    throw error;
  }
  return { data: data ?? [], count: count ?? 0 };
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching order:', error.message);
    throw error;
  }
  return data;
}

// ---------------------------------------------------------------------------
// Events (used as the "Alerts" feed on the client dashboard)
// ---------------------------------------------------------------------------

export interface ClientEvent {
  id: string;
  client_id: string;
  sensor_id?: string;
  code?: string;
  message?: string;
  image?: string;
  occurred_at?: string;
  occured_at?: string;
  created_at: string;
  metadata?: { status?: 'unread' | 'in-progress' | 'complete' | 'completed'; [key: string]: any };
}

export interface PaginatedEvents {
  data: ClientEvent[];
  count: number;
}

export async function getClientEvents(clientId: string, options?: { limit?: number; offset?: number }): Promise<PaginatedEvents> {
  let query = supabase
    .from('rf_events')
    .select('*', { count: 'exact' })
    .eq('client_id', clientId)
    .order('occurred_at', { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching client events:', error.message);
    throw error;
  }
  return { data: data ?? [], count: count ?? 0 };
}

// ---------------------------------------------------------------------------
// Camera Events
// ---------------------------------------------------------------------------

export interface CameraEvent {
  id: string;
  client_id: string;
  gateway_id: string;
  camera_id: string | null;
  camera_key: string;
  home_id: string;
  label: string;
  zone: string;
  score: number;
  started_at: string;
  ended_at: string | null;
  thumbnail_ref: string | null;
  clip_ref: string | null;
  created_at: string;
}

export interface PaginatedCameraEvents {
  data: CameraEvent[];
  count: number;
}

export async function getClientCameraEvents(clientId: string, options?: { limit?: number; offset?: number }): Promise<PaginatedCameraEvents> {
  let query = supabase
    .from('camera_events')
    .select('*', { count: 'exact' })
    .eq('client_id', clientId)
    .order('started_at', { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching camera events:', error.message);
    throw error;
  }
  return { data: data ?? [], count: count ?? 0 };
}

// ---------------------------------------------------------------------------
// Cameras (device configuration)
// ---------------------------------------------------------------------------

export interface Camera {
  id: string;
  gateway_id: string;
  client_id: string;
  home_id: string;
  camera_key: string;
  name: string;
  stream_url: string;
  sub_stream_url: string | null;
  stream_username: string;
  stream_password: string;
  detect_enabled: boolean;
  record_enabled: boolean;
  is_enabled: boolean;
  status: string;
  status_detail: string;
  created_at: string;
  updated_at: string;
}

export async function getCamerasByGateway(gatewayId: string): Promise<Camera[]> {
  const { data, error } = await supabase
    .from('cameras')
    .select('*')
    .eq('gateway_id', gatewayId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cameras:', error.message);
    throw error;
  }
  return data ?? [];
}

export async function getCamerasByClient(clientId: string): Promise<Camera[]> {
  const { data, error } = await supabase
    .from('cameras')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cameras:', error.message);
    throw error;
  }
  return data ?? [];
}

export async function updateEventStatus(eventId: string, status: 'unread' | 'read' | 'in-progress' | 'resolved' | 'complete' | 'completed'): Promise<void> {
  const { error } = await supabase
    .from('rf_events')
    .update({ metadata: { status } })
    .eq('id', eventId);

  if (error) {
    console.error('Error updating event status:', error.message);
    throw error;
  }
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

// ---------------------------------------------------------------------------
// Dashboard Counts - efficiently fetch counts for dashboard cards
// ---------------------------------------------------------------------------

export interface DashboardCounts {
  events: {
    unread: number;
    in_progress: number;
    completed: number;
    total: number;
  };
  sensors: {
    total: number;
    active: number;
  };
  cameras: {
    total: number;
    active: number;
  };
  gateways: {
    total: number;
    active: number;
  };
  cameraEvents: {
    total: number;
  };
}

export async function getDashboardCounts(clientId: string): Promise<DashboardCounts> {
  // Fetch all counts in parallel
  const [
    eventsResult,
    sensorsResult,
    camerasResult,
    gatewaysResult,
    cameraEventsResult
  ] = await Promise.all([
    // Events - select all columns to get metadata and potentially status
    supabase
      .from('rf_events')
      .select('*', { count: 'exact' })
      .eq('client_id', clientId),
    // Sensors count
    supabase
      .from('rf_sensors')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId),
    // Cameras count
    supabase
      .from('cameras')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId),
    // Gateways count - table is 'gateways' not 'rf_gateways'
    supabase
      .from('gateways')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId),
    // Camera events count
    supabase
      .from('camera_events')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
  ]);

  // Parse status from metadata (if column exists) or direct status column
  let eventStatusCounts = {
    unread: 0,
    in_progress: 0,
    completed: 0,
    total: eventsResult.count || 0,
  };

  if (eventsResult.data) {
    eventsResult.data.forEach(event => {
      // Try metadata JSONB first, then direct status column, then default 'unread'
      const metadata = (event as any).metadata;
      const directStatus = (event as any).status;
      const status = metadata?.status || directStatus || 'unread';

      if (status === 'unread') eventStatusCounts.unread++;
      else if (status === 'read' || status === 'in-progress') eventStatusCounts.in_progress++;
      else if (status === 'resolved' || status === 'complete' || status === 'completed') eventStatusCounts.completed++;
    });
  }

  return {
    events: eventStatusCounts,
    sensors: {
      total: sensorsResult.count || 0,
      active: sensorsResult.count || 0,
    },
    cameras: {
      total: camerasResult.count || 0,
      active: camerasResult.count || 0,
    },
    gateways: {
      total: gatewaysResult.count || 0,
      active: gatewaysResult.count || 0,
    },
    cameraEvents: {
      total: cameraEventsResult.count || 0,
    }
  };
}

// Also export a simpler function for just event counts by status
export async function getEventCountsByStatus(clientId: string): Promise<{ unread: number; inProgress: number; completed: number; total: number }> {
  const { data, count } = await supabase
    .from('rf_events')
    .select('metadata', { count: 'exact' })
    .eq('client_id', clientId);

  const counts = { unread: 0, inProgress: 0, completed: 0, total: count || 0 };

  if (data) {
    data.forEach(event => {
      const status = event.metadata?.status || 'unread';
      if (status === 'unread') counts.unread++;
      else if (status === 'read' || status === 'in-progress') counts.inProgress++;
      else if (status === 'resolved' || status === 'complete' || status === 'completed') counts.completed++;
    });
  }

  return counts;
}