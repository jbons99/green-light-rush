import { ROWS, COLS, AUTO_SPINS_DEFAULT, BIG_WIN_MULTIPLIER, symbolMeta } from "./core/config.js";
import { state } from "./core/state.js";
import { getVisibleMatrix } from "./core/reels.js";
import { evaluateWins, countSymbol } from "./core/evaluator.js";
import { totalBetFor } from "./core/spin.js";
import { resolveGamble } from "./features/gamble.js";
import { getFreeSpinAward } from "./features/freeSpins.js";
import { getTrafficPickCount } from "./features/trafficFeature.js";
import {
  unlockAudio,
  playSpinSound,
  playWinSound,
  playBigWinSound,
  playFeatureSound,
  playReelStop,
  playAnticipation
} from "./audio/sound.js";
import { showOverlay, showBigWin, configureFeatureOverlay, countUpValue } from "./ui/overlays.js";
import { resizeCanvas, clearCanvas, flashPaylines } from "./ui/paylineCanvas.js";
import {
  createGrid,
  clearWinFlashes,
  flashWinningLine,
  updateUI,
  setMessage,
  renderPaytable,
  getCells,
  symbolMarkup
} from "./ui/render.js";
import {
  createPickBonusBoard,
  createPickBonusState,
  applyPick,
  getPickBonusPayout
} from "./features/pickBonus.js";

const els = {
  reelScreenEl: document.getElementById("reelScreen"),
  paylineCanvasEl: document.getElementById("paylineCanvas"),
  reelsEl: document.getElementById("reels"),
  creditsEl: document.getElementById("credits"),
  linesValueEl: document.getElementById("linesValue"),
  betMultValueEl: document.getElementById("betMultValue"),
  totalBetEl: document.getElementById("totalBet"),
  winEl: document.getElementById("win"),
  modeLabelEl: document.getElementById("modeLabel"),
  freeSpinsLabelEl: document.getElementById("freeSpinsLabel"),
  messageEl: document.getElementById("message"),
  linesSelectEl: document.getElementById("linesSelect"),
  betMultSelectEl: document.getElementById("betMultSelect"),
  spinButtonEl: document.getElementById("spinButton"),
  autoButtonEl: document.getElementById("autoButton"),
  soundButtonEl: document.getElementById("soundButton"),
  collectButtonEl: document.getElementById("collectButton"),
  paytableButtonEl: document.getElementById("paytableButton"),
  closePaytableButtonEl: document.getElementById("closePaytableButton"),
  closePaytableBackdropEl: document.getElementById("closePaytableBackdrop"),
  paytableModalEl: document.getElementById("paytableModal"),
  paytableGridEl: document.getElementById("paytableGrid"),
  gambleButtons: document.querySelectorAll(".gamble-btn"),
  gamblePanelEl: document.querySelector(".gamble-panel"),
  bigWinOverlayEl: document.getElementById("bigWinOverlay"),
  bigWinValueEl: document.getElementById("bigWinValue"),
  featureOverlayEl: document.getElementById("featureOverlay"),
  featureOverlayTitleEl: document.getElementById("featureOverlayTitle"),
  featureOverlaySubtitleEl: document.getElementById("featureOverlaySubtitle"),
  trafficMeterTextEl: document.getElementById("trafficMeterText"),
  lightRedEl: document.getElementById("lightRed"),
  lightAmberEl: document.getElementById("lightAmber"),
  lightGreenEl: document.getElementById("lightGreen"),
  pickBonusPanelEl: document.getElementById("pickBonusPanel"),
  pickBonusGridEl: document.getElementById("pickBonusGrid"),
  pickBonusSubtitleEl: document.getElementById("pickBonusSubtitle"),
  miniCountEl: document.getElementById("miniCount"),
  minorCountEl: document.getElementById("minorCount"),
  majorCountEl: document.getElementById("majorCount"),
  grandCountEl: document.getElementById("grandCount")
};

