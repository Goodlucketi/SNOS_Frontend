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
