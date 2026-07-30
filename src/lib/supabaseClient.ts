import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = 'https://ushaclccmspdnwljyasq.supabase.co';
// const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzaGFjbGNjbXNwZG53bGp5YXNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NzAxOTIsImV4cCI6MjEwMDU0NjE5Mn0.RDsl5m_z4Scgilif8vbcJA6dMlg6mraRAMlT_-qzZBo';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY - check your .env file and restart the dev server (Vite only reads .env at startup).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