function totalBet() {
  return totalBetFor(state);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function emphasizeMessage(text) {
  setMessage(els.messageEl, text);
  els.messageEl.classList.remove("emphasis");
  void els.messageEl.offsetWidth;
  els.messageEl.classList.add("emphasis");
}

function pulseSpinButton(isOn) {
  if (isOn) {
    els.spinButtonEl.style.transform = "scale(0.98)";
    els.spinButtonEl.style.filter = "brightness(1.08)";
  } else {
    els.spinButtonEl.style.transform = "";
    els.spinButtonEl.style.filter = "";
  }
}

function shakeMachine() {
  const machine = document.querySelector(".machine-frame");
  if (!machine) return;
  machine.classList.remove("shake");
  void machine.offsetWidth;
  machine.classList.add("shake");
}

function flashReelScreen() {
  if (!els.reelScreenEl) return;
  els.reelScreenEl.classList.remove("reel-stop-flash");
  void els.reelScreenEl.offsetWidth;
  els.reelScreenEl.classList.add("reel-stop-flash");
}

function refreshSpinButtonState() {
  const shouldDisable = state.isSpinning || state.pickBonus?.active;
  els.spinButtonEl.disabled = shouldDisable;
  if (!shouldDisable) {
    els.spinButtonEl.classList.add("ready-pulse");
  } else {
    els.spinButtonEl.classList.remove("ready-pulse");
  }
}

function hasPickBonusUI() {
  return Boolean(
    els.pickBonusPanelEl &&
      els.pickBonusGridEl &&
      els.pickBonusSubtitleEl &&
      els.miniCountEl &&
      els.minorCountEl &&
      els.majorCountEl &&
      els.grandCountEl
  );
}

function renderPickBonus() {
  const bonus = state.pickBonus;
  if (!bonus || !hasPickBonusUI()) return;

  if (!bonus.active && bonus.board.length === 0) {
    els.pickBonusPanelEl.classList.add("hidden");
    refreshSpinButtonState();
    return;
  }

  els.pickBonusPanelEl.classList.remove("hidden");
  els.miniCountEl.textContent = bonus.counts.MINI;
  els.minorCountEl.textContent = bonus.counts.MINOR;
  els.majorCountEl.textContent = bonus.counts.MAJOR;
  els.grandCountEl.textContent = bonus.counts.GRAND;

  if (bonus.active) {
    els.pickBonusSubtitleEl.textContent = `Picks remaining: ${bonus.picksRemaining}`;
  } else if (bonus.wonJackpot) {
    els.pickBonusSubtitleEl.textContent = `${bonus.wonJackpot} WON!`;
  } else {
    els.pickBonusSubtitleEl.textContent = `Feature complete: ${bonus.creditTotal} credits`;
  }

  els.pickBonusGridEl.innerHTML = bonus.board
    .map((item, index) => {
      const revealed = bonus.revealed.includes(index);
      const extraClass = revealed ? (item.type === "CREDIT" ? "credit" : item.type.toLowerCase()) : "";
      return `
        <button class="pick-tile ${revealed ? `revealed ${extraClass}` : ""}" data-pick-index="${index}" ${revealed || !bonus.active ? "disabled" : ""}>
          ${revealed ? `<span class="pick-reveal-label">${item.label}</span>` : `<span class="pick-hidden-label">🚦</span>`}
        </button>
      `;
    })
    .join("");

  els.pickBonusGridEl.querySelectorAll("[data-pick-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.pickIndex);
      handlePick(index);
    });
  });

  refreshSpinButtonState();
}

async function handlePick(index) {
  if (!state.pickBonus?.active) return;
  applyPick(state.pickBonus, index);
  renderPickBonus();

  if (!state.pickBonus.active) {
    await sleep(400);
    const payout = getPickBonusPayout(state.pickBonus);
    state.credits += payout;
    state.currentWin = payout;

    if (state.pickBonus.wonJackpot) {
      playBigWinSound(state.soundEnabled);
      shakeMachine();
      emphasizeMessage(`${state.pickBonus.wonJackpot} JACKPOT WON! ${payout} credits.`);
      await showBigWin(els.bigWinOverlayEl, els.bigWinValueEl, payout);
    } else {
      playWinSound(state.soundEnabled);
      emphasizeMessage(`Bonus won: ${payout} credits.`);
    }

    updateUI(state, els);
    await sleep(1200);
    state.pickBonus = createPickBonusState();
    renderPickBonus();
  }
}

