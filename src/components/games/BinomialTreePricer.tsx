import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { formatNumber, randomChoice, randomInt, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Round = {
  spot: number;
  strike: number;
  up: number;
  down: number;
  rate: number;
};

const defaultRound: Round = {
  spot: 100,
  strike: 100,
  up: 1.1,
  down: 0.9,
  rate: 0.02,
};

function terminal(round: Round) {
  return {
    upStock: round.spot * round.up,
    downStock: round.spot * round.down,
    upPayoff: Math.max(round.spot * round.up - round.strike, 0),
    downPayoff: Math.max(round.spot * round.down - round.strike, 0),
  };
}

function riskNeutralProbability(round: Round) {
  return (1 + round.rate - round.down) / (round.up - round.down);
}

function optionValue(round: Round) {
  const q = riskNeutralProbability(round);
  const values = terminal(round);

  return (q * values.upPayoff + (1 - q) * values.downPayoff) / (1 + round.rate);
}

function generateRound(): Round {
  const spot = randomInt(80, 125);
  const upMove = randomChoice([1.08, 1.1, 1.12, 1.15, 1.2]);
  const downMove = randomChoice([0.78, 0.82, 0.85, 0.88, 0.92]);

  return {
    spot,
    strike: spot + randomChoice([-15, -10, -5, 0, 5, 10, 15]),
    up: upMove,
    down: downMove,
    rate: randomChoice([0, 0.01, 0.02, 0.04]),
  };
}

export default function BinomialTreePricer() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Fill the one-step call value at the root.");

  useEffect(() => {
    setBest(readStoredNumber("binomial-tree-best"));
  }, []);

  const values = terminal(round);
  const q = useMemo(() => riskNeutralProbability(round), [round]);
  const answer = useMemo(() => optionValue(round), [round]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const guess = Number(input);
    if (!Number.isFinite(guess)) {
      setFeedback("Enter a numeric option value.");
      return;
    }

    const correct = Math.abs(guess - answer) <= 0.25;
    const nextScore = score + (correct ? 1 : 0);

    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("binomial-tree-best", nextScore);
    }

    setFeedback(
      correct
        ? `Correct. q=${formatNumber(q, 3)}, root value ${formatNumber(answer)}.`
        : `Root value is ${formatNumber(answer)} using q=${formatNumber(q, 3)} and discounted expected payoff.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(generateRound());
    setInput("");
    setFeedback("Fill the one-step call value at the root.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Binomial Tree Pricer</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-accent-2/25 bg-accent-2/10 p-5">
        <p className="text-sm font-black uppercase text-accent-2">One-step call</p>
        <p className="mt-2 text-2xl font-black">
          Spot {round.spot}, strike {round.strike}, up {formatNumber((round.up - 1) * 100, 0)}%, down {formatNumber((1 - round.down) * 100, 0)}%.
        </p>
        <p className="mt-3 text-sm font-bold text-muted">Risk-free growth {(round.rate * 100).toFixed(0)}% for the step.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-line bg-panel p-4 text-center">
          <p className="text-xs font-black uppercase text-muted">Root</p>
          <p className="mt-2 text-5xl font-black">{formatNumber(round.spot)}</p>
          <p className="mt-2 text-sm font-bold text-muted">Call value ?</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-line bg-white p-4 text-center">
            <p className="text-xs font-black uppercase text-muted">Up node</p>
            <p className="mt-2 text-4xl font-black">{formatNumber(values.upStock)}</p>
            <p className="mt-2 text-sm font-bold text-muted">Payoff {formatNumber(values.upPayoff)}</p>
          </div>
          <div className="rounded-lg border border-line bg-white p-4 text-center">
            <p className="text-xs font-black uppercase text-muted">Down node</p>
            <p className="mt-2 text-4xl font-black">{formatNumber(values.downStock)}</p>
            <p className="mt-2 text-sm font-bold text-muted">Payoff {formatNumber(values.downPayoff)}</p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          inputMode="decimal"
          className="min-w-0 rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent-2"
          placeholder="Root call value"
        />
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Submit
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          New tree
        </button>
      </form>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
