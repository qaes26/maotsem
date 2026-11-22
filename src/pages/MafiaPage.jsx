import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaMask,
  FaHome,
  FaMoon,
  FaSun,
  FaUserSecret,
  FaSearch,
  FaHeartbeat,
  FaUserFriends,
  FaPlay,
  FaRedo,
  FaCrown,
  FaSkull,
  FaShieldAlt,
  FaVoteYea,
} from 'react-icons/fa';

export default function MafiaPage() {
  const navigate = useNavigate();

  // Setup state
  const [phase, setPhase] = useState('setup'); // 'setup' | 'reveal' | 'night' | 'day' | 'voting' | 'gameover'
  const [playerNames, setPlayerNames] = useState(['أحمد', 'محمد', 'سارة', 'خالد', 'عمر', 'ريم']);
  const [newPlayerName, setNewPlayerName] = useState('');

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
  const [votes, setVotes] = useState({}); // playerId -> votes count
  const [eliminatedPlayer, setEliminatedPlayer] = useState(null);
  const [winnerTeam, setWinnerTeam] = useState(null); // 'citizens' | 'mafia'

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (timerRunning && dayTimer > 0) {
      interval = setInterval(() => setDayTimer((t) => t - 1), 1000);
    } else if (dayTimer === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, dayTimer]);

  const handleAddPlayer = (e) => {
    e?.preventDefault();
    if (newPlayerName.trim() && playerNames.length < 12) {
      setPlayerNames([...playerNames, newPlayerName.trim()]);
      setNewPlayerName('');
    }
  };

  const handleRemovePlayer = (idx) => {
    if (playerNames.length > 5) {
      setPlayerNames(playerNames.filter((_, i) => i !== idx));
    }
  };

  // Start game and distribute roles
  const handleStartGame = () => {
    const total = playerNames.length;
    let mafiaCount = total >= 8 ? 2 : 1;

    // Roles pool
    const roles = [];
    for (let i = 0; i < mafiaCount; i++) roles.push('mafia');
    roles.push('detective');
    roles.push('doctor');
    while (roles.length < total) {
      roles.push('citizen');
    }

    // Shuffle roles
    const shuffledRoles = [...roles].sort(() => 0.5 - Math.random());

    const initializedPlayers = playerNames.map((name, i) => ({
      id: `p-${i}`,
      name,
      role: shuffledRoles[i],
      isAlive: true,
    }));

    setPlayers(initializedPlayers);
    setCurrentRevealIdx(0);
    setIsCardFlipped(false);
    setPhase('reveal');
  };

  // Next player reveal
  const handleNextReveal = () => {
    setIsCardFlipped(false);
    if (currentRevealIdx + 1 < players.length) {
      setCurrentRevealIdx(currentRevealIdx + 1);
    } else {
      // All players know their role, start first night!
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
  };

  // Night resolution -> Day Phase
  const resolveNight = () => {
    let victim = null;
    let saved = false;

    if (mafiaTarget) {
      if (doctorTarget === mafiaTarget) {
        saved = true;
      } else {
        victim = players.find((p) => p.id === mafiaTarget);
      }
    }

    if (victim) {
      setPlayers((prev) =>
        prev.map((p) => (p.id === victim.id ? { ...p, isAlive: false } : p))
      );
    }

    setLastNightVictim(victim);
    setDoctorSaved(saved);
    setPhase('day');
    setDayTimer(120);
    setTimerRunning(true);
    checkWinCondition(victim ? victim.id : null);
  };

  // Check Win condition
  const checkWinCondition = (newDeadId) => {
    const updated = players.map((p) => (p.id === newDeadId ? { ...p, isAlive: false } : p));
    const alive = updated.filter((p) => p.isAlive);
    const mafiaAlive = alive.filter((p) => p.role === 'mafia').length;
    const citizensAlive = alive.filter((p) => p.role !== 'mafia').length;

    if (mafiaAlive === 0) {
      setWinnerTeam('citizens');
      setPhase('gameover');
      return true;
    }
    if (mafiaAlive >= citizensAlive) {
      setWinnerTeam('mafia');
      setPhase('gameover');
      return true;
    }
    return false;
  };

  // Voting execution
  const handleVote = (targetId) => {
    setVotes((prev) => ({
      ...prev,
      [targetId]: (prev[targetId] || 0) + 1,
    }));
  };

  const finalizeVoting = () => {
    let maxVotes = 0;
    let eliminatedId = null;

    Object.entries(votes).forEach(([id, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        eliminatedId = id;
      }
    });

    if (eliminatedId) {
      const eliminated = players.find((p) => p.id === eliminatedId);
      setEliminatedPlayer(eliminated);
      setPlayers((prev) =>
        prev.map((p) => (p.id === eliminatedId ? { ...p, isAlive: false } : p))
      );

      const isOver = checkWinCondition(eliminatedId);
      if (!isOver) {
        setTimeout(() => {
          setEliminatedPlayer(null);
          setVotes({});
          startNightPhase();
        }, 4000);
      }
    } else {
      // No votes
      startNightPhase();
    }
  };

  const alivePlayers = players.filter((p) => p.isAlive);

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
            <p className="text-xs text-white/50">توزيع الأدوار سرياً، جولات ليل ونهار وتصويت تفاعلي</p>
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
            <p className="text-xs text-white/50">أدخل أسماء الحاضرين في الجلسة، وسيتم توزيع الأدوار تلقائياً وسرياً</p>
          </div>

          {/* Add player form */}
          <form onSubmit={handleAddPlayer} className="flex gap-2 max-w-md mx-auto">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="اسم اللاعب الجديد..."
              className="flex-1 bg-[var(--color-surface)] border border-white/10 rounded-2xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={playerNames.length >= 12 || !newPlayerName.trim()}
              className="px-6 py-2.5 rounded-2xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-40"
            >
              إضافة
            </button>
          </form>

          {/* Player Names Chips */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {playerNames.map((name, i) => (
              <div
                key={i}
                className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2 text-sm text-white"
              >
                <span>{name}</span>
                {playerNames.length > 5 && (
                  <button
                    onClick={() => handleRemovePlayer(i)}
                    className="text-white/40 hover:text-red-400 text-xs ml-1"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <button
              onClick={handleStartGame}
              className="px-10 py-4 rounded-2xl font-black text-sm gradient-accent text-[var(--color-primary)] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto"
            >
              <FaPlay className="text-xs" />
              <span>توزيع الأدوار وبدء اللعبة ({playerNames.length} لاعبين)</span>
            </button>
          </div>
        </div>
      )}

      {/* PHASE 2: SECRET REVEAL */}
      {phase === 'reveal' && (
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-purple-500/30 text-center space-y-6">
          <div className="text-xs font-bold text-purple-400">
            اللاعب {currentRevealIdx + 1} من {players.length}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white">
            مرر الهاتف إلى:{' '}
            <span className="text-[var(--color-accent)]">{players[currentRevealIdx].name}</span>
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
                {players[currentRevealIdx].role === 'mafia' && '🕵️‍♂️'}
                {players[currentRevealIdx].role === 'detective' && '🔍'}
                {players[currentRevealIdx].role === 'doctor' && '🩺'}
                {players[currentRevealIdx].role === 'citizen' && '👤'}
              </div>

              <div>
                <span className="text-xs font-bold text-white/50 block mb-1">دورك السري هو:</span>
                <h3 className="text-2xl font-black text-white">
                  {players[currentRevealIdx].role === 'mafia' && 'مافيا (القاتل)'}
                  {players[currentRevealIdx].role === 'detective' && 'المحقق (الشرطي)'}
                  {players[currentRevealIdx].role === 'doctor' && 'الطبيب (المسعف)'}
                  {players[currentRevealIdx].role === 'citizen' && 'مواطن صالح'}
                </h3>
              </div>

              <p className="text-xs text-white/70 leading-relaxed">
                {players[currentRevealIdx].role === 'mafia' && 'في الليل تختار ضحية للقضاء عليها دون كشف هويتك.'}
                {players[currentRevealIdx].role === 'detective' && 'في الليل تختار لاعباً لتفحص هل هو مافيا أم بريء.'}
                {players[currentRevealIdx].role === 'doctor' && 'في الليل تختار لاعباً لحمايته من القتل.'}
                {players[currentRevealIdx].role === 'citizen' && 'في النهار تناقش وتصوت لكشف المافيا والتخلص منهم.'}
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
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-blue-500/30 text-center space-y-6"
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
                {alivePlayers.map((p) => (
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
              <div className="text-sm font-bold text-cyan-400">🔍 استيقاظ المحقق: اختر شخصاً لفحصه سرياً:</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {alivePlayers.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setDetectiveTarget(p.id);
                      setDetectiveResult(p.role === 'mafia' ? 'مافيا ⚠️' : 'بريء مسالم 🕊️');
                    }}
                    className={`p-3 rounded-2xl border text-sm font-bold transition-all ${
                      detectiveTarget === p.id
                        ? 'bg-cyan-500/30 border-cyan-500 text-cyan-300'
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
                className="px-8 py-3 rounded-2xl font-bold text-xs bg-cyan-600 text-black font-black disabled:opacity-40"
              >
                نوم المحقق واستيقاظ الطبيب
              </button>
            </div>
          )}

          {nightStep === 'doctor' && (
            <div className="space-y-4 pt-4 border-t border-white/10">
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
                className="px-8 py-3 rounded-2xl font-bold text-xs bg-emerald-500 text-black font-black disabled:opacity-40"
              >
                شروق الشمس وبدء النهار ☀️
              </button>
            </div>
          )}
        </div>
      )}

      {/* PHASE 4: DAY & VOTING */}
      {(phase === 'day' || phase === 'voting') && (
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
            ) : (
              <span>🛡️ معجزة! نجح الطبيب في إنقاذ الضحية ولم يُقتل أي شخص الليلة!</span>
            )}
          </div>

          {/* Voting Box */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">صوّت لإعدام المشتبه به:</h3>
              <span className="text-xs text-white/50">اللاعبون الأحياء: {alivePlayers.length}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {alivePlayers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleVote(p.id)}
                  className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-center flex items-center justify-between font-bold text-sm text-white"
                >
                  <span>{p.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-mono">
                    {votes[p.id] || 0} صوت
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={finalizeVoting}
              className="w-full py-4 rounded-2xl font-black text-sm bg-red-600 hover:bg-red-500 text-white shadow-xl transition-all"
            >
              إنهاء التصويت وإعدام المتهم ⚖️
            </button>
          </div>
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
                <span className="font-bold text-white">{p.name}</span>
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

