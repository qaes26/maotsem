import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// In-memory room store
const rooms = new Map(); // code -> room object

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rooms.has(code) ? generateRoomCode() : code;
}

// POST /api/rooms/create
router.post('/create', (req, res) => {
  const { userId, nickname, avatar, mode } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'معرّف المستخدم مطلوب' });
  }

  const code = generateRoomCode();
  const host = { id: userId, nickname: nickname || 'مضيف', avatar: avatar || 'default' };
  const room = {
    code,
    host,
    players: [host],
    teams: { teamA: [host], teamB: [] },
    mode: mode || 'pvp',
    status: 'waiting',
    gameState: null,
    settings: {
      maxPlayers: 8,
      categories: [],
      isPrivate: false,
    },
    chat: [],
    createdAt: new Date().toISOString(),
  };

  rooms.set(code, room);
  res.json({ success: true, room, message: 'تم إنشاء الغرفة' });
});

// POST /api/rooms/join
router.post('/join', (req, res) => {
  const { code, userId, nickname, avatar } = req.body;
  if (!code || !userId) {
    return res.status(400).json({ success: false, message: 'كود الغرفة ومعرّف المستخدم مطلوبان' });
  }

  const room = rooms.get(code.toUpperCase());
  if (!room) {
    return res.status(404).json({ success: false, message: 'الغرفة غير موجودة' });
  }

  if (room.status !== 'waiting') {
    return res.status(400).json({ success: false, message: 'اللعبة بدأت بالفعل' });
  }

  if (room.players.length >= room.settings.maxPlayers) {
    return res.status(400).json({ success: false, message: 'الغرفة ممتلئة' });
  }

  // Check if player already in room
  if (room.players.find(p => p.id === userId)) {
    return res.json({ success: true, room, message: 'أنت بالفعل في الغرفة' });
  }

  const player = { id: userId, nickname: nickname || 'لاعب', avatar: avatar || 'default' };
  room.players.push(player);

  // Auto-assign to team with fewer players
  if (room.teams.teamA.length <= room.teams.teamB.length) {
    room.teams.teamA.push(player);
  } else {
    room.teams.teamB.push(player);
  }

  rooms.set(code.toUpperCase(), room);
  res.json({ success: true, room, message: 'تم الانضمام للغرفة' });
});

// GET /api/rooms/list
router.get('/list', (req, res) => {
  const activeRooms = [];
  for (const room of rooms.values()) {
    if (room.status === 'waiting') {
      activeRooms.push({
        code: room.code,
        host: room.host.nickname,
        players: room.players.length,
        maxPlayers: room.settings.maxPlayers,
        mode: room.mode,
        createdAt: room.createdAt,
      });
    }
  }
  res.json({ success: true, rooms: activeRooms });
});

// GET /api/rooms/:code
router.get('/:code', (req, res) => {
  const room = rooms.get(req.params.code.toUpperCase());
  if (!room) {
    return res.status(404).json({ success: false, message: 'الغرفة غير موجودة' });
  }
  res.json({ success: true, room });
});

// Socket.io room events
export function setupRoomSockets(io) {
  io.on('connection', (socket) => {
    // Join room via socket
    socket.on('join-room', ({ code, userId, nickname, avatar }) => {
      const roomCode = code?.toUpperCase();
      const room = rooms.get(roomCode);
      if (!room) {
        socket.emit('error', { message: 'الغرفة غير موجودة' });
        return;
      }

      socket.join(roomCode);
      socket.roomCode = roomCode;
      socket.userId = userId;

      // Add player if not already present
      if (!room.players.find(p => p.id === userId)) {
        const player = { id: userId, nickname: nickname || 'لاعب', avatar: avatar || 'default' };
        room.players.push(player);
        if (room.teams.teamA.length <= room.teams.teamB.length) {
          room.teams.teamA.push(player);
        } else {
          room.teams.teamB.push(player);
        }
        rooms.set(roomCode, room);
      }

      io.to(roomCode).emit('room-update', room);
      io.to(roomCode).emit('player-joined', {
        userId,
        nickname: nickname || 'لاعب',
        playersCount: room.players.length,
      });
    });

    // Leave room
    socket.on('leave-room', ({ code, userId }) => {
      const roomCode = code?.toUpperCase();
      const room = rooms.get(roomCode);
      if (!room) return;

      room.players = room.players.filter(p => p.id !== userId);
      room.teams.teamA = room.teams.teamA.filter(p => p.id !== userId);
      room.teams.teamB = room.teams.teamB.filter(p => p.id !== userId);

      // If host left, assign new host or delete room
      if (room.host.id === userId) {
        if (room.players.length > 0) {
          room.host = room.players[0];
        } else {
          rooms.delete(roomCode);
          io.to(roomCode).emit('room-closed');
          return;
        }
      }

      rooms.set(roomCode, room);
      socket.leave(roomCode);
      io.to(roomCode).emit('room-update', room);
      io.to(roomCode).emit('player-left', { userId, playersCount: room.players.length });
    });

    // Start game
    socket.on('start-game', ({ code }) => {
      const roomCode = code?.toUpperCase();
      const room = rooms.get(roomCode);
      if (!room) return;

      if (socket.userId !== room.host.id) {
        socket.emit('error', { message: 'فقط المضيف يمكنه بدء اللعبة' });
        return;
      }

      room.status = 'playing';
      rooms.set(roomCode, room);
      io.to(roomCode).emit('game-started', room);
      io.to(roomCode).emit('room-update', room);
    });

    // Chat message
    socket.on('chat-message', ({ code, userId, nickname, message }) => {
      const roomCode = code?.toUpperCase();
      const room = rooms.get(roomCode);
      if (!room) return;

      const chatMsg = {
        id: uuidv4(),
        userId,
        nickname: nickname || 'مجهول',
        message,
        timestamp: new Date().toISOString(),
      };
      room.chat.push(chatMsg);
      if (room.chat.length > 100) room.chat.shift();

      io.to(roomCode).emit('chat-message', chatMsg);
    });

    // Reaction
    socket.on('reaction', ({ code, userId, emoji }) => {
      const roomCode = code?.toUpperCase();
      io.to(roomCode).emit('reaction', { userId, emoji });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      if (socket.roomCode && socket.userId) {
        const room = rooms.get(socket.roomCode);
        if (room) {
          // Mark as disconnected but don't remove immediately
          const player = room.players.find(p => p.id === socket.userId);
          if (player) player.connected = false;
          io.to(socket.roomCode).emit('room-update', room);
        }
      }
    });
  });
}

export { rooms };
export default router;
