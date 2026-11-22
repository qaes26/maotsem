import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { FaCrown, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import useGameStore from '../../stores/gameStore';

const AnimatedScore = ({ score, color }) => {
  const [displayScore, setDisplayScore] = useState(score);
  const prevScore = useRef(score);

  useEffect(() => {
    if (score === prevScore.current) return;
    const diff = score - prevScore.current;
    const steps = 20;
    const increment = diff / steps;
    let current = prevScore.current;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplayScore(score);
        clearInterval(interval);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, 30);

    prevScore.current = score;
    return () => clearInterval(interval);
  }, [score]);

  return (
    <motion.span
      className="text-4xl md:text-5xl font-black tabular-nums"
      style={{ color }}
      key={score}
    >
      {displayScore}
    </motion.span>
  );
};

const PointChange = ({ points, side }) => (
  <AnimatePresence>
    {points !== 0 && (
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 0, y: -60 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5 }}
        className={`absolute ${side === 'right' ? 'right-4' : 'left-4'} -top-2 text-2xl font-bold ${
          points > 0 ? 'text-green-400' : 'text-red-400'
        }`}
      >
        {points > 0 ? `+${points}` : points}
      </motion.div>
    )}
  </AnimatePresence>
);

export default function Scoreboard({ teamAName = 'الفريق أ', teamBName = 'الفريق ب' }) {
  const { scores, currentTurn } = useGameStore();
  const [pointChangeA, setPointChangeA] = useState(0);
  const [pointChangeB, setPointChangeB] = useState(0);
  const prevScores = useRef(scores);

  useEffect(() => {
    const diffA = scores.teamA - prevScores.current.teamA;
    const diffB = scores.teamB - prevScores.current.teamB;
    if (diffA !== 0) {
      setPointChangeA(diffA);
      setTimeout(() => setPointChangeA(0), 1500);
    }
    if (diffB !== 0) {
      setPointChangeB(diffB);
      setTimeout(() => setPointChangeB(0), 1500);
    }
    prevScores.current = scores;
  }, [scores]);

  const teamALeading = scores.teamA > scores.teamB;
  const teamBLeading = scores.teamB > scores.teamA;

  return (
    <div dir="rtl" className="w-full bg-gradient-to-l from-[var(--color-surface-dark)] via-[var(--color-primary)] to-[var(--color-surface-dark)] rounded-2xl p-4 md:p-6 shadow-2xl border border-[var(--color-accent)]/20 relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-accent)]/5 to-transparent pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        {/* Team A (Right side in RTL) */}
        <motion.div
          className={`flex-1 text-center relative p-3 rounded-xl transition-all duration-500 ${
            currentTurn === 'teamA' ? 'bg-[var(--color-accent)]/10 ring-2 ring-[var(--color-accent)]/50' : ''
          }`}
          animate={currentTurn === 'teamA' ? { scale: [1, 1.02, 1] } : { scale: 1 }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            {teamALeading && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5, rotate: { repeat: Infinity, duration: 2 } }}
              >
                <FaCrown className="text-[var(--color-accent)] text-xl" />
              </motion.div>
            )}
            <h3 className="text-lg md:text-xl font-bold text-white">{teamAName}</h3>
          </div>
          <AnimatedScore score={scores.teamA} color="var(--color-accent)" />
          <PointChange points={pointChangeA} side="right" />
          {currentTurn === 'teamA' && (
            <motion.div
              className="mt-2 flex items-center justify-center gap-1 text-[var(--color-accent)] text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <FaArrowLeft />
              <span>دورك</span>
            </motion.div>
          )}
        </motion.div>

        {/* Divider */}
        <div className="mx-4 md:mx-8 flex flex-col items-center gap-2">
          <div className="w-[2px] h-8 bg-gradient-to-b from-transparent via-[var(--color-accent)] to-transparent" />
          <span className="text-[var(--color-accent)] font-bold text-xl">VS</span>
          <div className="w-[2px] h-8 bg-gradient-to-b from-transparent via-[var(--color-accent)] to-transparent" />
        </div>

        {/* Team B (Left side in RTL) */}
        <motion.div
          className={`flex-1 text-center relative p-3 rounded-xl transition-all duration-500 ${
            currentTurn === 'teamB' ? 'bg-blue-500/10 ring-2 ring-blue-400/50' : ''
          }`}
          animate={currentTurn === 'teamB' ? { scale: [1, 1.02, 1] } : { scale: 1 }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            {teamBLeading && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5, rotate: { repeat: Infinity, duration: 2 } }}
              >
                <FaCrown className="text-blue-400 text-xl" />
              </motion.div>
            )}
            <h3 className="text-lg md:text-xl font-bold text-white">{teamBName}</h3>
          </div>
          <AnimatedScore score={scores.teamB} color="#60a5fa" />
          <PointChange points={pointChangeB} side="left" />
          {currentTurn === 'teamB' && (
            <motion.div
              className="mt-2 flex items-center justify-center gap-1 text-blue-400 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <FaArrowRight />
              <span>دورك</span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
