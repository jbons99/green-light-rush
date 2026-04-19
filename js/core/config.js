// 🎰 GRID SETTINGS
export const ROWS = 5;
export const COLS = 5;

// 💰 BETTING
export const BASE_BET_PER_LINE = 1;
export const AUTO_SPINS_DEFAULT = 25;

// 🏆 WIN THRESHOLDS
export const BIG_WIN_MULTIPLIER = 5;

// 🎯 JACKPOTS (used in pick bonus)
export const JACKPOT_VALUES = {
  MINI: 50,
  MINOR: 125,
  MAJOR: 300,
  GRAND: 1000
};

// 🎰 SYMBOL DEFINITIONS
export const symbolMeta = {
  WILD: {
    name: "Wild",
    fallback: "⭐",
    img: "./assets/symbols/wild.png",
    tier: "feature",
    payout: { 3: 30, 4: 75, 5: 150 }
  },

  CASH: {
    name: "Cash",
    fallback: "💰",
    img: "./assets/symbols/cash.png",
    tier: "high",
    payout: { 3: 20, 4: 45, 5: 100 }
  },

  ROAD: {
    name: "Road",
    fallback: "🚧",
    img: "./assets/symbols/road.png",
    tier: "high",
    payout: { 3: 16, 4: 35, 5: 70 }
  },

  FUEL: {
    name: "Fuel",
    fallback: "⛽",
    img: "./assets/symbols/fuel.png",
    tier: "mid",
    payout: { 3: 12, 4: 25, 5: 50 }
  },

  POLICE: {
    name: "Police",
    fallback: "🚓",
    img: "./assets/symbols/police.png",
    tier: "mid",
    payout: { 3: 10, 4: 20, 5: 40 }
  },

  TRUCK: {
    name: "Truck",
    fallback: "🚚",
    img: "./assets/symbols/truck.png",
    tier: "mid",
    payout: { 3: 8, 4: 16, 5: 32 }
  },

  TAXI: {
    name: "Taxi",
    fallback: "🚕",
    img: "./assets/symbols/taxi.png",
    tier: "low",
    payout: { 3: 6, 4: 12, 5: 24 }
  },

  CAR: {
    name: "Car",
    fallback: "🚗",
    img: "./assets/symbols/car.png",
    tier: "low",
    payout: { 3: 5, 4: 10, 5: 20 }
  },

  STOP: {
    name: "Stop",
    fallback: "🛑",
    img: "./assets/symbols/stop.png",
    tier: "mid",
    payout: { 3: 7, 4: 14, 5: 28 }
  },

  // 🚦 FEATURE SYMBOL
  TRAFFIC: {
    name: "Traffic",
    fallback: "🚦",
    img: "./assets/symbols/traffic.png",
    tier: "feature",
    payout: { 3: 0, 4: 0, 5: 0 }
  }
};

// 🎲 SYMBOL GROUPS

// used for reel previews + base game symbols
export const regularSymbols = [
  "CASH",
  "ROAD",
  "FUEL",
  "POLICE",
  "TRUCK",
  "TAXI",
  "CAR",
  "STOP"
];

// special handling symbols
export const featureSymbols = [
  "WILD",
  "TRAFFIC"
];

// 🎯 ALL SYMBOLS (useful for preview spins / randoms)
export const allSymbols = [
  ...regularSymbols,
  ...featureSymbols
];