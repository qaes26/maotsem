import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUser,
  FaPhoneAlt,
  FaCheckCircle,
  FaTrophy,
  FaStar,
  FaGamepad,
  FaPercent,
  FaEdit,
  FaSave,
  FaSignOutAlt,
  FaMedal,
} from 'react-icons/fa';
import useAuthStore from '../stores/authStore';

const AVATAR_OPTIONS = ['🦁', '🦅', '⚽', '👑', '🎯', '🚀', '🤖', '⚡', '🔥', '🏆', '🎩', '💎'];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname || 'لاعب حخلص عليك');
  const [avatar, setAvatar] = useState(user?.avatar || '🦁');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const winRate = user?.gamesPlayed ? Math.round(((user?.gamesWon || 0) / user.gamesPlayed) * 100) : 0;

  const handleSave = async () => {
    try {
      await updateProfile({ nickname, avatar });
      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      // handled in store
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with Selector */}
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl gradient-accent golden-glow flex items-center justify-center text-5xl shadow-xl overflow-hidden">
              {avatar && avatar.startsWith('http') ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                avatar
              )}
            </div>
            {isEditing && (
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-[var(--color-accent)] text-[10px] font-bold border border-[var(--color-accent)]">
                تغيير
              </span>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-right space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="bg-[var(--color-surface)] border border-[var(--color-accent)] text-white px-3 py-1.5 rounded-xl font-bold text-lg focus:outline-none"
                    placeholder="اسم المستخدم"
                  />
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 rounded-xl gradient-accent text-[var(--color-primary)] font-bold text-sm flex items-center gap-1 shadow-md hover:scale-105"
                  >
                    <FaSave />
                    <span>حفظ</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <h1 className="text-2xl sm:text-3xl font-black text-white">{user?.nickname}</h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-sm"
                    title="تعديل الاسم والصورة"
                  >
                    <FaEdit />
                  </button>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <FaSignOutAlt />
                <span>تسجيل الخروج</span>
              </button>
            </div>

            {/* Email / ID badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/80" dir="ltr">
              <span className="font-mono">{user?.email || user?.phone || 'مستخدم مسجل'}</span>
              <FaCheckCircle className="text-[var(--color-success)] text-xs ml-1" title="حساب موثق" />
            </div>

            <p className="text-xs text-white/50">عضو نشط في حخلص عليك • حساب موثق عبر Google و Supabase</p>

            {savedSuccess && (
              <div className="text-xs text-[var(--color-success)] font-bold pt-1">
                ✓ تم تحديث الملف الشخصي بنجاح
              </div>
            )}
          </div>
        </div>

        {/* Avatar Preset Grid (visible in edit mode) */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 pt-6 border-t border-white/10"
          >
            <div className="text-xs font-bold text-white/80 mb-3">اختر الصورة الرمزية:</div>
            <div className="flex flex-wrap gap-2">
              {AVATAR_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setAvatar(opt)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                    avatar === opt
                      ? 'bg-[var(--color-accent)] text-black scale-110 shadow-lg'
                      : 'bg-white/5 hover:bg-white/10 text-white'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-white/10 text-center space-y-1">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center text-lg mb-2">
            <FaStar />
          </div>
          <div className="text-2xl font-black text-white">{user?.points || 0}</div>
          <div className="text-xs text-white/50">إجمالي النقاط</div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10 text-center space-y-1">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 mx-auto flex items-center justify-center text-lg mb-2">
            <FaGamepad />
          </div>
          <div className="text-2xl font-black text-white">{user?.gamesPlayed || 0}</div>
          <div className="text-xs text-white/50">مباريات ملعوبة</div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10 text-center space-y-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center text-lg mb-2">
            <FaTrophy />
          </div>
          <div className="text-2xl font-black text-white">{user?.gamesWon || 0}</div>
          <div className="text-xs text-white/50">مباريات فوز</div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10 text-center space-y-1">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 mx-auto flex items-center justify-center text-lg mb-2">
            <FaPercent />
          </div>
          <div className="text-2xl font-black text-white">{winRate}%</div>
          <div className="text-xs text-white/50">نسبة الفوز</div>
        </div>
      </div>

      {/* Badges / Achievements Section */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center gap-3">
          <FaMedal className="text-xl text-[var(--color-accent)]" />
          <h2 className="text-lg font-bold text-white">الأوسمة والإنجازات</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
            <div className="text-3xl">📱</div>
            <div className="text-right">
              <div className="text-sm font-bold text-white">عضو موثق</div>
              <div className="text-xs text-white/50">تم التوثيق عبر الهاتف SMS</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
            <div className="text-3xl">⚽</div>
            <div className="text-right">
              <div className="text-sm font-bold text-white">خبير كروي</div>
              <div className="text-xs text-white/50">أجاب على أسئلة كأس العالم</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
            <div className="text-3xl">💣</div>
            <div className="text-right">
              <div className="text-sm font-bold text-white">مقامر شجاع</div>
              <div className="text-xs text-white/50">استخدم خاصية القنبلة بنجاح</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

