import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaGamepad,
  FaShieldAlt,
  FaTrophy,
  FaCloud,
  FaUsers,
  FaBolt,
  FaCheckCircle,
} from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import useAuthStore from '../stores/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signInWithGoogle, isLoading, error, isAuthenticated, clearError } = useAuthStore();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = async () => {
    clearError();
    try {
      await signInWithGoogle();
    } catch {
      // Error handled in store
    }
  };

  const benefits = [
    {
      icon: FaTrophy,
      color: 'text-amber-400',
      title: 'بطولات الأفرقة الكبرى',
      desc: 'المنافسة في 5 جولات متتالية ورفع كأس البطولة وحفظ سجلك',
    },
    {
      icon: FaCloud,
      color: 'text-emerald-400',
      title: 'حفظ سحابي دائم عبر Supabase',
      desc: 'نقاطك وإحصائياتك وألقابك محفوظة بأمان ولن تضيع أبداً',
    },
    {
      icon: FaUsers,
      color: 'text-cyan-400',
      title: 'غرف اللعب التنافسية',
      desc: 'إنشاء ومشاركة غرف اللعب المباشرة مع أصدقائك بكود خاص',
    },
    {
      icon: FaBolt,
      color: 'text-pink-400',
      title: 'دخول فوري بنقرة واحدة',
      desc: 'بدون أي انتظار أو رموز تحقق SMS، ادخل وابدأ اللعب فوراً',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Brand Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl gradient-accent golden-glow mb-4 shadow-xl">
            <FaGamepad className="text-4xl text-[var(--color-primary)]" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">لعبة حخلص عليك</h1>
          <p className="text-white/60 text-sm">المنصة التنافسية الكبرى للألعاب والتحديات العربية</p>
        </motion.div>

        {/* Main Sign-In Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
        >
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white mb-2">تسجيل الدخول المباشر</h2>
            <p className="text-xs text-white/60 leading-relaxed">
              سجّل دخولك فوراً باستخدام حساب <span className="text-white font-semibold">Google</span> للوصول لكامل أطوار اللعبة والبطولات.
            </p>
          </div>

          {/* Google Sign-In Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            onClick={handleGoogleLogin}
            className="w-full py-4 px-6 rounded-2xl font-bold text-slate-900 bg-white hover:bg-slate-50 shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 border border-slate-200"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FcGoogle className="text-2xl flex-shrink-0" />
                <span className="text-base font-bold">تسجيل الدخول باستخدام Google</span>
              </>
            )}
          </motion.button>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs text-center font-medium leading-relaxed"
            >
              {error}
            </motion.div>
          )}

          {/* Security & Cloud Badge */}
          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-white/50">
            <FaShieldAlt className="text-emerald-400" />
            <span>مصادقة رسمية وآمنة 100% عبر Supabase Cloud</span>
          </div>
        </motion.div>

        {/* Feature Highlights Grid */}
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
                <div className={`p-2 rounded-xl bg-white/5 ${b.color} flex-shrink-0 text-base mt-0.5`}>
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
