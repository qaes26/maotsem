import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function Timer({ duration = 30, onTimeUp, isRunning = true, size = 80 }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const intervalRef = useRef(null);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (!isRunning) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning, onTimeUp]);

  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / duration;
  const dashOffset = circumference * (1 - progress);

  const getColor = () => {
    if (progress > 0.5) return 'var(--color-success)';
    if (progress > 0.25) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="4"
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transition={{ duration: 0.5 }}
        />
      </svg>

      {/* Time text */}
      <motion.span
        key={timeLeft}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        className="absolute text-lg font-bold"
        style={{ color: getColor() }}
      >
        {timeLeft}
      </motion.span>

      {/* Urgency pulse */}
      {timeLeft <= 5 && timeLeft > 0 && (
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute inset-0 rounded-full"
          style={{ border: `2px solid ${getColor()}` }}
        />
      )}
    </div>
  );
}
