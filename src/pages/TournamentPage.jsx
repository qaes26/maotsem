import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTrophy,
  FaCrown,
  FaHome,
  FaPlay,
  FaUsers,
  FaGavel,
  FaFutbol,
  FaTheaterMasks,
  FaBrain,
  FaArrowLeft,
  FaCheckCircle,
  FaMedal,
} from 'react-icons/fa';
import sound from '../utils/soundEffects';

const TEAM_EMBLEMS = ['🦁', '🦅', '👑', '⚡', '🐺', '⚔️', '🌪️', '🎯', '🔥', '💎'];

const TOURNAMENT_ROUNDS = [
  {
    id: 'round-1',
    number: 1,
    title: 'الجولة الأولى: لوحة الـ 6 فئات',
    desc: 'مواجهة كلاسيكية في 18 سؤالاً مع خطوط النجاة الستة وخاصية الحفرة والقنبلة',
    icon: FaBrain,
    color: 'from-amber-500/20 to-yellow-600/10',
    route: '/game',
    pointsCap: '1200+ نقطة',
  },
  {
    id: 'round-2',
    number: 2,
    title: 'الجولة الثانية: مزاد كرة القدم',
    desc: 'مزايدة ملحمية بين الفريقين على عدد اللاعبين والأندية خلال 45 ثانية',
    icon: FaGavel,
    color: 'from-amber-600/20 to-orange-600/10',
    route: '/auction',
    pointsCap: '1000 نقطة',
  },
  {
    id: 'round-3',
    number: 3,
    title: 'الجولة الثالثة: أهداف سكتش وصوت المعلق',
    desc: 'تتبع مسار الكرة واللمسات على السكتش التخطيطي والاستماع لعبارات المعلقين الكبار',
    icon: FaFutbol,
    color: 'from-indigo-600/20 to-blue-600/10',
    route: '/sketch',
    pointsCap: '800 نقطة',
  },
  {
    id: 'round-4',
    number: 4,
    title: 'الجولة الرابعة: تحدي تشكيلة 11 ضد 11',
    desc: 'تخمين النادي السابق لكل لاعب من أساطير النهائيات التاريخية على أرضية الملعب',
    icon: FaFutbol,
    color: 'from-emerald-600/20 to-green-600/10',
    route: '/lineup',
    pointsCap: '1100 نقطة',
  },
  {
    id: 'round-5',
    number: 5,
    title: 'الجولة الخامسة: تمثيل شخصيات ولاعبين',
    desc: 'تمثيل صامت لشخصيات باب الحارة والسينما وأساطير الكرة مع قائمة الكلمات الممنوعة',
    icon: FaTheaterMasks,
    color: 'from-pink-600/20 to-purple-600/10',
    route: '/charades',
    pointsCap: '600 نقطة',
  },
];

