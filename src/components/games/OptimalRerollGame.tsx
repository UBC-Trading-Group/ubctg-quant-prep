import { useEffect, useMemo, useState } from "react";
import { formatNumber, randomChoice, randomInt, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Round = {
  sides: number;
  rerolls: number;
  cost: number;
  multiplier: number;
  current: number;
};

const defaultRound: Round = {
  sides: 6,
  rerolls: 1,
  cost: 0,
  multiplier: 1,
  current: 4,
};

function payoff(face: number, multiplier: number) {
  return face * multiplier;
}

function valueAfterRoll(face: number, remainingRerolls: number, sides: number, cost: number, multiplier: number): number {
  const keep = payoff(face, multiplier);
  if (remainingRerolls <= 0) return keep;
  const reroll =
    -cost +
    Array.from({ length: sides }, (_, index) => valueAfterRoll(index + 1, remainingRerolls - 1, sides, cost, multiplier)).reduce(
      (sum, value) => sum + value,
      0
    ) /
      sides;
  return Math.max(keep, reroll);
}

function rerollValue(round: Round) {
  if (round.rerolls <= 0) return Number.NEGATIVE_INFINITY;
  return (
    -round.cost +
    Array.from({ length: round.sides }, (_, index) =>
      valueAfterRoll(index + 1, round.rerolls - 1, round.sides, round.cost, round.multiplier)
    ).reduce((sum, value) => sum + value, 0) /
      round.sides
  );
}

function generateRound(): Round {
  const sides = randomChoice([6, 8, 10]);
  return {
    sides,
    rerolls: randomInt(1, 3),
    cost: randomChoice([0, 1, 2, 3, 5]),
    multiplier: randomChoice([1, 2, 3, 4]),
    current: randomInt(1, sides),
  };
}

export default function OptimalRerollGame() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Choose whether to keep or reroll.");

  useEffect(() => {
    setBest(readStoredNumber("optimal-reroll-best"));
  }, []);

  const keepValue = payoff(round.current, round.multiplier);
  const continueValue = rerollValue(round);
  const shouldKeep = keepValue >= continueValue;
  const threshold = useMemo(() => {
    const face = Array.from({ length: round.sides }, (_, index) => index + 1).find(
      (candidate) => payoff(candidate, round.multiplier) >= continueValue
    );
    return face ?? round.sides + 1;
  }, [continueValue, round]);

  function answer(choice: "keep" | "reroll") {
    const correct = (choice === "keep") === shouldKeep;
    const nextScore = score + (correct ? 1 : 0);

    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("optimal-reroll-best", nextScore);
    }
    setFeedback(
      correct
        ? `Correct. Keep value ${formatNumber(keepValue)} vs reroll EV ${formatNumber(continueValue)}.`
        : `Not quite. Keep value ${formatNumber(keepValue)} vs reroll EV ${formatNumber(continueValue)}.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(generateRound());
    setFeedback("Choose whether to keep or reroll.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Optimal Reroll Game</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-warn/30 bg-warn/10 p-5">
          <p className="text-sm font-black uppercase text-warn">Current roll</p>
          <p className="mt-2 text-6xl font-black">{round.current}</p>
          <p className="mt-3 text-sm font-bold text-muted">
            d{round.sides}, {round.rerolls} reroll{round.rerolls > 1 ? "s" : ""} left, {formatNumber(round.cost)} cost per reroll.
          </p>
        </div>
        <div className="rounded-lg border border-line bg-panel p-4">
          <p className="text-sm font-black uppercase text-muted">Keep threshold</p>
          <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${round.sides}, minmax(0, 1fr))` }}>
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
          <p className="mt-3 text-sm text-muted">Keep faces at or above the highlighted threshold.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => answer("keep")} className="rounded-lg bg-accent px-4 py-2 font-black text-white">
          Keep
        </button>
        <button type="button" onClick={() => answer("reroll")} className="rounded-lg bg-ink px-4 py-2 font-black text-white">
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
