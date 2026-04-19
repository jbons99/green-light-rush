const redChoices = new Set(["red", "hearts"]);
const blackChoices = new Set(["black", "spades"]);
const colors = ["red", "black"];
const suits = ["hearts", "spades"];

export function resolveGamble(choice) {
  const landedColor = colors[Math.floor(Math.random() * colors.length)];
  const landedSuit = suits[Math.floor(Math.random() * suits.length)];

  let won = false;
  let multiplier = 0;

  if (choice === landedColor) {
    won = true;
    multiplier = 2;
  }

  if (choice === landedSuit) {
    won = true;
    multiplier = 4;
  }

  if (redChoices.has(choice) && landedColor === "red") {
    won = true;
    multiplier = choice === "red" ? 2 : multiplier;
  }

  if (blackChoices.has(choice) && landedColor === "black") {
    won = true;
    multiplier = choice === "black" ? 2 : multiplier;
  }

  return {
    won,
    multiplier,
    landedColor,
    landedSuit
  };
}