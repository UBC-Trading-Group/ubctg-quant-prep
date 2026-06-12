import { useEffect, useMemo, useState } from "react";
import { formatPercent, gcd, randomChoice, randomInt, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Outcome = {
  first: number;
  second: number;
};

type Round = {
  sides: number;
  label: string;
  detail: string;
  test: (outcome: Outcome) => boolean;
};

const defaultRound: Round = {
  sides: 6,
  label: "Sum is 7",
  detail: "Select every two-dice outcome where the total equals 7.",
  test: ({ first, second }) => first + second === 7,
};

function generateRound(): Round {
  const sides = randomChoice([4, 6, 8, 10]);
  const kind = randomChoice(["sum", "product", "parity", "inequality", "doubles"]);

  if (kind === "sum") {
    const target = randomInt(3, sides * 2 - 1);
    return {
      sides,
      label: `Sum is ${target}`,
      detail: `Select outcomes where d1 + d2 = ${target}.`,
      test: ({ first, second }) => first + second === target,
    };
  }

  if (kind === "product") {
    const target = randomChoice([6, 8, 10, 12, 16, 18, 24].filter((value) => value <= sides * sides));
    return {
      sides,
      label: `Product >= ${target}`,
      detail: `Select outcomes where d1 x d2 is at least ${target}.`,
      test: ({ first, second }) => first * second >= target,
    };
  }

  if (kind === "parity") {
    const parity = randomChoice(["even", "odd"]);
    return {
      sides,
      label: `Sum is ${parity}`,
      detail: `Select outcomes where the sum has ${parity} parity.`,
      test: ({ first, second }) => (first + second) % 2 === (parity === "even" ? 0 : 1),
    };
  }

  if (kind === "inequality") {
    const gap = randomChoice([1, 2, 3]);
    return {
      sides,
      label: `d1 exceeds d2 by ${gap}+`,
      detail: `Select outcomes where the first die is at least ${gap} higher than the second.`,
      test: ({ first, second }) => first - second >= gap,
    };
  }

  return {
    sides,
    label: "Doubles or neighbors",
    detail: "Select doubles and outcomes where the two dice differ by exactly 1.",
    test: ({ first, second }) => first === second || Math.abs(first - second) === 1,
  };
}

export default function DiceProbabilityGrid() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Select all valid outcomes, then check your grid.");

  useEffect(() => {
    setBest(readStoredNumber("dice-grid-best"));
  }, []);

  const outcomes = useMemo(() => {
    return Array.from({ length: round.sides }, (_, row) =>
      Array.from({ length: round.sides }, (_, column) => ({
        first: row + 1,
        second: column + 1,
      }))
    );
  }, [round.sides]);

  const validKeys = useMemo(() => {
    const keys = new Set<string>();
    outcomes.flat().forEach((outcome) => {
      if (round.test(outcome)) keys.add(`${outcome.first}-${outcome.second}`);
    });
    return keys;
  }, [outcomes, round]);

  const probability = validKeys.size / (round.sides * round.sides);
  const divisor = gcd(validKeys.size, round.sides * round.sides);

  function toggleOutcome(outcome: Outcome) {
    const key = `${outcome.first}-${outcome.second}`;
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelected(next);
  }

  function checkAnswer() {
    const falsePositive = [...selected].some((key) => !validKeys.has(key));
    const missed = [...validKeys].some((key) => !selected.has(key));
    const correct = !falsePositive && !missed;
    const nextScore = score + (correct ? 1 : 0);

    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("dice-grid-best", nextScore);
    }

    setFeedback(
      correct
        ? `Correct. Probability ${validKeys.size}/${round.sides * round.sides} = ${formatPercent(probability)}.`
        : `Not quite. Valid outcomes: ${validKeys.size}/${round.sides * round.sides}. Probability ${validKeys.size / divisor}/${(round.sides * round.sides) / divisor}.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(generateRound());
    setSelected(new Set());
    setFeedback("Select all valid outcomes, then check your grid.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Dice Probability Grid</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">d{round.sides} x d{round.sides}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-accent/25 bg-accent/10 p-4">
        <p className="text-sm font-black uppercase text-accent">{round.label}</p>
        <p className="mt-2 text-muted">{round.detail}</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-panel p-3">
        <div
          className="grid min-w-96 gap-1"
          style={{ gridTemplateColumns: `repeat(${round.sides}, minmax(0, 1fr))` }}
        >
          {outcomes.flat().map((outcome) => {
            const key = `${outcome.first}-${outcome.second}`;
            const isSelected = selected.has(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleOutcome(outcome)}
                className={`aspect-square rounded-md border text-sm font-black transition ${
                  isSelected
                    ? "border-accent bg-accent text-white"
                    : "border-line bg-white text-ink hover:border-accent"
                }`}
              >
                {outcome.first},{outcome.second}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={checkAnswer} className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Check
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg bg-accent px-4 py-2 font-black text-white">
          New grid
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
