import { countSymbol } from "../core/evaluator.js";

export function getFreeSpinAward(matrix) {
  const roadCount = countSymbol(matrix, "ROAD");
  if (roadCount >= 5) return 10;
  if (roadCount >= 3) return 5;
  return 0;
}