async function reelKickIn(cells) {
  for (let reel = 0; reel < COLS; reel++) {
    for (let row = 0; row < ROWS; row++) {
      const index = row * COLS + reel;
      cells[index].classList.add("spinning", "blur-spin");
      cells[index].classList.remove("anticipation-reel");
    }
    await sleep(45);
  }
}

function getAnticipationReels(finalMatrix) {
  const anticipationReels = [];
  let landedTraffic = 0;

  for (let reel = 0; reel < COLS; reel++) {
    let reelTraffic = 0;
    for (let row = 0; row < ROWS; row++) {
      if (finalMatrix[row][reel] === "TRAFFIC") reelTraffic += 1;
    }

    landedTraffic += reelTraffic;
    if (landedTraffic >= 2 && reel < COLS - 1) {
      anticipationReels.push(reel + 1);
    }
  }

  return anticipationReels;
}

async function animateSpin(finalMatrix) {
  const cells = getCells();
  const previewSymbols = Object.keys(symbolMeta);
  const anticipationReels = getAnticipationReels(finalMatrix);
  let anticipationPlayed = false;

  clearWinFlashes();
  clearCanvas(els.paylineCanvasEl);
  pulseSpinButton(true);
  playSpinSound(state.soundEnabled);

  cells.forEach((cell) => {
    cell.classList.remove("stop-bounce", "win-flash", "anticipation-reel");
  });

  await reelKickIn(cells);

  for (let reel = 0; reel < COLS; reel++) {
    const isAnticipationReel = anticipationReels.includes(reel);
    const ticks = isAnticipationReel ? 18 + reel * 5 : 12 + reel * 4;

    if (isAnticipationReel) {
      for (let row = 0; row < ROWS; row++) {
        const index = row * COLS + reel;
        cells[index].classList.add("anticipation-reel");
      }

      if (els.reelScreenEl) els.reelScreenEl.classList.add("feature-active");
      if (!anticipationPlayed) {
        playAnticipation(state.soundEnabled);
        anticipationPlayed = true;
      }
    }

    for (let tick = 0; tick < ticks; tick++) {
      for (let row = 0; row < ROWS; row++) {
        const index = row * COLS + reel;
        const preview = previewSymbols[Math.floor(Math.random() * previewSymbols.length)];
        cells[index].innerHTML = symbolMarkup(preview);
      }

      const slowdownPhase = tick / ticks;
      const frameDelay = isAnticipationReel
        ? slowdownPhase < 0.45
          ? 30 + reel * 2
          : slowdownPhase < 0.75
            ? 52 + reel * 5
            : 92 + reel * 8
        : slowdownPhase < 0.55
          ? 26 + reel * 2
          : slowdownPhase < 0.8
            ? 40 + reel * 4
            : 68 + reel * 6;

      await sleep(frameDelay);
    }

    for (let row = 0; row < ROWS; row++) {
      const index = row * COLS + reel;
      cells[index].innerHTML = symbolMarkup(finalMatrix[row][reel]);
      cells[index].classList.remove("spinning", "blur-spin", "anticipation-reel");
      cells[index].classList.add("stop-bounce");
    }

    playReelStop(state.soundEnabled, reel);
    flashReelScreen();

    await sleep(isAnticipationReel ? 220 + reel * 25 : 110 + reel * 18);
  }

  await sleep(120);
  cells.forEach((cell) => cell.classList.remove("stop-bounce", "anticipation-reel"));
  if (els.reelScreenEl) els.reelScreenEl.classList.remove("feature-active");
  pulseSpinButton(false);
}

async function animateWinMeter(targetWin) {
  els.winEl.textContent = "0";
  await countUpValue(els.winEl, targetWin, 950);
}

