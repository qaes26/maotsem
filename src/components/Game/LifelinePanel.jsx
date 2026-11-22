import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FaBomb, FaPhoneAlt, FaSyncAlt, FaCrosshairs, FaChevronDown, FaTimes } from 'react-icons/fa';

const LIFELINES = [
  {
    id: 'two-answers',
    name: 'جوابين',
    emoji: '🎯',
    icon: FaCrosshairs,
    description: 'لديك محاولتان للإجابة على السؤال بدلاً من واحدة',
    color: 'from-blue-500 to-blue-700',
    glowColor: 'shadow-blue-500/40',
    bgColor: 'bg-blue-500/10 border-blue-500/40',
  },
  {
    id: 'pit',
    name: 'الحفرة',
    emoji: '⬇️',
    icon: FaChevronDown,
    description: 'إذا أجبت صح: تكسب النقاط + تخصم من الخصم نفس القيمة',
    color: 'from-red-500 to-red-700',
    glowColor: 'shadow-red-500/40',
    bgColor: 'bg-red-500/10 border-red-500/40',
  },
  {
    id: 'double',
    name: 'خاصية الدبل',
    emoji: '✖️2',
    icon: FaTimes,
    description: 'مضاعفة نقاط السؤال الحالي',
    color: 'from-[var(--color-accent)] to-yellow-600',
    glowColor: 'shadow-yellow-500/40',
    bgColor: 'bg-yellow-500/10 border-yellow-500/40',
  },
  {
    id: 'call-friend',
    name: 'اتصال بصديق',
    emoji: '📞',
    icon: FaPhoneAlt,
    description: 'اتصل بصديق للمساعدة - لديك 30 ثانية',
    color: 'from-green-500 to-green-700',
    glowColor: 'shadow-green-500/40',
    bgColor: 'bg-green-500/10 border-green-500/40',
  },
  {
    id: 'swap',
    name: 'بدل السؤال',
    emoji: '🔄',
    icon: FaSyncAlt,
    description: 'استبدل السؤال الحالي بسؤال آخر من نفس الفئة',
    color: 'from-purple-500 to-purple-700',
    glowColor: 'shadow-purple-500/40',
    bgColor: 'bg-purple-500/10 border-purple-500/40',
  },
  {
    id: 'bomb',
    name: 'القنبلة',
    emoji: '💣',
    icon: FaBomb,
    description: 'حظ! 50% فرصة +400 نقطة أو -400 نقطة',
    color: 'from-orange-500 to-orange-700',
    glowColor: 'shadow-orange-500/40',
    bgColor: 'bg-orange-500/10 border-orange-500/40',
  },
];

// Selection mode: pick 3 of 6 before game
export function LifelineSelector({ selectedLifelines = [], onToggle, maxSelections = 3 }) {
  return (
    <div dir="rtl" className="w-full">
      <h3 className="text-xl font-bold text-white mb-2 text-center">
        اختر {maxSelections} خطوط نجاة
      </h3>
      <p className="text-gray-400 text-sm text-center mb-4">
        تم اختيار {selectedLifelines.length} من {maxSelections}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {LIFELINES.map((lifeline) => {
          const isSelected = selectedLifelines.includes(lifeline.id);
          const isDisabled = !isSelected && selectedLifelines.length >= maxSelections;

          return (
            <motion.button
              key={lifeline.id}
              onClick={() => !isDisabled && onToggle?.(lifeline.id)}
              className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                isSelected
                  ? `${lifeline.bgColor} border-opacity-100 shadow-lg ${lifeline.glowColor}`
                  : isDisabled
                  ? 'bg-gray-800/30 border-gray-700 opacity-40 cursor-not-allowed'
                  : 'bg-[var(--color-surface)]/50 border-gray-600 hover:border-gray-400'
              }`}
              whileHover={!isDisabled ? { scale: 1.05 } : {}}
              whileTap={!isDisabled ? { scale: 0.95 } : {}}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs"
                >
                  ✓
                </motion.div>
              )}

              <div className="text-3xl mb-2">{lifeline.emoji}</div>
              <div className="text-white font-bold text-sm">{lifeline.name}</div>
              <div className="text-gray-400 text-xs mt-1 leading-relaxed">{lifeline.description}</div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// In-game display: show team's 3 chosen lifelines
export default function LifelinePanel({
  teamLifelines = [],
  usedLifelines = [],
  activeLifeline = null,
  onUseLifeline,
  disabled = false,
}) {
  const [tooltip, setTooltip] = useState(null);

  const availableLifelines = LIFELINES.filter((l) => teamLifelines.includes(l.id));

  return (
    <div dir="rtl" className="flex items-center gap-2 md:gap-3 justify-center flex-wrap">
      {availableLifelines.map((lifeline) => {
        const isUsed = usedLifelines.includes(lifeline.id);
        const isActive = activeLifeline === lifeline.id;

        return (
          <div key={lifeline.id} className="relative">
            <motion.button
              className={`relative w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${
                isUsed
                  ? 'bg-gray-800/50 border-gray-700 opacity-30 cursor-not-allowed line-through'
                  : isActive
                  ? `bg-gradient-to-br ${lifeline.color} border-white shadow-xl ${lifeline.glowColor}`
                  : `bg-[var(--color-surface)]/80 border-gray-600 hover:border-[var(--color-accent)] hover:shadow-lg cursor-pointer`
              }`}
              onClick={() => !isUsed && !disabled && onUseLifeline?.(lifeline.id)}
              onMouseEnter={() => setTooltip(lifeline.id)}
              onMouseLeave={() => setTooltip(null)}
              disabled={isUsed || disabled}
              animate={
                isActive
                  ? { scale: [1, 1.1, 1], boxShadow: ['0 0 0px rgba(255,255,255,0)', '0 0 20px rgba(255,255,255,0.3)', '0 0 0px rgba(255,255,255,0)'] }
                  : {}
              }
              transition={isActive ? { repeat: Infinity, duration: 1 } : {}}
              whileHover={!isUsed && !disabled ? { scale: 1.1 } : {}}
              whileTap={!isUsed && !disabled ? { scale: 0.9 } : {}}
            >
              <span className={`text-2xl ${isUsed ? 'grayscale' : ''}`}>{lifeline.emoji}</span>
              {isUsed && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-0.5 bg-red-500 rotate-45 absolute" />
                </div>
              )}
            </motion.button>

            {/* Tooltip */}
            <AnimatePresence>
              {tooltip === lifeline.id && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 bg-gray-900 border border-gray-600 rounded-lg p-2 shadow-xl z-50 whitespace-nowrap"
                >
                  <div className="text-white text-xs font-bold">{lifeline.name}</div>
                  <div className="text-gray-400 text-xs">{lifeline.description}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {availableLifelines.length === 0 && (
        <p className="text-gray-500 text-sm">لا توجد خطوط نجاة</p>
      )}
    </div>
  );
}
