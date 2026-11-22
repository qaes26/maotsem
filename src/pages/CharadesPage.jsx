import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTheaterMasks,
  FaHome,
  FaClock,
  FaCheck,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaVolumeUp,
  FaVolumeMute,
  FaArrowLeft,
  FaRedo,
} from 'react-icons/fa';
import sound from '../utils/soundEffects';
import gameApi from '../services/gameApi';

export default function CharadesPage() {
  const navigate = useNavigate();

  const [cards, setCards] = useState([]);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isSecretRevealed, setIsSecretRevealed] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  // Teams & Scores
  const [currentTeam, setCurrentTeam] = useState('teamA');
  const [scores, setScores] = useState({ teamA: 0, teamB: 0 });
  const [teamNames] = useState({ teamA: 'الفريق الأول', teamB: 'الفريق الثاني' });
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [roundResult, setRoundResult] = useState(null); // 'guessed' | 'expired' | 'violation'

  // Fetch cards
  useEffect(() => {
    gameApi.getCharades().then((data) => {
      if (data && data.length > 0) {
        setCards(data);
      }
    });
  }, []);

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 5 && t > 1) {
            sound.playTick(true);
          } else if (t % 10 === 0) {
            sound.playTick(false);
          }
          return t - 1;
        });
      }, 1000);
    } else if (timerActive && timeLeft === 0) {
      setTimerActive(false);
      handleExpire();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const activeCard = cards[currentCardIdx];

  const handleStartActing = () => {
    sound.playWhistle();
    setTimerActive(true);
    setTimeLeft(60);
    setRoundCompleted(false);
    setRoundResult(null);
  };

  const handleCorrectGuess = () => {
    sound.playCorrect();
    setTimerActive(false);
    setRoundCompleted(true);
    setRoundResult('guessed');
    setScores((prev) => ({
      ...prev,
      [currentTeam]: prev[currentTeam] + 200,
    }));
  };

  const handleViolation = () => {
    sound.playWrong();
    setTimerActive(false);
    setRoundCompleted(true);
    setRoundResult('violation');
  };

  const handleExpire = () => {
    sound.playWrong();
    setRoundCompleted(true);
    setRoundResult('expired');
  };

  const handleNextCard = () => {
    setIsSecretRevealed(false);
    setTimerActive(false);
    setTimeLeft(60);
    setRoundCompleted(false);
    setRoundResult(null);
    setCurrentTeam((prev) => (prev === 'teamA' ? 'teamB' : 'teamA'));
    setCurrentCardIdx((prev) => (prev + 1) % (cards.length || 1));
  };

  if (!activeCard) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center text-2xl shadow-lg border border-pink-500/30">
            <FaTheaterMasks />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">تمثيل شخصيات ولاعبين (Charades)</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                طور الأمسيات والضحك
              </span>
            </div>
            <p className="text-xs text-white/50">مثل الشخصية أو اللاعب بدون أي كلام، وعلى فريقك تخمينه قبل انتهاء الوقت!</p>
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

      {/* Scoreboard */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className={`p-4 rounded-3xl glass-card border-2 transition-all ${
            currentTeam === 'teamA' ? 'border-pink-500 bg-pink-500/10' : 'border-white/10 bg-white/5'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-pink-400 font-bold">{teamNames.teamA}</div>
              {currentTeam === 'teamA' && (
                <span className="text-[10px] text-white/70 font-bold">فريقكم يمثل الآن!</span>
              )}
            </div>
            <div className="text-2xl font-black font-mono text-pink-300">{scores.teamA}</div>
          </div>
        </div>

        <div
          className={`p-4 rounded-3xl glass-card border-2 transition-all ${
            currentTeam === 'teamB' ? 'border-pink-500 bg-pink-500/10' : 'border-white/10 bg-white/5'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-pink-400 font-bold">{teamNames.teamB}</div>
              {currentTeam === 'teamB' && (
                <span className="text-[10px] text-white/70 font-bold">فريقكم يمثل الآن!</span>
              )}
            </div>
            <div className="text-2xl font-black font-mono text-pink-300">{scores.teamB}</div>
          </div>
        </div>
      </div>

      {/* Main Acting Card Container */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 space-y-6 shadow-2xl text-center">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white/60">
            بطاقة {currentCardIdx + 1} من {cards.length}
          </span>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-pink-500/20 text-pink-300">
            فئة: {activeCard.category}
          </span>
        </div>

        {/* Secret Reveal Gate */}
        {!isSecretRevealed ? (
          <div className="py-12 space-y-4">
            <div className="text-5xl mb-2">🤫</div>
            <h3 className="text-xl font-black text-white">
              دور الممثل من: <span className="text-pink-400">{teamNames[currentTeam]}</span>
            </h3>
            <p className="text-xs text-white/60 max-w-sm mx-auto">
              تأكد من عدم رؤية باقي أفراد فريقك للشاشة، ثم اضغط للكشف عن الشخصية المطلوبة
            </p>
            <button
              onClick={() => setIsSecretRevealed(true)}
              className="px-8 py-3.5 rounded-2xl font-black text-sm bg-pink-600 hover:bg-pink-500 text-white shadow-xl hover:scale-105 transition-all flex items-center gap-2 mx-auto"
            >
              <FaEye />
              <span>كشف بطاقة الشخصية سرياً</span>
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            {/* The Secret Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-pink-900/30 to-purple-900/20 border-2 border-pink-500/40 space-y-4 max-w-md mx-auto shadow-xl">
              <div className="text-5xl">{activeCard.emoji}</div>
              <div>
                <span className="text-xs text-pink-300 font-bold block mb-1">الشخصية المطلوب تمثيلها:</span>
                <h2 className="text-3xl font-black text-white">{activeCard.name}</h2>
              </div>

              {/* Taboo Words */}
              <div className="pt-2 border-t border-white/10">
                <span className="text-xs font-bold text-red-400 block mb-2">
                  🚫 كلمات ممنوع ذكرها أو النطق بها نهائياً:
                </span>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {activeCard.tabooWords.map((word, idx) => (
                    <span key={idx} className="text-xs font-bold px-2.5 py-1 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30">
                      {word}
                    </span>
                  ))}
                </div>
              </div>

              {/* Acting Hint */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-xs text-white/70">
                <span className="text-amber-400 font-bold block mb-1">💡 فكرة للحركات:</span>
                {activeCard.hint}
              </div>
            </div>

            {/* Timer and Action Controls */}
            {!timerActive && !roundCompleted && (
              <button
                onClick={handleStartActing}
                className="px-10 py-4 rounded-2xl font-black text-sm gradient-accent text-[var(--color-primary)] shadow-2xl hover:scale-105 transition-all flex items-center gap-2 mx-auto"
              >
                <FaClock />
                <span>ابدأ المؤقت والتمثيل الآن (60 ثانية)</span>
              </button>
            )}

            {timerActive && (
              <div className="space-y-6">
                <div className="font-mono">
                  <div className={`text-6xl font-black ${timeLeft <= 10 ? 'text-red-400 animate-ping' : 'text-white'}`}>
                    {timeLeft}s
                  </div>
                  <div className="text-xs text-white/50 mt-1">الوقت المتبقي لتخمين الفريق</div>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={handleCorrectGuess}
                    className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center gap-2 shadow-lg transition-all"
                  >
                    <FaCheck />
                    <span>✓ حزروها صح! (+200 نقطة)</span>
                  </button>

                  <button
                    onClick={handleViolation}
                    className="px-6 py-3.5 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-bold text-xs flex items-center gap-2 transition-all"
                  >
                    <FaTimes />
                    <span>نطق كلمة ممنوعة أو ارتكب خطأ</span>
                  </button>
                </div>
              </div>
            )}

            {/* Round Completed Screen */}
            {roundCompleted && (
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div
                  className={`p-4 rounded-2xl font-black text-sm ${
                    roundResult === 'guessed'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  {roundResult === 'guessed' && `🎉 أحسنتم! حزر فريق ${teamNames[currentTeam]} الشخصية بنجاح (+200 نقطة)!`}
                  {roundResult === 'expired' && '⌛ انتهى الوقت قبل أن يتمكن الفريق من معرفة الشخصية!'}
                  {roundResult === 'violation' && '❌ تم نطق إحدى الكلمات الممنوعة وضاعت الجولة!'}
                </div>

                <button
                  onClick={handleNextCard}
                  className="px-8 py-3.5 rounded-2xl font-black text-xs bg-pink-600 hover:bg-pink-500 text-white shadow-xl transition-all"
                >
                  البطاقة التالية وتمرير الدور للخصم
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
