import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaCheck,
  FaPlay,
  FaRobot,
  FaUsers,
  FaUserFriends,
  FaExclamationTriangle,
  FaBrain,
  FaFutbol,
  FaFilm,
  FaGlobe,
  FaFemale,
  FaCalculator,
  FaBook,
  FaRandom,
} from 'react-icons/fa';
import useGameStore from '../stores/gameStore';
import { LifelineSelector } from '../components/Game/LifelinePanel';

const ALL_AVAILABLE_CATEGORIES = [
  { id: 'premier-league', name: 'الدوري الإنجليزي', icon: '🦁', color: 'from-purple-600/30 to-purple-900/30', border: 'border-purple-500/40', tag: 'كرة قدم' },
  { id: 'la-liga', name: 'الدوري الإسباني والكلاسيكو', icon: '🇪🇸', color: 'from-red-600/30 to-amber-900/30', border: 'border-red-500/40', tag: 'كرة قدم' },
  { id: 'champions-league', name: 'دوري أبطال أوروبا', icon: '⭐', color: 'from-blue-600/30 to-blue-900/30', border: 'border-blue-500/40', tag: 'كرة قدم' },
  { id: 'world-cup-2022', name: 'كأس العالم 2022 وقطر', icon: '🏆', color: 'from-amber-600/30 to-amber-900/30', border: 'border-amber-500/40', tag: 'كرة قدم' },
  { id: 'world-cup', name: 'كؤوس العالم التاريخية', icon: '🌍', color: 'from-emerald-600/30 to-emerald-900/30', border: 'border-emerald-500/40', tag: 'كرة قدم' },
  { id: 'ronaldo-messi', name: 'رونالدو وميسي', icon: '🐐', color: 'from-yellow-600/30 to-yellow-900/30', border: 'border-yellow-500/40', tag: 'كرة قدم' },
  { id: 'commentary-clues', name: 'صوت المعلق وأحداث كروية', icon: '🎙️', color: 'from-indigo-600/30 to-indigo-900/30', border: 'border-indigo-500/40', tag: 'تحدي كروي' },
  { id: 'bab-al-hara', name: 'باب الحارة وحارة الضبع', icon: '🗡️', color: 'from-stone-600/30 to-stone-900/30', border: 'border-stone-500/40', tag: 'مسلسلات' },
  { id: 'arabic-series', name: 'مسلسلات عربية ومصرية', icon: '📺', color: 'from-rose-600/30 to-rose-900/30', border: 'border-rose-500/40', tag: 'مسلسلات' },
  { id: 'global-movies', name: 'أفلام ومسلسلات عالمية', icon: '🍿', color: 'from-pink-600/30 to-pink-900/30', border: 'border-pink-500/40', tag: 'سينما' },
  { id: 'culture', name: 'معلومات عامة وثقافية', icon: '💡', color: 'from-teal-600/30 to-teal-900/30', border: 'border-teal-500/40', tag: 'ثقافة' },
  { id: 'fashion-beauty', name: 'فئة البنات (موضة وجمال)', icon: '💄', color: 'from-fuchsia-600/30 to-fuchsia-900/30', border: 'border-fuchsia-500/40', tag: 'بنات' },
  { id: 'math', name: 'رياضيات وألغاز ذكاء', icon: '🔢', color: 'from-cyan-600/30 to-cyan-900/30', border: 'border-cyan-500/40', tag: 'ذكاء' },
  { id: 'arabic', name: 'لغة عربية وجذور وجموع', icon: '📖', color: 'from-orange-600/30 to-orange-900/30', border: 'border-orange-500/40', tag: 'لغة' },
];

