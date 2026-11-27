import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCrown,
  FaRedo,
  FaHome,
  FaVolumeMute,
  FaVolumeUp,
  FaRobot,
  FaCheck,
  FaTimes,
  FaPhoneAlt,
  FaBomb,
  FaCrosshairs,
  FaSyncAlt,
  FaChevronDown,
  FaClock,
  FaExclamationCircle,
  FaEye,
} from 'react-icons/fa';

import GameSetupPage, { ALL_AVAILABLE_CATEGORIES } from './GameSetupPage';
import QuestionCard from '../components/Game/QuestionCard';
import LifelinePanel from '../components/Game/LifelinePanel';
import Scoreboard from '../components/Game/Scoreboard';
import AIOpponent from '../components/Game/AIOpponent';
import Timer from '../components/shared/Timer';
import useGameStore from '../stores/gameStore';
import useAuthStore from '../stores/authStore';
import sound from '../utils/soundEffects';
import gameApi from '../services/gameApi';

export default function GameBoardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAIModeParam = searchParams.get('ai') === 'true';

  const {
    isGameActive,
    selectedCategories,
    scores,
    currentTurn,
    gameMode,
    aiDifficulty,
    usedLifelines,
    selectQuestion,
    submitAnswer,
    useLifeline,
    nextTurn,
    resetGame,
    setGameMode,
  } = useGameStore();

  const user = useAuthStore((s) => s.user);

  // Local game board state
  const [boardQuestions, setBoardQuestions] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [activeQuestionCoords, setActiveQuestionCoords] = useState(null); // { cIdx, qIdx }
  const [answeredSlots, setAnsweredSlots] = useState(new Set()); // Strictly tracks by slot coordinate 'cIdx-qIdx'
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  // In-question states
  const [timerRunning, setTimerRunning] = useState(false);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(30);

  // Active lifeline in the current turn
  const [currentLifeline, setCurrentLifeline] = useState(null); // 'two-answers' | 'pit' | 'double' | 'call-friend' | 'bomb'
  const [callFriendActive, setCallFriendActive] = useState(false);
  const [callFriendTimer, setCallFriendTimer] = useState(30);
  const [bombResult, setBombResult] = useState(null); // { outcome: 'bonus'|'trap', points: 400 }

  // Game over state
  const [isGameOver, setIsGameOver] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);

  // Teams config
  const [teamNames, setTeamNames] = useState({
    teamA: 'الفريق الأول',
    teamB: isAIModeParam ? 'روبوت هخلص عليك (AI)' : 'الفريق الثاني',
  });

  // Fetch / initialize board questions
  useEffect(() => {
    if (selectedCategories.length === 6) {
      gameApi.getQuestions().then((questions) => {
        if (questions) {
          buildBoard(questions, selectedCategories);
        }
      });
    }
  }, [selectedCategories]);

  // Build the 6x3 grid
  const buildBoard = (allQuestions, categories) => {
    const pointValues = [200, 400, 600];
    const grid = categories.map((catId, cIdx) => {
      const catQuestions = allQuestions.filter(
        (q) => q.category === catId || q.subcategory === catId
      );

      const sample = catQuestions[0];
      const catMeta = ALL_AVAILABLE_CATEGORIES.find((c) => c.id === catId);
      const catName = catMeta ? catMeta.name : (sample ? sample.subcategoryName || sample.categoryName || catId : catId);
      const catIcon = catMeta ? catMeta.icon : '🎯';
      const catImage = catMeta ? catMeta.image : 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80';

      // Track picked questions for this column to guarantee 3 distinct questions
      const usedIdsInCol = new Set();

      const questions = pointValues.map((points, qIdx) => {
        const slotId = `${cIdx}-${qIdx}`;

        // 1. Unused match with exact points
        let match = catQuestions.find((q) => q.points === points && !usedIdsInCol.has(q.id));

        // 2. Unused match with any points
        if (!match) {
          match = catQuestions.find((q) => !usedIdsInCol.has(q.id));
        }

        // 3. Fallback: random from catQuestions
        if (!match && catQuestions.length > 0) {
          match = catQuestions[Math.floor(Math.random() * catQuestions.length)];
        }

        if (match) {
          usedIdsInCol.add(match.id);
          const correctAnswerText =
            match.correctAnswerText ||
            (match.options && typeof match.correctAnswer === 'number'
              ? match.options[match.correctAnswer]
              : match.answer || 'الإجابة النموذجية');

          return {
            ...match,
            slotId,
            points,
            id: `${match.id || catId}_${cIdx}_${qIdx}_${points}`,
            correctAnswerText,
          };
        }

        return {
          id: `${catId}_${cIdx}_${qIdx}_${points}`,
          slotId,
          question: `سؤال في ${catName} بقيمة ${points} نقطة`,
          options: ['خيار 1', 'خيار 2', 'خيار 3', 'خيار 4'],
          correctAnswer: 0,
          correctAnswerText: 'الإجابة النموذجية للسؤال',
          points,
          explanation: 'إجابة السؤال الصحيحة والمعتمدة.',
        };
      });

      return {
        id: catId,
        name: catName,
        icon: catIcon,
        image: catImage,
        questions,
      };
    });

    setBoardQuestions(grid);
  };

  // AI Turn Handling
  useEffect(() => {
    if (
      (gameMode === 'ai' || isAIModeParam) &&
      currentTurn === 'teamB' &&
      !activeQuestion &&
      !isGameOver &&
      boardQuestions.length > 0
    ) {
      setAiThinking(true);

      const availableMoves = [];
      boardQuestions.forEach((col, cIdx) => {
        col.questions.forEach((q, qIdx) => {
          const slotId = q.slotId || `${cIdx}-${qIdx}`;
          if (!answeredSlots.has(slotId)) {
            availableMoves.push({ q, cIdx, qIdx });
          }
        });
      });

      if (availableMoves.length === 0) {
        setIsGameOver(true);
        setAiThinking(false);
        return;
      }

      // Pick question after 2 seconds
      const timer = setTimeout(() => {
        const move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        handleSelectQuestion(move.q, move.cIdx, move.qIdx);
        setAiThinking(false);

        // AI Answer execution after 3 seconds
        setTimeout(() => {
          setIsAnswerRevealed(true);
          let accuracy = 0.65;
          if (aiDifficulty === 'easy') accuracy = 0.4;
          if (aiDifficulty === 'hard') accuracy = 0.85;

          const isCorrectChoice = Math.random() < accuracy;
          setTimeout(() => {
            handleAwardPoints(isCorrectChoice ? 'teamB' : null);
          }, 2000);
        }, 3000);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [currentTurn, activeQuestion, isGameOver, boardQuestions, answeredSlots]);

  // Handle Question Click from Board
  const handleSelectQuestion = (q, cIdx, qIdx) => {
    const slotId = q.slotId || `${cIdx}-${qIdx}`;
    if (answeredSlots.has(slotId) || activeQuestion) return;

    setActiveQuestion(q);
    setActiveQuestionCoords({ cIdx, qIdx });
    setIsAnswerRevealed(false);
    setCurrentLifeline(null);
    setBombResult(null);
    setQuestionTimeLeft(30);
    setTimerRunning(true);
  };

  // Handle Lifeline Activation
  const handleUseLifeline = (lifelineId) => {
    if (currentLifeline || isAnswerRevealed) return;

    const team = currentTurn;
    const teamUsed = usedLifelines[team] || [];
    if (teamUsed.length >= 3 || teamUsed.includes(lifelineId)) return;

    useLifeline(lifelineId);
    setCurrentLifeline(lifelineId);

    if (lifelineId === 'call-friend') {
      setCallFriendActive(true);
      setCallFriendTimer(35);
    } else if (lifelineId === 'bomb') {
      sound.playBomb();
      const isBonus = Math.random() >= 0.5;
      const pts = 400;
      setBombResult({
        outcome: isBonus ? 'bonus' : 'trap',
        points: pts,
      });

      if (isBonus) {
        scores[team] += pts;
      } else {
        scores[team] = Math.max(0, scores[team] - pts);
      }
    } else if (lifelineId === 'swap') {
      fetch('/api/game/questions')
        .then((res) => res.json())
        .then((data) => {
          const alternates = data.questions.filter(
            (item) => item.id !== activeQuestion.id && item.points === activeQuestion.points
          );
          if (alternates.length > 0) {
            const newQ = alternates[Math.floor(Math.random() * alternates.length)];
            const correctAnswerText =
              newQ.correctAnswerText ||
              (newQ.options && typeof newQ.correctAnswer === 'number'
                ? newQ.options[newQ.correctAnswer]
                : newQ.answer || 'الإجابة النموذجية');
            setActiveQuestion({
              ...newQ,
              slotId: activeQuestion.slotId,
              correctAnswerText,
            });
          }
        });
    }
  };

  // Award Points to Team A, Team B, or None (Referee / Teams Control)
  const handleAwardPoints = (winnerTeam) => {
    if (!activeQuestion) return;

    let earnedPoints = activeQuestion.points;
    if (currentLifeline === 'double') {
      earnedPoints *= 2;
    }

    if (winnerTeam === 'teamA') {
      sound.playCorrect();
      if (currentLifeline === 'pit' && currentTurn === 'teamA') {
        scores.teamA += earnedPoints;
        scores.teamB = Math.max(0, scores.teamB - earnedPoints);
      } else {
        scores.teamA += earnedPoints;
      }
    } else if (winnerTeam === 'teamB') {
      sound.playCorrect();
      if (currentLifeline === 'pit' && currentTurn === 'teamB') {
        scores.teamB += earnedPoints;
        scores.teamA = Math.max(0, scores.teamA - earnedPoints);
      } else {
        scores.teamB += earnedPoints;
      }
    } else {
      sound.playWrong();
      if (currentLifeline === 'pit') {
        scores[currentTurn] = Math.max(0, scores[currentTurn] - Math.round(earnedPoints / 2));
      }
    }

    // Mark slot strictly as answered
    const slotId = activeQuestion.slotId || `${activeQuestionCoords?.cIdx}-${activeQuestionCoords?.qIdx}`;
    setAnsweredSlots((prev) => {
      const next = new Set(prev);
      next.add(slotId);

      // Check if all 18 questions are answered
      if (next.size >= 18) {
        setTimeout(() => {
          setIsGameOver(true);
          sound.playFanfare();
        }, 1500);
      }
      return next;
    });

    setActiveQuestion(null);
    setIsAnswerRevealed(false);
    nextTurn();
  };

  // If game is not active or categories not selected, show GameSetupPage
  if (!isGameActive || selectedCategories.length < 6) {
    return <GameSetupPage onStart={() => {}} />;
  }

  const teamALeading = scores.teamA > scores.teamB;
  const teamBLeading = scores.teamB > scores.teamA;
  const isTied = scores.teamA === scores.teamB;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Top Bar: Controls + Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold flex items-center gap-2 transition-all border border-white/10"
        >
          <FaHome />
          <span>الرئيسية</span>
        </button>

        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-black text-white">لوحة هخلص عليك (6 فئات)</h1>
          <div className="text-xs text-white/50">
            تمت الإجابة: {answeredSlots.size} / 18 سؤالاً
          </div>
        </div>

        <button
          onClick={() => {
            if (window.confirm('هل تريد إعادة تعيين اللعبة وبدء مباراة جديدة؟')) {
              resetGame();
            }
          }}
          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold flex items-center gap-2 transition-all border border-white/10"
        >
          <FaRedo />
          <span>إعادة اللعبة</span>
        </button>
      </div>

      {/* Scoreboard & Turn Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Team A Card */}
        <motion.div
          animate={
            currentTurn === 'teamA'
              ? { scale: [1, 1.02, 1], borderColor: 'var(--color-accent)' }
              : { scale: 1, borderColor: 'rgba(255,255,255,0.1)' }
          }
          className={`p-5 rounded-3xl glass-card border-2 transition-all relative overflow-hidden ${
            currentTurn === 'teamA'
              ? 'bg-gradient-to-r from-[var(--color-accent)]/20 via-yellow-600/10 to-transparent shadow-xl shadow-[var(--color-accent)]/20'
              : 'bg-white/5'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl gradient-accent flex items-center justify-center text-[var(--color-primary)] font-black text-xl shadow-md">
                A
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">{teamNames.teamA}</h3>
                  {teamALeading && <FaCrown className="text-[var(--color-accent)] text-sm" />}
                </div>
                {currentTurn === 'teamA' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-accent)] text-[var(--color-primary)]">
                    دوركم الآن للاختيار والإجابة
                  </span>
                )}
              </div>
            </div>

            <div className="text-left font-mono">
              <div className="text-3xl font-black text-[var(--color-accent)]">{scores.teamA}</div>
              <div className="text-[10px] text-white/40">نقطة</div>
            </div>
          </div>

          {/* Lifelines Bar for Team A */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/60">خطوط النجاة (3/3):</span>
            <div className="flex gap-1.5">
              {[
                { id: 'two-answers', label: 'جوابين', icon: '🎯' },
                { id: 'pit', label: 'الحفرة', icon: '⬇️' },
                { id: 'double', label: 'الدبل', icon: '✖️2' },
                { id: 'call-friend', label: 'صديق', icon: '📞' },
                { id: 'swap', label: 'بدل', icon: '🔄' },
                { id: 'bomb', label: 'قنبلة', icon: '💣' },
              ].map((lf) => {
                const isUsed = (usedLifelines.teamA || []).includes(lf.id);
                const isActiveInTurn = currentTurn === 'teamA' && currentLifeline === lf.id;
                return (
                  <button
                    key={lf.id}
                    disabled={isUsed || currentTurn !== 'teamA' || !activeQuestion || isAnswerSubmitted}
                    onClick={() => handleUseLifeline(lf.id)}
                    title={`${lf.label} ${isUsed ? '(مستخدمة)' : ''}`}
                    className={`w-8 h-8 rounded-xl text-xs flex items-center justify-center transition-all ${
                      isActiveInTurn
                        ? 'bg-[var(--color-accent)] text-black ring-2 ring-white animate-pulse'
                        : isUsed
                        ? 'bg-white/5 opacity-30 text-white/30 cursor-not-allowed line-through'
                        : currentTurn === 'teamA' && activeQuestion && !isAnswerSubmitted
                        ? 'bg-white/10 hover:bg-[var(--color-accent)] hover:text-black text-white hover:scale-110 shadow-md'
                        : 'bg-white/5 text-white/50'
                    }`}
                  >
                    {lf.icon}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Team B / AI Card */}
        <motion.div
          animate={
            currentTurn === 'teamB'
              ? { scale: [1, 1.02, 1], borderColor: '#38bdf8' }
              : { scale: 1, borderColor: 'rgba(255,255,255,0.1)' }
          }
          className={`p-5 rounded-3xl glass-card border-2 transition-all relative overflow-hidden ${
            currentTurn === 'teamB'
              ? 'bg-gradient-to-r from-cyan-600/20 via-blue-600/10 to-transparent shadow-xl shadow-cyan-500/20'
              : 'bg-white/5'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500 flex items-center justify-center text-black font-black text-xl shadow-md">
                {gameMode === 'ai' ? <FaRobot /> : 'B'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">{teamNames.teamB}</h3>
                  {teamBLeading && <FaCrown className="text-cyan-400 text-sm" />}
                </div>
                {currentTurn === 'teamB' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-400 text-black">
                    {aiThinking ? 'الذكاء الاصطناعي يفكر...' : 'دور الفريق الثاني الآن'}
                  </span>
                )}
              </div>
            </div>

            <div className="text-left font-mono">
              <div className="text-3xl font-black text-cyan-400">{scores.teamB}</div>
              <div className="text-[10px] text-white/40">نقطة</div>
            </div>
          </div>

          {/* Lifelines Bar for Team B */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/60">خطوط النجاة (3/3):</span>
            <div className="flex gap-1.5">
              {[
                { id: 'two-answers', label: 'جوابين', icon: '🎯' },
                { id: 'pit', label: 'الحفرة', icon: '⬇️' },
                { id: 'double', label: 'الدبل', icon: '✖️2' },
                { id: 'call-friend', label: 'صديق', icon: '📞' },
                { id: 'swap', label: 'بدل', icon: '🔄' },
                { id: 'bomb', label: 'قنبلة', icon: '💣' },
              ].map((lf) => {
                const isUsed = (usedLifelines.teamB || []).includes(lf.id);
                const isActiveInTurn = currentTurn === 'teamB' && currentLifeline === lf.id;
                return (
                  <button
                    key={lf.id}
                    disabled={isUsed || currentTurn !== 'teamB' || !activeQuestion || isAnswerSubmitted}
                    onClick={() => handleUseLifeline(lf.id)}
                    title={`${lf.label} ${isUsed ? '(مستخدمة)' : ''}`}
                    className={`w-8 h-8 rounded-xl text-xs flex items-center justify-center transition-all ${
                      isActiveInTurn
                        ? 'bg-cyan-400 text-black ring-2 ring-white animate-pulse'
                        : isUsed
                        ? 'bg-white/5 opacity-30 text-white/30 cursor-not-allowed line-through'
                        : currentTurn === 'teamB' && activeQuestion && !isAnswerSubmitted
                        ? 'bg-white/10 hover:bg-cyan-400 hover:text-black text-white hover:scale-110 shadow-md'
                        : 'bg-white/5 text-white/50'
                    }`}
                  >
                    {lf.icon}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* The Main 6-Category Grid Board */}
      <div className="glass-card p-4 sm:p-6 rounded-3xl border border-white/10 shadow-2xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {boardQuestions.map((col, cIdx) => (
            <div key={col.id || cIdx} className="space-y-3">
              {/* Category Header Card with Real Image */}
              <div
                className="p-3 sm:p-4 rounded-2xl border border-white/10 text-center flex flex-col justify-end min-h-[92px] shadow-lg relative overflow-hidden bg-cover bg-center group"
                style={{
                  backgroundImage: `url(${col.image || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80'})`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-slate-900/40 backdrop-blur-[0.5px]" />
                <div className="relative z-10">
                  <span className="text-lg block mb-0.5 drop-shadow">{col.icon || '🎯'}</span>
                  <span className="text-xs sm:text-sm font-black text-white leading-tight line-clamp-2 drop-shadow-md">
                    {col.name}
                  </span>
                </div>
              </div>

              {/* Point Buttons (200, 400, 600) */}
              <div className="space-y-2">
                {col.questions.map((q, qIdx) => {
                  const slotId = q.slotId || `${cIdx}-${qIdx}`;
                  const isAnswered = answeredSlots.has(slotId);
                  const isCurrentActive = activeQuestion?.slotId === slotId;

                  return (
                    <motion.button
                      key={slotId}
                      whileHover={!isAnswered ? { scale: 1.04 } : {}}
                      whileTap={!isAnswered ? { scale: 0.96 } : {}}
                      disabled={isAnswered || !!activeQuestion || (currentTurn === 'teamB' && gameMode === 'ai')}
                      onClick={() => handleSelectQuestion(q, cIdx, qIdx)}
                      className={`w-full py-4 sm:py-5 rounded-2xl font-black text-base sm:text-xl font-mono tracking-wider transition-all duration-300 shadow-lg ${
                        isAnswered
                          ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed line-through'
                          : isCurrentActive
                          ? 'bg-[var(--color-accent)] text-[var(--color-primary)] ring-4 ring-[var(--color-accent)]/50 scale-105'
                          : 'bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-surface-dark)] hover:from-[var(--color-accent)]/20 hover:to-[var(--color-surface)] text-[var(--color-accent)] border border-[var(--color-accent)]/30 hover:border-[var(--color-accent)] shadow-[var(--color-accent)]/10'
                      }`}
                    >
                      {isAnswered ? '✓' : q.points}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Question Modal (بدون خيارات متعددة + زر كشف الإجابة) */}
      <AnimatePresence>
        {activeQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="w-full max-w-3xl glass-card rounded-3xl border-2 border-[var(--color-accent)]/40 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
            >
              {/* Question Header Bar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-[var(--color-accent)] text-[var(--color-primary)] font-black text-sm">
                    {currentLifeline === 'double' ? activeQuestion.points * 2 : activeQuestion.points} نقطة
                  </span>
                  <span className="text-xs text-white/70 font-semibold">
                    {activeQuestion.subcategoryName || activeQuestion.categoryName || 'سؤال'}
                  </span>
                </div>

                {/* Active Lifeline Indicator badge */}
                {currentLifeline && (
                  <div className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                    <span>خط النجاة مفعّل:</span>
                    <span>
                      {currentLifeline === 'two-answers' && '🎯 جوابين'}
                      {currentLifeline === 'pit' && '⬇️ الحفرة (+لك و -للخصم)'}
                      {currentLifeline === 'double' && '✖️2 مضاعفة النقاط'}
                      {currentLifeline === 'call-friend' && '📞 اتصال بصديق'}
                      {currentLifeline === 'bomb' && '💣 القنبلة'}
                    </span>
                  </div>
                )}

                {/* Turn badge */}
                <span className="text-xs font-bold text-white/80">
                  دور:{' '}
                  <span className="text-[var(--color-accent)]">
                    {currentTurn === 'teamA' ? teamNames.teamA : teamNames.teamB}
                  </span>
                </span>
              </div>

              {/* Bomb mystery alert if used */}
              {bombResult && (
                <div
                  className={`p-3 rounded-2xl text-center text-xs font-black flex items-center justify-center gap-2 ${
                    bombResult.outcome === 'bonus'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-red-500/20 text-red-400 border border-red-500/40'
                  }`}
                >
                  <FaBomb />
                  <span>
                    {bombResult.outcome === 'bonus'
                      ? '🎉 حظ خارق! كسبت +400 نقطة إضافية من القنبلة!'
                      : '💥 انفجرت القنبلة فخاً! تم خصم -400 نقطة من رصيد الفريق!'}
                  </span>
                </div>
              )}

              {/* Call a friend active timer */}
              {callFriendActive && (
                <div className="p-3 rounded-2xl bg-green-500/20 border border-green-500/40 text-green-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaPhoneAlt className="animate-bounce" />
                    <span>مكالمة الصديق جارية... اسأله الآن!</span>
                  </div>
                  <span className="font-mono font-bold text-sm">30 ثانية</span>
                </div>
              )}

              {/* Question Text Alone (السؤال موجود وحيد بدون خيارات متعددة) */}
              <div className="text-center py-6 px-4 bg-white/5 rounded-3xl border border-white/10 shadow-inner my-2">
                <span className="text-xs font-bold text-[var(--color-accent)] block mb-2">السؤال المطلوب:</span>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-relaxed">
                  {activeQuestion.question}
                </h2>
              </div>

              {/* Question Action: Reveal Button or Revealed Answer */}
              {!isAnswerRevealed ? (
                <div className="flex flex-col items-center justify-center py-6 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setIsAnswerRevealed(true);
                      sound.playWhistle();
                    }}
                    className="px-8 py-4 rounded-2xl font-black text-base sm:text-lg bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 shadow-2xl shadow-amber-500/30 flex items-center gap-3 border-2 border-amber-300 transition-all hover:brightness-110"
                  >
                    <FaEye className="text-xl" />
                    <span>كشف الإجابة الصحيحة (للحكم والفريقين) 👁️</span>
                  </motion.button>
                  <p className="text-xs text-white/50 text-center">
                    اضغط على الزر لكشف الإجابة الصحيحة فقط بدون خيارات والتحكيم بين الفريقين
                  </p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  {/* The Single Correct Answer Card */}
                  <div className="p-6 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/60 shadow-xl shadow-emerald-500/10 text-center space-y-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                      الإجابة الصحيحة المعتمدة ✓
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-300">
                      {activeQuestion.correctAnswerText ||
                        (activeQuestion.options && typeof activeQuestion.correctAnswer === 'number'
                          ? activeQuestion.options[activeQuestion.correctAnswer]
                          : activeQuestion.answer) ||
                        'الإجابة الصحيحة'}
                    </div>
                  </div>

                  {/* Optional Explanation */}
                  {activeQuestion.explanation && (
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-white/80 text-right leading-relaxed">
                      <span className="font-bold text-[var(--color-accent)] block mb-1">💡 معلومة هخلص عليك:</span>
                      {activeQuestion.explanation}
                    </div>
                  )}

                  {/* Referee Award Points Section */}
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <div className="text-center text-xs font-bold text-white/60">
                      ⚖️ قرار الحكم ومنح النقاط:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => handleAwardPoints('teamA')}
                        className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-600/30 hover:from-amber-500 hover:to-amber-600 border border-amber-500/40 text-amber-300 hover:text-black font-black text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <FaCheck />
                        <span>نقطة لـ {teamNames.teamA} (+{currentLifeline === 'double' ? activeQuestion.points * 2 : activeQuestion.points})</span>
                      </button>

                      <button
                        onClick={() => handleAwardPoints('teamB')}
                        className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-cyan-600/30 hover:from-cyan-500 hover:to-cyan-600 border border-cyan-500/40 text-cyan-300 hover:text-black font-black text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <FaCheck />
                        <span>نقطة لـ {teamNames.teamB} (+{currentLifeline === 'double' ? activeQuestion.points * 2 : activeQuestion.points})</span>
                      </button>

                      <button
                        onClick={() => handleAwardPoints(null)}
                        className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/60 hover:text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
                      >
                        <FaTimes />
                        <span>لا أحد / إجابة خاطئة (0)</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Game Over Modal */}
      <AnimatePresence>
        {isGameOver && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-lg glass-card rounded-3xl border-2 border-[var(--color-accent)] p-8 text-center space-y-6 shadow-2xl"
            >
              <div className="w-20 h-20 rounded-3xl gradient-accent golden-glow mx-auto flex items-center justify-center text-4xl text-[var(--color-primary)]">
                <FaCrown />
              </div>

              <div>
                <h2 className="text-3xl font-black text-white mb-2">انتهت المواجهة!</h2>
                <div className="text-lg font-bold text-[var(--color-accent)]">
                  {teamALeading
                    ? `🏆 فاز ${teamNames.teamA} بجدارة!`
                    : teamBLeading
                    ? `🏆 فاز ${teamNames.teamB} بجدارة!`
                    : '🤝 تعادل تاريخي ومثير بين الفريقين!'}
                </div>
              </div>

              {/* Final Scores */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 font-mono">
                <div>
                  <div className="text-xs text-white/60 mb-1">{teamNames.teamA}</div>
                  <div className="text-3xl font-black text-[var(--color-accent)]">{scores.teamA}</div>
                </div>
                <div>
                  <div className="text-xs text-white/60 mb-1">{teamNames.teamB}</div>
                  <div className="text-3xl font-black text-cyan-400">{scores.teamB}</div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => resetGame()}
                  className="px-6 py-3 rounded-2xl font-bold text-xs gradient-accent text-[var(--color-primary)] hover:scale-105 transition-all flex items-center gap-2"
                >
                  <FaRedo />
                  <span>العب مباراة جديدة</span>
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 rounded-2xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-2"
                >
                  <FaHome />
                  <span>الرئيسية</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

