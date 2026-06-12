import { formatNumber, randomChoice, randomInt } from "./gameUtils";

export type ContractOutcome = {
  label: string;
  payoff: number;
  weight: number;
};

export type ContractRound = {
  title: string;
  prompt: string;
  fairValue: number;
  maxSpread: number;
  outcomes: ContractOutcome[];
};

export function money(value: number, decimals = 2) {
  return `$${formatNumber(value, decimals)}`;
}

function weightedFairValue(outcomes: ContractOutcome[]) {
  const totalWeight = outcomes.reduce((sum, outcome) => sum + outcome.weight, 0);
  return outcomes.reduce((sum, outcome) => sum + (outcome.weight / totalWeight) * outcome.payoff, 0);
}

export function generateContractRound(): ContractRound {
  const kind = randomChoice(["threshold", "pip", "coins", "max", "min", "card"] as const);

  if (kind === "threshold") {
    const sides = randomChoice([6, 8, 10, 12, 20]);
    const threshold = randomInt(Math.max(2, Math.floor(sides * 0.35)), sides);
    const payout = randomChoice([20, 30, 40, 50, 75, 100]);
    const outcomes = Array.from({ length: sides }, (_, index) => {
      const face = index + 1;
      return { label: String(face), payoff: face >= threshold ? payout : 0, weight: 1 };
    });
    const fairValue = weightedFairValue(outcomes);
    return {
      title: `d${sides} threshold contract`,
      prompt: `Pays ${money(payout, 0)} if a d${sides} roll is ${threshold} or higher.`,
      fairValue,
      maxSpread: Math.max(3, Math.round(payout * 0.08)),
      outcomes,
    };
  }

  if (kind === "pip") {
    const sides = randomChoice([6, 8, 10]);
    const multiplier = randomChoice([2, 3, 4, 5]);
    const outcomes = Array.from({ length: sides }, (_, index) => {
      const face = index + 1;
      return { label: String(face), payoff: face * multiplier, weight: 1 };
    });
    return {
      title: `d${sides} linear payoff`,
      prompt: `Pays ${money(multiplier, 0)} per pip on a d${sides} roll.`,
      fairValue: weightedFairValue(outcomes),
      maxSpread: Math.max(2, multiplier * 2),
      outcomes,
    };
  }

  if (kind === "coins") {
    const headsPay = randomChoice([5, 8, 10, 12]);
    const bonus = randomChoice([10, 15, 20, 30]);
    const outcomes = [
      { label: "TT", payoff: 0, weight: 1 },
      { label: "TH", payoff: headsPay, weight: 1 },
      { label: "HT", payoff: headsPay, weight: 1 },
      { label: "HH", payoff: headsPay * 2 + bonus, weight: 1 },
    ];
    return {
      title: "Two-coin payoff",
      prompt: `Pays ${money(headsPay, 0)} per head plus ${money(bonus, 0)} extra for HH.`,
      fairValue: weightedFairValue(outcomes),
      maxSpread: Math.max(3, headsPay),
      outcomes,
    };
  }

  if (kind === "max" || kind === "min") {
    const sides = randomChoice([6, 8, 10]);
    const multiplier = randomChoice([2, 3, 4]);
    const outcomes = Array.from({ length: sides }, (_, index) => {
      const face = index + 1;
      const weight =
        kind === "max"
          ? face * face - (face - 1) * (face - 1)
          : (sides - face + 1) ** 2 - (sides - face) ** 2;
      return { label: `${kind} ${face}`, payoff: face * multiplier, weight };
    });
    return {
      title: `${kind === "max" ? "Maximum" : "Minimum"} of two d${sides}`,
      prompt: `Pays ${money(multiplier, 0)} times the ${kind} of two d${sides} rolls.`,
      fairValue: weightedFairValue(outcomes),
      maxSpread: Math.max(3, multiplier * 2),
      outcomes,
    };
  }

  const redPay = randomChoice([10, 15, 20, 25]);
  const aceBonus = randomChoice([20, 30, 40, 50]);
  const outcomes = [
    { label: "black non-ace", payoff: 0, weight: 24 },
    { label: "red non-ace", payoff: redPay, weight: 24 },
    { label: "black ace", payoff: aceBonus, weight: 2 },
    { label: "red ace", payoff: redPay + aceBonus, weight: 2 },
  ];
  return {
    title: "One-card contract",
    prompt: `Pays ${money(redPay, 0)} if red plus ${money(aceBonus, 0)} if ace.`,
    fairValue: weightedFairValue(outcomes),
    maxSpread: Math.max(4, Math.round((redPay + aceBonus) * 0.08)),
    outcomes,
  };
}

export function scoreMarket({
  bid,
  ask,
  fairValue,
  maxSpread,
}: {
  bid: number;
  ask: number;
  fairValue: number;
  maxSpread: number;
}) {
  const spread = ask - bid;
  const surroundsFair = bid <= fairValue && fairValue <= ask;
  const tightEnough = spread <= maxSpread;
  const valid = Number.isFinite(bid) && Number.isFinite(ask) && bid < ask;
  const quality = valid && surroundsFair ? Math.max(0, 1 - spread / Math.max(maxSpread * 2, 1)) : 0;
  return { valid, spread, surroundsFair, tightEnough, correct: valid && surroundsFair && tightEnough, quality };
}