export default function TournamentPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState('setup'); // 'setup' | 'rounds' | 'finale'

  // Teams Setup
  const [teamA, setTeamA] = useState({
    name: 'صقور التحدي',
    emblem: '🦅',
    captain: 'كابتن الفريق الأول',
    score: 0,
  });

  const [teamB, setTeamB] = useState({
    name: 'فرسان القمة',
    emblem: '⚔️',
    captain: 'كابتن الفريق الثاني',
    score: 0,
  });

  const [completedRounds, setCompletedRounds] = useState(new Set());

  const handleStartTournament = () => {
    sound.playWhistle();
    setStep('rounds');
  };

  const handleOpenRound = (r) => {
    sound.playWhistle();
    navigate(r.route);
  };

  const teamALeading = teamA.score > teamB.score;
  const teamBLeading = teamB.score > teamA.score;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-3xl gradient-accent golden-glow text-[var(--color-primary)] flex items-center justify-center text-3xl shadow-xl flex-shrink-0">
            <FaTrophy />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white">بطولة حخلص عليك الكبرى</h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30">
                5 جولات نارية
              </span>
            </div>
            <p className="text-xs text-white/50">
              بطولة متكاملة متعددة الجولات تجمع كل أطوار المنصة في منافسة كبرى لتتويج البطل!
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold flex items-center gap-2 border border-white/10"
        >
          <FaHome />
          <span>الرئيسية</span>
        </button>
      </div>

      {/* STEP 1: TEAMS SETUP */}
      {step === 'setup' && (
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 space-y-8 shadow-2xl">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white">تأسيس الفرق وبدء البطولة</h2>
            <p className="text-xs text-white/60">اختر أسماء وشعارات الفريقين اللذين سيتنافسان عبر الجولات الخمس</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team A Setup */}
            <div className="p-6 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">الفريق الأول (Team 1)</span>
                <span className="text-4xl">{teamA.emblem}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">اسم الفريق:</label>
                <input
                  type="text"
                  value={teamA.name}
                  onChange={(e) => setTeamA({ ...teamA, name: e.target.value })}
                  className="w-full bg-[var(--color-surface)] border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">اختر شعار الفريق:</label>
                <div className="flex flex-wrap gap-1.5">
                  {TEAM_EMBLEMS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setTeamA({ ...teamA, emblem: em })}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                        teamA.emblem === em ? 'bg-amber-400 text-black scale-110 shadow-md' : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Team B Setup */}
            <div className="p-6 rounded-3xl bg-cyan-500/10 border-2 border-cyan-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400">الفريق الثاني (Team 2)</span>
                <span className="text-4xl">{teamB.emblem}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">اسم الفريق:</label>
                <input
                  type="text"
                  value={teamB.name}
                  onChange={(e) => setTeamB({ ...teamB, name: e.target.value })}
                  className="w-full bg-[var(--color-surface)] border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">اختر شعار الفريق:</label>
                <div className="flex flex-wrap gap-1.5">
                  {TEAM_EMBLEMS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setTeamB({ ...teamB, emblem: em })}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                        teamB.emblem === em ? 'bg-cyan-400 text-black scale-110 shadow-md' : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center pt-4">
            <button
              onClick={handleStartTournament}
              className="px-12 py-4 rounded-2xl font-black text-sm gradient-accent text-[var(--color-primary)] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto"
            >
              <FaPlay className="text-xs" />
              <span>انطلاق البطولة وافتتاح الجولة الأولى!</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: ROUNDS HUB */}
      {step === 'rounds' && (
        <div className="space-y-6">
          {/* Tournament Live Scoreboard */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl glass-card border-2 border-amber-500/40 bg-amber-500/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{teamA.emblem}</span>
                <div>
                  <h3 className="font-black text-white text-base sm:text-lg">{teamA.name}</h3>
                  <span className="text-[10px] text-amber-400 font-bold">نقاط البطولة الإجمالية</span>
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-black font-mono text-amber-400">{teamA.score}</div>
            </div>

            <div className="p-5 rounded-3xl glass-card border-2 border-cyan-500/40 bg-cyan-500/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{teamB.emblem}</span>
                <div>
                  <h3 className="font-black text-white text-base sm:text-lg">{teamB.name}</h3>
                  <span className="text-[10px] text-cyan-400 font-bold">نقاط البطولة الإجمالية</span>
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-black font-mono text-cyan-400">{teamB.score}</div>
            </div>
          </div>

          {/* Rounds List Cards */}
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-white">جدول جولات البطولة الخمس:</h2>

            <div className="grid grid-cols-1 gap-4">
              {TOURNAMENT_ROUNDS.map((round) => {
                const Icon = round.icon;
                const isDone = completedRounds.has(round.id);

                return (
                  <motion.div
                    key={round.id}
                    whileHover={{ scale: 1.01 }}
                    className={`p-6 rounded-3xl glass-card border border-white/10 bg-gradient-to-r ${round.color} flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl`}
                  >
                    <div className="flex items-center gap-4 text-right w-full md:w-auto">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl text-[var(--color-accent)] flex-shrink-0 shadow-md">
                        <Icon />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold text-[var(--color-accent)]">
                            الجولة {round.number}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                            {round.pointsCap}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-white">{round.title}</h3>
                        <p className="text-xs text-white/70 max-w-xl mt-0.5">{round.desc}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenRound(round)}
                      className="w-full md:w-auto px-6 py-3 rounded-2xl font-black text-xs gradient-accent text-[var(--color-primary)] shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 flex-shrink-0"
                    >
                      <FaPlay className="text-[10px]" />
                      <span>بدء الجولة الآن</span>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
