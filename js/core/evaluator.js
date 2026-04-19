import { COLS, symbolMeta } from "./config.js";
import { PAYLINES } from "./paylines.js";

console.log("EVALUATOR PATH TEST OK", PAYLINES);

export function countSymbol(matrix, targetSymbol) {
  let count = 0;

  for (const row of matrix) {
    for (const symbol of row) {
      if (symbol === targetSymbol) count++;
    }
  }

  return count;
}

function getLineSymbols(matrix, line) {
  return line.map((rowIndex, colIndex) => matrix[rowIndex][colIndex]);
}

function evaluateLine(symbols, betMultiplier) {
  const first = symbols[0];
  if (!first) return 0;

  let matchSymbol = first;
  let matchCount = 1;

  if (first === "WILD") {
    const firstNonWild = symbols.find((symbol) => symbol !== "WILD");
    matchSymbol = firstNonWild || "WILD";
  }

  for (let i = 1; i < COLS; i++) {
    const symbol = symbols[i];

    if (symbol === matchSymbol || symbol === "WILD" || matchSymbol === "WILD") {
      matchCount++;
    } else {
      break;
    }
  }

  if (matchCount < 3) return 0;

  const meta = symbolMeta[matchSymbol];
  if (!meta?.payout) return 0;

  return (meta.payout[matchCount] || 0) * betMultiplier;
}

export function evaluateWins(matrix, selectedLines, betMultiplier) {
  let total = 0;
  const winningLines = [];

  for (let i = 0; i < selectedLines && i < PAYLINES.length; i++) {
    const line = PAYLINES[i];
    const symbols = getLineSymbols(matrix, line);
    const lineWin = evaluateLine(symbols, betMultiplier);

    if (lineWin > 0) {
      total += lineWin;
      winningLines.push(line);
    }
  }

  return { total, winningLines };
}