async function spin() {
  if (state.isSpinning || state.pickBonus?.active) return;

  const bet = totalBet();
  if (state.freeSpinsRemaining <= 0 && state.credits < bet) {
    state.autoSpinsRemaining = 0;
    setMessage(els.messageEl, "Not enough credits.");
    updateUI(state, els);
    refreshSpinButtonState();
    return;
  }

  state.isSpinning = true;
  state.currentWin = 0;
  state.lastBaseWin = 0;
  state.trafficLevel = 0;
  state.sessionStats.totalSpins += 1;

  clearWinFlashes();
  clearCanvas(els.paylineCanvasEl);
  els.reelScreenEl.classList.remove("feature-active");

  if (state.freeSpinsRemaining > 0) {
    state.freeSpinsRemaining -= 1;
    setMessage(els.messageEl, "Free spin in progress...");
  } else {
    state.credits -= bet;
    setMessage(els.messageEl, "Spinning...");
  }

  updateUI(state, els);
  refreshSpinButtonState();

  try {
    const matrix = getVisibleMatrix();
    state.lastGrid = state.currentGrid;
    state.currentGrid = matrix;

    await animateSpin(matrix);

    const result = evaluateWins(matrix, state.selectedLines, state.betMultiplier);
    const win = result.total;
    const trafficSymbols = countSymbol(matrix, "TRAFFIC");
    const freeSpinsAward = getFreeSpinAward(matrix);

    state.trafficLevel = trafficSymbols;
    state.currentWin = win;
    state.lastBaseWin = win;

    if (freeSpinsAward > 0) {
      state.freeSpinsRemaining += freeSpinsAward;
      emphasizeMessage(`FREE SPINS AWARDED: ${freeSpinsAward}`);
      showOverlay(els.featureOverlayEl, 1200);
      configureFeatureOverlay(els.featureOverlayTitleEl, els.featureOverlaySubtitleEl, "FREE SPINS", `${freeSpinsAward} SPINS ADDED`);
    }

    if (result.winningLines.length > 0) {
      result.winningLines.forEach((line, index) => {
        setTimeout(() => flashWinningLine(line), index * 140);
      });
      flashPaylines(els.paylineCanvasEl, result.winningLines, 420);
    }

    if (trafficSymbols >= 3) {
      const picks = getTrafficPickCount(trafficSymbols);
      state.pickBonus = createPickBonusState();
      state.pickBonus.active = true;
      state.pickBonus.board = createPickBonusBoard();
      state.pickBonus.picksRemaining = picks;
      state.sessionStats.totalBonuses += 1;

      configureFeatureOverlay(
        els.featureOverlayTitleEl,
        els.featureOverlaySubtitleEl,
        "CONTROL THE LIGHTS",
        `${picks} PICKS AWARDED`
      );

      showOverlay(els.featureOverlayEl, 1600);
      playFeatureSound(state.soundEnabled);
      shakeMachine();
      emphasizeMessage(`CONTROL THE LIGHTS BONUS! ${picks} picks awarded.`);
      renderPickBonus();
    } else if (win > 0) {
      playWinSound(state.soundEnabled);
      emphasizeMessage(`Win: ${win} credits.`);
    } else if (freeSpinsAward <= 0) {
      setMessage(els.messageEl, "No win. Spin again.");
    }

    if (win > 0) {
      state.sessionStats.totalWins += 1;
      state.sessionStats.totalCreditsWon += win;
      await sleep(140);
      await animateWinMeter(win);
      state.credits += win;
      updateUI(state, els);

      if (win >= bet * BIG_WIN_MULTIPLIER) {
        await sleep(180);
        playBigWinSound(state.soundEnabled);
        shakeMachine();
        await showBigWin(els.bigWinOverlayEl, els.bigWinValueEl, win);
      }
    } else {
      updateUI(state, els);
    }
  } finally {
    state.isSpinning = false;
    refreshSpinButtonState();
  }

  if (state.autoSpinsRemaining > 0 && !state.pickBonus?.active) {
    state.autoSpinsRemaining -= 1;
    updateUI(state, els);

    if (state.autoSpinsRemaining > 0) {
      setTimeout(() => spin(), 700);
    } else {
      setMessage(els.messageEl, "Auto spins complete.");
    }
  }
}

function clearGambleState() {
  els.gamblePanelEl.classList.remove("gamble-win", "gamble-lose");
}