export default function GameSetupPage({ onStart }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAIModeParam = searchParams.get('ai') === 'true';

  const {
    selectedCategories,
    setSelectedCategories,
    gameMode,
    setGameMode,
    aiDifficulty,
    setAiDifficulty,
    startGame,
  } = useGameStore();

  const [chosenCats, setChosenCats] = useState(
    selectedCategories.length === 6
      ? selectedCategories
      : ['premier-league', 'la-liga', 'champions-league', 'world-cup-2022', 'bab-al-hara', 'culture']
  );

  const [activeMode, setActiveMode] = useState(isAIModeParam ? 'ai' : gameMode || 'team');
  const [activeDifficulty, setActiveDifficulty] = useState(aiDifficulty || 'medium');
  const [teamAName, setTeamAName] = useState('الفريق الأول');
  const [teamBName, setTeamBName] = useState(isAIModeParam ? 'روبوت حخلص عليك (AI)' : 'الفريق الثاني');
  const [step, setStep] = useState(1); // 1: Categories, 2: Lifelines, 3: Launch

  // Selected Lifelines for Team A & Team B (max 3 each)
  const [teamALifelines, setTeamALifelines] = useState(['two-answers', 'pit', 'double']);
  const [teamBLifelines, setTeamBLifelines] = useState(['pit', 'swap', 'bomb']);

  const handleToggleCategory = (catId) => {
    if (chosenCats.includes(catId)) {
      setChosenCats(chosenCats.filter((id) => id !== catId));
    } else {
      if (chosenCats.length < 6) {
        setChosenCats([...chosenCats, catId]);
      }
    }
  };

  const handleSelectRandom = () => {
    const shuffled = [...ALL_AVAILABLE_CATEGORIES].sort(() => 0.5 - Math.random());
    setChosenCats(shuffled.slice(0, 6).map((c) => c.id));
  };

  const handleToggleLifelineA = (id) => {
    if (teamALifelines.includes(id)) {
      setTeamALifelines(teamALifelines.filter((x) => x !== id));
    } else if (teamALifelines.length < 3) {
      setTeamALifelines([...teamALifelines, id]);
    }
  };

  const handleToggleLifelineB = (id) => {
    if (teamBLifelines.includes(id)) {
      setTeamBLifelines(teamBLifelines.filter((x) => x !== id));
    } else if (teamBLifelines.length < 3) {
      setTeamBLifelines([...teamBLifelines, id]);
    }
  };

  const handleLaunchGame = () => {
    setSelectedCategories(chosenCats);
    setGameMode(activeMode);
    setAiDifficulty(activeDifficulty);

    startGame({
      categories: chosenCats,
      mode: activeMode,
      aiDifficulty: activeDifficulty,
      teamAName,
      teamBName,
      teamALifelines,
      teamBLifelines,
    });

    if (onStart) {
      onStart();
    } else {
      navigate('/game');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Title Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-right border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-bold mb-2">
            <FaBrain />
            <span>إعداد المواجهة التنافسية</span>
          </div>
          <h1 className="text-3xl font-black text-white">إعداد مباراة حخلص عليك (6 فئات)</h1>
          <p className="text-sm text-white/60 mt-1">
            اختر 6 فئات للمواجهة، وحدد وضع اللعب وخطوط النجاة لكل فريق
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 bg-[var(--color-surface)] p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setStep(1)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              step === 1 ? 'gradient-accent text-[var(--color-primary)]' : 'text-white/60 hover:text-white'
            }`}
          >
            1. الفئات الـ 6
          </button>
          <button
            onClick={() => chosenCats.length === 6 && setStep(2)}
            disabled={chosenCats.length < 6}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              step === 2
                ? 'gradient-accent text-[var(--color-primary)]'
                : chosenCats.length === 6
                ? 'text-white/60 hover:text-white'
                : 'text-white/30 cursor-not-allowed'
            }`}
          >
            2. خطوط النجاة والفرق
          </button>
        </div>
      </div>

      {step === 1 ? (
        <div className="space-y-6">
          {/* Category counter & random selector */}
          <div className="flex items-center justify-between p-4 rounded-2xl glass-card border border-white/10">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                  chosenCats.length === 6
                    ? 'bg-[var(--color-success)] text-white'
                    : 'bg-[var(--color-accent)] text-[var(--color-primary)]'
                }`}
              >
                {chosenCats.length}/6
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  {chosenCats.length === 6
                    ? 'اكتمل اختيار 6 فئات! يمكنك المتابعة'
                    : `اختر ${6 - chosenCats.length} فئات إضافية`}
                </div>
                <div className="text-xs text-white/50">تتكون اللوحة من 6 أعمدة و3 أسئلة لكل عمود (18 سؤالاً)</div>
              </div>
            </div>

            <button
              onClick={handleSelectRandom}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-bold flex items-center gap-2 transition-all border border-white/10"
            >
              <FaRandom />
              <span>اختيار عشوائي</span>
            </button>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {ALL_AVAILABLE_CATEGORIES.map((cat) => {
              const isSelected = chosenCats.includes(cat.id);
              return (
                <motion.div
                  key={cat.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleToggleCategory(cat.id)}
                  className={`relative p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between h-36 ${
                    isSelected
                      ? `bg-gradient-to-br ${cat.color} ${cat.border} shadow-lg shadow-[var(--color-accent)]/20 scale-[1.02]`
                      : 'bg-[var(--color-surface)]/60 border-white/5 hover:border-white/20 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/30 text-white/70">
                      {cat.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white leading-snug">{cat.name}</h3>
                  </div>

                  {isSelected && (
                    <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-[var(--color-accent)] text-[var(--color-primary)] flex items-center justify-center text-xs font-bold shadow-md">
                      <FaCheck />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Continue button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              disabled={chosenCats.length !== 6}
              className={`px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-xl ${
                chosenCats.length === 6
                  ? 'gradient-accent text-[var(--color-primary)] hover:scale-105 active:scale-95'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              <span>المتابعة إلى خطوط النجاة والفرق</span>
              <FaPlay className="text-xs" />
            </button>
          </div>
        </div>
      ) : (
        /* Step 2: Mode, Teams & Lifelines */
        <div className="space-y-8">
          {/* Mode Selector */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-lg font-bold text-white">اختر وضع المواجهة:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => {
                  setActiveMode('team');
                  setTeamBName('الفريق الثاني');
                }}
                className={`p-4 rounded-2xl border-2 text-center transition-all ${
                  activeMode === 'team'
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-white'
                    : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                <FaUsers className="text-2xl mx-auto mb-2 text-[var(--color-accent)]" />
                <div className="font-bold text-sm">فريق ضد فريق (محلي)</div>
                <div className="text-xs text-white/50 mt-1">فريقين يتنافسان على نفس الجهاز</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMode('ai');
                  setTeamBName('روبوت حخلص عليك (AI)');
                }}
                className={`p-4 rounded-2xl border-2 text-center transition-all ${
                  activeMode === 'ai'
                    ? 'border-cyan-400 bg-cyan-400/10 text-white'
                    : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                <FaRobot className="text-2xl mx-auto mb-2 text-cyan-400" />
                <div className="font-bold text-sm">ضد الذكاء الاصطناعي (AI)</div>
                <div className="text-xs text-white/50 mt-1">تحدَّ روبوت اللعبة الذكي بمفرده</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMode('pvp');
                  setTeamBName('الخصم');
                }}
                className={`p-4 rounded-2xl border-2 text-center transition-all ${
                  activeMode === 'pvp'
                    ? 'border-emerald-400 bg-emerald-400/10 text-white'
                    : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                <FaUserFriends className="text-2xl mx-auto mb-2 text-emerald-400" />
                <div className="font-bold text-sm">لاعب ضد لاعب (PvP)</div>
                <div className="text-xs text-white/50 mt-1">مواجهة فردية 1 ضد 1</div>
              </button>
            </div>

            {/* AI Difficulty Selector */}
            {activeMode === 'ai' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-4 border-t border-white/10 space-y-2"
              >
                <div className="text-xs font-bold text-cyan-400">مستوى ذكاء الخصم الاصطناعي:</div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'easy', label: 'سهل (40% دقة)', desc: 'يخطئ كثيراً ويناسب المبتدئين' },
                    { id: 'medium', label: 'متوسط (65% دقة)', desc: 'تحدٍ متوازن لمعظم اللاعبين' },
                    { id: 'hard', label: 'صعب وذكي (85% دقة)', desc: 'خبير كروي وثقافي قلما يخطئ!' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setActiveDifficulty(lvl.id)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        activeDifficulty === lvl.id
                          ? 'border-cyan-400 bg-cyan-400/20 text-white'
                          : 'border-white/10 bg-white/5 text-white/50'
                      }`}
                    >
                      <div className="text-xs font-bold">{lvl.label}</div>
                      <div className="text-[10px] text-white/40 mt-0.5">{lvl.desc}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Team Names Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl glass-card border border-white/10">
              <label className="block text-xs font-bold text-[var(--color-accent)] mb-2">اسم الفريق الأول:</label>
              <input
                type="text"
                value={teamAName}
                onChange={(e) => setTeamAName(e.target.value)}
                className="w-full bg-[var(--color-surface)] border border-white/10 rounded-xl px-4 py-2 text-white font-bold text-sm focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>

            <div className="p-4 rounded-2xl glass-card border border-white/10">
              <label className="block text-xs font-bold text-blue-400 mb-2">اسم الفريق الثاني:</label>
              <input
                type="text"
                value={teamBName}
                onChange={(e) => setTeamBName(e.target.value)}
                disabled={activeMode === 'ai'}
                className="w-full bg-[var(--color-surface)] border border-white/10 rounded-xl px-4 py-2 text-white font-bold text-sm focus:outline-none focus:border-blue-400 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Lifeline Selection (3 per team) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-3xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-[var(--color-accent)]">خطوط نجاة ({teamAName})</span>
                <span className="text-xs text-white/50">اختر 3 فقط</span>
              </div>
              <LifelineSelector
                selectedLifelines={teamALifelines}
                onToggle={handleToggleLifelineA}
                maxSelections={3}
              />
            </div>

            <div className="glass-card p-6 rounded-3xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-blue-400">خطوط نجاة ({teamBName})</span>
                <span className="text-xs text-white/50">اختر 3 فقط</span>
              </div>
              <LifelineSelector
                selectedLifelines={teamBLifelines}
                onToggle={handleToggleLifelineB}
                maxSelections={3}
              />
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-white/10">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold text-sm transition-all"
            >
              الرجوع لتعديل الفئات
            </button>

            <button
              onClick={handleLaunchGame}
              className="px-10 py-4 rounded-2xl font-black text-sm gradient-accent text-[var(--color-primary)] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
              <span>انطلق إلى لوحة الأسئلة!</span>
              <FaPlay />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

