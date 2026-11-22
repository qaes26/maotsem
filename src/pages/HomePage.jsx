import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaPlay,
  FaRobot,
  FaUsers,
  FaTrophy,
  FaCrown,
  FaFire,
  FaBolt,
  FaMask,
  FaFutbol,
  FaBrain,
  FaArrowLeft,
  FaStar,
  FaGavel,
  FaPenNib,
  FaTheaterMasks,
  FaMedal,
} from 'react-icons/fa';
import useAuthStore from '../stores/authStore';
import useGameStore from '../stores/gameStore';
import sound from '../utils/soundEffects';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const setGameMode = useGameStore((s) => s.setGameMode);

  const handleStartMode = (mode, route) => {
    sound.playWhistle();
    // Online multiplayer rooms require authenticated phone
    if (!isAuthenticated && route.startsWith('/room')) {
      navigate('/login');
      return;
    }
    if (mode) setGameMode(mode);
    navigate(route);
  };

  const gameModes = [
    {
      id: 'tournament',
      title: 'بطولة حخلص عليك الكبرى',
      subtitle: '5 جولات متتالية مع الأفرقة وتتويج البطل',
      description: 'أقوى وضع تنافسي متكامل! يتنافس الفريقان عبر 5 جولات: لوحة الفئات، مزاد الكرة، سكتش الأهداف، التشكيلة، والتمثيل!',
      icon: FaTrophy,
      badge: 'النظام الشامل الخارق 🏆',
      gradient: 'from-amber-500/25 via-yellow-600/15 to-amber-950/20',
      borderColor: 'border-[var(--color-accent)]',
      textColor: 'text-[var(--color-accent)]',
      buttonBg: 'gradient-accent',
      buttonText: 'text-[var(--color-primary)]',
      route: '/tournament',
      mode: 'tournament',
      featured: true,
    },
    {
      id: 'six-categories',
      title: 'لوحة الـ 6 فئات',
      subtitle: 'الوضع الكلاسيكي (18 سؤالاً)',
      description: 'اختر 6 فئات وتنافس في لوحة من 18 سؤالاً متدرجة (200، 400، 600) مع خطوط النجاة الـ 6 وخاصية الحفرة والقنبلة!',
      icon: FaBrain,
      badge: 'كلاسيكي شهير 🎯',
      gradient: 'from-amber-500/20 via-yellow-600/10 to-transparent',
      borderColor: 'border-amber-500/40',
      textColor: 'text-amber-400',
      buttonBg: 'bg-amber-500 hover:bg-amber-400',
      buttonText: 'text-black',
      route: '/game',
      mode: 'pvp',
    },
    {
      id: 'auction',
      title: 'مزاد كرة القدم',
      subtitle: 'مزايدة ملحمية وتحدي الـ 45 ثانية',
      description: 'مزايدة حية بين الفريقين على عدد اللاعبين والأندية، ومن يدخل التحدي يملك 45 ثانية لتحقيق الرهان أو تضيع النقاط!',
      icon: FaGavel,
      badge: 'تحدي ورهان كروي 🔨',
      gradient: 'from-orange-500/20 via-amber-600/10 to-transparent',
      borderColor: 'border-orange-500/40',
      textColor: 'text-orange-400',
      buttonBg: 'bg-orange-500 hover:bg-orange-400',
      buttonText: 'text-black',
      route: '/auction',
      mode: 'auction',
    },
    {
      id: 'sketch',
      title: 'أهداف سكتش وصوت المعلق',
      subtitle: 'تتبع حركة الكرة وصوت الشوالي وخليف',
      description: 'رسم تخطيطي متحرك لمسار الكرة والتمريرات لأهداف تاريخية خالدة، مع صوت واقتباسات أشهر المعلقين العرب!',
      icon: FaPenNib,
      badge: 'بصري وصوتي ✍️',
      gradient: 'from-indigo-500/20 via-blue-600/10 to-transparent',
      borderColor: 'border-indigo-500/40',
      textColor: 'text-indigo-400',
      buttonBg: 'bg-indigo-600 hover:bg-indigo-500',
      buttonText: 'text-white',
      route: '/sketch',
      mode: 'sketch',
    },
    {
      id: 'lineup',
      title: 'تحدي "تشكيلة"',
      subtitle: 'من أي نادٍ انتقل اللاعب؟',
      description: 'تحدي كروي على أرضية الملعب! 22 لاعباً من أشهر النهائيات العالمية، احزر النادي السابق لكل لاعب قبل هذا النادي.',
      icon: FaFutbol,
      badge: 'لعشاق التكتيك ⚽',
      gradient: 'from-emerald-500/20 via-green-600/10 to-transparent',
      borderColor: 'border-emerald-500/40',
      textColor: 'text-emerald-400',
      buttonBg: 'bg-emerald-500 hover:bg-emerald-400',
      buttonText: 'text-black',
      route: '/lineup',
      mode: 'lineup',
    },
    {
      id: 'charades',
      title: 'تمثيل شخصيات ولاعبين',
      subtitle: 'تمثيل صامت وتحدي الكلمات الممنوعة',
      description: 'ألعاب وضحك الأمسيات! مثل شخصيات باب الحارة والسينما العالمية وأساطير الكرة خلال 60 ثانية بدون كلام وبلا كلمات ممنوعة!',
      icon: FaTheaterMasks,
      badge: 'أمسيات وضحك 🎭',
      gradient: 'from-pink-500/20 via-rose-600/10 to-transparent',
      borderColor: 'border-pink-500/40',
      textColor: 'text-pink-400',
      buttonBg: 'bg-pink-600 hover:bg-pink-500',
      buttonText: 'text-white',
      route: '/charades',
      mode: 'charades',
    },
    {
      id: 'mafia',
      title: 'لعبة مافيا الجماعية',
      subtitle: 'توزيع الأدوار سرياً والتصويت',
      description: 'لعبة الأمسيات المتكاملة! توزيع الأدوار سرياً (مافيا، محقق، طبيب، مواطن)، جولات ليل ونهار وتصويت تفاعلي مع سجل أحداث.',
      icon: FaMask,
      badge: 'ألعاب جماعية 🕵️',
      gradient: 'from-purple-500/20 via-indigo-600/10 to-transparent',
      borderColor: 'border-purple-500/40',
      textColor: 'text-purple-400',
      buttonBg: 'bg-purple-600 hover:bg-purple-500',
      buttonText: 'text-white',
      route: '/mafia',
      mode: 'mafia',
    },
    {
      id: 'ai-mode',
      title: 'التحدي ضد الذكاء الاصطناعي',
      subtitle: 'مواجهة فردية ضد روبوت حخلص عليك',
      description: 'العب بمفردك ضد منافس ذكي بمستويات (سهل، متوسط، صعب). الذكاء الاصطناعي يختار الفئات ويستخدم خطوط النجاة استراتيجياً.',
      icon: FaRobot,
      badge: 'لعب فردي ذكي 🤖',
      gradient: 'from-cyan-500/20 via-blue-600/10 to-transparent',
      borderColor: 'border-cyan-500/40',
      textColor: 'text-cyan-400',
      buttonBg: 'bg-cyan-500 hover:bg-cyan-400',
      buttonText: 'text-black',
      route: '/game?ai=true',
      mode: 'ai',
    },
    {
      id: 'multiplayer-rooms',
      title: 'الغرف الجماعية (أونلاين)',
      subtitle: 'أنشئ غرفة أو انضم برمز سداسي',
      description: 'العب مع أصدقائك عن بُعد في الوقت الفعلي عبر رمز الغرفة، مع دردشة حية ونظام فرق وتنافس مباشر متزامن بالكامل.',
      icon: FaUsers,
      badge: 'أونلاين حقيقي 🌐',
      gradient: 'from-rose-500/20 via-pink-600/10 to-transparent',
      borderColor: 'border-rose-500/40',
      textColor: 'text-rose-400',
      buttonBg: 'bg-rose-500 hover:bg-rose-400',
      buttonText: 'text-white',
      route: '/room',
      mode: 'team',
    },
  ];

  const featuredMode = gameModes.find((m) => m.featured);
  const otherModes = gameModes.filter((m) => !m.featured);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Hero Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-6 sm:p-10 glass-card border border-white/10 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-accent)]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-right space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-accent)] text-xs font-bold">
              <FaCrown />
              <span>المنصة رقم #1 للألعاب التفاعلية والمسابقات باللغة العربية</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              أهلاً بك في <span className="text-[var(--color-accent)]">حخلص عليك</span>
            </h1>
            <p className="text-white/70 max-w-xl text-sm sm:text-base leading-relaxed">
              مشروع متكامل ومحتوى متجدد باستمرار: بطولات متعددة الجولات، مزاد كروي، أهداف سكتش، تمثيل شخصيات، وتحدي التشكيلة!
            </p>
          </div>

          {/* Quick User Stats Pill or Login CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {isAuthenticated ? (
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-surface)]/80 border border-white/10 w-full sm:w-auto justify-center">
                <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center text-[var(--color-primary)] font-bold text-xl">
                  {user?.avatar || '🦁'}
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{user?.nickname}</div>
                  <div className="text-xs text-[var(--color-accent)] font-semibold flex items-center gap-1">
                    <FaStar className="text-[10px]" />
                    <span>{user?.points || 0} نقطة</span>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-[var(--color-primary)] gradient-accent shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm flex items-center justify-center gap-2"
              >
                <FaPlay className="text-xs" />
                <span>تسجيل الدخول برقم الهاتف</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Featured Mode: Tournament Mode */}
      {featuredMode && (
        <motion.div
          whileHover={{ scale: 1.01 }}
          onClick={() => handleStartMode(featuredMode.mode, featuredMode.route)}
          className={`p-6 sm:p-8 rounded-3xl glass-card border-2 ${featuredMode.borderColor} bg-gradient-to-r ${featuredMode.gradient} relative overflow-hidden shadow-2xl transition-all cursor-pointer`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5 text-right w-full md:w-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl gradient-accent flex items-center justify-center text-[var(--color-primary)] text-3xl sm:text-4xl shadow-xl flex-shrink-0">
                <FaTrophy />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/40">
                    {featuredMode.badge}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">{featuredMode.title}</h3>
                <p className="text-xs sm:text-sm text-white/70 max-w-2xl mt-1 leading-relaxed">
                  {featuredMode.description}
                </p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStartMode(featuredMode.mode, featuredMode.route);
              }}
              className="w-full md:w-auto px-8 py-4 rounded-2xl font-black text-sm gradient-accent text-[var(--color-primary)] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 flex-shrink-0"
            >
              <span>افتتاح البطولة الآن</span>
              <FaArrowLeft className="text-xs" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Grid of All Modes & Rounds */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-8 rounded-full gradient-accent" />
            <h2 className="text-2xl font-extrabold text-white">أطوار اللعب والجولات المستقلة</h2>
          </div>
          <span className="text-xs text-white/50">اختر الطور الذي يناسب جلستكم وتنافسوا</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {otherModes.map((mode, index) => {
            const Icon = mode.icon;
            return (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => handleStartMode(mode.mode, mode.route)}
                className={`p-6 rounded-3xl glass-card border ${mode.borderColor} bg-gradient-to-b ${mode.gradient} shadow-xl flex flex-col justify-between cursor-pointer transition-all group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-[var(--color-surface)]/80 ${mode.textColor} border border-white/10 shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 text-white/70 border border-white/10">
                      {mode.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-white mb-1 group-hover:text-[var(--color-accent)] transition-colors">
                    {mode.title}
                  </h3>
                  <div className="text-xs font-semibold text-white/50 mb-2">{mode.subtitle}</div>
                  <p className="text-xs text-white/60 leading-relaxed line-clamp-3">
                    {mode.description}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartMode(mode.mode, mode.route);
                  }}
                  className={`mt-6 w-full py-2.5 px-4 rounded-xl font-bold text-xs ${mode.buttonBg} ${mode.buttonText} shadow-md flex items-center justify-center gap-2 transition-all`}
                >
                  <span>دخول الجولة</span>
                  <FaArrowLeft className="text-[10px]" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Highlights Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="p-4 rounded-2xl bg-[var(--color-surface)]/40 border border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg">
            <FaBolt />
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-white">محتوى يتجدد باستمرار</div>
            <div className="text-xs text-white/50">مولد أسئلة ذكي يضمن عدم تكرار التحديات بين المباريات</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--color-surface)]/40 border border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-lg">
            <FaUsers />
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-white">نظام أفرقة وجولات حية</div>
            <div className="text-xs text-white/50">تخصيص أسماء وشعارات وكباتن الفرق مع لوحة صدارة دائمة</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--color-surface)]/40 border border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg">
            <FaFire />
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-white">مؤثرات صوتية تفاعلية</div>
            <div className="text-xs text-white/50">صافرة حكم، مطرقة مزاد، صوت القنبلة، وألحان الفوز الحماسية</div>
          </div>
        </div>
      </div>
    </div>
  );
}
