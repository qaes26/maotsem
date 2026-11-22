import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPenNib,
  FaMicrophone,
  FaHome,
  FaTrophy,
  FaPlay,
  FaCheck,
  FaTimes,
  FaFutbol,
  FaArrowLeft,
  FaVolumeUp,
  FaVolumeMute,
  FaLightbulb,
} from 'react-icons/fa';
import sound from '../utils/soundEffects';
import gameApi from '../services/gameApi';

export default function SketchPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('sketch'); // 'sketch' | 'commentary'
  const [sketches, setSketches] = useState([]);
  const [commentaries, setCommentaries] = useState([]);
  const [currentSketchIdx, setCurrentSketchIdx] = useState(0);
  const [currentCommIdx, setCurrentCommIdx] = useState(0);

  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showHint, setShowHint] = useState(false);

  // Teams & Scores
  const [currentTurn, setCurrentTurn] = useState('teamA');
  const [scores, setScores] = useState({ teamA: 0, teamB: 0 });
  const [teamNames] = useState({ teamA: 'الفريق الأول', teamB: 'الفريق الثاني' });

  // Fetch sketches & commentary
  useEffect(() => {
    gameApi.getSketches().then((data) => {
      if (data) setSketches(data);
    });

    gameApi.getCommentary().then((data) => {
      if (data) setCommentaries(data);
    });
  }, []);

  const activeSketch = sketches[currentSketchIdx];
  const activeComm = commentaries[currentCommIdx];

  const handleSelectOption = (index, correctAnswer, points) => {
    if (isAnswerSubmitted) return;

    setSelectedOption(index);
    setIsAnswerSubmitted(true);
    const correct = index === correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      sound.playCorrect();
      setScores((prev) => ({
        ...prev,
        [currentTurn]: prev[currentTurn] + (points || 400),
      }));
    } else {
      sound.playWrong();
    }
  };

  const handleNextItem = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setIsCorrect(null);
    setShowHint(false);
    setCurrentTurn((prev) => (prev === 'teamA' ? 'teamB' : 'teamA'));

    if (activeTab === 'sketch') {
      setCurrentSketchIdx((prev) => (prev + 1) % (sketches.length || 1));
    } else {
      setCurrentCommIdx((prev) => (prev + 1) % (commentaries.length || 1));
    }
  };

  // Read quote with browser speech synthesis if available
  const handlePlayVoice = (text) => {
    sound.playMicClick();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl shadow-lg border border-indigo-500/30">
            {activeTab === 'sketch' ? <FaPenNib /> : <FaMicrophone />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">أهداف سكتش وصوت المعلق</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                تحدي كروي بصري وصوتي
              </span>
            </div>
            <p className="text-xs text-white/50">
              {activeTab === 'sketch'
                ? 'تتبع مسار الكرة والتمريرات على السكتش التخطيطي واحزر الهدف!'
                : 'استمع لعبارة المعلق الشهيرة وخمن صاحب الهدف وتفاصيل اللقاء!'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold flex items-center gap-2 transition-all border border-white/10"
          >
            <FaHome />
            <span>الرئيسية</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex bg-[var(--color-surface)] p-1.5 rounded-2xl border border-white/10 max-w-md mx-auto">
        <button
          onClick={() => {
            setActiveTab('sketch');
            setSelectedOption(null);
            setIsAnswerSubmitted(false);
          }}
          className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
            activeTab === 'sketch'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <FaPenNib />
          <span>أهداف سكتش (Goal Sketch)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('commentary');
            setSelectedOption(null);
            setIsAnswerSubmitted(false);
          }}
          className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
            activeTab === 'commentary'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <FaMicrophone />
          <span>صوت المعلق (Commentary)</span>
        </button>
      </div>

      {/* Scoreboard and Turn Indicator */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className={`p-4 rounded-3xl glass-card border-2 transition-all ${
            currentTurn === 'teamA'
              ? 'border-indigo-400 bg-indigo-500/10'
              : 'border-white/10 bg-white/5'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-indigo-400 font-bold">{teamNames.teamA}</div>
              {currentTurn === 'teamA' && (
                <span className="text-[10px] text-white/70 font-bold">دوركم الآن للإجابة</span>
              )}
            </div>
            <div className="text-2xl font-black font-mono text-indigo-300">{scores.teamA}</div>
          </div>
        </div>

        <div
          className={`p-4 rounded-3xl glass-card border-2 transition-all ${
            currentTurn === 'teamB'
              ? 'border-indigo-400 bg-indigo-500/10'
              : 'border-white/10 bg-white/5'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-indigo-400 font-bold">{teamNames.teamB}</div>
              {currentTurn === 'teamB' && (
                <span className="text-[10px] text-white/70 font-bold">دوركم الآن للإجابة</span>
              )}
            </div>
            <div className="text-2xl font-black font-mono text-indigo-300">{scores.teamB}</div>
          </div>
        </div>
      </div>

      {/* TAB 1: GOAL SKETCH VIEW */}
      {activeTab === 'sketch' && activeSketch && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300">
              سكتش رقم {currentSketchIdx + 1} من {sketches.length} • {activeSketch.points} نقطة
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">{activeSketch.title}</h2>
            <p className="text-xs text-white/60">تأمل الرسم التخطيطي لمسار الكرة والتمريرات</p>
          </div>

          {/* Visual Pitch SVG Sketch Canvas */}
          <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500/30 bg-[#0a3320] p-6 min-h-[300px] flex items-center justify-center shadow-inner">
            {/* SVG Pitch and trajectory lines */}
            <svg viewBox="0 0 100 60" className="w-full max-w-2xl h-auto drop-shadow-lg">
              {/* Pitch borders */}
              <rect x="5" y="5" width="90" height="50" rx="2" fill="#0d422a" stroke="#ffffff30" strokeWidth="0.8" />
              {/* Half line */}
              <line x1="50" y1="5" x2="50" y2="55" stroke="#ffffff30" strokeWidth="0.8" />
              {/* Center Circle */}
              <circle cx="50" cy="30" r="8" fill="none" stroke="#ffffff30" strokeWidth="0.8" />
              {/* Penalty Boxes */}
              <rect x="5" y="16" width="14" height="28" fill="none" stroke="#ffffff30" strokeWidth="0.8" />
              <rect x="81" y="16" width="14" height="28" fill="none" stroke="#ffffff30" strokeWidth="0.8" />
              {/* Goals */}
              <rect x="3" y="24" width="2" height="12" fill="#ffffff60" />
              <rect x="95" y="24" width="2" height="12" fill="#ffffff60" />

              {/* Dynamic trajectory based on sketch type */}
              {activeSketch.diagram?.type === 'corner-cutback' && (
                <g>
                  {/* Corner kick path */}
                  <path d="M 95 5 Q 90 25 86 35" fill="none" stroke="#fbbf24" strokeWidth="1.4" strokeDasharray="2,1" />
                  <circle cx="95" cy="5" r="1.8" fill="#e11d48" />
                  {/* Striker finish into goal */}
                  <line x1="86" y1="35" x2="95" y2="30" stroke="#38bdf8" strokeWidth="1.8" markerEnd="url(#arrow)" />
                  <circle cx="86" cy="35" r="2.2" fill="#38bdf8" />
                </g>
              )}

              {activeSketch.diagram?.type === 'solo-dribble' && (
                <g>
                  {/* Maradona style zigzag dribble from center */}
                  <path d="M 50 30 Q 60 45 68 32 T 78 40 T 88 28 L 95 30" fill="none" stroke="#fbbf24" strokeWidth="1.6" />
                  <circle cx="50" cy="30" r="2" fill="#fbbf24" />
                  <circle cx="95" cy="30" r="2.2" fill="#10b981" />
                </g>
              )}

              {activeSketch.diagram?.type === 'bicycle-kick' && (
                <g>
                  {/* Cross from wing */}
                  <path d="M 82 10 Q 84 25 88 32" fill="none" stroke="#fbbf24" strokeWidth="1.4" strokeDasharray="2,1" />
                  {/* High leap & strike */}
                  <line x1="88" y1="32" x2="95" y2="28" stroke="#f43f5e" strokeWidth="2" />
                  <circle cx="88" cy="32" r="2.5" fill="#f43f5e" />
                </g>
              )}

              {activeSketch.diagram?.type === 'header-corner' && (
                <g>
                  {/* Ramos 93 corner */}
                  <path d="M 95 55 Q 92 38 87 32" fill="none" stroke="#fbbf24" strokeWidth="1.4" strokeDasharray="2,1" />
                  <line x1="87" y1="32" x2="95" y2="30" stroke="#38bdf8" strokeWidth="2" />
                  <circle cx="87" cy="32" r="2.5" fill="#38bdf8" />
                </g>
              )}

              {activeSketch.diagram?.type === 'tiki-taka-counter' && (
                <g>
                  {/* 4 passing triangles */}
                  <line x1="40" y1="30" x2="55" y2="20" stroke="#fbbf24" strokeWidth="1.2" />
                  <line x1="55" y1="20" x2="70" y2="35" stroke="#fbbf24" strokeWidth="1.2" />
                  <line x1="70" y1="35" x2="88" y2="24" stroke="#fbbf24" strokeWidth="1.2" />
                  <line x1="88" y1="24" x2="95" y2="28" stroke="#10b981" strokeWidth="2" />
                  <circle cx="88" cy="24" r="2" fill="#10b981" />
                </g>
              )}
            </svg>
          </div>

          {/* Sequence Description / Hint */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 text-xs">
            <div className="flex items-center gap-2 text-white/80">
              <FaFutbol className="text-amber-400" />
              <span>{activeSketch.description}</span>
            </div>

            <button
              onClick={() => setShowHint(!showHint)}
              className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 font-bold text-xs flex items-center gap-1 transition-all"
            >
              <FaLightbulb />
              <span>{showHint ? 'إخفاء التلميح' : 'تلميح'}</span>
            </button>
          </div>

          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300"
            >
              <span className="font-bold">سلسلة التمريرات: </span>
              {activeSketch.passSequence?.join(' ⬅️ ')}
            </motion.div>
          )}

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {activeSketch.options.map((option, idx) => {
              let btnStyle = 'bg-white/5 border-white/10 hover:border-white/30 text-white';

              if (isAnswerSubmitted) {
                if (idx === activeSketch.correctAnswer) {
                  btnStyle = 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-black';
                } else if (idx === selectedOption) {
                  btnStyle = 'bg-red-500/20 border-red-400 text-red-300';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswerSubmitted}
                  onClick={() => handleSelectOption(idx, activeSketch.correctAnswer, activeSketch.points)}
                  className={`p-4 rounded-2xl border-2 text-right text-sm font-bold transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <span>{option}</span>
                  <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center font-mono text-xs">
                    {['أ', 'ب', 'ج', 'د'][idx]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Feedback & Next */}
          {isAnswerSubmitted && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-4 text-center">
              <div
                className={`p-3 rounded-2xl font-black text-xs ${
                  isCorrect
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {isCorrect
                  ? `✓ إجابة عبقرية! تم منح ${activeSketch.points} نقطة لـ ${teamNames[currentTurn]}`
                  : `✗ إجابة خاطئة! الهدف التاريخي هو: ${activeSketch.options[activeSketch.correctAnswer]}`}
              </div>

              <button
                onClick={handleNextItem}
                className="px-8 py-3 rounded-2xl font-black text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl transition-all"
              >
                السكتش التالي وتمرير الدور
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* TAB 2: COMMENTARY VOICE VIEW */}
      {activeTab === 'commentary' && activeComm && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-500/20 text-rose-300">
              تعليق رقم {currentCommIdx + 1} من {commentaries.length} • {activeComm.points} نقطة
            </span>
            <div className="text-sm font-bold text-white/60">بصوت المعلق الكبير:</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">{activeComm.commentator}</h2>
          </div>

          {/* Audio / Speech Simulator Box */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-900/30 via-purple-900/20 to-black/40 border border-rose-500/30 text-center space-y-4">
            <p className="text-lg sm:text-2xl font-black text-amber-300 leading-relaxed italic">
              "{activeComm.quote}"
            </p>

            <button
              onClick={() => handlePlayVoice(activeComm.quote)}
              className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 mx-auto shadow-lg hover:scale-105 transition-all"
            >
              <FaMicrophone />
              <span>استمع للتعليق الصوتي 🎙️</span>
            </button>
          </div>

          <div className="text-center text-xs text-white/60">
            <span className="text-amber-400 font-bold">💡 التلميح: </span>
            {activeComm.clue}
          </div>

          <div className="text-center text-sm font-bold text-white pt-2">
            {activeComm.question}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeComm.options.map((option, idx) => {
              let btnStyle = 'bg-white/5 border-white/10 hover:border-white/30 text-white';

              if (isAnswerSubmitted) {
                if (idx === activeComm.correctAnswer) {
                  btnStyle = 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-black';
                } else if (idx === selectedOption) {
                  btnStyle = 'bg-red-500/20 border-red-400 text-red-300';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswerSubmitted}
                  onClick={() => handleSelectOption(idx, activeComm.correctAnswer, activeComm.points)}
                  className={`p-4 rounded-2xl border-2 text-right text-sm font-bold transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <span>{option}</span>
                  <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center font-mono text-xs">
                    {['أ', 'ب', 'ج', 'د'][idx]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Feedback & Next */}
          {isAnswerSubmitted && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-4 text-center">
              <div
                className={`p-3 rounded-2xl font-black text-xs ${
                  isCorrect
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {isCorrect
                  ? `✓ إجابة صحيحة! أحسنتم 🎉 (+${activeComm.points} نقطة لـ ${teamNames[currentTurn]})`
                  : `✗ إجابة خاطئة! الإجابة المعتمدة هي: ${activeComm.options[activeComm.correctAnswer]}`}
              </div>

              <button
                onClick={handleNextItem}
                className="px-8 py-3 rounded-2xl font-black text-xs bg-rose-600 hover:bg-rose-500 text-white shadow-xl transition-all"
              >
                التعليق التالي وتمرير الدور
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
