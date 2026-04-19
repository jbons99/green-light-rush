import { JACKPOT_VALUES } from "../core/config.js";

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createPickBonusState() {
  return {
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
  };
}

export function createPickBonusBoard() {
  const tiles = [
    { type: "MINI", label: "MINI" },
    { type: "MINI", label: "MINI" },
    { type: "MINI", label: "MINI" },
    { type: "MINOR", label: "MINOR" },
    { type: "MINOR", label: "MINOR" },
    { type: "MINOR", label: "MINOR" },
    { type: "MAJOR", label: "MAJOR" },
    { type: "MAJOR", label: "MAJOR" },
    { type: "MAJOR", label: "MAJOR" },
    { type: "GRAND", label: "GRAND" },
    { type: "GRAND", label: "GRAND" },
    { type: "GRAND", label: "GRAND" },
    { type: "CREDIT", value: 10, label: "+10" },
    { type: "CREDIT", value: 15, label: "+15" },
    { type: "CREDIT", value: 20, label: "+20" },
    { type: "CREDIT", value: 25, label: "+25" },
    { type: "CREDIT", value: 30, label: "+30" },
    { type: "CREDIT", value: 40, label: "+40" },
    { type: "CREDIT", value: 50, label: "+50" },
    { type: "CREDIT", value: 75, label: "+75" }
  ];

  return shuffle(tiles);
}

export function applyPick(bonusState, index) {
  if (!bonusState.active) return;
  if (bonusState.revealed.includes(index)) return;
  if (bonusState.picksRemaining <= 0) return;

  const item = bonusState.board[index];
  bonusState.revealed.push(index);
  bonusState.picksRemaining -= 1;

  if (item.type === "CREDIT") {
    bonusState.creditTotal += item.value;
  } else {
    bonusState.counts[item.type] += 1;
    if (bonusState.counts[item.type] >= 3 && !bonusState.wonJackpot) {
      bonusState.wonJackpot = item.type;
    }
  }

  if (bonusState.wonJackpot || bonusState.picksRemaining <= 0) {
    bonusState.active = false;
  }
}

export function getPickBonusPayout(bonusState) {
  if (bonusState.wonJackpot) {
    return JACKPOT_VALUES[bonusState.wonJackpot] + bonusState.creditTotal;
  }
  return bonusState.creditTotal;
}