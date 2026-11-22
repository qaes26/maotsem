import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

// Global toast state (simple event-based)
let toastListeners = [];
let toastId = 0;

export function showToast(message, type = 'info', duration = 3000) {
  const id = ++toastId;
  toastListeners.forEach((fn) => fn({ id, message, type, duration }));
  return id;
}

const icons = {
  success: <FaCheckCircle />,
  error: <FaTimesCircle />,
  info: <FaInfoCircle />,
  warning: <FaExclamationTriangle />,
};

const colors = {
  success: { bg: 'rgba(0, 184, 148, 0.15)', border: 'rgba(0, 184, 148, 0.4)', text: '#00b894' },
  error: { bg: 'rgba(231, 76, 60, 0.15)', border: 'rgba(231, 76, 60, 0.4)', text: '#e74c3c' },
  info: { bg: 'rgba(15, 52, 96, 0.8)', border: 'rgba(226, 183, 20, 0.3)', text: '#e2b714' },
  warning: { bg: 'rgba(243, 156, 18, 0.15)', border: 'rgba(243, 156, 18, 0.4)', text: '#f39c12' },
};

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const c = colors[toast.type] || colors.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="flex items-center gap-3 px-5 py-3 rounded-xl backdrop-blur-md shadow-lg max-w-sm"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <span style={{ color: c.text }} className="text-lg flex-shrink-0">
        {icons[toast.type]}
      </span>
      <p className="text-sm font-medium text-white">{toast.message}</p>
    </motion.div>
  );
}

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (toast) => {
      setToasts((prev) => [...prev.slice(-4), toast]); // keep max 5
    };
    toastListeners.push(handler);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== handler);
    };
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="toast-container">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
