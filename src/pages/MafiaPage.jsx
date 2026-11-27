import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaMask,
  FaHome,
  FaMoon,
  FaSun,
  FaPlay,
  FaCrown,
  FaTrash,
  FaEdit,
  FaCheck,
  FaUserPlus,
  FaMagic,
} from 'react-icons/fa';

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function MafiaPage() {
  const navigate = useNavigate();

  // Setup state: start EMPTY so user adds players from scratch
  const [phase, setPhase] = useState('setup'); // 'setup' | 'reveal' | 'night' | 'day' | 'gameover'
  const [playerNames, setPlayerNames] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [nameError, setNameError] = useState('');
  const [editingIdx, setEditingIdx] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  // Assigned players list: { id, name, role: 'mafia'|'detective'|'doctor'|'citizen', isAlive: true }
  const [players, setPlayers] = useState([]);
  const [currentRevealIdx, setCurrentRevealIdx] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Night phase actions
  const [nightStep, setNightStep] = useState('mafia'); // 'mafia' | 'detective' | 'doctor'
  const [mafiaTarget, setMafiaTarget] = useState(null);
  const [detectiveTarget, setDetectiveTarget] = useState(null);
  const [detectiveResult, setDetectiveResult] = useState(null);
  const [doctorTarget, setDoctorTarget] = useState(null);

  // Day phase
  const [lastNightVictim, setLastNightVictim] = useState(null);
  const [doctorSaved, setDoctorSaved] = useState(false);
  const [dayTimer, setDayTimer] = useState(120);
  const [timerRunning, setTimerRunning] = useState(false);

  // Voting phase
  const [votes, setVotes] = useState({});
  const [voteNotice, setVoteNotice] = useState('');
  const [eliminatedPlayer, setEliminatedPlayer] = useState(null);
  const [winnerTeam, setWinnerTeam] = useState(null); // 'citizens' | 'mafia'

  const transitionTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (phase === 'day' && timerRunning && dayTimer > 0) {
      interval = setInterval(() => setDayTimer((t) => Math.max(0, t - 1)), 1000);
    } else if (dayTimer === 0 && timerRunning) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [phase, timerRunning, dayTimer]);

  const handleAddPlayer = (e) => {
    e?.preventDefault();
    setNameError('');

    const raw = newPlayerName.trim();
    if (!raw) return;

    // Support adding comma/Arabic-comma separated names in one go
    const parts = raw
      .split(/[,،\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const updated = [...playerNames];
    const duplicates = [];

    for (const part of parts) {
      if (updated.length >= 12) {
        setNameError('الحد الأقصى هو 12 لاعباً');
        break;
      }
      const exists = updated.some((n) => n.toLowerCase() === part.toLowerCase());
      if (exists) {
        duplicates.push(part);
      } else {
        updated.push(part);
      }
    }

    if (duplicates.length > 0) {
      setNameError(`الاسم "${duplicates[0]}" مضاف مسبقاً! لا يمكن تكرار نفس الاسم.`);
    }

    setPlayerNames(updated);
    setNewPlayerName('');
  };

  const handleRemovePlayer = (idx) => {
    setNameError('');
    setPlayerNames((prev) => prev.filter((_, i) => i !== idx));
    if (editingIdx === idx) setEditingIdx(null);
  };

  const handleSaveEdit = (idx) => {
    const trimmed = editingValue.trim();
    if (!trimmed) return;
    const duplicate = playerNames.some(
      (n, i) => i !== idx && n.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setNameError(`الاسم "${trimmed}" موجود بالفعل!`);
      return;
    }
    setNameError('');
    setPlayerNames((prev) => prev.map((n, i) => (i === idx ? trimmed : n)));
    setEditingIdx(null);
    setEditingValue('');
  };

  const handleFillSample = () => {
    setNameError('');
    setPlayerNames(['أحمد', 'محمد', 'سارة', 'خالد', 'عمر', 'ريم']);
  };

  const handleClearAll = () => {
    setNameError('');
    setPlayerNames([]);
    setEditingIdx(null);
  };

  // Start game and distribute roles
  const handleStartGame = () => {
    if (playerNames.length < 5) {
      setNameError('يجب إضافة 5 لاعبين على الأقل لبدء اللعبة');
      return;
    }

    const total = playerNames.length;
    const mafiaCount = total >= 8 ? 2 : 1;

    const roles = [];
    for (let i = 0; i < mafiaCount; i++) roles.push('mafia');
    roles.push('detective');
    roles.push('doctor');
    while (roles.length < total) {
      roles.push('citizen');
    }

    const shuffledRoles = shuffleArray(roles);
    const initializedPlayers = playerNames.map((name, i) => ({
      id: `p-${i}-${Date.now()}`,
      name,
      role: shuffledRoles[i],
      isAlive: true,
    }));

    setPlayers(initializedPlayers);
    setCurrentRevealIdx(0);
    setIsCardFlipped(false);
    setVotes({});
    setVoteNotice('');
    setEliminatedPlayer(null);
    setWinnerTeam(null);
    setPhase('reveal');
  };

  const handleNextReveal = () => {
    setIsCardFlipped(false);
    if (currentRevealIdx + 1 < players.length) {
      setCurrentRevealIdx(currentRevealIdx + 1);
    } else {
      startNightPhase();
    }
  };

  const startNightPhase = () => {
    setPhase('night');
    setNightStep('mafia');
    setMafiaTarget(null);
    setDetectiveTarget(null);
    setDetectiveResult(null);
    setDoctorTarget(null);
    setTimerRunning(false);
  };

  const checkWinCondition = (updatedPlayersList) => {
    const alive = updatedPlayersList.filter((p) => p.isAlive);
    const mafiaAlive = alive.filter((p) => p.role === 'mafia').length;
    const citizensAlive = alive.filter((p) => p.role !== 'mafia').length;

    if (mafiaAlive === 0) {
      setWinnerTeam('citizens');
      setTimerRunning(false);
      setPhase('gameover');
      return true;
    }
    if (mafiaAlive >= citizensAlive) {
      setWinnerTeam('mafia');
      setTimerRunning(false);
      setPhase('gameover');
      return true;
    }
    return false;
  };

  // Night resolution -> Day Phase
  const resolveNight = () => {
    let victim = null;
    let saved = false;

    if (mafiaTarget) {
      if (doctorTarget === mafiaTarget) {
        saved = true;
      } else {
        victim = players.find((p) => p.id === mafiaTarget) || null;
      }
    }

    const updatedPlayers = victim
      ? players.map((p) => (p.id === victim.id ? { ...p, isAlive: false } : p))
      : players;

    setPlayers(updatedPlayers);
    setLastNightVictim(victim);
    setDoctorSaved(saved);
    setVotes({});
    setVoteNotice('');
    setEliminatedPlayer(null);

    if (!checkWinCondition(updatedPlayers)) {
      setPhase('day');
      setDayTimer(120);
      setTimerRunning(true);
    }
  };

  const alivePlayers = players.filter((p) => p.isAlive);
  const totalVotesCast = Object.values(votes).reduce((sum, v) => sum + v, 0);

  const handleVoteDelta = (targetId, delta) => {
    setVoteNotice('');
    setVotes((prev) => {
      const current = prev[targetId] || 0;
      if (delta > 0 && totalVotesCast >= alivePlayers.length) {
        setVoteNotice(`اكتمل عدد الأصوات المسموح (${alivePlayers.length} أصوات للأحياء)`);
        return prev;
      }
      const nextVal = Math.max(0, current + delta);
      return { ...prev, [targetId]: nextVal };
    });
  };

  const finalizeVoting = () => {
    if (eliminatedPlayer) return;

    let maxVotes = 0;
    let topCandidates = [];

    Object.entries(votes).forEach(([id, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        topCandidates = [id];
      } else if (count === maxVotes && count > 0) {
        topCandidates.push(id);
      }
    });

    if (maxVotes === 0) {
      setVoteNotice('لم يتم التصويت على أي لاعب بعد، أو اضغط "تخطي الإعدام" للانتقال لليل.');
      return;
    }

    if (topCandidates.length > 1) {
      const names = topCandidates
        .map((id) => players.find((p) => p.id === id)?.name)
        .filter(Boolean)
        .join(' و ');
      setVoteNotice(`تعادل في الأصوات بين (${names})! عدّل الأصوات لحسم الإعدام أو تخطَّ لليل.`);
      return;
    }

    const eliminatedId = topCandidates[0];
    const eliminated = players.find((p) => p.id === eliminatedId);
    const updatedPlayers = players.map((p) =>
      p.id === eliminatedId ? { ...p, isAlive: false } : p
    );

    setTimerRunning(false);
    setEliminatedPlayer(eliminated);
    setPlayers(updatedPlayers);

    const isOver = checkWinCondition(updatedPlayers);
    if (!isOver) {
      transitionTimerRef.current = setTimeout(() => {
        setEliminatedPlayer(null);
        setVotes({});
        setVoteNotice('');
        startNightPhase();
      }, 3000);
    }
  };

  const handleSkipVoting = () => {
    setTimerRunning(false);
    setVotes({});
    setVoteNotice('');
    startNightPhase();
  };

  const isDetectiveAlive = players.some((p) => p.role === 'detective' && p.isAlive);
  const isDoctorAlive = players.some((p) => p.role === 'doctor' && p.isAlive);
  const nonMafiaAlive = alivePlayers.filter((p) => p.role !== 'mafia');

  const currentPlayer = players[currentRevealIdx];
  const mafiaPartners =
    currentPlayer?.role === 'mafia'
      ? players.filter((p) => p.role === 'mafia' && p.id !== currentPlayer.id)
      : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center text-2xl shadow-lg border border-purple-500/30">
            <FaMask />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">لعبة مافيا الجماعية</h1>
            <p className="text-xs text-white/50">أضف أسماء اللاعبين من الصفر، توزيع الأدوار سرياً، ليل ونهار وتصويت عادل</p>
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

      {/* PHASE 1: SETUP */}
      {phase === 'setup' && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-white">إعداد اللاعبين (5 - 12 لاعباً)</h2>
            <p className="text-xs text-white/50">
              ابدأ بإضافة أسماء أصدقائك واحداً تلو الآخر (بدون تكرار)، أو افصل بينهم بفاصلة لإضافتهم دفعة واحدة
            </p>
          </div>

          {/* Add player form */}
          <form onSubmit={handleAddPlayer} className="flex gap-2 max-w-lg mx-auto">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => {
                setNewPlayerName(e.target.value);
                if (nameError) setNameError('');
              }}
              placeholder="اكتب اسم اللاعب هنا ثم اضغط إضافة..."
              className="flex-1 bg-[var(--color-surface)] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={playerNames.length >= 12 || !newPlayerName.trim()}
              className="px-5 py-3 rounded-2xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-40 flex items-center gap-1.5"
            >
              <FaUserPlus />
              <span>إضافة</span>
            </button>
          </form>

          {nameError && (
            <div className="max-w-lg mx-auto p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold text-center">
              ⚠️ {nameError}
            </div>
          )}

          {/* Quick Helpers */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="text-xs text-white/50 font-mono">
              المضافون: <strong className="text-purple-400">{playerNames.length}</strong> / 12
              {playerNames.length < 5 && ` (متبقي ${5 - playerNames.length} على الأقل)`}
            </span>
            {playerNames.length === 0 && (
              <button
                type="button"
                onClick={handleFillSample}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold flex items-center gap-1.5 border border-white/10 transition"
              >
                <FaMagic className="text-purple-400" />
                <span>تعبئة أسماء تجريبية سريعة</span>
              </button>
            )}
            {playerNames.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold flex items-center gap-1.5 border border-red-500/20 transition"
              >
                <FaTrash />
                <span>مسح جميع الأسماء</span>
              </button>
            )}
          </div>

          {/* Player Names Chips */}
          {playerNames.length === 0 ? (
            <div className="text-center py-8 rounded-2xl border border-dashed border-white/10 bg-white/5 text-white/40 text-xs">
              القائمة فارغة الآن — ابدأ بإضافة أسماء اللاعبين من الحقل أعلاه 👆
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
              {playerNames.map((name, i) => (
                <div
                  key={`${name}-${i}`}
                  className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-2 text-sm text-white"
                >
                  {editingIdx === i ? (
                    <div className="flex items-center gap-1.5 flex-1">
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveEdit(i);
                          }
                        }}
                        className="flex-1 bg-slate-900 border border-purple-500 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(i)}
                        className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs"
                      >
                        <FaCheck />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-xs font-mono font-bold flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="font-bold truncate">{name}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingIdx(i);
                            setEditingValue(name);
                          }}
                          className="p-1.5 text-white/40 hover:text-amber-400 text-xs transition"
                          title="تعديل الاسم"
                        >
                          <FaEdit />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePlayer(i)}
                          className="p-1.5 text-white/40 hover:text-red-400 text-xs transition"
                          title="حذف اللاعب"
                        >
                          ×
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="text-center pt-4">
            <button
              onClick={handleStartGame}
              disabled={playerNames.length < 5}
              className="px-10 py-4 rounded-2xl font-black text-sm gradient-accent text-[var(--color-primary)] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <FaPlay className="text-xs" />
              <span>توزيع الأدوار وبدء اللعبة ({playerNames.length} لاعبين)</span>
            </button>
          </div>
        </div>
      )}

      {/* PHASE 2: SECRET REVEAL */}
      {phase === 'reveal' && currentPlayer && (
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-purple-500/30 text-center space-y-6">
          <div className="text-xs font-bold text-purple-400">
            اللاعب {currentRevealIdx + 1} من {players.length}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white">
            مرر الهاتف إلى:{' '}
            <span className="text-[var(--color-accent)]">{currentPlayer.name}</span>
          </h2>

          {!isCardFlipped ? (
            <div className="py-8 space-y-4">
              <p className="text-sm text-white/60">
                تأكد من عدم رؤية الآخرين للشاشة، ثم اضغط على الزر لكشف دورك السري
              </p>
              <button
                onClick={() => setIsCardFlipped(true)}
                className="px-8 py-4 rounded-2xl font-black text-sm bg-purple-600 hover:bg-purple-500 text-white shadow-xl hover:scale-105 transition-all"
              >
                👁️ اضغط لكشف دورك السري
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              className="p-6 rounded-3xl border-2 border-purple-500/50 bg-purple-900/20 max-w-sm mx-auto space-y-4 shadow-2xl"
            >
              <div className="text-5xl">
                {currentPlayer.role === 'mafia' && '🕵️‍♂️'}
                {currentPlayer.role === 'detective' && '🔍'}
                {currentPlayer.role === 'doctor' && '🩺'}
                {currentPlayer.role === 'citizen' && '👤'}
              </div>

              <div>
                <span className="text-xs font-bold text-white/50 block mb-1">دورك السري هو:</span>
                <h3 className="text-2xl font-black text-white">
                  {currentPlayer.role === 'mafia' && 'مافيا (القاتل)'}
                  {currentPlayer.role === 'detective' && 'المحقق (الشرطي)'}
                  {currentPlayer.role === 'doctor' && 'الطبيب (المسعف)'}
                  {currentPlayer.role === 'citizen' && 'مواطن صالح'}
                </h3>
              </div>

              {mafiaPartners.length > 0 && (
                <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-xs text-red-200 font-bold">
                  🤝 شريكك في المافيا: {mafiaPartners.map((p) => p.name).join('، ')}
                </div>
              )}

              <p className="text-xs text-white/70 leading-relaxed">
                {currentPlayer.role === 'mafia' && 'في الليل تختار ضحية للقضاء عليها دون كشف هويتك.'}
                {currentPlayer.role === 'detective' && 'في الليل تختار لاعباً واحداً لتفحص هل هو مافيا أم بريء.'}
                {currentPlayer.role === 'doctor' && 'في الليل تختار لاعباً لحمايته من القتل.'}
                {currentPlayer.role === 'citizen' && 'في النهار تناقش وتصوت لكشف المافيا والتخلص منهم.'}
              </p>

              <button
                onClick={handleNextReveal}
                className="w-full py-3 rounded-2xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
              >
                أخفِ دورك ومرر الهاتف للاعب التالي ✓
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* PHASE 3: NIGHT PHASE */}
      {phase === 'night' && (
        <div
          className="glass-card rounded-3xl p-6 sm:p-10 border border-blue-500/30 text-center space-y-6"
          style={{ background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.95), rgba(30, 27, 75, 0.95))' }}
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-500/20 text-blue-400 mx-auto flex items-center justify-center text-3xl">
            <FaMoon />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white mb-1">الليل بدأ في المدينة...</h2>
            <p className="text-xs text-blue-300">الجميع يغمض عينيه الآن بهدوء تام 🤫</p>
          </div>

          {nightStep === 'mafia' && (
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="text-sm font-bold text-red-400">🕵️‍♂️ استيقاظ المافيا: اختر الضحية لتصفيتها:</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {nonMafiaAlive.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setMafiaTarget(p.id)}
                    className={`p-3 rounded-2xl border text-sm font-bold transition-all ${
                      mafiaTarget === p.id
                        ? 'bg-red-500/30 border-red-500 text-red-300'
                        : 'bg-white/5 border-white/10 text-white hover:border-red-400'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              <button
                disabled={!mafiaTarget}
                onClick={() => setNightStep('detective')}
                className="px-8 py-3 rounded-2xl font-bold text-xs bg-red-600 text-white disabled:opacity-40"
              >
                تأكيد هدف المافيا ثم نوم المافيا
              </button>
            </div>
          )}

          {nightStep === 'detective' && (
            <div className="space-y-4 pt-4 border-t border-white/10">
              {isDetectiveAlive ? (
                <>
                  <div className="text-sm font-bold text-cyan-400">
                    🔍 استيقاظ المحقق: اختر شخصاً واحداً لفحصه سرياً:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {alivePlayers
                      .filter((p) => p.role !== 'detective')
                      .map((p) => (
                        <button
                          key={p.id}
                          disabled={!!detectiveTarget}
                          onClick={() => {
                            setDetectiveTarget(p.id);
                            setDetectiveResult(p.role === 'mafia' ? `${p.name}: مافيا ⚠️` : `${p.name}: بريء مسالم 🕊️`);
                          }}
                          className={`p-3 rounded-2xl border text-sm font-bold transition-all ${
                            detectiveTarget === p.id
                              ? 'bg-cyan-500/30 border-cyan-500 text-cyan-300'
                              : detectiveTarget
                              ? 'bg-white/5 border-white/5 text-white/30 cursor-not-allowed'
                              : 'bg-white/5 border-white/10 text-white hover:border-cyan-400'
                          }`}
                        >
                          {p.name}
                        </button>
                      ))}
                  </div>

                  {detectiveResult && (
                    <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-300 text-xs font-bold">
                      نتيجة الفحص السرية: {detectiveResult}
                    </div>
                  )}

                  <button
                    disabled={!detectiveTarget}
                    onClick={() => setNightStep('doctor')}
                    className="px-8 py-3 rounded-2xl font-black text-xs bg-cyan-600 text-black disabled:opacity-40"
                  >
                    نوم المحقق واستيقاظ الطبيب
                  </button>
                </>
              ) : (
                <div className="space-y-4 py-4">
                  <div className="text-sm font-bold text-cyan-400/70">🔍 دور المحقق (محجوب — مغادرة صامتة)</div>
                  <p className="text-xs text-white/50">انتظر لحظة ثم انتقل للطبيب دون كشف هوية المصاب</p>
                  <button
                    onClick={() => setNightStep('doctor')}
                    className="px-8 py-3 rounded-2xl font-black text-xs bg-cyan-600 text-black"
                  >
                    الانتقال إلى دور الطبيب
                  </button>
                </div>
              )}
            </div>
          )}

          {nightStep === 'doctor' && (
            <div className="space-y-4 pt-4 border-t border-white/10">
              {isDoctorAlive ? (
                <>
                  <div className="text-sm font-bold text-emerald-400">🩺 استيقاظ الطبيب: اختر شخصاً لحمايته:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {alivePlayers.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setDoctorTarget(p.id)}
                        className={`p-3 rounded-2xl border text-sm font-bold transition-all ${
                          doctorTarget === p.id
                            ? 'bg-emerald-500/30 border-emerald-500 text-emerald-300'
                            : 'bg-white/5 border-white/10 text-white hover:border-emerald-400'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={!doctorTarget}
                    onClick={resolveNight}
                    className="px-8 py-3 rounded-2xl font-black text-xs bg-emerald-500 text-black disabled:opacity-40"
                  >
                    شروق الشمس وبدء النهار ☀️
                  </button>
                </>
              ) : (
                <div className="space-y-4 py-4">
                  <div className="text-sm font-bold text-emerald-400/70">🩺 دور الطبيب (محجوب — مغادرة صامتة)</div>
                  <button
                    onClick={resolveNight}
                    className="px-8 py-3 rounded-2xl font-black text-xs bg-emerald-500 text-black"
                  >
                    شروق الشمس وبدء النهار ☀️
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* PHASE 4: DAY & VOTING */}
      {phase === 'day' && (
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-yellow-500/30 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-2xl">
                <FaSun />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">أشرقت شمس النهار!</h2>
                <div className="text-xs text-white/50">وقت النقاش والتصويت لكشف المافيا</div>
              </div>
            </div>

            <div className="text-left font-mono">
              <div className="text-2xl font-black text-[var(--color-accent)]">{dayTimer}s</div>
              <div className="text-[10px] text-white/50">وقت النقاش</div>
            </div>
          </div>

          {/* Morning Report */}
          <div
            className={`p-4 rounded-2xl text-center text-sm font-bold ${
              lastNightVictim
                ? 'bg-red-500/20 border border-red-500/40 text-red-300'
                : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
            }`}
          >
            {lastNightVictim ? (
              <span>💀 لقد استيقظت المدينة على خبر مقتل: {lastNightVictim.name}!</span>
            ) : doctorSaved ? (
              <span>🛡️ معجزة! نجح الطبيب في إنقاذ الضحية ولم يُقتل أي شخص الليلة!</span>
            ) : (
              <span>☀️ صباح آمن! لم يُقتل أي شخص الليلة!</span>
            )}
          </div>

          {eliminatedPlayer ? (
            <div className="p-6 rounded-2xl bg-red-500/20 border-2 border-red-500 text-center space-y-2">
              <div className="text-3xl">⚖️</div>
              <div className="text-lg font-black text-white">
                تم إعدام {eliminatedPlayer.name} بقرار المدينة!
              </div>
              <div className="text-xs text-white/70">جاري الانتقال إلى الليل التالي...</div>
            </div>
          ) : (
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-bold text-white">
                  صوّت لإعدام المشتبه به ({totalVotesCast}/{alivePlayers.length} صوت):
                </h3>
                <button
                  onClick={() => {
                    setVotes({});
                    setVoteNotice('');
                  }}
                  className="text-xs text-white/50 hover:text-white px-2.5 py-1 rounded-lg bg-white/5"
                >
                  تصفير الأصوات
                </button>
              </div>

              {voteNotice && (
                <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold text-center">
                  ⚠️ {voteNotice}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {alivePlayers.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-2 text-sm text-white"
                  >
                    <span className="font-bold truncate">{p.name}</span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleVoteDelta(p.id, -1)}
                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="min-w-[54px] text-center text-xs px-2 py-1 rounded-lg bg-red-500/20 text-red-300 font-mono font-bold">
                        {votes[p.id] || 0} صوت
                      </span>
                      <button
                        type="button"
                        onClick={() => handleVoteDelta(p.id, 1)}
                        className="w-7 h-7 rounded-lg bg-red-600/80 hover:bg-red-500 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={finalizeVoting}
                  className="py-4 rounded-2xl font-black text-sm bg-red-600 hover:bg-red-500 text-white shadow-xl transition-all"
                >
                  إنهاء التصويت وإعدام المتهم ⚖️
                </button>
                <button
                  onClick={handleSkipVoting}
                  className="py-4 rounded-2xl font-bold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all"
                >
                  تخطي الإعدام والانتقال لليل 🌙
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PHASE 5: GAME OVER */}
      {phase === 'gameover' && (
        <div className="glass-card rounded-3xl p-8 sm:p-12 border-2 border-[var(--color-accent)] text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 rounded-3xl gradient-accent golden-glow mx-auto flex items-center justify-center text-4xl text-[var(--color-primary)]">
            <FaCrown />
          </div>

          <div>
            <h2 className="text-3xl font-black text-white mb-2">انتهت اللعبة!</h2>
            <div className="text-xl font-bold text-[var(--color-accent)]">
              {winnerTeam === 'citizens'
                ? '🎉 انتصر المواطنون الصالحون وتم القضاء على جميع أفراد المافيا!'
                : '🕵️‍♂️ انتصرت المافيا وسيطرت على المدينة بالكامل!'}
            </div>
          </div>

          {/* Reveal All Roles */}
          <div className="space-y-2 text-right max-w-md mx-auto pt-4 border-t border-white/10">
            <div className="text-xs font-bold text-white/60 mb-2">كشف هويات جميع اللاعبين:</div>
            {players.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
              >
                <span className="font-bold text-white">
                  {p.name} {!p.isAlive && <span className="text-red-400 text-[10px]">(خارج اللعبة)</span>}
                </span>
                <span
                  className={
                    p.role === 'mafia'
                      ? 'text-red-400 font-bold'
                      : p.role === 'detective'
                      ? 'text-cyan-400 font-bold'
                      : p.role === 'doctor'
                      ? 'text-emerald-400 font-bold'
                      : 'text-white/60'
                  }
                >
                  {p.role === 'mafia' && 'مافيا'}
                  {p.role === 'detective' && 'محقق'}
                  {p.role === 'doctor' && 'طبيب'}
                  {p.role === 'citizen' && 'مواطن'}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setPhase('setup');
              setPlayers([]);
            }}
            className="px-8 py-3.5 rounded-2xl font-bold text-xs gradient-accent text-[var(--color-primary)] hover:scale-105 transition-all"
          >
            العب جولة جديدة من مافيا
          </button>
        </div>
      )}
    </div>
  );
}