async function gamble(choice) {
  if (state.isSpinning || state.pickBonus?.active) return;
  if (state.lastBaseWin <= 0) {
    setMessage(els.messageEl, "You need a base-game win to gamble.");
    return;
  }

  clearGambleState();
  setMessage(els.messageEl, `Gamble on ${choice}...`);
  await sleep(420);

  const result = resolveGamble(choice);
  state.credits -= state.lastBaseWin;

  if (result.won) {
    const upgraded = state.lastBaseWin * result.multiplier;
    state.credits += upgraded;
    state.currentWin = upgraded;
    state.lastBaseWin = upgraded;
    els.gamblePanelEl.classList.add("gamble-win");
    emphasizeMessage(`Gamble win! ${choice} hit for ${upgraded}.`);
    playWinSound(state.soundEnabled);

    if (upgraded >= totalBet() * 8) {
      await sleep(150);
      playBigWinSound(state.soundEnabled);
      shakeMachine();
      await showBigWin(els.bigWinOverlayEl, els.bigWinValueEl, upgraded);
    }
  } else {
    state.currentWin = 0;
    state.lastBaseWin = 0;
    els.gamblePanelEl.classList.add("gamble-lose");
    emphasizeMessage(`Gamble lost on ${choice}. ${result.landedColor.toUpperCase()} / ${result.landedSuit.toUpperCase()}`);
  }

  updateUI(state, els);
  setTimeout(clearGambleState, 950);
}

function collectWin() {
  clearGambleState();
  if (state.lastBaseWin > 0) {
    emphasizeMessage(`Collected ${state.lastBaseWin}. Ready to spin.`);
    state.lastBaseWin = 0;
  } else {
    setMessage(els.messageEl, "Nothing to collect.");
  }
}

function startAuto() {
  if (state.isSpinning || state.pickBonus?.active) return;

  if (state.autoSpinsRemaining > 0) {
    state.autoSpinsRemaining = 0;
    setMessage(els.messageEl, "Auto stopped.");
    updateUI(state, els);
    return;
  }

  state.autoSpinsRemaining = AUTO_SPINS_DEFAULT;
  emphasizeMessage(`Auto spins started: ${AUTO_SPINS_DEFAULT}`);
  updateUI(state, els);
  spin();
}

function openPaytable() {
  els.paytableModalEl.classList.remove("hidden");
}

function closePaytable() {
  els.paytableModalEl.classList.add("hidden");
}

function toggleSound() {
  unlockAudio();
  state.soundEnabled = !state.soundEnabled;
  updateUI(state, els);
  setMessage(els.messageEl, state.soundEnabled ? "Sound enabled." : "Sound disabled.");
}

function bindEvents() {
  els.linesSelectEl.addEventListener("change", (e) => {
    state.selectedLines = Number(e.target.value);
    updateUI(state, els);
  });

  els.betMultSelectEl.addEventListener("change", (e) => {
    state.betMultiplier = Number(e.target.value);
    updateUI(state, els);
  });

  els.spinButtonEl.addEventListener("click", () => {
    unlockAudio();
    spin();
  });

  els.autoButtonEl.addEventListener("click", () => {
    unlockAudio();
    startAuto();
  });

  els.soundButtonEl.addEventListener("click", () => {
    unlockAudio();
    toggleSound();
  });

  els.collectButtonEl.addEventListener("click", collectWin);
  els.paytableButtonEl.addEventListener("click", openPaytable);
  els.closePaytableButtonEl.addEventListener("click", closePaytable);
  els.closePaytableBackdropEl.addEventListener("click", closePaytable);

  els.gambleButtons.forEach((button) => {
    button.addEventListener("click", () => gamble(button.dataset.gamble));
  });

  window.addEventListener("resize", () => {
    resizeCanvas(els.paylineCanvasEl, els.reelScreenEl);
    clearCanvas(els.paylineCanvasEl);
  });
}

function init() {
  createGrid(els.reelsEl);
  renderPaytable(els.paytableGridEl);
  resizeCanvas(els.paylineCanvasEl, els.reelScreenEl);
  bindEvents();
  renderPickBonus();
  updateUI(state, els);
  refreshSpinButtonState();
}

init();