import { create } from 'zustand';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  currentRoom: null,
  roomData: null,
  messages: [],
  error: null,

  // Connect to socket server
  connect: (token) => {
    const { socket: existingSocket } = get();
    if (existingSocket?.connected) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      set({ isConnected: true, error: null });
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    socket.on('connect_error', (err) => {
      set({ error: err.message, isConnected: false });
    });

    // Room events
    socket.on('room-update', (data) => {
      set({ roomData: data });
    });

    socket.on('chat-message', (msg) => {
      set((state) => ({
        messages: [...state.messages, msg],
      }));
    });

    socket.on('reaction', (reaction) => {
      // Handle reactions (can be extended)
    });

    socket.on('player-joined', (data) => {
      set((state) => ({
        roomData: state.roomData
          ? { ...state.roomData, players: data.players }
          : null,
      }));
    });

    socket.on('player-left', (data) => {
      set((state) => ({
        roomData: state.roomData
          ? { ...state.roomData, players: data.players }
          : null,
      }));
    });

    socket.on('error', (err) => {
      set({ error: err.message || err });
    });

    set({ socket });
  },

  // Disconnect
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false, currentRoom: null, roomData: null, messages: [] });
    }
  },

  // Join room
  joinRoom: (code, user) => {
    const { socket } = get();
    if (socket) {
      socket.emit('join-room', { code, user });
      set({ currentRoom: code, messages: [] });
    }
  },

  // Leave room
  leaveRoom: () => {
    const { socket, currentRoom } = get();
    if (socket && currentRoom) {
      socket.emit('leave-room', { code: currentRoom });
      set({ currentRoom: null, roomData: null, messages: [] });
    }
  },

  // Send chat message
  sendMessage: (text) => {
    const { socket, currentRoom } = get();
    if (socket && currentRoom) {
      socket.emit('chat-message', { code: currentRoom, text });
    }
  },

  // Send reaction
  sendReaction: (emoji) => {
    const { socket, currentRoom } = get();
    if (socket && currentRoom) {
      socket.emit('reaction', { code: currentRoom, emoji });
    }
  },

  // Create room
  createRoom: async (token) => {
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'فشل إنشاء الغرفة');
      return data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Clear messages
  clearMessages: () => set({ messages: [] }),
}));

export default useSocketStore;
