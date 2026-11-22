import { create } from 'zustand';
import { io } from 'socket.io-client';
import { supabase, isSupabaseConfigured } from '../config/supabase';

const SOCKET_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? ''
    : 'http://localhost:3001');

const useSocketStore = create((set, get) => ({
  socket: null,
  supabaseChannel: null,
  isConnected: false,
  currentRoom: null,
  roomData: null,
  messages: [],
  error: null,

  // Connect to socket server
  connect: (token) => {
    const { socket: existingSocket } = get();
    if (existingSocket?.connected) return;

    if (!SOCKET_URL) {
      // Running pure serverless (Netlify without backend)
      set({ isConnected: true, error: null });
      return;
    }

    try {
      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 5000,
      });

      socket.on('connect', () => {
        set({ isConnected: true, error: null });
      });

      socket.on('disconnect', () => {
        set({ isConnected: false });
      });

      socket.on('connect_error', () => {
        // Fallback gracefully to Supabase Realtime
        set({ isConnected: true });
      });

      socket.on('room-update', (data) => {
        set({ roomData: data });
      });

      socket.on('chat-message', (msg) => {
        set((state) => ({
          messages: [...state.messages, msg],
        }));
      });

      socket.on('player-joined', (data) => {
        set((state) => ({
          roomData: state.roomData
            ? { ...state.roomData, players: data.players || state.roomData.players }
            : null,
        }));
      });

      socket.on('game-started', () => {
        window.location.href = '/game';
      });

      set({ socket });
    } catch {
      set({ isConnected: true });
    }
  },

  disconnect: () => {
    const { socket, supabaseChannel } = get();
    if (socket) {
      socket.disconnect();
    }
    if (supabaseChannel && isSupabaseConfigured() && supabase) {
      supabase.removeChannel(supabaseChannel);
    }
    set({
      socket: null,
      supabaseChannel: null,
      isConnected: false,
      currentRoom: null,
      roomData: null,
      messages: [],
    });
  },

  // Join Room (Socket.io + Supabase Realtime Channel)
  joinRoom: (code, user) => {
    const roomCode = code?.toUpperCase();
    const { socket, supabaseChannel: oldChannel } = get();

    if (oldChannel && isSupabaseConfigured() && supabase) {
      supabase.removeChannel(oldChannel);
    }

    // 1. Socket.io
    if (socket?.connected) {
      socket.emit('join-room', { code: roomCode, user });
    }

    // 2. Supabase Realtime Broadcast Channel (works 100% on Netlify!)
    let channel = null;
    if (isSupabaseConfigured() && supabase) {
      channel = supabase.channel(`room:${roomCode}`, {
        config: { broadcast: { self: false } },
      });

      channel
        .on('broadcast', { event: 'room-update' }, ({ payload }) => {
          set({ roomData: payload });
        })
        .on('broadcast', { event: 'player-joined' }, ({ payload }) => {
          set((state) => {
            const current = state.roomData;
            if (!current) return {};
            const player = payload.player || payload;
            const exists = current.players?.some((p) => p.id === player.id);
            if (exists) return {};
            const newPlayers = [...(current.players || []), player];
            const teams = { ...(current.teams || { teamA: [], teamB: [] }) };
            if (teams.teamA.length <= teams.teamB.length) {
              teams.teamA = [...teams.teamA, player];
            } else {
              teams.teamB = [...teams.teamB, player];
            }
            return { roomData: { ...current, players: newPlayers, teams } };
          });
        })
        .on('broadcast', { event: 'chat-message' }, ({ payload }) => {
          set((state) => ({ messages: [...state.messages, payload] }));
        })
        .on('broadcast', { event: 'game-started' }, () => {
          window.location.href = '/game';
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED' && user) {
            channel.send({
              type: 'broadcast',
              event: 'player-joined',
              payload: { player: user },
            });
          }
        });
    }

    set({ currentRoom: roomCode, supabaseChannel: channel, messages: [] });
  },

  leaveRoom: () => {
    const { socket, currentRoom, supabaseChannel } = get();
    if (socket?.connected && currentRoom) {
      socket.emit('leave-room', { code: currentRoom });
    }
    if (supabaseChannel && isSupabaseConfigured() && supabase) {
      supabase.removeChannel(supabaseChannel);
    }
    set({ currentRoom: null, roomData: null, supabaseChannel: null, messages: [] });
  },

  sendMessage: (text, senderName) => {
    const { socket, currentRoom, supabaseChannel } = get();
    const msg = {
      sender: senderName || 'أنت',
      text,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({ messages: [...state.messages, msg] }));

    if (socket?.connected && currentRoom) {
      socket.emit('chat-message', { code: currentRoom, text });
    }
    if (supabaseChannel) {
      supabaseChannel.send({
        type: 'broadcast',
        event: 'chat-message',
        payload: msg,
      });
    }
  },

  startGame: (code) => {
    const { socket, supabaseChannel } = get();
    if (socket?.connected) {
      socket.emit('start-game', { code });
    }
    if (supabaseChannel) {
      supabaseChannel.send({
        type: 'broadcast',
        event: 'game-started',
        payload: { code },
      });
    }
  },

  clearError: () => set({ error: null }),
  clearMessages: () => set({ messages: [] }),
}));

export default useSocketStore;
