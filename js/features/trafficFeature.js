export function getTrafficPickCount(trafficSymbols) {
  if (trafficSymbols >= 5) return 5;
  if (trafficSymbols === 4) return 4;
  if (trafficSymbols === 3) return 3;
  return 0;
}