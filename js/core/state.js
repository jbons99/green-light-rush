export const state = {
  credits: 1000,
  selectedLines: 20,
  betMultiplier: 1,
  currentWin: 0,
  trafficLevel: 0,
  isSpinning: false,
  lastBaseWin: 0,
  autoSpinsRemaining: 0,
  freeSpinsRemaining: 0,
  soundEnabled: true,
  currentGrid: [],
  lastGrid: [],
  sessionStats: {
    totalSpins: 0,
    totalWins: 0,
    totalCreditsWon: 0,
    totalBonuses: 0
  },
  pickBonus: {
    active: false,
    picksRemaining: 0,
    board: [],
    revealed: [],
    counts: {
      MINI: 0,
      MINOR: 0,
      MAJOR: 0,
      GRAND: 0
    },
    creditTotal: 0,
    wonJackpot: null
  }
};