import { ROWS, COLS } from "./config.js";

const REEL_STRIPS = [
  ["CAR", "STOP", "CASH", "ROAD", "CAR", "TRAFFIC", "TAXI", "FUEL", "CAR", "TRUCK", "WILD", "ROAD", "CAR", "POLICE", "CASH", "STOP", "CAR", "ROAD"],
  ["TAXI", "FUEL", "ROAD", "CAR", "TRAFFIC", "STOP", "TRUCK", "CASH", "TAXI", "ROAD", "POLICE", "WILD", "CAR", "FUEL", "STOP", "ROAD", "CAR", "CASH"],
  ["ROAD", "CAR", "STOP", "FUEL", "TRAFFIC", "CASH", "TRUCK", "ROAD", "CAR", "WILD", "POLICE", "FUEL", "CAR", "TRAFFIC", "ROAD", "STOP", "CASH", "TAXI"],
  ["POLICE", "CAR", "ROAD", "TRAFFIC", "STOP", "TRUCK", "CASH", "CAR", "FUEL", "ROAD", "WILD", "TAXI", "STOP", "CAR", "ROAD", "FUEL", "CASH", "CAR"],
  ["CAR", "ROAD", "STOP", "FUEL", "CASH", "TRAFFIC", "TRUCK", "CAR", "POLICE", "ROAD", "TAXI", "STOP", "CAR", "WILD", "ROAD", "FUEL", "CASH", "CAR"]
];

function getStopIndex(strip) {
  return Math.floor(Math.random() * strip.length);
}

export function getVisibleMatrix() {
  const matrix = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

  for (let col = 0; col < COLS; col++) {
    const strip = REEL_STRIPS[col];
    const stopIndex = getStopIndex(strip);

    for (let row = 0; row < ROWS; row++) {
      const symbolIndex = (stopIndex + row) % strip.length;
      matrix[row][col] = strip[symbolIndex];
    }
  }

  return matrix;
}