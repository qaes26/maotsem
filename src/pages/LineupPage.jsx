import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gameApi from '../services/gameApi';
import { FaFutbol, FaHome, FaRedo } from 'react-icons/fa';

export default function LineupPage() {
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [activeTeamSide, setActiveTeamSide] = useState('teamA'); // 'teamA' | 'teamB'
  const [currentTurn, setCurrentTurn] = useState('team1'); // 'team1' | 'team2'
  const [scores, setScores] = useState({ team1: 0, team2: 0 });

  // Selected player on pitch
  const [activePlayer, setActivePlayer] = useState(null);
  const [revealedPlayers, setRevealedPlayers] = useState(new Map());
  const [selectedClub, setSelectedClub] = useState(null);
  const [showResult, setShowResult] = useState(false);

  // Fetch matches
  useEffect(() => {
    gameApi.getLineups().then((data) => {
      if (data && data.length > 0) {
        setMatches(data);
        setSelectedMatch(data[0]);
      }
    });
  }, []);

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
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">تحدي "تشكيلة"</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                من أي نادٍ انتقل اللاعب؟
              </span>
            </div>
            <p className="text-xs text-white/50">
              اختر لاعباً من تشكيلة المباراة وخمّن النادي الذي كان يلعب له مباشرة قبل هذا النادي
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetMatch}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/10"
          >
            <FaRedo />
            <span>إعادة المباراة</span>
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

      {/* Match Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {matches.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setSelectedMatch(m);
              setRevealedPlayers(new Map());
              setActivePlayer(null);
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
              selectedMatch.id === m.id
                ? 'bg-emerald-500 text-black border-emerald-400 shadow-lg'
                : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10'
            }`}
          >
            {m.title}
          </button>
        ))}
      </div>

      {/* Scoreboard and Turn Indicator */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className={`p-4 rounded-2xl glass-card border-2 transition-all ${
            currentTurn === 'team1'
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
          className={`p-4 rounded-2xl glass-card border-2 transition-all ${
            currentTurn === 'team2'
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
          <p className="text-xs text-white/70">اختر مباراة أخرى من الأعلى أو أعد اللعب</p>
        </div>
      )}

      {/* Team Lineup Switcher */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <button
          onClick={() => setActiveTeamSide('teamA')}
          className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 border ${
            activeTeamSide === 'teamA'
              ? 'bg-[var(--color-accent)] text-[var(--color-primary)] border-[var(--color-accent)] shadow-lg'
              : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10'
          }`}
        >
          <span>{selectedMatch.teamA.logo}</span>
          <span>تشكيلة {selectedMatch.teamA.name} ({selectedMatch.teamA.formation})</span>
        </button>

        <button
          onClick={() => setActiveTeamSide('teamB')}
          className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 border ${
            activeTeamSide === 'teamB'
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
                className={`p-4 rounded-2xl border-2 transition-all text-center flex flex-col items-center justify-between min-h-[110px] ${
                  revealed
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
              className="w-full max-w-md glass-card rounded-3xl border-2 border-emerald-500/40 p-6 space-y-6 shadow-2xl text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center text-3xl">
                <FaFutbol />
              </div>

              <div>
                <span className="text-xs text-white/60 font-bold block mb-1">
                  رقم {activePlayer.number} • {activePlayer.position}
                </span>
                <h2 className="text-2xl font-black text-white">{activePlayer.name}</h2>
                <p className="text-xs text-white/50 mt-1">
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
                    className={`p-3 rounded-2xl text-xs font-bold ${
                      selectedClub === activePlayer.prevClub
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
