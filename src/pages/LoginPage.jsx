import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaGamepad,
  FaShieldAlt,
  FaTrophy,
  FaUsers,
  FaBolt,
  FaCheckCircle,
  FaPhoneAlt,
  FaUser,
} from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import useAuthStore from '../stores/authStore';

const AVATARS = ['🦁', '🦅', '🐯', '🐺', '👑', '⚡', '🎯', '🚀', '🔥', '💎'];

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginWithPhoneAndUsername, signInWithGoogle, isLoading, error, isAuthenticated, clearError } = useAuthStore();

  const [phone, setPhone] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🦁');
  const [successNotice, setSuccessNotice] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setSuccessNotice('');

    if (!phone.trim()) {
      useAuthStore.setState({ error: 'يرجى إدخال رقم الهاتف' });
      return;
    }
    if (!nickname.trim()) {
      useAuthStore.setState({ error: 'يرجى إدخال اسم المستخدم' });
      return;
    }

    const res = await loginWithPhoneAndUsername({
      phone: phone.trim(),
      nickname: nickname.trim(),
      avatar: selectedAvatar,
    });

    if (res?.success) {
      setSuccessNotice(res.message || 'تم تسجيل الدخول بنجاح! جاري الانتقال...');
      setTimeout(() => {
        navigate('/');
      }, 700);
    }
  };

  const handleGoogleLogin = async () => {
    clearError();
    try {
      await signInWithGoogle();
    } catch {}
  };

  const benefits = [
    {
      icon: FaBolt,
      color: 'text-amber-400',
      title: 'دخول فوري بدون انتظار',
      desc: 'فقط برقم هاتفك واسمك المستعار، لا داعي لرموز تحقق أو أكواد SMS',
    },
    {
      icon: FaUser,
      color: 'text-cyan-400',
      title: 'اسم مستعار فريد لك',
      desc: 'اسمك وهويتك خاصة بك وحدك ولا يمكن تكرارها لأي لاعب آخر',
    },
    {
      icon: FaTrophy,
      color: 'text-emerald-400',
      title: 'حفظ سحابي دائم عبر Supabase',
      desc: 'نقاطك وإحصائياتك وألقابك وسجل انتصاراتك محفوظة بأمان',
    },
    {
      icon: FaUsers,
      color: 'text-pink-400',
      title: 'تحدي الأصدقاء في الغرف والبطولات',
      desc: 'إنشاء ومشاركة غرف اللعب المباشرة فور تسجيلك بكل سهولة',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10 font-arabic" dir="rtl">
      <div className="w-full max-w-lg">
        {/* Brand Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl gradient-accent golden-glow mb-3 shadow-xl">
            <FaGamepad className="text-4xl text-[var(--color-primary)]" />
          </div>
          <h1 className="text-3xl font-black text-white mb-1.5 tracking-wide">لعبة هخلص عليك</h1>
          <p className="text-white/60 text-xs sm:text-sm">معركة العقول الكبرى والتحديات الرياضية والثقافية</p>
        </motion.div>

        {/* Main Sign-In Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-xl"
        >
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-accent/20 text-accent border border-accent/30 mb-2">
              <span>⚡</span> تسجيل سريع وفوري
            </span>
            <h2 className="text-xl font-bold text-white">تسجيل الدخول بالرقم واسم المستخدم</h2>
            <p className="text-xs text-white/60 mt-1">
              أدخل رقم هاتفك واسمك المستعار لتبدأ اللعب فوراً بدون أي كود تحقق
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone or Email Input */}
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1.5 flex items-center gap-1.5">
                <FaPhoneAlt className="text-accent text-xs" />
                <span>رقم الهاتف أو الجيميل / البريد الإلكتروني *</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="مثال: 0791234567 أو example@gmail.com"
                  dir="ltr"
                  className="w-full bg-surface border border-surface-light rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-accent focus:outline-none transition text-left text-sm font-mono tracking-wider"
                  required
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">يستخدم لربط حسابك وسجل نقاطك بأمان</p>
            </div>

            {/* Username Input */}
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1.5 flex items-center gap-1.5">
                <FaUser className="text-accent text-xs" />
                <span>اسم المستخدم / اللقب (اسم واحد فقط لكل رقم ولا يتكرر) *</span>
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="مثال: أبو قيس، صانع الألعاب، النمر..."
                className="w-full bg-surface border border-surface-light rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-accent focus:outline-none transition text-sm font-bold"
                required
              />
              <p className="text-[11px] text-amber-300/80 mt-1">🔒 يتم ربط هذا الاسم برقم هاتفك للأبد ولا يُسمح بالتسجيل باسم مختلف على نفس الرقم</p>
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1.5">اختر صورة الأفاتار الخاصة بك:</label>
              <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 bg-surface-dark/80 rounded-xl border border-surface-light">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                      selectedAvatar === av
                        ? 'bg-accent/30 border-2 border-accent scale-110 shadow-lg shadow-accent/30'
                        : 'hover:bg-surface border border-transparent'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3.5 rounded-xl bg-danger/20 border border-danger/40 text-red-300 text-xs font-bold text-center leading-relaxed"
                >
                  ⚠️ {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
              {successNotice && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3.5 rounded-xl bg-success/20 border border-success/40 text-success text-xs font-bold text-center flex items-center justify-center gap-2"
                >
                  <FaCheckCircle className="text-base" />
                  <span>{successNotice}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl font-black text-primary bg-gradient-to-r from-accent to-yellow-500 hover:brightness-110 shadow-xl shadow-accent/25 transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FaBolt className="text-lg" />
                  <span>دخول أو إنشاء حساب فوري ⚡</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative bg-[#111a33] px-3 text-[11px] text-gray-400 font-bold">أو</span>
          </div>

          {/* Optional Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl font-bold text-gray-200 bg-surface/70 hover:bg-surface border border-surface-light hover:border-gray-400 transition-all flex items-center justify-center gap-2.5 text-xs"
          >
            <FcGoogle className="text-lg" />
            <span>تسجيل الدخول السريع عبر Google</span>
          </button>

          {/* Security Badge */}
          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-white/50">
            <FaShieldAlt className="text-emerald-400" />
            <span>حفظ تلقائي وفوري ومزامنة سحابية مع Supabase</span>
          </div>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm flex items-start gap-3"
              >
                <div className={`p-2 rounded-xl bg-white/5 ${b.color} flex-shrink-0 text-sm mt-0.5`}>
                  <Icon />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">{b.title}</h4>
                  <p className="text-[11px] text-white/50 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
