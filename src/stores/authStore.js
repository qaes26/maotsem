// ============================================
// 🎮 Supabase Google Auth Store for حخلص عليك
// 100% Real Google Authentication via Supabase OAuth
// ============================================
import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../config/supabase';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  // 1. Sign In With Google (Real 1-Click Supabase OAuth)
  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('قاعدة بيانات Supabase غير متصلة. يرجى التأكد من المفاتيح في ملف .env');
      }

      console.log('🟢 [Auth] Starting Google OAuth with Supabase...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[Auth Store] Google Login Error:', err);
      set({ isLoading: false, error: err.message || 'فشل تسجيل الدخول بحساب Google' });
      throw err;
    }
  },

  // 2. Handle Supabase Authenticated User
  handleSupabaseUser: async (sbUser, accessToken) => {
    if (!sbUser) return;

    const email = sbUser.email || '';
    const fullName =
      sbUser.user_metadata?.full_name ||
      sbUser.user_metadata?.name ||
      email.split('@')[0] ||
      'لاعب حخلص عليك';
    const avatarUrl =
      sbUser.user_metadata?.avatar_url ||
      sbUser.user_metadata?.picture ||
      '🦁';

    const userProfile = {
      id: sbUser.id,
      email,
      phone: sbUser.phone || email || `user_${sbUser.id.slice(0, 8)}`,
      nickname: fullName,
      avatar: avatarUrl,
      points: 0,
      gamesPlayed: 0,
      gamesWon: 0,
    };

    // Upsert or fetch from Supabase 'profiles' table
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: existing } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sbUser.id)
          .single();

        if (existing) {
          userProfile.points = existing.points || 0;
          userProfile.gamesPlayed = existing.games_played || 0;
          userProfile.gamesWon = existing.games_won || 0;
          userProfile.nickname = existing.nickname || fullName;
          userProfile.avatar = existing.avatar || avatarUrl;
        } else {
          await supabase.from('profiles').upsert(
            {
              id: sbUser.id,
              phone: userProfile.phone,
              nickname: fullName,
              avatar: avatarUrl,
              points: 0,
              games_played: 0,
              games_won: 0,
              last_login_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
        }
      } catch (err) {
        console.warn('[Auth Store] Supabase profile sync warning:', err.message);
      }
    }

    const token = accessToken || sbUser.id || 'sb-token-' + Date.now();
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userProfile));

    set({
      user: userProfile,
      token,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });

    return userProfile;
  },

  // 3. Initialize & Listen for Auth Redirects (Google callback)
  initAuth: () => {
    if (!isSupabaseConfigured() || !supabase) return;

    // Check existing Supabase session (e.g. after Google OAuth redirect)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        get().handleSupabaseUser(session.user, session.access_token);
      }
    });

    // Listen to real-time auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🟢 [Auth] State change event:', event);
      if (session?.user) {
        get().handleSupabaseUser(session.user, session.access_token);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    });
  },

  // 4. Load User from storage or Supabase
  loadUser: async () => {
    get().initAuth();

    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    if (savedUser) {
      try {
        set({ user: JSON.parse(savedUser), isAuthenticated: true });
      } catch {
        // ignore
      }
    }
  },

  // 5. Logout
  logout: async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('[Auth Store] Sign out error:', e);
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  // 6. Update user profile
  updateProfile: async (data) => {
    const { user } = get();
    if (!user) return;
    set({ isLoading: true, error: null });

    const updatedUser = { ...user, ...data };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('profiles')
          .update({
            nickname: updatedUser.nickname,
            avatar: updatedUser.avatar,
            points: updatedUser.points,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      } catch (e) {
        console.warn('[Auth Store] Update profile error:', e);
      }
    }

    localStorage.setItem('user', JSON.stringify(updatedUser));
    set({ user: updatedUser, isLoading: false });
    return updatedUser;
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
