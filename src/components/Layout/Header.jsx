import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUser,
  FaLock,
  FaGamepad,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaDoorOpen,
  FaTrophy,
  FaBrain,
  FaGavel,
  FaFutbol,
  FaPaintBrush,
  FaTheaterMasks,
  FaUserSecret,
  FaChevronDown,
} from 'react-icons/fa';
import useAuthStore from '../../stores/authStore';
import useSocketStore from '../../stores/socketStore';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modesDropdown, setModesDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const currentRoom = useSocketStore((s) => s.currentRoom);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const navModes = [
    { name: 'البطولة الكبرى 🏆', path: '/tournament', icon: FaTrophy, color: 'text-amber-400', desc: '5 جولات وتتويج بطل' },
    { name: 'لوحة الـ 6 فئات', path: '/game', icon: FaBrain, color: 'text-emerald-400', desc: '18 سؤالاً وخطوط نجاة' },
    { name: 'مزاد كرة القدم', path: '/auction', icon: FaGavel, color: 'text-orange-400', desc: 'مزايدة وتحدي 45 ثانية' },
    { name: 'تحدي تشكيلة', path: '/lineup', icon: FaFutbol, color: 'text-green-400', desc: '11 ضد 11 والنادي السابق' },
    { name: 'سكتش ومعلق', path: '/sketch', icon: FaPaintBrush, color: 'text-cyan-400', desc: 'أهداف مرسومة وتعليق صوتي' },
    { name: 'تمثيل وتحدي', path: '/charades', icon: FaTheaterMasks, color: 'text-pink-400', desc: 'شخصيات بدون كلام' },
    { name: 'لعبة مافيا', path: '/mafia', icon: FaUserSecret, color: 'text-purple-400', desc: 'أدوار سرية وتصويت' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#16213e]/90 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0" onClick={() => setMenuOpen(false)}>
          <motion.div
            whileHover={{ rotate: 12, scale: 1.1 }}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-md shadow-amber-500/20"
          >
            <FaGamepad className="text-xl text-slate-900" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-lg font-black text-white group-hover:text-amber-400 transition-colors leading-tight">
              حخلص عليك
            </span>
            <span className="text-[10px] text-amber-400/80 font-medium">المنصة التنافسية الكبرى</span>
          </div>
        </Link>

        {/* Desktop Quick Nav Links */}
        <nav className="hidden lg:flex items-center gap-1.5 flex-1 justify-center max-w-2xl">
          <Link
            to="/tournament"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              location.pathname === '/tournament'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30'
            }`}
          >
            <FaTrophy className="text-sm" />
            <span>البطولة الكبرى</span>
          </Link>

          <Link
            to="/game"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              location.pathname === '/game'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
          >
            <FaBrain className="text-xs text-emerald-400" />
            <span>لوحة الفئات</span>
          </Link>

          <Link
            to="/auction"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              location.pathname === '/auction'
                ? 'bg-orange-500 text-white font-bold'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
          >
            <FaGavel className="text-xs text-orange-400" />
            <span>المزاد</span>
          </Link>

          <Link
            to="/lineup"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              location.pathname === '/lineup'
                ? 'bg-green-500 text-slate-950 font-bold'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
          >
            <FaFutbol className="text-xs text-green-400" />
            <span>تشكيلة</span>
          </Link>

          {/* Modes Dropdown */}
          <div className="relative">
            <button
              onClick={() => setModesDropdown(!modesDropdown)}
              onBlur={() => setTimeout(() => setModesDropdown(false), 200)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white/80 hover:text-white hover:bg-white/5 transition-all"
            >
              <span>المزيد</span>
              <FaChevronDown className="text-[10px]" />
            </button>

            <AnimatePresence>
              {modesDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-slate-900/95 border border-white/10 shadow-2xl p-2 z-50 backdrop-blur-xl"
                >
                  <Link
                    to="/sketch"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-white/5 text-white/80 hover:text-white transition-all"
                  >
                    <FaPaintBrush className="text-cyan-400" />
                    <div>
                      <div className="font-semibold text-white">سكتش ومعلق</div>
                      <div className="text-[10px] text-white/50">أهداف مرسومة وأصوات معلقين</div>
                    </div>
                  </Link>
                  <Link
                    to="/charades"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-white/5 text-white/80 hover:text-white transition-all"
                  >
                    <FaTheaterMasks className="text-pink-400" />
                    <div>
                      <div className="font-semibold text-white">تمثيل وتحدي</div>
                      <div className="text-[10px] text-white/50">شخصيات بدون كلام وكلمات ممنوعة</div>
                    </div>
                  </Link>
                  <Link
                    to="/mafia"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-white/5 text-white/80 hover:text-white transition-all"
                  >
                    <FaUserSecret className="text-purple-400" />
                    <div>
                      <div className="font-semibold text-white">لعبة مافيا</div>
                      <div className="text-[10px] text-white/50">أدوار سرية وتصويت ليلي ونهاري</div>
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Room Indicator & User Profile */}
        <div className="hidden sm:flex items-center gap-3">
          {currentRoom && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30"
            >
              <FaDoorOpen className="text-emerald-400 text-xs" />
              <span className="text-xs text-emerald-400 font-bold">
                الغرفة: {currentRoom}
              </span>
            </motion.div>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/90 transition-all text-xs border border-white/5"
              >
                <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-900 font-black flex items-center justify-center text-[10px] overflow-hidden">
                  {user?.avatar && user.avatar.startsWith('http') ? (
                    <img src={user.avatar} alt={user.nickname} className="w-full h-full object-cover" />
                  ) : (
                    user?.avatar || (user?.nickname ? user.nickname.charAt(0) : '👤')
                  )}
                </div>
                <span className="font-semibold">{user?.nickname || 'الملف الشخصي'}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/5 transition-all text-xs"
                title="تسجيل الخروج"
              >
                <FaSignOutAlt />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 hover:brightness-110 transition-all"
            >
              تسجيل الدخول
            </Link>
          )}

          <Link
            to="/admin"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-amber-400 hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
            title="لوحة الإدارة (الرمز mm432199)"
          >
            <FaLock className="text-xs" />
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-white/80 hover:bg-white/5 transition-all"
        >
          {menuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden bg-slate-900/95 border-t border-white/10 backdrop-blur-xl"
          >
            <div className="px-4 py-4 flex flex-col gap-2">
              {currentRoom && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <FaDoorOpen className="text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-bold">الغرفة الحالية: {currentRoom}</span>
                </div>
              )}

              {/* Tournament highlight */}
              <Link
                to="/tournament"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-600/10 border border-amber-500/40"
              >
                <div className="flex items-center gap-2.5">
                  <FaTrophy className="text-amber-400" />
                  <div>
                    <div className="text-sm font-bold text-amber-300">بطولة حخلص عليك الكبرى 🏆</div>
                    <div className="text-[11px] text-white/60">5 جولات متكاملة وتتويج بطل الفرق</div>
                  </div>
                </div>
                <span className="text-[10px] bg-amber-500 text-slate-900 font-black px-2 py-0.5 rounded">موصى به</span>
              </Link>

              {/* Grid of game modes */}
              <div className="grid grid-cols-2 gap-2 my-1">
                {navModes.slice(1).map((m) => {
                  const Icon = m.icon;
                  return (
                    <Link
                      key={m.path}
                      to={m.path}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/90 text-xs"
                    >
                      <Icon className={m.color} />
                      <span className="font-semibold">{m.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Auth and Admin */}
              <div className="border-t border-white/10 pt-3 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 text-white/90 text-xs"
                    >
                      <FaUser className="text-amber-400" />
                      <span>{user?.nickname || 'الملف الشخصي'} ({user?.phone})</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-red-400 hover:bg-white/5 text-xs text-right"
                    >
                      <FaSignOutAlt />
                      <span>تسجيل الخروج</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="p-3 text-center rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                  >
                    تسجيل الدخول بحساب Google
                  </Link>
                )}
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/40 hover:text-amber-400 text-xs"
                >
                  <FaLock />
                  <span>لوحة التحكم والإدارة (Password: mm432199)</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}