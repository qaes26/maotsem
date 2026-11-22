import { v4 as uuidv4 } from 'uuid';
import { getQuestions } from './data/questions.js';
import { rooms } from './rooms.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadSettings() {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'data', 'settings.json'), 'utf-8');
    return JSON.parse(data);
  } catch {
    return { lifelines: { enabled: ['two-answers','pit','double','call-friend','swap','bomb'], maxPerGame: 3, bombBonusChance: 0.5 }, game: { questionTimer: 30, pointValues: [200,400,600] } };
  }
}

// Active game states: roomCode -> GameState
const gameStates = new Map();

class GameState {
  constructor(room, selectedCategories) {
    this.roomCode = room.code;
    this.mode = room.mode;
    this.teams = {
      teamA: { players: [...room.teams.teamA], score: 0, lifelinesUsed: 0, usedLifelineTypes: [] },
      teamB: { players: [...room.teams.teamB], score: 0, lifelinesUsed: 0, usedLifelineTypes: [] },
    };
    this.currentTurn = 'teamA';
    this.categories = this._buildGrid(selectedCategories);
    this.answeredQuestions = new Set();
    this.totalQuestions = 0;
    this.currentQuestion = null;
    this.activeLifeline = null;
    this.timer = null;
    this.timerValue = loadSettings().game?.questionTimer || 30;
    this.status = 'playing';
    this.isAI = room.mode === 'ai';
    this.aiDifficulty = room.aiDifficulty || 'medium';
    this.twoAnswerAttempt = 0;

    // Count total questions
    for (const cat of this.categories) {
      this.totalQuestions += cat.questions.length;
    }
  }

  _buildGrid(selectedCategories) {
    const allQuestions = getQuestions();
    const settings = loadSettings();
    const pointValues = settings.game?.pointValues || [200, 400, 600];
    const grid = [];

    for (const catId of selectedCategories) {
      const catQuestions = allQuestions.filter(q => q.category === catId || q.subcategory === catId);
      const grouped = {};
      for (const pv of pointValues) {
        const matching = catQuestions.filter(q => q.points === pv);
        if (matching.length > 0) {
          grouped[pv] = matching[Math.floor(Math.random() * matching.length)];
        } else if (catQuestions.length > 0) {
          const q = { ...catQuestions[Math.floor(Math.random() * catQuestions.length)], points: pv };
          grouped[pv] = q;
        }
      }

      // Get category display name from first question
      const sample = catQuestions[0];
      grid.push({
        id: catId,
        name: sample ? (sample.categoryName || catId) : catId,
        questions: pointValues.map(pv => grouped[pv]).filter(Boolean),
      });
    }

    return grid;
  }

