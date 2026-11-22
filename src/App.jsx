import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import useThemeStore from './stores/themeStore';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Toast from './components/shared/Toast';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const RoomPage = lazy(() => import('./pages/RoomPage'));
const GameBoardPage = lazy(() => import('./pages/GameBoardPage'));
const LineupPage = lazy(() => import('./pages/LineupPage'));
const MafiaPage = lazy(() => import('./pages/MafiaPage'));
const AuctionPage = lazy(() => import('./pages/AuctionPage'));
const SketchPage = lazy(() => import('./pages/SketchPage'));
const CharadesPage = lazy(() => import('./pages/CharadesPage'));
const TournamentPage = lazy(() => import('./pages/TournamentPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Loading fallback
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg text-white/60">جاري التحميل...</p>
      </div>
    </div>
  );
}

export default function App() {
  const loadUser = useAuthStore((s) => s.loadUser);
  const loadTheme = useThemeStore((s) => s.loadTheme);

  useEffect(() => {
    loadUser();
    loadTheme();
  }, []);

  return (
    <div className="min-h-screen flex flex-col gradient-bg">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/room/:code?"
              element={
                <ProtectedRoute>
                  <RoomPage />
                </ProtectedRoute>
              }
            />
            <Route path="/game" element={<GameBoardPage />} />
            <Route path="/lineup" element={<LineupPage />} />
            <Route path="/mafia" element={<MafiaPage />} />
            <Route path="/auction" element={<AuctionPage />} />
            <Route path="/sketch" element={<SketchPage />} />
            <Route path="/charades" element={<CharadesPage />} />
            <Route path="/tournament" element={<TournamentPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <Toast />
    </div>
  );
}
