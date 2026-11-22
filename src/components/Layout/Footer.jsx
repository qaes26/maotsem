import React from 'react';
import { FaHeart } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="py-4 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <p className="text-sm text-white/30 flex items-center justify-center gap-1">
        صُنع بـ <FaHeart className="text-[var(--color-danger)] text-xs" /> لمحبي المسابقات
      </p>
      <p className="text-xs text-white/20 mt-1">
        حخلص عليك © {new Date().getFullYear()}
      </p>
    </footer>
  );
}
