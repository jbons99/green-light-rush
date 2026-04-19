import { ROWS, COLS, symbolMeta, BASE_BET_PER_LINE } from "../core/config.js";

export function totalBet(selectedLines, betMultiplier) {
  return selectedLines * BASE_BET_PER_LINE * betMultiplier;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function symbolMarkup(symbol) {
  const meta = symbolMeta[symbol];

  return `
    <div class="symbol-tile ${meta.tier}">
      <div class="symbol-image-wrap">
        <img
          src="${meta.img}"
          alt="${escapeHtml(meta.name)}"
          class="symbol-img"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
        />
        <div class="symbol-fallback" style="display:none;">${meta.fallback}</div>
      </div>
      <div class="symbol-name">${escapeHtml(meta.name)}</div>
    </div>
  `;
}

export function createGrid(reelsEl) {
  reelsEl.innerHTML = "";
  for (let i = 0; i < ROWS * COLS; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.innerHTML = symbolMarkup("CAR");
    reelsEl.appendChild(cell);
  }
}

export function getCells() {
  return document.querySelectorAll(".cell");
}

export function clearWinFlashes() {
  getCells().forEach((cell) => cell.classList.remove("win-flash"));
}

export function flashWinningLine(lineData) {
  const cells = getCells();
  lineData.rows.forEach((row, col) => {
    const index = row * COLS + col;
    if (cells[index]) cells[index].classList.add("win-flash");
  });
}

export function updateTrafficMeter(level, els) {
  els.lightRedEl.classList.remove("active");
  els.lightAmberEl.classList.remove("active");
  els.lightGreenEl.classList.remove("active");

  if (level <= 0) {
    els.lightRedEl.classList.add("active");
    els.trafficMeterTextEl.textContent = "RED LIGHT";
  } else if (level <= 2) {
    els.lightAmberEl.classList.add("active");
    els.trafficMeterTextEl.textContent = `TRAFFIC: ${level}`;
  } else {
    els.lightGreenEl.classList.add("active");
    els.trafficMeterTextEl.textContent = `BONUS LIVE: ${level}`;
  }
}

export function updateUI(state, els) {
  els.creditsEl.textContent = state.credits;
  els.linesValueEl.textContent = state.selectedLines;
  els.betMultValueEl.textContent = `${state.betMultiplier}x`;
  els.totalBetEl.textContent = totalBet(state.selectedLines, state.betMultiplier);
  els.winEl.textContent = state.currentWin;
  els.freeSpinsLabelEl.textContent = `Free Spins: ${state.freeSpinsRemaining}`;
  els.soundButtonEl.textContent = state.soundEnabled ? "SOUND ON" : "SOUND OFF";

  if (state.pickBonus?.active) {
    els.modeLabelEl.textContent = "Pick Bonus";
  } else if (state.freeSpinsRemaining > 0) {
    els.modeLabelEl.textContent = "Free Spins";
  } else if (state.autoSpinsRemaining > 0) {
    els.modeLabelEl.textContent = `Auto ${state.autoSpinsRemaining}`;
  } else {
    els.modeLabelEl.textContent = "Base Game";
  }

  updateTrafficMeter(state.trafficLevel, els);
}

export function setMessage(messageEl, text) {
  messageEl.textContent = text;
}

export function renderPaytable(paytableGridEl) {
  const rows = [
    ["WILD", "Wild — substitutes for regular symbols"],
    ["CASH", "Money Bag — top regular symbol"],
    ["TRAFFIC", "3+ anywhere triggers Control the Lights"],
    ["ROAD", "3+ anywhere also awards free spins"],
    ["FUEL", "Medium-high value"],
    ["POLICE", "Medium value"],
    ["TRUCK", "Medium value"],
    ["TAXI", "Low-medium value"],
    ["CAR", "Low value"],
    ["STOP", "Low-medium value"]
  ];

  paytableGridEl.innerHTML = rows
    .map(([symbol, text]) => {
      const meta = symbolMeta[symbol];
      return `
        <div class="pay-card">
          <img
            src="${meta.img}"
            alt="${escapeHtml(meta.name)}"
            class="sym"
            onerror="this.style.display='none';"
          />
          <span>${escapeHtml(text)}</span>
        </div>
      `;
    })
    .join("");
}