  getBoard() {
    return {
      categories: this.categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        questions: cat.questions.map(q => ({
          id: q.id,
          points: q.points,
          answered: this.answeredQuestions.has(q.id),
        })),
      })),
      teams: {
        teamA: { ...this.teams.teamA },
        teamB: { ...this.teams.teamB },
      },
      currentTurn: this.currentTurn,
      status: this.status,
      currentQuestion: this.currentQuestion ? {
        id: this.currentQuestion.id,
        question: this.currentQuestion.question,
        options: this.currentQuestion.options,
        points: this.currentQuestion.points,
        category: this.currentQuestion.category,
        subcategory: this.currentQuestion.subcategory,
        mediaType: this.currentQuestion.mediaType,
        mediaUrl: this.currentQuestion.mediaUrl,
        activeLifeline: this.activeLifeline,
      } : null,
      timerValue: this.timerValue,
      answeredCount: this.answeredQuestions.size,
      totalQuestions: this.totalQuestions,
    };
  }

  selectQuestion(questionId) {
    if (this.answeredQuestions.has(questionId)) return null;
    for (const cat of this.categories) {
      const q = cat.questions.find(q => q.id === questionId);
      if (q) {
        this.currentQuestion = { ...q };
        this.activeLifeline = null;
        this.twoAnswerAttempt = 0;
        return this.currentQuestion;
      }
    }
    return null;
  }

  submitAnswer(answerIndex, teamId) {
    if (!this.currentQuestion) return null;

    const q = this.currentQuestion;
    const isCorrect = answerIndex === q.correctAnswer;
    const team = this.teams[teamId] || this.teams[this.currentTurn];
    const opponentTeamId = this.currentTurn === 'teamA' ? 'teamB' : 'teamA';
    const opponent = this.teams[opponentTeamId];

    let pointsAwarded = 0;
    let pointsDeducted = 0;

    // Handle two-answer lifeline
    if (this.activeLifeline === 'two-answers' && !isCorrect && this.twoAnswerAttempt === 0) {
      this.twoAnswerAttempt = 1;
      return {
        isCorrect: false,
        secondChance: true,
        eliminatedOption: answerIndex,
        message: 'لديك فرصة ثانية!',
      };
    }

    if (isCorrect) {
      pointsAwarded = q.points;

      // Handle lifeline bonuses
      if (this.activeLifeline === 'double') {
        pointsAwarded *= 2;
      }
      if (this.activeLifeline === 'pit') {
        pointsDeducted = q.points;
        opponent.score = Math.max(0, opponent.score - pointsDeducted);
      }

      team.score += pointsAwarded;
    }

    this.answeredQuestions.add(q.id);
    const result = {
      isCorrect,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      pointsAwarded: isCorrect ? pointsAwarded : 0,
      pointsDeducted,
      scores: { teamA: this.teams.teamA.score, teamB: this.teams.teamB.score },
    };

    this.currentQuestion = null;
    this.activeLifeline = null;
    this.twoAnswerAttempt = 0;

    // Check if game is over
    if (this.answeredQuestions.size >= this.totalQuestions) {
      this.status = 'finished';
      result.gameOver = true;
      result.winner = this.teams.teamA.score > this.teams.teamB.score ? 'teamA' :
                      this.teams.teamB.score > this.teams.teamA.score ? 'teamB' : 'tie';
    }

    return result;
  }

  useLifeline(lifelineType, teamId) {
    const settings = loadSettings();
    const team = this.teams[teamId] || this.teams[this.currentTurn];
    const maxPerGame = settings.lifelines?.maxPerGame || 3;
    const enabled = settings.lifelines?.enabled || [];

    if (!enabled.includes(lifelineType)) {
      return { success: false, message: 'هذه الميزة غير مفعّلة' };
    }

    if (team.lifelinesUsed >= maxPerGame) {
      return { success: false, message: `وصلت للحد الأقصى (${maxPerGame}) من وسائل المساعدة` };
    }

    if (team.usedLifelineTypes.includes(lifelineType)) {
      return { success: false, message: 'تم استخدام وسيلة المساعدة هذه بالفعل' };
    }

    team.lifelinesUsed++;
    team.usedLifelineTypes.push(lifelineType);
    this.activeLifeline = lifelineType;

    const result = { success: true, type: lifelineType };

    switch (lifelineType) {
      case 'two-answers':
        result.message = 'جوابين - لديك محاولتان للإجابة';
        this.twoAnswerAttempt = 0;
        break;

      case 'pit':
        result.message = 'حفرة - إذا أجبت صح، تحصل على النقاط ويخسرها خصمك';
        break;

      case 'double':
        result.message = 'دبل - نقاط السؤال مضاعفة';
        if (this.currentQuestion) {
          result.doubledPoints = this.currentQuestion.points * 2;
        }
        break;

      case 'call-friend':
        result.message = 'اتصال بصديق - لديك 30 ثانية';
        result.callTimer = 30;
        break;

      case 'swap': {
        if (!this.currentQuestion) {
          return { success: false, message: 'لا يوجد سؤال حالي' };
        }
        // Find alternate question from same category/points
        const allQ = getQuestions();
        const alternates = allQ.filter(q =>
          q.category === this.currentQuestion.category &&
          q.points === this.currentQuestion.points &&
          q.id !== this.currentQuestion.id &&
          !this.answeredQuestions.has(q.id)
        );
        if (alternates.length > 0) {
          const newQ = alternates[Math.floor(Math.random() * alternates.length)];
          this.currentQuestion = { ...newQ };
          result.newQuestion = {
            id: newQ.id,
            question: newQ.question,
            options: newQ.options,
            points: newQ.points,
            mediaType: newQ.mediaType,
            mediaUrl: newQ.mediaUrl,
          };
          result.message = 'بدل السؤال - تم استبدال السؤال';
        } else {
          team.lifelinesUsed--;
          team.usedLifelineTypes.pop();
          this.activeLifeline = null;
          return { success: false, message: 'لا يوجد سؤال بديل متاح' };
        }
        break;
      }

      case 'bomb': {
        const bombChance = settings.lifelines?.bombBonusChance ?? 0.5;
        const won = Math.random() < bombChance;
        if (won) {
          team.score += 400;
          result.message = 'قنبلة 💣 - محظوظ! +400 نقطة';
          result.bombResult = 'bonus';
          result.points = 400;
        } else {
          team.score = Math.max(0, team.score - 400);
          result.message = 'قنبلة 💣 - للأسف! -400 نقطة';
          result.bombResult = 'penalty';
          result.points = -400;
        }
        result.scores = { teamA: this.teams.teamA.score, teamB: this.teams.teamB.score };
        this.activeLifeline = null; // Bomb resolves immediately
        break;
      }
    }

    return result;
  }

  nextTurn() {
    this.currentTurn = this.currentTurn === 'teamA' ? 'teamB' : 'teamA';
    this.currentQuestion = null;
    this.activeLifeline = null;
    this.twoAnswerAttempt = 0;
    return this.currentTurn;
  }

  getAIAnswer() {
    if (!this.currentQuestion) return null;
    const rates = { easy: 0.4, medium: 0.65, hard: 0.85 };
    const correctRate = rates[this.aiDifficulty] || 0.65;
    const isCorrect = Math.random() < correctRate;

    if (isCorrect) {
      return this.currentQuestion.correctAnswer;
    } else {
      // Pick a wrong answer
      const wrong = [0, 1, 2, 3].filter(i => i !== this.currentQuestion.correctAnswer);
      return wrong[Math.floor(Math.random() * wrong.length)];
    }
  }
}

