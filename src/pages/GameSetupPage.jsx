import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaCheck,
  FaPlay,
  FaRobot,
  FaUsers,
  FaUserFriends,
  FaBrain,
  FaRandom,
} from 'react-icons/fa';
import useGameStore from '../stores/gameStore';
import { LifelineSelector } from '../components/Game/LifelinePanel';
import gameApi from '../services/gameApi';

export const FALLBACK_CATEGORY_IMAGE =
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80';

export const CATEGORY_SECTIONS = [
  { id: 'all', name: 'جميع الأقسام', icon: '🌟' },
  { id: 'football', name: 'كرة القدم والرياضة', icon: '⚽' },
  { id: 'series', name: 'السينما والمسلسلات', icon: '🎬' },
  { id: 'general', name: 'الثقافة العامة', icon: '💡' },
  { id: 'girls', name: 'فئة البنات', icon: '💄' },
  { id: 'math', name: 'الرياضيات والذكاء', icon: '🔢' },
  { id: 'arabic', name: 'اللغة العربية', icon: '📖' },
];

export const ALL_AVAILABLE_CATEGORIES = [
  // ⚽ كرة القدم والرياضة
  {
    id: 'premier-league',
    name: 'الدوري الإنجليزي الممتاز',
    icon: '🦁',
    sectionId: 'football',
    sectionName: 'كرة قدم',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1a/2023_07_31_arne_mueseler_00060-Verbessert-RR_%2853106651455%29.jpg/960px-2023_07_31_arne_mueseler_00060-Verbessert-RR_%2853106651455%29.jpg',
    color: 'from-purple-600/30 to-purple-900/30',
    border: 'border-purple-500/40',
  },
  {
    id: 'la-liga',
    name: 'الدوري الإسباني',
    icon: '🇪🇸',
    sectionId: 'football',
    sectionName: 'كرة قدم',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ad/Camp_Nou_aerial.jpg/960px-Camp_Nou_aerial.jpg',
    color: 'from-amber-600/30 to-amber-900/30',
    border: 'border-amber-500/40',
  },
  {
    id: 'clasico',
    name: 'كلاسيكو ريال مدريد وبرشلونة',
    icon: '⚔️',
    sectionId: 'football',
    sectionName: 'كرة قدم',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/Final_SuperCopa_ESP_2011_%286056383408%29.jpg/960px-Final_SuperCopa_ESP_2011_%286056383408%29.jpg',
    color: 'from-red-600/30 to-blue-900/30',
    border: 'border-red-500/40',
  },
  {
    id: 'champions-league',
    name: 'دوري أبطال أوروبا',
    icon: '⭐',
    sectionId: 'football',
    sectionName: 'كرة قدم',
    image: 'https://thumb.wikimedia.org/wikipedia/en/thumb/f/f5/UEFA_Champions_League.svg/960px-UEFA_Champions_League.svg.png',
    color: 'from-blue-600/30 to-blue-900/30',
    border: 'border-blue-500/40',
  },
  {
    id: 'world-cup-2022',
    name: 'كأس العالم 2022 قطر',
    icon: '🏆',
    sectionId: 'football',
    sectionName: 'كرة قدم',
    image: 'https://thumb.wikimedia.org/wikipedia/en/thumb/a/a5/17_11_2021_-_Visita_ao_Est%C3%A1dio_Lusail_%2851688270420%29.jpg/960px-17_11_2021_-_Visita_ao_Est%C3%A1dio_Lusail_%2851688270420%29.jpg',
    color: 'from-rose-600/30 to-amber-900/30',
    border: 'border-rose-500/40',
  },
  {
    id: 'world-cup',
    name: 'بطولات كأس العالم التاريخية',
    icon: '🌍',
    sectionId: 'football',
    sectionName: 'كرة قدم',
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/FIFA_World_Cup_Trophy_photo_by_Djuradj_Vujcic.jpg',
    color: 'from-emerald-600/30 to-emerald-900/30',
    border: 'border-emerald-500/40',
  },
  {
    id: 'ronaldo',
    name: 'كريستيانو رونالدو (الدون)',
    icon: '🐐',
    sectionId: 'football',
    sectionName: 'كرة قدم',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/26/Cristiano_Ronaldo_Croatia_v_Portugal_2_July_2026-075_%28cropped%29.jpg/960px-Cristiano_Ronaldo_Croatia_v_Portugal_2_July_2026-075_%28cropped%29.jpg',
    color: 'from-yellow-600/30 to-yellow-900/30',
    border: 'border-yellow-500/40',
  },
  {
    id: 'messi',
    name: 'ليونيل ميسي (البرغوث)',
    icon: '🐐',
    sectionId: 'football',
    sectionName: 'كرة قدم',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c8/Leo_Messi_Argentina_v_Egypt_7_July_2026-1.jpg/960px-Leo_Messi_Argentina_v_Egypt_7_July_2026-1.jpg',
    color: 'from-cyan-600/30 to-blue-900/30',
    border: 'border-cyan-500/40',
  },
  {
    id: 'serie-a',
    name: 'الدوري الإيطالي (الكالتشيو)',
    icon: '🇮🇹',
    sectionId: 'football',
    sectionName: 'كرة قدم',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/Stadio_Meazza_2021_3.jpg/960px-Stadio_Meazza_2021_3.jpg',
    color: 'from-green-600/30 to-emerald-900/30',
    border: 'border-green-500/40',
  },
  {
    id: 'bundesliga',
    name: 'الدوري الألماني (البوندسليغا)',
    icon: '🇩🇪',
    sectionId: 'football',
    sectionName: 'كرة قدم',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/Allianz_Arena_2008-02-09.jpg/960px-Allianz_Arena_2008-02-09.jpg',
    color: 'from-yellow-600/30 to-red-900/30',
    border: 'border-yellow-500/40',
  },
  {
    id: 'coaches',
    name: 'أساطير التدريب والتكتيك',
    icon: '👔',
    sectionId: 'football',
    sectionName: 'كرة قدم',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/60/Josep_Guardiola_2023-10-04_Fu%C3%9Fball%2C_M%C3%A4nner%2C_UEFA_Champions_League%2C_RB_Leipzig_-_Manchester_City_FC_1DX_2797_%28cropped%29.jpg/960px-Josep_Guardiola_2023-10-04_Fu%C3%9Fball%2C_M%C3%A4nner%2C_UEFA_Champions_League%2C_RB_Leipzig_-_Manchester_City_FC_1DX_2797_%28cropped%29.jpg',
    color: 'from-indigo-600/30 to-indigo-900/30',
    border: 'border-indigo-500/40',
  },
  {
    id: 'sports-general',
    name: 'رياضة عامة وأولمبياد',
    icon: '🥇',
    sectionId: 'football',
    sectionName: 'رياضة عامة',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80',
    color: 'from-teal-600/30 to-teal-900/30',
    border: 'border-teal-500/40',
  },

  // 🎬 السينما والمسلسلات
  {
    id: 'bab-al-hara',
    name: 'باب الحارة وحارة الضبع',
    icon: '🗡️',
    sectionId: 'series',
    sectionName: 'مسلسلات',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/53/Damascus%2C_Syria%2C_Panoramic_view_of_Damascus.jpg/960px-Damascus%2C_Syria%2C_Panoramic_view_of_Damascus.jpg',
    color: 'from-stone-600/30 to-stone-900/30',
    border: 'border-stone-500/40',
  },
  {
    id: 'arabic-series',
    name: 'مسلسلات عربية ومصرية',
    icon: '📺',
    sectionId: 'series',
    sectionName: 'مسلسلات',
    image: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=600&q=80',
    color: 'from-rose-600/30 to-rose-900/30',
    border: 'border-rose-500/40',
  },
  {
    id: 'global-movies',
    name: 'أفلام عالمية وهوليوود',
    icon: '🍿',
    sectionId: 'series',
    sectionName: 'سينما',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
    color: 'from-pink-600/30 to-pink-900/30',
    border: 'border-pink-500/40',
  },
  {
    id: 'global-series',
    name: 'مسلسلات أجنبية وعالمية',
    icon: '🎬',
    sectionId: 'series',
    sectionName: 'مسلسلات',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2f/Hollywood_sign_%288485145044%29.jpg/960px-Hollywood_sign_%288485145044%29.jpg',
    color: 'from-purple-600/30 to-purple-900/30',
    border: 'border-purple-500/40',
  },

  // 💡 الثقافة العامة والمعلومات
  {
    id: 'culture',
    name: 'معلومات عامة وثقافية',
    icon: '💡',
    sectionId: 'general',
    sectionName: 'ثقافة عامة',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dc/The_Great_Globe%2C_Guyot_Hall%2C_Princeton_University.jpg/960px-The_Great_Globe%2C_Guyot_Hall%2C_Princeton_University.jpg',
    color: 'from-teal-600/30 to-teal-900/30',
    border: 'border-teal-500/40',
  },

  // 💄 فئة البنات
  {
    id: 'fashion-beauty',
    name: 'موضة وجمال ومكياج',
    icon: '💄',
    sectionId: 'girls',
    sectionName: 'بنات',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    color: 'from-fuchsia-600/30 to-fuchsia-900/30',
    border: 'border-fuchsia-500/40',
  },
  {
    id: 'lifestyle',
    name: 'لايف ستايل وأناقة',
    icon: '👗',
    sectionId: 'girls',
    sectionName: 'بنات',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80',
    color: 'from-pink-600/30 to-pink-900/30',
    border: 'border-pink-500/40',
  },

  // 🔢 الرياضيات والذكاء
  {
    id: 'mental-math',
    name: 'حساب ذهني وسرعة بديهة',
    icon: '🔢',
    sectionId: 'math',
    sectionName: 'رياضيات',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
    color: 'from-cyan-600/30 to-cyan-900/30',
    border: 'border-cyan-500/40',
  },
  {
    id: 'puzzles',
    name: 'ألغاز وتفكير منطقي',
    icon: '🧩',
    sectionId: 'math',
    sectionName: 'ذكاء',
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/ChessSet.jpg',
    color: 'from-blue-600/30 to-blue-900/30',
    border: 'border-blue-500/40',
  },

  // 📖 اللغة العربية
  {
    id: 'plurals',
    name: 'جموع نادرة وتحدي المفردات',
    icon: '📖',
    sectionId: 'arabic',
    sectionName: 'لغة عربية',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/31/Ibn_al-Bawwab_-_Qur%CA%BEan_f._278v-279r.jpg/960px-Ibn_al-Bawwab_-_Qur%CA%BEan_f._278v-279r.jpg',
    color: 'from-orange-600/30 to-orange-900/30',
    border: 'border-orange-500/40',
  },
  {
    id: 'roots',
    name: 'جذور الكلمات والمعاجم',
    icon: '📜',
    sectionId: 'arabic',
    sectionName: 'لغة عربية',
    image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
    color: 'from-amber-600/30 to-amber-900/30',
    border: 'border-amber-500/40',
  },
  {
    id: 'vocabulary',
    name: 'فصاحة وبلاغة وأمثال',
    icon: '🖋️',
    sectionId: 'arabic',
    sectionName: 'لغة عربية',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/Fountain_pen_writing_%28literacy%29.jpg/960px-Fountain_pen_writing_%28literacy%29.jpg',
    color: 'from-lime-600/30 to-lime-900/30',
    border: 'border-lime-500/40',
  },
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

  const [availableCats, setAvailableCats] = useState(ALL_AVAILABLE_CATEGORIES);

  useEffect(() => {
    // Merge any custom categories added via Admin panel
    gameApi.getCategories().then((remoteCats) => {
      if (!Array.isArray(remoteCats) || remoteCats.length === 0) return;
      const merged = [...ALL_AVAILABLE_CATEGORIES];
      const existingIds = new Set(merged.map((c) => c.id));
      for (const rc of remoteCats) {
        if (rc.id && !existingIds.has(rc.id) && !['football', 'series', 'general', 'girls', 'math', 'arabic'].includes(rc.id)) {
          merged.push({
            id: rc.id,
            name: rc.name,
            icon: rc.icon || '🎯',
            sectionId: rc.sectionId || 'general',
            sectionName: rc.sectionName || 'قسم مخصص',
            image: rc.image || FALLBACK_CATEGORY_IMAGE,
            color: 'from-amber-600/30 to-amber-900/30',
            border: 'border-amber-500/40',
          });
        }
      }
      setAvailableCats(merged);
    }).catch(() => {});
  }, []);

  const [chosenCats, setChosenCats] = useState(
    selectedCategories.length === 6
      ? selectedCategories
      : ['premier-league', 'la-liga', 'champions-league', 'world-cup-2022', 'bab-al-hara', 'culture']
  );

  const [activeSection, setActiveSection] = useState('all');
  const [activeMode, setActiveMode] = useState(isAIModeParam ? 'ai' : gameMode || 'team');
  const [activeDifficulty, setActiveDifficulty] = useState(aiDifficulty || 'medium');
  const [teamAName, setTeamAName] = useState('الفريق الأول');
  const [teamBName, setTeamBName] = useState(isAIModeParam ? 'روبوت هخلص عليك (AI)' : 'الفريق الثاني');
  const [step, setStep] = useState(1);

  const [teamALifelines, setTeamALifelines] = useState(['two-answers', 'pit', 'double']);
  const [teamBLifelines, setTeamBLifelines] = useState(['pit', 'swap', 'bomb']);

  const handleToggleCategory = (catId) => {
    if (chosenCats.includes(catId)) {
      setChosenCats(chosenCats.filter((id) => id !== catId));
    } else if (chosenCats.length < 6) {
      setChosenCats([...chosenCats, catId]);
    }
  };

  const handleSelectRandom = () => {
    const shuffled = [...availableCats].sort(() => 0.5 - Math.random());
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
          <h1 className="text-3xl font-black text-white">إعداد مباراة هخلص عليك (6 فئات)</h1>
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
          {/* Selected 6 Categories Top Tray */}
          <div className="p-5 rounded-3xl glass-card border-2 border-[var(--color-accent)]/30 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg shadow-md ${
                    chosenCats.length === 6
                      ? 'bg-[var(--color-success)] text-white ring-2 ring-[var(--color-success)]/40'
                      : 'bg-[var(--color-accent)] text-[var(--color-primary)] ring-2 ring-[var(--color-accent)]/40'
                  }`}
                >
                  {chosenCats.length}/6
                </div>
                <div>
                  <div className="text-base font-black text-white">
                    {chosenCats.length === 6
                      ? '🎉 اكتمل اختيار الفئات الـ 6 للوحة بنجاح!'
                      : `لوحة الفئات الـ 6 (متبقي ${6 - chosenCats.length} فئات)`}
                  </div>
                  <div className="text-xs text-white/50">
                    انقر على أي فئة لإضافتها أو إزالتها من اللوحة المكونة من 18 سؤالاً
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectRandom}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-bold flex items-center gap-2 transition-all border border-white/10"
                >
                  <FaRandom />
                  <span>اختيار عشوائي منوع</span>
                </button>
                {chosenCats.length > 0 && (
                  <button
                    onClick={() => setChosenCats([])}
                    className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all border border-red-500/20"
                  >
                    تفريغ
                  </button>
                )}
              </div>
            </div>

            {/* 6 Visual Slots */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
                const catId = chosenCats[slotIdx];
                const cat = availableCats.find((c) => c.id === catId);

                if (cat) {
                  return (
                    <motion.div
                      key={cat.id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative rounded-2xl border-2 border-[var(--color-accent)] text-center flex flex-col justify-end min-h-[115px] shadow-lg group overflow-hidden p-2.5"
                    >
                      <img
                        src={cat.image || FALLBACK_CATEGORY_IMAGE}
                        alt={cat.name}
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = FALLBACK_CATEGORY_IMAGE; }}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-slate-900/10" />
                      <button
                        onClick={() => handleToggleCategory(cat.id)}
                        className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center opacity-90 hover:opacity-100 shadow-md z-20"
                        title="إزالة الفئة"
                      >
                        ✕
                      </button>
                      <div className="relative z-10">
                        <span className="text-lg block drop-shadow">{cat.icon}</span>
                        <span className="text-xs font-black text-white line-clamp-1 drop-shadow">{cat.name}</span>
                        <span className="text-[9px] text-[var(--color-accent)] font-bold">{cat.sectionName}</span>
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <div
                    key={`empty-${slotIdx}`}
                    className="p-3 rounded-2xl border-2 border-dashed border-white/15 bg-white/5 text-center flex flex-col items-center justify-center min-h-[115px] text-white/30"
                  >
                    <span className="text-xs font-mono font-bold mb-1">فئة {slotIdx + 1}</span>
                    <span className="text-[10px]">+ شاغرة</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section Filter Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white/70">تصفح الفئات حسب الأقسام:</span>
              <span className="text-xs text-white/40 font-mono">
                {activeSection === 'all'
                  ? `إجمالي الفئات: ${availableCats.length}`
                  : `فئات القسم: ${availableCats.filter((c) => c.sectionId === activeSection).length}`}
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORY_SECTIONS.map((sec) => {
                const isActive = activeSection === sec.id;
                const count =
                  sec.id === 'all'
                    ? availableCats.length
                    : availableCats.filter((c) => c.sectionId === sec.id).length;

                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                      isActive
                        ? 'gradient-accent text-[var(--color-primary)] border-transparent shadow-lg shadow-amber-500/20'
                        : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border-white/10'
                    }`}
                  >
                    <span>{sec.icon}</span>
                    <span>{sec.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? 'bg-black/20 text-black' : 'bg-white/10 text-white/50'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filtered Categories Grid with Verified Real Images */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {availableCats
              .filter((cat) => activeSection === 'all' || cat.sectionId === activeSection)
              .map((cat) => {
                const isSelected = chosenCats.includes(cat.id);
                const selectionIndex = chosenCats.indexOf(cat.id);

                return (
                  <motion.div
                    key={cat.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleToggleCategory(cat.id)}
                    className={`relative p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between h-44 overflow-hidden shadow-xl group ${
                      isSelected
                        ? 'border-[var(--color-accent)] ring-4 ring-[var(--color-accent)]/40 scale-[1.02]'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img
                      src={cat.image || FALLBACK_CATEGORY_IMAGE}
                      alt={cat.name}
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = FALLBACK_CATEGORY_IMAGE; }}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/35 to-slate-950/15" />

                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-2xl drop-shadow-md bg-black/40 backdrop-blur-sm w-9 h-9 rounded-xl flex items-center justify-center border border-white/10">
                        {cat.icon}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-white border border-white/15 shadow">
                        {cat.sectionName}
                      </span>
                    </div>

                    <div className="relative z-10">
                      <h3 className="text-sm font-black text-white leading-snug drop-shadow-lg">{cat.name}</h3>
                    </div>

                    {isSelected && (
                      <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[var(--color-accent)] text-[var(--color-primary)] flex items-center gap-1 text-[11px] font-black shadow-xl z-20">
                        <FaCheck className="text-[10px]" />
                        <span>فئة {selectionIndex + 1}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
          </div>

          {/* Continue button */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="text-xs text-white/50">
              {chosenCats.length === 6 ? (
                <span className="text-emerald-400 font-bold">✓ جاهز للمتابعة إلى إعداد الفرق وخطوط النجاة</span>
              ) : (
                <span>يرجى اختيار 6 فئات كاملة لتفعيل زر المتابعة</span>
              )}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={chosenCats.length !== 6}
              className={`px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-xl ${
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
                  setTeamBName('روبوت هخلص عليك (AI)');
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
