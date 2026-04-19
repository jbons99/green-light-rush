import { BASE_BET_PER_LINE } from "./config.js";

export function totalBetFor(state) {
  return state.selectedLines * BASE_BET_PER_LINE * state.betMultiplier;
}

export function canAffordSpin(state) {
  return state.freeSpinsRemaining > 0 || state.credits >= totalBetFor(state);
}