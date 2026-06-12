import { useEffect, useMemo, useState } from "react";
import { formatNumber, randomChoice, randomInt, readStoredNumber, scheduleAutoAdvance, writeStoredNumber } from "./gameUtils";

type Round = {
  values: number[];
  cost: number;
};

const defaultRound: Round = {
  values: [0, 10, 25, 100],
  cost: 18,
};

function money(value: number) {
  return `$${formatNumber(value)}`;
}

function generateRound(): Round {
  const count = randomInt(4, 8);
  const values = Array.from({ length: count }, () => randomChoice([0, 0, 5, 10, 20, 40, 75]));
  values[randomInt(0, count - 1)] = randomChoice([80, 100, 150]);
  return {
    values,
    cost: randomChoice([5, 8, 10, 12, 15, 20, 25]),
  };
}

function nextBoxEdge(values: number[], revealed: Set<number>, bestValue: number, cost: number) {
  const unopened = values.filter((_, index) => !revealed.has(index));
  if (unopened.length === 0) return Number.NEGATIVE_INFINITY;
  const expectedImprovement =
    unopened.reduce((sum, value) => sum + Math.max(0, value - bestValue), 0) / unopened.length;
  return expectedImprovement - cost;
}

export default function SealedBoxEVGame() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [bestValue, setBestValue] = useState(0);
  const [spent, setSpent] = useState(0);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Open if the expected improvement beats the search cost.");

  useEffect(() => {
    setBest(readStoredNumber("sealed-box-best"));
  }, []);

  const edge = useMemo(() => nextBoxEdge(round.values, revealed, bestValue, round.cost), [bestValue, revealed, round]);
  const shouldOpen = edge > 0;
  const unopenedCount = round.values.length - revealed.size;
  const netValue = bestValue - spent;

  function updateScore(correct: boolean) {
    const nextScore = score + (correct ? 1 : 0);
    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("sealed-box-best", nextScore);
    }
  }

  function openBox() {
    if (done || unopenedCount === 0) return;
    const correct = shouldOpen;
    const unopened = round.values.map((_, index) => index).filter((index) => !revealed.has(index));
    const index = randomChoice(unopened);
    const value = round.values[index];
    const nextRevealed = new Set(revealed);
    nextRevealed.add(index);

    updateScore(correct);
    setRevealed(nextRevealed);
    setBestValue((current) => Math.max(current, value));
    setSpent((current) => current + round.cost);
    setFeedback(
      correct
        ? `Correct search decision. Box revealed ${money(value)}.`
        : `Opening was not optimal; next-box edge was ${money(edge)}. Box revealed ${money(value)}.`
    );
  }

  function stopSearch() {
    if (done) return;
    const correct = !shouldOpen;
    updateScore(correct);
    setDone(true);
    setFeedback(
      correct
        ? `Correct stop. Best box ${money(bestValue)}, net ${money(netValue)}.`
        : `Stopping early leaves expected edge of ${money(edge)} on the next box.`
    );
    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(generateRound());
    setRevealed(new Set());
    setBestValue(0);
    setSpent(0);
    setDone(false);
    setFeedback("Open if the expected improvement beats the search cost.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Sealed Box EV Game</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Net {money(netValue)}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-warn/30 bg-warn/10 p-5">
        <p className="text-sm font-black uppercase text-warn">Search market</p>
        <p className="mt-2 text-2xl font-black">
          {round.values.length} sealed boxes. Opening costs {money(round.cost)}. You may keep the best value revealed.
        </p>
        <p className="mt-3 text-sm font-bold text-muted">
          Best revealed {money(bestValue)}. Spent {money(spent)}. Unopened {unopenedCount}.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {round.values.map((value, index) => {
          const isOpen = revealed.has(index);
          return (
            <div
              key={`${value}-${index}`}
              className={`grid aspect-[4/3] place-items-center rounded-lg border p-3 text-center ${
                isOpen ? "border-accent bg-accent/10" : "border-line bg-panel"
              }`}
            >
              <div>
                <p className="text-xs font-black uppercase text-muted">Box {index + 1}</p>
                <p className="mt-2 text-2xl font-black">{isOpen ? money(value) : "Sealed"}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={openBox} disabled={done || unopenedCount === 0} className="rounded-lg bg-warn px-4 py-2 font-black text-white disabled:opacity-50">
          Open box
        </button>
        <button type="button" onClick={stopSearch} disabled={done} className="rounded-lg bg-ink px-4 py-2 font-black text-white disabled:opacity-50">
          Stop
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          New boxes
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
