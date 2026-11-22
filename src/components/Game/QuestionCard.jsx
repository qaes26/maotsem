import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FaCheck, FaTimes, FaStar } from 'react-icons/fa';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const OPTION_COLORS = [
  'from-blue-600/30 to-blue-800/30 border-blue-500/40 hover:border-blue-400',
  'from-green-600/30 to-green-800/30 border-green-500/40 hover:border-green-400',
  'from-purple-600/30 to-purple-800/30 border-purple-500/40 hover:border-purple-400',
  'from-orange-600/30 to-orange-800/30 border-orange-500/40 hover:border-orange-400',
];

export default function QuestionCard({
  question,
  options = [],
  correctAnswer,
  selectedAnswer,
  showAnswer = false,
  points = 200,
  category = '',
  lifelineActive = null,
  hiddenOptions = [],
  onSelectAnswer,
  disabled = false,
}) {
  const [hoveredOption, setHoveredOption] = useState(null);

  const getOptionState = (index) => {
    if (!showAnswer) {
      if (selectedAnswer === index) return 'selected';
      if (hiddenOptions.includes(index)) return 'hidden';
      return 'default';
    }
    if (index === correctAnswer) return 'correct';
    if (selectedAnswer === index && index !== correctAnswer) return 'incorrect';
    return 'revealed';
  };

  const getOptionClasses = (index) => {
    const state = getOptionState(index);
    const base =
      'relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer select-none';

    switch (state) {
      case 'selected':
        return `${base} bg-[var(--color-accent)]/20 border-[var(--color-accent)] shadow-lg shadow-[var(--color-accent)]/20`;
      case 'correct':
        return `${base} bg-green-500/20 border-green-400 shadow-lg shadow-green-500/30`;
      case 'incorrect':
        return `${base} bg-red-500/20 border-red-400 shadow-lg shadow-red-500/30 animate-shake`;
      case 'hidden':
        return `${base} opacity-20 pointer-events-none bg-gray-800/50 border-gray-700`;
      case 'revealed':
        return `${base} opacity-50 bg-gray-800/30 border-gray-700`;
      default:
        return `${base} bg-gradient-to-br ${OPTION_COLORS[index]} hover:shadow-lg`;
    }
  };

  return (
    <div dir="rtl" className="w-full max-w-2xl mx-auto">
      {/* Category & Points Badge */}
      <div className="flex items-center justify-between mb-4">
        {category && (
          <span className="px-4 py-1.5 bg-[var(--color-surface)]/80 rounded-full text-sm text-gray-300 border border-gray-600">
            {category}
          </span>
        )}
        <motion.span
          className="px-4 py-1.5 bg-gradient-to-l from-[var(--color-accent)] to-[var(--color-warning)] rounded-full text-sm font-bold text-[var(--color-primary)] flex items-center gap-1"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <FaStar className="text-xs" />
          {points} نقطة
        </motion.span>
      </div>

      {/* Lifeline indicator */}
      <AnimatePresence>
        {lifelineActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-300 text-sm text-center"
          >
            {lifelineActive === 'two-answers' && '🎯 جوابين - لديك محاولتان'}
            {lifelineActive === 'double' && '✖️2 خاصية الدبل - النقاط مضاعفة'}
            {lifelineActive === 'pit' && '⬇️ الحفرة - صح = +نقاط للك & -نقاط للخصم'}
            {lifelineActive === 'call-friend' && '📞 اتصال بصديق'}
            {lifelineActive === 'swap' && '🔄 تم تبديل السؤال'}
            {lifelineActive === 'bomb' && '💣 القنبلة - حظ أو نحس!'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Text */}
      <motion.div
        className="bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-dark)] rounded-2xl p-6 md:p-8 mb-6 border border-[var(--color-accent)]/20 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-xl md:text-2xl font-bold text-white text-center leading-relaxed">
          {question}
        </p>
      </motion.div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((option, index) => (
          <motion.button
            key={index}
            className={getOptionClasses(index)}
            onClick={() => !disabled && !showAnswer && !hiddenOptions.includes(index) && onSelectAnswer?.(index)}
            onMouseEnter={() => setHoveredOption(index)}
            onMouseLeave={() => setHoveredOption(null)}
            initial={{ opacity: 0, x: index % 2 === 0 ? 30 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={!disabled && !showAnswer ? { scale: 1.02 } : {}}
            whileTap={!disabled && !showAnswer ? { scale: 0.98 } : {}}
            disabled={disabled || showAnswer || hiddenOptions.includes(index)}
          >
            {/* Label */}
            <span
              className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shrink-0 ${
                getOptionState(index) === 'correct'
                  ? 'bg-green-500 text-white'
                  : getOptionState(index) === 'incorrect'
                  ? 'bg-red-500 text-white'
                  : 'bg-white/10 text-white'
              }`}
            >
              {getOptionState(index) === 'correct' ? (
                <FaCheck />
              ) : getOptionState(index) === 'incorrect' ? (
                <FaTimes />
              ) : (
                OPTION_LABELS[index]
              )}
            </span>

            {/* Option Text */}
            <span className="text-white text-base md:text-lg font-medium flex-1 text-right">
              {option}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Answer Feedback */}
      <AnimatePresence>
        {showAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-4 p-4 rounded-xl text-center font-bold text-lg ${
              selectedAnswer === correctAnswer
                ? 'bg-green-500/20 border border-green-400/40 text-green-300'
                : 'bg-red-500/20 border border-red-400/40 text-red-300'
            }`}
          >
            {selectedAnswer === correctAnswer ? (
              <span>✅ إجابة صحيحة! +{points} نقطة</span>
            ) : (
              <span>❌ إجابة خاطئة! الإجابة الصحيحة: {options[correctAnswer]}</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
