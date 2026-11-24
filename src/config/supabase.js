// ============================================
// 🎮 Supabase Configuration for هخلص عليك
// Shared client for both frontend and backend
// ============================================
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseUrl.length > 10 && supabaseAnonKey && supabaseAnonKey.length > 10);
};

let supabase = null;

if (isSupabaseConfigured()) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  console.log('🟢 [Supabase] Connected to:', supabaseUrl);
} else {
  console.log('⚠️ [Supabase] Not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env');
}

export { supabase };
export default supabase;
