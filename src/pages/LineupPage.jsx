import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gameApi from '../services/gameApi';
import { FALLBACK_CATEGORY_IMAGE } from './GameSetupPage';
import {
  FaFutbol,
  FaHome,
  FaRedo,
  FaSearch,
  FaRandom,
  FaChevronRight,
  FaChevronLeft,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';

export default function LineupPage() {
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [activeTeamSide, setActiveTeamSide] = useState('teamA'); // 'teamA' | 'teamB'
  const [currentTurn, setCurrentTurn] = useState('team1'); // 'team1' | 'team2'
  const [scores, setScores] = useState({ team1: 0, team2: 0 });

  // Catalog filter / search UI for 70+ historical lineups
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompetition, setSelectedCompetition] = useState('الكل');
  const [showCatalog, setShowCatalog] = useState(true);

  // Selected player on pitch
  const [activePlayer, setActivePlayer] = useState(null);
  const [revealedPlayers, setRevealedPlayers] = useState(new Map());
  const [selectedClub, setSelectedClub] = useState(null);
  const [showResult, setShowResult] = useState(false);

  // Fetch all 70+ lineup matches
  useEffect(() => {
    gameApi.getLineups().then((data) => {
      if (data && data.length > 0) {
        setMatches(data);
        setSelectedMatch(data[0]);
      }
    });
  }, []);

  const competitions = useMemo(() => {
    const unique = Array.from(new Set(matches.map((m) => m.competition).filter(Boolean)));
    return ['الكل', ...unique];
  }, [matches]);

  const filteredMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return matches.filter((m) => {
      const compOk = selectedCompetition === 'الكل' || m.competition === selectedCompetition;
      if (!compOk) return false;
      if (!q) return true;
      const haystack = [
        m.title,
        m.subtitle,
        m.stadium,
        String(m.year || ''),
        m.competition,
        m.teamA?.name,
        m.teamB?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [matches, selectedCompetition, searchQuery]);

  const handleSelectMatch = (match) => {
    if (!match) return;
    setSelectedMatch(match);
    setRevealedPlayers(new Map());
    setActivePlayer(null);
    setSelectedClub(null);
    setShowResult(false);
    setActiveTeamSide('teamA');
  };

  const handlePickRandomMatch = () => {
    const pool = filteredMatches.length > 0 ? filteredMatches : matches;
    if (pool.length === 0) return;
    if (pool.length === 1) {
      handleSelectMatch(pool[0]);
      return;
    }
    const candidates = pool.filter((m) => m.id !== selectedMatch?.id);
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    handleSelectMatch(picked);
  };

  const handleStepMatch = (delta) => {
    if (!selectedMatch || matches.length === 0) return;
    const idx = matches.findIndex((m) => m.id === selectedMatch.id);
    const nextIdx = (idx + delta + matches.length) % matches.length;
    handleSelectMatch(matches[nextIdx]);
  };

  const handleSelectPlayer = (player, side) => {
    const key = `${selectedMatch.id}-${side}-${player.number}-${player.name}`;
    if (revealedPlayers.has(key)) return;

    setActivePlayer({ ...player, side, key });
    setSelectedClub(null);
    setShowResult(false);
  };

  const handleGuessClub = (club) => {
    if (!activePlayer || showResult) return;

    setSelectedClub(club);
    setShowResult(true);

    const isCorrect = club === activePlayer.prevClub;
    const newRevealed = new Map(revealedPlayers);
    newRevealed.set(activePlayer.key, {
      isCorrect,
      guess: club,
      actual: activePlayer.prevClub,
    });
    setRevealedPlayers(newRevealed);

    if (isCorrect) {
      setScores((prev) => ({
        ...prev,
        [currentTurn]: prev[currentTurn] + 100,
      }));
    }
  };

  const handleClosePlayerModal = () => {
    setActivePlayer(null);
    setShowResult(false);
    setSelectedClub(null);
    setCurrentTurn((prev) => (prev === 'team1' ? 'team2' : 'team1'));
  };

  const handleResetMatch = () => {
    setRevealedPlayers(new Map());
    setActivePlayer(null);
    setSelectedClub(null);
    setShowResult(false);
    setScores({ team1: 0, team2: 0 });
    setCurrentTurn('team1');
  };

  if (!selectedMatch) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentMatchIndex = Math.max(0, matches.findIndex((m) => m.id === selectedMatch.id));
  const currentDisplayTeam = activeTeamSide === 'teamA' ? selectedMatch.teamA : selectedMatch.teamB;
  const totalMatchPlayers =
    (selectedMatch.teamA?.players?.length || 0) + (selectedMatch.teamB?.players?.length || 0);
  const allRevealed = totalMatchPlayers > 0 && revealedPlayers.size >= totalMatchPlayers;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl shadow-lg border border-emerald-500/30">
            <FaFutbol />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-white">تحدي &quot;تشكيلة&quot;</h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ⚽ {matches.length} تشكيلة تاريخية بصور حقيقية
              </span>
            </div>
            <p className="text-xs text-white/55">
              اختر أي مباراة تاريخية ثم اختر لاعباً وخمّن النادي الذي انتقل منه مباشرة قبل هذه المباراة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePickRandomMatch}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black text-xs font-black flex items-center gap-1.5 transition-all border border-emerald-500/40"
          >
            <FaRandom />
            <span>تشكيلة عشوائية</span>
          </button>
          <button
            onClick={handleResetMatch}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/10"
          >
            <FaRedo />
            <span>إعادة النتيجة</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold flex items-center gap-2 transition-all border border-white/10"
          >
            <FaHome />
            <span>الرئيسية</span>
          </button>
        </div>
      </div>

      {/* 70 Lineups Browser Panel with Photos & Filters */}
      <div className="glass-card rounded-3xl p-4 sm:p-5 border border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`ابحث في ${matches.length} تشكيلة بالاسم، الفريق، الملعب، أو السنة (مثال: 2005، الكلاسيكو، الهلال...)`}
              className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-black/30 border border-white/15 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <button
            onClick={() => setShowCatalog((v) => !v)}
            className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white/80 flex items-center justify-center gap-2 transition-all"
          >
            {showCatalog ? <FaEyeSlash /> : <FaEye />}
            <span>
              {showCatalog
                ? `إخفاء قائمة التشكيلات (${filteredMatches.length})`
                : `استعراض التشكيلات (${filteredMatches.length} من ${matches.length})`}
            </span>
          </button>
        </div>

        {/* Competition Filters */}
        <div className="flex flex-wrap gap-2">
          {competitions.map((comp) => {
            const count =
              comp === 'الكل'
                ? matches.length
                : matches.filter((m) => m.competition === comp).length;
            const active = selectedCompetition === comp;
            return (
              <button
                key={comp}
                onClick={() => {
                  setSelectedCompetition(comp);
                  setShowCatalog(true);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 ${
                  active
                    ? 'bg-emerald-500 text-black border-emerald-400 shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10'
                }`}
              >
                <span>{comp}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    active ? 'bg-black/20 text-black' : 'bg-white/10 text-white/60'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Visual Grid of Lineup Cards with Photos */}
        {showCatalog && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[340px] overflow-y-auto pl-1 pt-1">
            {filteredMatches.length === 0 ? (
              <div className="col-span-full py-8 text-center text-white/50 text-sm">
                لا توجد تشكيلات مطابقة لبحثك. جرّب كلمة أخرى أو اختر &quot;الكل&quot;.
              </div>
            ) : (
              filteredMatches.map((m) => {
                const isSelected = selectedMatch.id === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMatch(m)}
                    className={`group text-right rounded-2xl overflow-hidden border-2 transition-all flex flex-col bg-slate-900/70 ${
                      isSelected
                        ? 'border-emerald-400 ring-2 ring-emerald-400/40 shadow-lg shadow-emerald-500/20'
                        : 'border-white/10 hover:border-emerald-400/50'
                    }`}
                  >
                    <div className="relative h-24 w-full overflow-hidden">
                      <img
                        src={m.image || FALLBACK_CATEGORY_IMAGE}
                        alt={m.title}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_CATEGORY_IMAGE;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        {m.year && (
                          <span className="px-2 py-0.5 rounded-full bg-black/75 text-amber-300 font-mono font-bold text-[10px] border border-white/10">
                            {m.year}
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-500 text-black font-black text-[10px]">
                          نشطة ✓
                        </span>
                      )}
                      <div className="absolute bottom-1.5 right-2 left-2 flex items-center justify-between text-[10px] text-white/85 font-bold">
                        <span className="truncate">{m.competition || 'تحدي تشكيلة'}</span>
                        <span>
                          {m.teamA?.logo} vs {m.teamB?.logo}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 space-y-1 flex-1 flex flex-col justify-between w-full">
                      <div className="font-black text-xs text-white line-clamp-1">{m.title}</div>
                      <div className="text-[11px] text-white/60 line-clamp-1">{m.subtitle}</div>
                      {m.stadium && (
                        <div className="text-[10px] text-emerald-300/80 line-clamp-1">
                          🏟️ {m.stadium}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Selected Match Hero Card Banner */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500/35 shadow-2xl">
        <div className="relative h-48 sm:h-56 w-full">
          <img
            src={selectedMatch.image || FALLBACK_CATEGORY_IMAGE}
            alt={selectedMatch.title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_CATEGORY_IMAGE;
            }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30" />

          {/* Quick Prev/Next Match Controls */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <button
              onClick={() => handleStepMatch(-1)}
              className="p-2 rounded-xl bg-black/65 hover:bg-emerald-500 text-white hover:text-black border border-white/15 transition-all"
              title="التشكيلة السابقة"
            >
              <FaChevronRight />
            </button>
            <span className="px-3 py-1 rounded-xl bg-black/70 text-xs font-mono font-bold text-emerald-300 border border-white/15">
              {currentMatchIndex + 1} / {matches.length}
            </span>
            <button
              onClick={() => handleStepMatch(1)}
              className="p-2 rounded-xl bg-black/65 hover:bg-emerald-500 text-white hover:text-black border border-white/15 transition-all"
              title="التشكيلة التالية"
            >
              <FaChevronLeft />
            </button>
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-2 flex-wrap">
            {selectedMatch.competition && (
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-black text-xs font-black shadow">
                {selectedMatch.competition}
              </span>
            )}
            {selectedMatch.year && (
              <span className="px-3 py-1 rounded-full bg-black/70 text-amber-300 text-xs font-mono font-bold border border-amber-400/30">
                {selectedMatch.year}
              </span>
            )}
          </div>

          <div className="absolute bottom-4 right-4 left-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-3xl font-black text-white drop-shadow">
                {selectedMatch.title}
              </h2>
              <p className="text-xs sm:text-sm text-white/80 font-semibold">
                {selectedMatch.subtitle}
              </p>
              {selectedMatch.stadium && (
                <div className="text-xs text-emerald-300 font-bold">
                  🏟️ {selectedMatch.stadium}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15 text-xs font-black self-start sm:self-auto">
              <span>{selectedMatch.teamA?.logo} {selectedMatch.teamA?.name}</span>
              <span className="text-emerald-400">VS</span>
              <span>{selectedMatch.teamB?.name} {selectedMatch.teamB?.logo}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scoreboard and Turn Indicator */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className={`p-4 rounded-2xl glass-card border-2 transition-all ${currentTurn === 'team1'
              ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
              : 'border-white/10 bg-white/5'
            }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-white/60 font-bold">الفريق الأول</div>
              {currentTurn === 'team1' && (
                <span className="text-[10px] text-[var(--color-accent)] font-bold">دورك الآن للاختيار</span>
              )}
            </div>
            <div className="text-2xl font-black font-mono text-[var(--color-accent)]">{scores.team1}</div>
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl glass-card border-2 transition-all ${currentTurn === 'team2'
              ? 'border-emerald-400 bg-emerald-400/10'
              : 'border-white/10 bg-white/5'
            }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-white/60 font-bold">الفريق الثاني</div>
              {currentTurn === 'team2' && (
                <span className="text-[10px] text-emerald-400 font-bold">دورك الآن للاختيار</span>
              )}
            </div>
            <div className="text-2xl font-black font-mono text-emerald-400">{scores.team2}</div>
          </div>
        </div>
      </div>

      {allRevealed && (
        <div className="p-5 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 text-center space-y-2">
          <div className="text-2xl font-black text-white">
            🏆 اكتملت تشكيلة المباراة!{' '}
            {scores.team1 > scores.team2
              ? 'فاز الفريق الأول!'
              : scores.team2 > scores.team1
                ? 'فاز الفريق الثاني!'
                : 'تعادل مثير بين الفريقين!'}
          </div>
          <p className="text-xs text-white/70">اختر مباراة أخرى من الـ {matches.length} تشكيلة أو انتقل للتالية</p>
        </div>
      )}

      {/* Team Lineup Switcher */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <button
          onClick={() => setActiveTeamSide('teamA')}
          className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 border ${activeTeamSide === 'teamA'
              ? 'bg-[var(--color-accent)] text-[var(--color-primary)] border-[var(--color-accent)] shadow-lg'
              : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10'
            }`}
        >
          <span>{selectedMatch.teamA.logo}</span>
          <span>تشكيلة {selectedMatch.teamA.name} ({selectedMatch.teamA.formation})</span>
        </button>

        <button
          onClick={() => setActiveTeamSide('teamB')}
          className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 border ${activeTeamSide === 'teamB'
              ? 'bg-emerald-500 text-black border-emerald-400 shadow-lg'
              : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10'
            }`}
        >
          <span>{selectedMatch.teamB.logo}</span>
          <span>تشكيلة {selectedMatch.teamB.name} ({selectedMatch.teamB.formation})</span>
        </button>
      </div>

      {/* Soccer Pitch View */}
      <div
        className="relative rounded-3xl overflow-hidden border-4 border-emerald-600/40 shadow-2xl p-6 sm:p-10 min-h-[500px] flex flex-col justify-between"
        style={{
          background: 'radial-gradient(ellipse at center, #0f5132 0%, #052c1e 100%)',
          backgroundImage: `
            radial-gradient(circle at center, rgba(255,255,255,0.15) 2px, transparent 2px),
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      >
        <div className="absolute inset-4 border-2 border-white/20 rounded-2xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-white/20 pointer-events-none" />
        <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-white/20 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {(currentDisplayTeam?.players || []).map((player) => {
            const key = `${selectedMatch.id}-${activeTeamSide}-${player.number}-${player.name}`;
            const revealed = revealedPlayers.get(key);

            return (
              <motion.button
                key={key}
                whileHover={!revealed ? { scale: 1.05 } : {}}
                whileTap={!revealed ? { scale: 0.95 } : {}}
                disabled={!!revealed}
                onClick={() => handleSelectPlayer(player, activeTeamSide)}
                className={`p-4 rounded-2xl border-2 transition-all text-center flex flex-col items-center justify-between min-h-[110px] ${revealed
                    ? revealed.isCorrect
                      ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200'
                      : 'bg-red-500/30 border-red-400 text-red-200'
                    : 'bg-black/50 hover:bg-black/70 border-white/20 hover:border-[var(--color-accent)] text-white shadow-lg'
                  }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="w-7 h-7 rounded-full bg-white/10 font-mono font-bold text-xs flex items-center justify-center">
                    {player.number}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    {player.position}
                  </span>
                </div>

                <div className="font-bold text-sm sm:text-base my-2">{player.name}</div>

                {revealed ? (
                  <div className="text-[11px] font-bold">
                    {revealed.isCorrect ? (
                      <span className="text-emerald-400">✓ {revealed.actual}</span>
                    ) : (
                      <span className="text-red-400">
                        ✗ <span className="line-through">{revealed.guess}</span> ({revealed.actual})
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-[10px] text-[var(--color-accent)] font-semibold">
                    اضغط لتخمين النادي السابق
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Player Guess Modal */}
      <AnimatePresence>
        {activePlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="w-full max-w-md glass-card rounded-3xl border-2 border-emerald-500/40 p-6 space-y-5 shadow-2xl text-center"
            >
              <div className="relative h-24 rounded-2xl overflow-hidden border border-white/10">
                <img
                  src={selectedMatch.image || FALLBACK_CATEGORY_IMAGE}
                  alt={selectedMatch.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_CATEGORY_IMAGE;
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent flex items-end justify-between p-3">
                  <span className="text-[11px] font-bold text-white truncate">{selectedMatch.title}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-black">
                    #{activePlayer.number} • {activePlayer.position}
                  </span>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-black text-white">{activePlayer.name}</h2>
                <p className="text-xs text-white/60 mt-1">
                  من أي نادٍ انتقل مباشرة قبل الانضمام لـ{' '}
                  <span className="text-emerald-400 font-bold">
                    {activePlayer.side === 'teamA' ? selectedMatch.teamA.name : selectedMatch.teamB.name}
                  </span>
                  ؟
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(activePlayer.options || []).map((club, idx) => {
                  let btnColor = 'bg-white/5 hover:bg-white/10 border-white/10 text-white';

                  if (showResult) {
                    if (club === activePlayer.prevClub) {
                      btnColor = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                    } else if (club === selectedClub) {
                      btnColor = 'bg-red-500/20 border-red-500 text-red-300';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={showResult}
                      onClick={() => handleGuessClub(club)}
                      className={`p-3.5 rounded-2xl border-2 text-sm font-bold transition-all ${btnColor}`}
                    >
                      {club}
                    </button>
                  );
                })}
              </div>

              {showResult && (
                <div className="space-y-4 pt-2">
                  <div
                    className={`p-3 rounded-2xl text-xs font-bold ${selectedClub === activePlayer.prevClub
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                  >
                    {selectedClub === activePlayer.prevClub
                      ? '🎉 إجابة صحيحة! +100 نقطة'
                      : `❌ إجابة خاطئة! النادي الصحيح هو: ${activePlayer.prevClub}`}
                  </div>

                  <button
                    onClick={handleClosePlayerModal}
                    className="w-full py-3 rounded-2xl font-bold text-sm bg-emerald-500 text-black hover:bg-emerald-400 transition-all"
                  >
                    متابعة وتمرير الدور
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
