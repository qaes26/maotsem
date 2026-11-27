import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaGavel,
  FaHome,
  FaClock,
  FaCheck,
  FaTimes,
  FaVolumeUp,
  FaVolumeMute,
  FaArrowLeft,
} from 'react-icons/fa';
import sound from '../utils/soundEffects';
import gameApi from '../services/gameApi';
import { FALLBACK_CATEGORY_IMAGE } from './GameSetupPage';

export default function AuctionPage() {
  const navigate = useNavigate();

  const [challenges, setChallenges] = useState([]);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [gameState, setGameState] = useState('bidding'); // 'bidding' | 'challenge' | 'result'
  const [isMuted, setIsMuted] = useState(false);

  // Teams
  const [teamNames, setTeamNames] = useState({
    teamA: 'فريق الأسود',
    teamB: 'فريق النسور',
  });
  const [scores, setScores] = useState({ teamA: 0, teamB: 0 });

  // Bidding state
  const [currentBid, setCurrentBid] = useState(3);
  const [highestBidder, setHighestBidder] = useState(null); // null until first bid

  // Challenge timer state
  const [timeLeft, setTimeLeft] = useState(45);
  const [timerActive, setTimerActive] = useState(false);
  const [checkedAnswers, setCheckedAnswers] = useState(new Set());
  const [challengeResult, setChallengeResult] = useState(null); // 'won' | 'lost'

  // Fetch auction challenges
  useEffect(() => {
    gameApi.getAuctions().then((auctions) => {
      if (auctions && auctions.length > 0) {
        setChallenges(auctions);
        setCurrentBid(auctions[0].startingBid || 3);
      }
    });
  }, []);

  const activeChallenge = challenges[currentChallengeIndex];

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (gameState === 'challenge' && timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 5 && t > 1) {
            sound.playTick(true);
          } else if (t % 5 === 0) {
            sound.playTick(false);
          }
          return Math.max(0, t - 1);
        });
      }, 1000);
    } else if (gameState === 'challenge' && timerActive && timeLeft === 0) {
      setTimerActive(false);
      handleTimeExpired();
    }
    return () => clearInterval(interval);
  }, [gameState, timerActive, timeLeft]);

  // Raise bid
  const handleRaiseBid = (team) => {
    sound.playGavel();
    const startBid = activeChallenge?.startingBid || 3;
    const nextBid = highestBidder === null ? startBid : currentBid + 1;
    setCurrentBid(nextBid);
    setHighestBidder(team);
  };

  // Pass bid (opponent concedes to highestBidder)
  const handlePassBid = (passingTeam) => {
    if (!highestBidder || highestBidder === passingTeam) return;
    sound.playWhistle();
    setGameState('challenge');
    setTimeLeft(activeChallenge?.timeSeconds || 45);
    setTimerActive(true);
    setCheckedAnswers(new Set());
  };

  // Toggle answer in checklist
  const handleToggleAnswer = (item) => {
    if (gameState !== 'challenge') return;
    const next = new Set(checkedAnswers);
    if (next.has(item)) {
      next.delete(item);
    } else {
      next.add(item);
      sound.playCorrect();
    }
    setCheckedAnswers(next);

    if (next.size >= currentBid) {
      setTimerActive(false);
      handleChallengeWon();
    }
  };

  const handleChallengeWon = () => {
    if (gameState !== 'challenge' || !highestBidder) return;
    sound.playFanfare();
    setTimerActive(false);
    setChallengeResult('won');
    setGameState('result');
    const reward = activeChallenge?.pointsReward || 500;
    setScores((prev) => ({
      ...prev,
      [highestBidder]: prev[highestBidder] + reward,
    }));
  };

  const handleTimeExpired = () => {
    if (gameState !== 'challenge' || !highestBidder) return;
    sound.playWrong();
    setTimerActive(false);
    setChallengeResult('lost');
    setGameState('result');
    const penalty = Math.round((activeChallenge?.pointsReward || 500) / 2);
    const opponent = highestBidder === 'teamA' ? 'teamB' : 'teamA';
    setScores((prev) => ({
      ...prev,
      [highestBidder]: Math.max(0, prev[highestBidder] - penalty),
      [opponent]: prev[opponent] + penalty,
    }));
  };

  const handleNextChallenge = () => {
    const nextIdx = (currentChallengeIndex + 1) % (challenges.length || 1);
    setCurrentChallengeIndex(nextIdx);
    setCurrentBid(challenges[nextIdx]?.startingBid || 3);
    setGameState('bidding');
    setHighestBidder(null);
    setCheckedAnswers(new Set());
    setChallengeResult(null);
  };

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  if (!activeChallenge) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl shadow-lg border border-amber-500/30">
            <FaGavel />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">المزاد الكبير 🔥</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                جولة المزايدة والتحدي
              </span>
            </div>
            <p className="text-xs text-white/50">زايد على عدد الإجابات — رياضة، ثقافة، دين، جغرافيا، وأكثر!</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm transition-all border border-white/10"
            title="كتم / تفعيل المؤثرات الصوتية"
          >
            {isMuted ? <FaVolumeMute className="text-red-400" /> : <FaVolumeUp className="text-emerald-400" />}
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

      {/* Scoreboard */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className={`p-4 rounded-3xl glass-card border-2 transition-all ${
            highestBidder === 'teamA' && gameState === 'challenge'
              ? 'border-amber-400 bg-amber-500/10'
              : 'border-white/10 bg-white/5'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <input
                type="text"
                value={teamNames.teamA}
                onChange={(e) => setTeamNames((p) => ({ ...p, teamA: e.target.value }))}
                className="bg-transparent text-sm font-bold text-amber-400 focus:outline-none focus:border-b border-amber-400/50 w-full"
              />
              <div className="text-[10px] text-white/50">الفريق الأول</div>
            </div>
            <div className="text-3xl font-black font-mono text-amber-400">{scores.teamA}</div>
          </div>
        </div>

        <div
          className={`p-4 rounded-3xl glass-card border-2 transition-all ${
            highestBidder === 'teamB' && gameState === 'challenge'
              ? 'border-cyan-400 bg-cyan-500/10'
              : 'border-white/10 bg-white/5'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <input
                type="text"
                value={teamNames.teamB}
                onChange={(e) => setTeamNames((p) => ({ ...p, teamB: e.target.value }))}
                className="bg-transparent text-sm font-bold text-cyan-400 focus:outline-none focus:border-b border-cyan-400/50 w-full"
              />
              <div className="text-[10px] text-white/50">الفريق الثاني</div>
            </div>
            <div className="text-3xl font-black font-mono text-cyan-400">{scores.teamB}</div>
          </div>
        </div>
      </div>

      {/* Main Auction Container */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
        {/* Challenge Visual Image + Title Banner */}
        <div className="space-y-4 border-b border-white/10 pb-6">
          <div className="relative h-44 sm:h-52 rounded-2xl overflow-hidden border border-amber-500/30 shadow-xl">
            <img
              src={activeChallenge.image || FALLBACK_CATEGORY_IMAGE}
              alt={activeChallenge.title}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_CATEGORY_IMAGE;
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
            <div className="absolute bottom-4 right-4 left-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2 text-right">
              <div>
                <span className="inline-block text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500 text-black mb-2">
                  تحدي المزاد رقم {currentChallengeIndex + 1} من {challenges.length}
                </span>
                <h2 className="text-xl sm:text-3xl font-black text-white drop-shadow">{activeChallenge.title}</h2>
              </div>
              <span className="px-3 py-1 rounded-xl bg-black/65 border border-amber-400/40 text-amber-300 text-xs font-black self-start sm:self-auto">
                الجائزة: +{activeChallenge.pointsReward || 500} نقطة
              </span>
            </div>
          </div>

          <div className="text-center space-y-1.5">
            <p className="text-sm text-white/80 max-w-2xl mx-auto">{activeChallenge.description}</p>
            <div className="text-xs text-amber-400/90 font-semibold">{activeChallenge.hint}</div>
          </div>
        </div>

        {/* PHASE 1: BIDDING */}
        {gameState === 'bidding' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="text-xs text-white/60">
                {highestBidder ? 'أعلى مزاد حالي:' : 'يبدأ المزاد من:'}
              </div>
              <div className="text-6xl font-black font-mono text-amber-400 animate-pulse-glow inline-block p-4 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40">
                {currentBid}
              </div>
              <div className="text-sm font-bold text-white">
                {highestBidder ? (
                  <>
                    باسم:{' '}
                    <span className={highestBidder === 'teamA' ? 'text-amber-400' : 'text-cyan-400'}>
                      {teamNames[highestBidder]}
                    </span>
                  </>
                ) : (
                  <span className="text-white/50">اضغط على "أزايد" لافتتاح المزاد</span>
                )}
              </div>
            </div>

            {/* Bidding Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-3">
                <h3 className="font-bold text-amber-400">{teamNames.teamA}</h3>
                <div className="flex gap-2 justify-center">
                  <button
                    disabled={highestBidder === 'teamA'}
                    onClick={() => handleRaiseBid('teamA')}
                    className="flex-1 py-3 px-4 rounded-xl font-black text-sm bg-amber-500 hover:bg-amber-400 text-black shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {highestBidder === null ? `أبدأ المزاد (${currentBid}) 🔨` : `أزايد بـ (${currentBid + 1}) 🔨`}
                  </button>
                  <button
                    disabled={!highestBidder || highestBidder === 'teamA'}
                    onClick={() => handlePassBid('teamA')}
                    className="py-3 px-4 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    انسحاب (تثبيت للخصم)
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-center space-y-3">
                <h3 className="font-bold text-cyan-400">{teamNames.teamB}</h3>
                <div className="flex gap-2 justify-center">
                  <button
                    disabled={highestBidder === 'teamB'}
                    onClick={() => handleRaiseBid('teamB')}
                    className="flex-1 py-3 px-4 rounded-xl font-black text-sm bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {highestBidder === null ? `أبدأ المزاد (${currentBid}) 🔨` : `أزايد بـ (${currentBid + 1}) 🔨`}
                  </button>
                  <button
                    disabled={!highestBidder || highestBidder === 'teamB'}
                    onClick={() => handlePassBid('teamB')}
                    className="py-3 px-4 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    انسحاب (تثبيت للخصم)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PHASE 2: LIVE CHALLENGE CHECKLIST */}
        {gameState === 'challenge' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div>
                <span className="text-xs text-white/50 block">الفريق المنفذ للتحدي:</span>
                <span className="text-lg font-black text-amber-400">{teamNames[highestBidder]}</span>
              </div>

              {/* Progress counter */}
              <div className="text-center font-mono">
                <div className="text-3xl font-black text-white">
                  <span className="text-emerald-400">{checkedAnswers.size}</span> / {currentBid}
                </div>
                <div className="text-xs text-white/50">إجابات محققة حتى الآن</div>
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center gap-2 font-mono">
                <FaClock className="text-amber-400 text-xl" />
                <span className={`text-4xl font-black ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            {/* Checklist of Valid Answers */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-white/60 mb-1">
                قائمة الإجابات المعتمدة (اضغط على الإجابة عند ذكرها من الفريق):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[360px] overflow-y-auto pr-1">
                {(activeChallenge.validAnswers || []).map((item, idx) => {
                  const isChecked = checkedAnswers.has(item);
                  return (
                    <button
                      key={idx}
                      onClick={() => handleToggleAnswer(item)}
                      className={`p-3 rounded-xl border text-right text-xs font-bold transition-all flex items-center justify-between ${
                        isChecked
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80'
                      }`}
                    >
                      <span>{item}</span>
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                          isChecked ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white/40'
                        }`}
                      >
                        {isChecked ? '✓' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Manual End Buttons */}
            <div className="flex items-center justify-between gap-3 flex-wrap pt-4 border-t border-white/10">
              <button
                onClick={handleChallengeWon}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all flex items-center gap-2 shadow-lg"
              >
                <FaCheck />
                <span>حقق الهدف بنجاح (+{activeChallenge.pointsReward} نقطة)</span>
              </button>

              <button
                onClick={handleTimeExpired}
                className="px-6 py-3 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-bold text-xs transition-all flex items-center gap-2"
              >
                <FaTimes />
                <span>فشل أو انتهى الوقت دون إكمال المزاد</span>
              </button>
            </div>
          </div>
        )}

        {/* PHASE 3: RESULT */}
        {gameState === 'result' && (
          <div className="p-8 text-center space-y-6">
            <div className="text-6xl">{challengeResult === 'won' ? '🎉' : '💥'}</div>

            <div>
              <h3 className="text-3xl font-black text-white mb-2">
                {challengeResult === 'won' ? 'نجح التحدي ببراعة!' : 'فشل التحدي وضاع الرهان!'}
              </h3>
              <p className="text-sm text-white/70 max-w-md mx-auto">
                {challengeResult === 'won'
                  ? `أوفى ${teamNames[highestBidder]} بعهده وسمى ${currentBid} إجابات وحصل على +${activeChallenge.pointsReward} نقطة!`
                  : `لم يستطع ${teamNames[highestBidder]} إكمال الـ ${currentBid} إجابات، فتم خصم النقاط ومنحها للخصم!`}
              </p>
            </div>

            <button
              onClick={handleNextChallenge}
              className="px-8 py-4 rounded-2xl font-black text-sm bg-amber-500 hover:bg-amber-400 text-black shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto"
            >
              <span>التحدي والمزاد التالي</span>
              <FaArrowLeft className="text-xs" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
