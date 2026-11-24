// ============================================
// 🎮 Unified Auth Store for هخلص عليك
// Fast & Simple: Phone + Unique Username ("وما يتكرر")
// + Supabase Persistent Sync & Google OAuth support
// ============================================
import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../config/supabase';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  // 1. Fast Login with Phone or Email & Unique Username (الرقم أو الإيميل واليوزر نيم وما يتكرر)
  loginWithPhoneAndUsername: async ({ phone, nickname, avatar }) => {
    set({ isLoading: true, error: null });

    const rawContact = (phone || '').toString().trim();
    const isEmail = rawContact.includes('@');
    const cleanPhone = isEmail ? rawContact.toLowerCase() : rawContact.replace(/[^\d+]/g, '');
    const cleanNickname = (nickname || '').toString().trim();

    if (!cleanPhone || (isEmail ? !cleanPhone.includes('.') : cleanPhone.length < 6)) {
      const err = isEmail ? 'يرجى إدخال بريد إلكتروني صالح' : 'يرجى إدخال رقم هاتف صالح (6 أرقام على الأقل)';
      set({ isLoading: false, error: err });
      return { success: false, message: err };
    }

    if (!cleanNickname || cleanNickname.length < 2) {
      const err = 'يرجى إدخال اسم مستخدم (حرفين على الأقل)';
      set({ isLoading: false, error: err });
      return { success: false, message: err };
    }

    // A. Try Backend API first
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          nickname: cleanNickname,
          avatar: avatar || '🦁',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return { success: true, user: data.user, token: data.token, message: data.message };
      } else if (!data.success && data.message) {
        set({ isLoading: false, error: data.message });
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.warn('[AuthStore] Backend login failed, falling back to direct Supabase:', err);
    }

    // B. Direct Supabase Fallback (Netlify / Static Hosting)
    if (isSupabaseConfigured() && supabase) {
      try {
        // Uniqueness check for nickname
        const { data: nickUsers } = await supabase
          .from('profiles')
          .select('*')
          .ilike('nickname', cleanNickname);

        const existingNick = nickUsers && nickUsers.length > 0 ? nickUsers[0] : null;

        // Lookup phone
        const { data: phoneUsers } = await supabase
          .from('profiles')
          .select('*')
          .eq('phone', cleanPhone);

        const existingPhone = phoneUsers && phoneUsers.length > 0 ? phoneUsers[0] : null;

        // Case 1: Returning user by phone
        if (existingPhone) {
          if (existingNick && existingNick.phone !== cleanPhone) {
            const err = `اسم المستخدم "${cleanNickname}" محجوز للاعب آخر، يرجى اختيار اسم مستخدم مميز`;
            set({ isLoading: false, error: err });
            return { success: false, message: err };
          }

          const updated = {
            ...existingPhone,
            nickname: cleanNickname,
            avatar: avatar || existingPhone.avatar || '🦁',
            last_login_at: new Date().toISOString(),
          };

          await supabase.from('profiles').update({
            nickname: cleanNickname,
            avatar: updated.avatar,
            last_login_at: updated.last_login_at,
          }).eq('id', existingPhone.id);

          const token = 'token_' + existingPhone.id;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(updated));

          set({
            user: updated,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return { success: true, user: updated, token };
        }

        // Case 2: New user registration, but nickname is taken
        if (existingNick) {
          const err = `اسم المستخدم "${cleanNickname}" مستخدم بالفعل من قبل لاعب آخر، يرجى اختيار اسم آخر`;
          set({ isLoading: false, error: err });
          return { success: false, message: err };
        }

        // Case 3: Create fresh user in Supabase
        const newId = (typeof crypto !== 'undefined' && crypto.randomUUID)
          ? crypto.randomUUID()
          : 'usr_' + Date.now().toString(36);

        const newProfile = {
          id: newId,
          phone: cleanPhone,
          nickname: cleanNickname,
          avatar: avatar || '🦁',
          points: 0,
          games_played: 0,
          games_won: 0,
          last_login_at: new Date().toISOString(),
        };

        const { data: inserted, error: insertError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (insertError) throw insertError;

        const created = inserted || newProfile;
        const token = 'token_' + created.id;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(created));

        set({
          user: created,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return { success: true, user: created, token };
      } catch (sbErr) {
        console.error('[AuthStore] Supabase direct login error:', sbErr);
        const err = sbErr.message || 'فشل تسجيل الدخول عبر Supabase';
        set({ isLoading: false, error: err });
        return { success: false, message: err };
      }
    }

    // C. Offline Local Fallback
    const localUser = {
      id: 'local_' + Date.now(),
      phone: cleanPhone,
      nickname: cleanNickname,
      avatar: avatar || '🦁',
      points: 0,
      gamesPlayed: 0,
      gamesWon: 0,
    };
    const localToken = 'local_token_' + Date.now();
    localStorage.setItem('token', localToken);
    localStorage.setItem('user', JSON.stringify(localUser));
    set({ user: localUser, token: localToken, isAuthenticated: true, isLoading: false, error: null });
    return { success: true, user: localUser, token: localToken };
  },

  // 2. Check Username Availability
  checkUsername: async (nickname, currentPhone) => {
    if (!nickname || nickname.trim().length < 2) return false;
    try {
      const res = await fetch('/api/auth/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname.trim(), currentPhone }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.available;
      }
    } catch {}

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('phone')
          .ilike('nickname', nickname.trim());
        if (!data || data.length === 0) return true;
        if (currentPhone && data[0].phone === currentPhone) return true;
        return false;
      } catch {}
    }
    return true;
  },

  // 3. Optional Google OAuth Sign-In
  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('قاعدة بيانات Supabase غير متصلة');
      }
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      return data;
    } catch (err) {
      set({ isLoading: false, error: err.message || 'فشل تسجيل الدخول بحساب Google' });
      throw err;
    }
  },

  // 4. Handle Supabase Auth Redirects
  handleSupabaseUser: async (sbUser, accessToken) => {
    if (!sbUser) return;
    const email = sbUser.email || '';
    const fullName =
      sbUser.user_metadata?.full_name ||
      sbUser.user_metadata?.name ||
      email.split('@')[0] ||
      'لاعب هخلص عليك';
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

  // 5. Initialize & Listen for Auth Redirects
  initAuth: () => {
    if (!isSupabaseConfigured() || !supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        get().handleSupabaseUser(session.user, session.access_token);
      }
    });

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        get().handleSupabaseUser(session.user, session.access_token);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    });
  },

  // 6. Load User from storage
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
      } catch {}
    }
  },

  // 7. Logout
  logout: async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  // 8. Update profile
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
