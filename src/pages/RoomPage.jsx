import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUsers,
  FaPlus,
  FaSignInAlt,
  FaCopy,
  FaCheck,
  FaCrown,
  FaPaperPlane,
  FaPlay,
  FaHome,
  FaShieldAlt,
  FaSmile,
} from 'react-icons/fa';
import useAuthStore from '../stores/authStore';
import useSocketStore from '../stores/socketStore';
import { supabase, isSupabaseConfigured } from '../config/supabase';

export default function RoomPage() {
  const navigate = useNavigate();
  const { code: urlCode } = useParams();

  const user = useAuthStore((s) => s.user);
  const {
    socket,
    isConnected,
    currentRoom,
    roomData,
    messages,
    connect,
    joinRoom,
    leaveRoom,
    sendMessage,
    createRoom,
  } = useSocketStore();

  const [activeTab, setActiveTab] = useState(urlCode ? 'join' : 'create');
  const [inputCode, setInputCode] = useState(urlCode || '');
  const [chatInput, setChatInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Local fallback room data if socket is not connected or in standalone mode
  const [localRoom, setLocalRoom] = useState(null);

  // Initialize connection
  useEffect(() => {
    connect();
    if (urlCode) {
      setInputCode(urlCode);
    }
  }, [urlCode]);

  // Handle Create Room (Backend + Supabase Realtime Fallback)
  const handleCreate = async () => {
    setErrorMsg('');
    const hostPlayer = {
      id: user?.id || 'host-' + Date.now().toString(36),
      nickname: user?.nickname || 'المضيف',
      avatar: user?.avatar || '👑',
    };

    // 1. Try backend API first
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: hostPlayer.id,
          nickname: hostPlayer.nickname,
          avatar: hostPlayer.avatar,
          mode: 'team',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.room) {
          setLocalRoom(data.room);
          joinRoom(data.room.code, hostPlayer);
          return;
        }
      }
    } catch {}

    // 2. Direct Supabase Room Creation (Works 100% on Netlify)
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const roomObj = {
      code: randomCode,
      host: hostPlayer,
      players: [hostPlayer],
      teams: {
        teamA: [hostPlayer],
        teamB: [],
      },
      status: 'waiting',
      mode: 'team',
      chat: [],
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('rooms').insert([{
          code: randomCode,
          mode: 'team',
          status: 'waiting',
          settings: roomObj,
        }]);
      } catch (err) {
        console.warn('Supabase room insert warning:', err);
      }
    }

    setLocalRoom(roomObj);
    joinRoom(randomCode, hostPlayer);
  };

  // Handle Join Room (Backend + Supabase Realtime Fallback)
  const handleJoin = async () => {
    setErrorMsg('');
    const code = inputCode.trim().toUpperCase();
    if (!code) {
      setErrorMsg('يرجى إدخال رمز الغرفة المكون من 6 خانات');
      return;
    }

    const joiningPlayer = {
      id: user?.id || 'player-' + Date.now().toString(36),
      nickname: user?.nickname || 'لاعب جديد',
      avatar: user?.avatar || '🦁',
    };

    // 1. Try backend API first
    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          userId: joiningPlayer.id,
          nickname: joiningPlayer.nickname,
          avatar: joiningPlayer.avatar,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.room) {
          setLocalRoom(data.room);
          joinRoom(data.room.code, joiningPlayer);
          return;
        } else {
          setErrorMsg(data.message || 'الغرفة غير موجودة');
          return;
        }
      }
    } catch {}

    // 2. Direct Supabase Room Lookup (Works 100% on Netlify)
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: roomRow, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('code', code)
          .single();

        if (error || !roomRow) {
          setErrorMsg('الغرفة غير موجودة، يرجى التأكد من الرمز');
          return;
        }

        const roomObj = roomRow.settings || {
          code,
          host: { nickname: 'المضيف' },
          players: [],
          teams: { teamA: [], teamB: [] },
          chat: [],
        };

        if (!roomObj.players.some((p) => p.id === joiningPlayer.id)) {
          roomObj.players.push(joiningPlayer);
          if (roomObj.teams.teamA.length <= roomObj.teams.teamB.length) {
            roomObj.teams.teamA.push(joiningPlayer);
          } else {
            roomObj.teams.teamB.push(joiningPlayer);
          }
          await supabase.from('rooms').update({ settings: roomObj }).eq('code', code);
        }

        setLocalRoom(roomObj);
        joinRoom(code, joiningPlayer);
        return;
      } catch (err) {
        console.error('Supabase join room error:', err);
      }
    }

    setErrorMsg('تعذر العثور على الغرفة أو الاتصال بها');
  };

  const handleCopyCode = () => {
    const codeToCopy = roomData?.code || localRoom?.code;
    if (codeToCopy) {
      navigator.clipboard.writeText(codeToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendChat = (e) => {
    e?.preventDefault();
    if (chatInput.trim()) {
      const text = chatInput.trim();
      const sender = user?.nickname || 'أنت';
      sendMessage(text, sender);
      if (localRoom) {
        setLocalRoom((prev) => ({
          ...prev,
          chat: [...(prev.chat || []), { sender, text }],
        }));
      }
      setChatInput('');
    }
  };

  const handleSendEmoji = (emoji) => {
    const sender = user?.nickname || 'أنت';
    sendMessage(emoji, sender);
    if (localRoom) {
      setLocalRoom((prev) => ({
        ...prev,
        chat: [...(prev.chat || []), { sender, text: emoji }],
      }));
    }
  };

  const handleStartGame = () => {
    const code = activeRoomData?.code;
    const { startGame } = useSocketStore.getState();
    startGame(code);
    navigate('/game');
  };

  const activeRoomData = roomData || localRoom;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-2xl shadow-lg border border-rose-500/30">
            <FaUsers />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">الغرف الجماعية (أونلاين)</h1>
            <p className="text-xs text-white/50">أنشئ غرفة أو انضم لغرفة أصدقائك وتنافسوا في بث مباشر متزامن</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold flex items-center gap-2 border border-white/10"
        >
          <FaHome />
          <span>الرئيسية</span>
        </button>
      </div>

      {!activeRoomData ? (
        /* Create / Join Tabs */
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex bg-[var(--color-surface)] p-1.5 rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                activeTab === 'create'
                  ? 'gradient-accent text-[var(--color-primary)] shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <FaPlus />
              <span>إنشاء غرفة جديدة</span>
            </button>

            <button
              onClick={() => setActiveTab('join')}
              className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                activeTab === 'join'
                  ? 'gradient-accent text-[var(--color-primary)] shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <FaSignInAlt />
              <span>الانضمام برمز</span>
            </button>
          </div>

          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-2xl">
            {activeTab === 'create' ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl gradient-accent golden-glow mx-auto flex items-center justify-center text-3xl text-[var(--color-primary)]">
                  <FaCrown />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">إنشاء غرفة لعب خاصة</h3>
                  <p className="text-xs text-white/60 mt-1">
                    سيتم إنشاء كود فريد يمكنك مشاركته مع أصدقائك للانضمام فوراً من أي هاتف أو كمبيوتر
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-500/20 text-red-400 text-xs font-bold">
                    {errorMsg}
                  </div>
                )}

                <button
                  onClick={handleCreate}
                  className="w-full py-4 rounded-2xl font-black text-sm gradient-accent text-[var(--color-primary)] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <FaPlus />
                  <span>تأكيد وإنشاء الغرفة الآن</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-black text-white">الانضمام إلى غرفة صديق</h3>
                  <p className="text-xs text-white/60 mt-1">أدخل رمز الغرفة المكون من 6 خانات:</p>
                </div>

                <input
                  type="text"
                  maxLength={6}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="مثال: AB12CD"
                  className="w-full text-center py-4 bg-[var(--color-surface)] border-2 border-white/20 rounded-2xl text-2xl font-mono font-bold tracking-widest text-white focus:outline-none focus:border-[var(--color-accent)]"
                />

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-500/20 text-red-400 text-xs font-bold text-center">
                    {errorMsg}
                  </div>
                )}

                <button
                  onClick={handleJoin}
                  className="w-full py-4 rounded-2xl font-black text-sm bg-rose-500 hover:bg-rose-400 text-white shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <FaSignInAlt />
                  <span>انضمام إلى الغرفة</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Inside Room Lobby */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Lobby Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Room Code Banner */}
            <div className="glass-card rounded-3xl p-6 border-2 border-[var(--color-accent)]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-white/60 font-bold block mb-1">رمز الغرفة للمشاركة:</span>
                <div className="text-3xl font-black font-mono tracking-widest text-[var(--color-accent)]">
                  {activeRoomData.code}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 transition-all border border-white/10"
                >
                  {copied ? <FaCheck className="text-emerald-400" /> : <FaCopy />}
                  <span>{copied ? 'تم النسخ!' : 'نسخ الرمز'}</span>
                </button>

                <button
                  onClick={() => {
                    leaveRoom();
                    setLocalRoom(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all border border-red-500/30"
                >
                  مغادرة الغرفة
                </button>
              </div>
            </div>

            {/* Teams Division */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Team A */}
              <div className="p-5 rounded-3xl glass-card border border-[var(--color-accent)]/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="font-bold text-sm text-[var(--color-accent)]">الفريق الأول (Team A)</span>
                  <span className="text-xs text-white/40">
                    {activeRoomData.teams?.teamA?.length || 1} لاعبين
                  </span>
                </div>
                <div className="space-y-2">
                  {(activeRoomData.teams?.teamA || [user]).map((p, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs text-white"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{p.avatar || '🦁'}</span>
                        <span className="font-bold">{p.nickname || 'لاعب'}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                        جاهز
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team B */}
              <div className="p-5 rounded-3xl glass-card border border-blue-500/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="font-bold text-sm text-blue-400">الفريق الثاني (Team B)</span>
                  <span className="text-xs text-white/40">
                    {activeRoomData.teams?.teamB?.length || 0} لاعبين
                  </span>
                </div>
                <div className="space-y-2">
                  {(activeRoomData.teams?.teamB || []).map((p, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs text-white"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{p.avatar || '🦅'}</span>
                        <span className="font-bold">{p.nickname || 'لاعب'}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                        جاهز
                      </span>
                    </div>
                  ))}
                  {(!activeRoomData.teams?.teamB || activeRoomData.teams?.teamB.length === 0) && (
                    <div className="p-4 rounded-2xl border border-dashed border-white/10 text-center text-xs text-white/40">
                      بانتظار انضمام الخصم...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Launch Game Button */}
            <button
              onClick={handleStartGame}
              className="w-full py-4 rounded-2xl font-black text-sm gradient-accent text-[var(--color-primary)] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <FaPlay className="text-xs" />
              <span>بدء اللعبة واختيار الفئات الآن</span>
            </button>
          </div>

          {/* Chat & Reactions Column */}
          <div className="glass-card rounded-3xl p-5 border border-white/10 flex flex-col justify-between h-[500px]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <span className="font-bold text-xs text-white">دردشة وتفاعلات الغرفة</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              {/* Quick Emojis */}
              <div className="flex justify-between gap-1 mb-3">
                {['🔥', '⚽', '👏', '🎯', '😂', '👑'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleSendEmoji(emoji)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-lg transition-all"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Messages list */}
              <div className="space-y-2 overflow-y-auto max-h-[320px] pr-1">
                {(activeRoomData.chat || []).map((msg, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs">
                    <span className="font-bold text-[var(--color-accent)] block mb-0.5">
                      {msg.sender}:
                    </span>
                    <span className="text-white/80">{msg.text}</span>
                  </div>
                ))}
                {(!activeRoomData.chat || activeRoomData.chat.length === 0) && (
                  <div className="text-center text-xs text-white/30 py-10">
                    لا توجد رسائل بعد... أرسل رسالة ترحيب أو تفاعلاً!
                  </div>
                )}
              </div>
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="flex gap-2 pt-3 border-t border-white/10">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="اكتب رسالة..."
                className="flex-1 bg-[var(--color-surface)] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl gradient-accent text-[var(--color-primary)] font-bold text-xs"
              >
                <FaPaperPlane />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

