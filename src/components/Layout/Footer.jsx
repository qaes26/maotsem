import React from 'react';
import { FaHeart } from 'react-icons/fa';
import useThemeStore from '../../stores/themeStore';

export default function Footer() {
  const theme = useThemeStore((s) => s.theme);

  return (
    <footer className="py-4 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <p className="text-sm text-white/30 flex items-center justify-center gap-1">
        {theme?.footerText || 'صُنع لمحبي المسابقات'} <FaHeart className="text-[var(--color-danger)] text-xs" />
      </p>
      <p className="text-xs text-white/20 mt-1">
        {theme?.siteName || 'هخلص عليك'} © {new Date().getFullYear()}
      </p>
    </footer>
  );
}
