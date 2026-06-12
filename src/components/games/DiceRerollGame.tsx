import { useEffect, useMemo, useState } from "react";
import { formatNumber, randomChoice, randomInt, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Decision = "keep" | "reroll";

type Round = {
  sides: number;
  rerollsLeft: number;
  cost: number;
  multiplier: number;
  bonusThreshold: number;
  bonus: number;
  currentRoll: number;
};

const defaultRound: Round = {
  sides: 6,
  rerollsLeft: 1,
  cost: 1,
  multiplier: 2,
  bonusThreshold: 6,
  bonus: 6,
  currentRoll: 4,
};

function payoff(face: number, round: Round) {
  return face * round.multiplier + (face >= round.bonusThreshold ? round.bonus : 0);
}

function optimalValueAfterRoll(face: number, rerollsLeft: number, round: Round): number {
  const keepValue = payoff(face, round);
  if (rerollsLeft <= 0) return keepValue;

  const rerollValue =
    -round.cost +
    Array.from({ length: round.sides }, (_, index) => optimalValueAfterRoll(index + 1, rerollsLeft - 1, round)).reduce(
      (sum, value) => sum + value,
      0
    ) /
      round.sides;

  return Math.max(keepValue, rerollValue);
}

function rerollEv(round: Round) {
  if (round.rerollsLeft <= 0) return Number.NEGATIVE_INFINITY;

  return (
    -round.cost +
    Array.from({ length: round.sides }, (_, index) =>
      optimalValueAfterRoll(index + 1, round.rerollsLeft - 1, round)
    ).reduce((sum, value) => sum + value, 0) /
      round.sides
  );
}

function generateRound(): Round {
  const sides = randomChoice([6, 8, 10, 12]);

  return {
    sides,
    rerollsLeft: randomInt(1, 3),
    cost: randomChoice([0, 1, 2, 3, 4]),
    multiplier: randomChoice([1, 2, 3]),
    bonusThreshold: randomInt(Math.max(3, sides - 2), sides),
    bonus: randomChoice([0, 4, 6, 10, 12]),
    currentRoll: randomInt(1, sides),
  };
}

export default function DiceRerollGame() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Choose keep or reroll from the current state.");

  useEffect(() => {
    setRound(generateRound());
    setBest(readStoredNumber("dice-reroll-best"));
  }, []);

  const keepValue = payoff(round.currentRoll, round);
  const continueValue = rerollEv(round);
  const correctDecision: Decision = keepValue >= continueValue ? "keep" : "reroll";
  const threshold = useMemo(() => {
    const face = Array.from({ length: round.sides }, (_, index) => index + 1).find(
      (candidate) => payoff(candidate, round) >= continueValue
    );

    return face ?? round.sides + 1;
  }, [continueValue, round]);

  function choose(decision: Decision) {
    const correct = decision === correctDecision;
    const nextScore = score + (correct ? 1 : 0);

    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("dice-reroll-best", nextScore);
    }
    setFeedback(
      correct
        ? `Correct. Keep value ${formatNumber(keepValue)} vs reroll EV ${formatNumber(continueValue)}.`
        : `Best choice is ${correctDecision}. Keep value ${formatNumber(keepValue)} vs reroll EV ${formatNumber(continueValue)}.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(generateRound());
    setFeedback("Choose keep or reroll from the current state.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Dice Reroll Game</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-lg border border-warn/30 bg-warn/10 p-5 text-center">
          <p className="text-sm font-black uppercase text-warn">Current d{round.sides}</p>
          <p className="mt-2 text-7xl font-black">{round.currentRoll}</p>
          <p className="mt-3 text-sm font-bold text-muted">
            {round.rerollsLeft} reroll{round.rerollsLeft === 1 ? "" : "s"} left at cost {formatNumber(round.cost)}.
          </p>
        </div>

        <div className="rounded-lg border border-line bg-panel p-4">
          <p className="text-sm font-black uppercase text-muted">Payoff and threshold</p>
          <p className="mt-2 text-lg font-black">
            Payoff = {round.multiplier}x roll{round.bonus > 0 ? ` + ${round.bonus} for ${round.bonusThreshold}+` : ""}.
          </p>
          <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${round.sides}, minmax(0, 1fr))` }}>
            {Array.from({ length: round.sides }, (_, index) => index + 1).map((face) => (
              <span
                key={face}
                className={`grid aspect-square place-items-center rounded-md border text-sm font-black ${
                  face >= threshold ? "border-accent bg-accent text-white" : "border-line bg-white text-muted"
                }`}
              >
                {face}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => choose("keep")} className="rounded-lg bg-accent px-4 py-2 font-black text-white">
          Keep
        </button>
        <button type="button" onClick={() => choose("reroll")} className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Reroll
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          New decision
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
