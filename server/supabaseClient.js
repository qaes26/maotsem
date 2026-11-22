// ============================================
// 🎮 Supabase Server Client for حخلص عليك Backend
// Uses service_role key for full admin access
// ============================================
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseReady = () => {
  return !!(supabaseUrl && supabaseUrl.length > 10 && supabaseServiceKey && supabaseServiceKey.length > 10);
};

let supabase = null;

if (isSupabaseReady()) {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  console.log('🟢 [Supabase Server] Connected to:', supabaseUrl);
} else {
  console.log('⚠️ [Supabase Server] Not configured. Using local JSON database fallback.');
}

export { supabase };
export default supabase;
