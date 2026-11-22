import { motion } from 'framer-motion';
import { FaRobot } from 'react-icons/fa';

const AI_NAMES = {
  easy: 'روبوت سهل 🤖',
  medium: 'روبوت متوسط 🧠',
  hard: 'روبوت خبير 🎓',
};

const DIFFICULTY_LABELS = {
  easy: 'سهل',
  medium: 'متوسط',
  hard: 'صعب',
};

const DIFFICULTY_COLORS = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/40',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  hard: 'bg-red-500/20 text-red-400 border-red-500/40',
};

const ThinkingDots = () => (
  <div className="flex items-center gap-1 mt-2" dir="rtl">
    <span className="text-gray-400 text-sm">يفكر</span>
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-2 h-2 bg-[var(--color-accent)] rounded-full inline-block"
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
      />
    ))}
  </div>
);

export default function AIOpponent({ difficulty = 'medium', isThinking = false, score = 0 }) {
  return (
    <motion.div
      dir="rtl"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-dark)] rounded-2xl p-4 border border-[var(--color-accent)]/20 shadow-lg"
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <motion.div
          className="relative"
          animate={isThinking ? { rotate: [0, -5, 5, 0] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-warning)] flex items-center justify-center shadow-lg">
            <FaRobot className="text-2xl text-[var(--color-primary)]" />
          </div>
          {isThinking && (
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            />
          )}
        </motion.div>

        {/* Info */}
        <div className="flex-1">
          <h4 className="text-white font-bold text-lg">{AI_NAMES[difficulty]}</h4>
          <span
            className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold border ${DIFFICULTY_COLORS[difficulty]}`}
          >
            {DIFFICULTY_LABELS[difficulty]}
          </span>
          {isThinking && <ThinkingDots />}
        </div>

        {/* Score */}
        <div className="text-center">
          <div className="text-xs text-gray-400">النقاط</div>
          <motion.div
            className="text-2xl font-black text-[var(--color-accent)]"
            key={score}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
          >
            {score}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