// Socket.io game events
export function setupGameSockets(io) {
  io.on('connection', (socket) => {

    // Initialize game state
    socket.on('init-game', ({ code, categories, aiDifficulty }) => {
      const roomCode = code?.toUpperCase();
      const room = rooms.get(roomCode);
      if (!room) {
        socket.emit('error', { message: 'الغرفة غير موجودة' });
        return;
      }

      const selectedCats = categories || ['premier-league', 'champions-league', 'world-cup', 'general', 'arabic-series', 'global-movies'];
      if (aiDifficulty) room.aiDifficulty = aiDifficulty;

      const gameState = new GameState(room, selectedCats);
      gameStates.set(roomCode, gameState);
      room.gameState = gameState.getBoard();
      room.status = 'playing';

      io.to(roomCode).emit('game-state', gameState.getBoard());
    });

    // Select question
    socket.on('select-question', ({ code, questionId }) => {
      const roomCode = code?.toUpperCase();
      const gs = gameStates.get(roomCode);
      if (!gs) return;

      const question = gs.selectQuestion(questionId);
      if (!question) {
        socket.emit('error', { message: 'السؤال غير متاح' });
        return;
      }

      io.to(roomCode).emit('question-selected', {
        id: question.id,
        question: question.question,
        options: question.options,
        points: question.points,
        category: question.category,
        subcategory: question.subcategory,
        mediaType: question.mediaType,
        mediaUrl: question.mediaUrl,
      });

      // Start timer
      io.to(roomCode).emit('timer-start', { seconds: gs.timerValue });
    });

    // Submit answer
    socket.on('submit-answer', ({ code, answerIndex, teamId }) => {
      const roomCode = code?.toUpperCase();
      const gs = gameStates.get(roomCode);
      if (!gs) return;

      const result = gs.submitAnswer(answerIndex, teamId);
      if (!result) return;

      io.to(roomCode).emit('answer-result', result);

      if (result.gameOver) {
        io.to(roomCode).emit('game-over', {
          winner: result.winner,
          scores: result.scores,
          teams: gs.teams,
        });
        // Update room status
        const room = rooms.get(roomCode);
        if (room) room.status = 'finished';
      }

      io.to(roomCode).emit('game-state', gs.getBoard());
    });

    // Use lifeline
    socket.on('use-lifeline', ({ code, lifelineType, teamId }) => {
      const roomCode = code?.toUpperCase();
      const gs = gameStates.get(roomCode);
      if (!gs) return;

      const result = gs.useLifeline(lifelineType, teamId);
      io.to(roomCode).emit('lifeline-result', result);

      if (result.success) {
        io.to(roomCode).emit('game-state', gs.getBoard());
      }
    });

    // Next turn
    socket.on('next-turn', ({ code }) => {
      const roomCode = code?.toUpperCase();
      const gs = gameStates.get(roomCode);
      if (!gs) return;

      const newTurn = gs.nextTurn();
      io.to(roomCode).emit('turn-changed', { currentTurn: newTurn });
      io.to(roomCode).emit('game-state', gs.getBoard());

      // AI auto-answer if it's AI's turn
      if (gs.isAI && newTurn === 'teamB') {
        io.to(roomCode).emit('ai-thinking', { message: 'الذكاء الاصطناعي يفكر...' });
      }
    });

    // AI select question (triggered by frontend)
    socket.on('ai-select-question', ({ code }) => {
      const roomCode = code?.toUpperCase();
      const gs = gameStates.get(roomCode);
      if (!gs || !gs.isAI) return;

      // Pick random unanswered question
      const available = [];
      for (const cat of gs.categories) {
        for (const q of cat.questions) {
          if (!gs.answeredQuestions.has(q.id)) {
            available.push(q.id);
          }
        }
      }

      if (available.length === 0) return;

      const questionId = available[Math.floor(Math.random() * available.length)];
      const question = gs.selectQuestion(questionId);
      if (!question) return;

      io.to(roomCode).emit('question-selected', {
        id: question.id,
        question: question.question,
        options: question.options,
        points: question.points,
        category: question.category,
        subcategory: question.subcategory,
        mediaType: question.mediaType,
        mediaUrl: question.mediaUrl,
      });

      // AI answers after random delay
      const delay = 2000 + Math.random() * 4000;
      setTimeout(() => {
        const aiAnswer = gs.getAIAnswer();
        io.to(roomCode).emit('ai-answering', { selectedAnswer: aiAnswer });

        setTimeout(() => {
          const result = gs.submitAnswer(aiAnswer, 'teamB');
          if (result) {
            io.to(roomCode).emit('answer-result', result);
            if (result.gameOver) {
              io.to(roomCode).emit('game-over', {
                winner: result.winner,
                scores: result.scores,
                teams: gs.teams,
              });
            }
            io.to(roomCode).emit('game-state', gs.getBoard());
          }
        }, 1000);
      }, delay);
    });

    // Timer expired
    socket.on('timer-expired', ({ code, teamId }) => {
      const roomCode = code?.toUpperCase();
      const gs = gameStates.get(roomCode);
      if (!gs || !gs.currentQuestion) return;

      // Mark as wrong (no answer submitted)
      const result = {
        isCorrect: false,
        correctAnswer: gs.currentQuestion.correctAnswer,
        explanation: gs.currentQuestion.explanation,
        pointsAwarded: 0,
        pointsDeducted: 0,
        scores: { teamA: gs.teams.teamA.score, teamB: gs.teams.teamB.score },
        timedOut: true,
      };

      gs.answeredQuestions.add(gs.currentQuestion.id);
      gs.currentQuestion = null;
      gs.activeLifeline = null;

      if (gs.answeredQuestions.size >= gs.totalQuestions) {
        gs.status = 'finished';
        result.gameOver = true;
        result.winner = gs.teams.teamA.score > gs.teams.teamB.score ? 'teamA' :
                        gs.teams.teamB.score > gs.teams.teamA.score ? 'teamB' : 'tie';
      }

      io.to(roomCode).emit('answer-result', result);
      io.to(roomCode).emit('game-state', gs.getBoard());
    });

    // Get current game state
    socket.on('get-game-state', ({ code }) => {
      const roomCode = code?.toUpperCase();
      const gs = gameStates.get(roomCode);
      if (gs) {
        socket.emit('game-state', gs.getBoard());
      }
    });
  });
}

export { gameStates, GameState };
