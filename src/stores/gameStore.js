import { create } from 'zustand';
import useSocketStore from './socketStore';

const useGameStore = create((set, get) => ({
  // Game state
  gameState: null,
  selectedCategories: [],
  currentQuestion: null,
  scores: { teamA: 0, teamB: 0 },
  currentTurn: 'teamA',
  lifelines: ['two-answers', 'pit', 'double', 'call-friend', 'swap', 'bomb'],
  usedLifelines: { teamA: [], teamB: [] },
  timer: 30,
  gameMode: 'pvp', // 'pvp' | 'team' | 'ai'
  aiDifficulty: 'medium', // 'easy' | 'medium' | 'hard'
  isGameActive: false,
  questionsGrid: [],
  answeredQuestions: [],
  showAnswer: false,
  selectedAnswer: null,
  isCorrect: null,
  lifelineActive: null,

  // Set game mode
  setGameMode: (mode) => set({ gameMode: mode }),
  setAiDifficulty: (difficulty) => set({ aiDifficulty: difficulty }),

  // Set selected categories
  setSelectedCategories: (categories) => set({ selectedCategories: categories }),

  // Start a new game
  startGame: (config = {}) => {
    const socket = useSocketStore.getState().socket;
    if (socket) {
      socket.emit('start-game', {
        categories: config.categories || get().selectedCategories,
        mode: config.mode || get().gameMode,
        aiDifficulty: config.aiDifficulty || get().aiDifficulty,
      });
    }
    set({
      isGameActive: true,
      scores: { teamA: 0, teamB: 0 },
      currentTurn: 'teamA',
      usedLifelines: { teamA: [], teamB: [] },
      answeredQuestions: [],
      currentQuestion: null,
      showAnswer: false,
      selectedAnswer: null,
      isCorrect: null,
      lifelineActive: null,
    });
  },

  // Select a question from the grid
  selectQuestion: (questionId) => {
    const socket = useSocketStore.getState().socket;
    if (socket) {
      socket.emit('select-question', { questionId });
    }
    set({ showAnswer: false, selectedAnswer: null, isCorrect: null, lifelineActive: null });
  },

  // Submit an answer
  submitAnswer: (answerIndex) => {
    const socket = useSocketStore.getState().socket;
    const { currentQuestion } = get();
    if (socket && currentQuestion) {
      socket.emit('submit-answer', {
        questionId: currentQuestion.id,
        answer: answerIndex,
      });
    }
    set({ selectedAnswer: answerIndex });
  },

  // Use a lifeline
  useLifeline: (lifelineId) => {
    const socket = useSocketStore.getState().socket;
    const { currentTurn, usedLifelines } = get();

    // Check if team already used max lifelines
    if (usedLifelines[currentTurn]?.length >= 3) return;
    // Check if lifeline already used by this team
    if (usedLifelines[currentTurn]?.includes(lifelineId)) return;

    if (socket) {
      socket.emit('use-lifeline', { lifeline: lifelineId });
    }
    set({
      lifelineActive: lifelineId,
      usedLifelines: {
        ...usedLifelines,
        [currentTurn]: [...(usedLifelines[currentTurn] || []), lifelineId],
      },
    });
  },

  // Next turn
  nextTurn: () => {
    const socket = useSocketStore.getState().socket;
    if (socket) {
      socket.emit('next-turn');
    }
    const { currentTurn } = get();
    set({
      currentTurn: currentTurn === 'teamA' ? 'teamB' : 'teamA',
      currentQuestion: null,
      showAnswer: false,
      selectedAnswer: null,
      isCorrect: null,
      lifelineActive: null,
    });
  },

  // Reset game
  resetGame: () => {
    set({
      gameState: null,
      selectedCategories: [],
      currentQuestion: null,
      scores: { teamA: 0, teamB: 0 },
      currentTurn: 'teamA',
      usedLifelines: { teamA: [], teamB: [] },
      timer: 30,
      isGameActive: false,
      questionsGrid: [],
      answeredQuestions: [],
      showAnswer: false,
      selectedAnswer: null,
      isCorrect: null,
      lifelineActive: null,
    });
  },

  // Update from server state
  updateGameState: (state) => {
    set({
      gameState: state,
      scores: state.scores || get().scores,
      currentTurn: state.currentTurn || get().currentTurn,
      questionsGrid: state.questionsGrid || get().questionsGrid,
      currentQuestion: state.currentQuestion || get().currentQuestion,
      timer: state.timer ?? get().timer,
      answeredQuestions: state.answeredQuestions || get().answeredQuestions,
      usedLifelines: state.usedLifelines || get().usedLifelines,
      isGameActive: state.isGameActive ?? get().isGameActive,
    });
  },

  // Handle answer result from server
  handleAnswerResult: (result) => {
    set({
      showAnswer: true,
      isCorrect: result.isCorrect,
      scores: result.scores || get().scores,
    });
    if (result.isCorrect) {
      set((s) => ({
        answeredQuestions: [...s.answeredQuestions, result.questionId],
      }));
    }
  },

  // Set current question from server
  setCurrentQuestion: (question) => set({ currentQuestion: question }),

  // Set timer
  setTimer: (time) => set({ timer: time }),

  // Initialize socket listeners
  initSocketListeners: () => {
    const socket = useSocketStore.getState().socket;
    if (!socket) return;

    socket.on('game-state', (state) => get().updateGameState(state));
    socket.on('question-selected', (q) => get().setCurrentQuestion(q));
    socket.on('answer-result', (r) => get().handleAnswerResult(r));
    socket.on('turn-changed', (data) => set({ currentTurn: data.currentTurn }));
    socket.on('timer-tick', (t) => set({ timer: t }));
    socket.on('game-over', (data) => {
      set({ isGameActive: false, gameState: { ...get().gameState, winner: data.winner } });
    });
    socket.on('lifeline-result', (data) => {
      if (data.type === 'bomb') {
        set({ scores: data.scores });
      }
    });
  },

  // Cleanup socket listeners
  cleanupSocketListeners: () => {
    const socket = useSocketStore.getState().socket;
    if (!socket) return;
    socket.off('game-state');
    socket.off('question-selected');
    socket.off('answer-result');
    socket.off('turn-changed');
    socket.off('timer-tick');
    socket.off('game-over');
    socket.off('lifeline-result');
  },
}));

export default useGameStore;
