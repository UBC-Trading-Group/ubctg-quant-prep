import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { randomInt, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Round = {
  types: number;
  packSize: number;
  target: number;
};

const defaultRound: Round = {
  types: 8,
  packSize: 2,
  target: 8,
};

function generateRound(): Round {
  const types = randomInt(6, 14);
  const packSize = randomInt(1, 4);
  const target = Math.random() > 0.35 ? types : Math.ceil(types * 0.8);
  return { types, packSize, target };
}

function simulate(round: Round) {
  const collected = new Set<number>();
  let packs = 0;
  const history: number[] = [];

  while (collected.size < round.target && packs < 500) {
    packs += 1;
    for (let index = 0; index < round.packSize; index += 1) {
      const item = randomInt(1, round.types);
      collected.add(item);
      history.push(item);
    }
  }

  return { packs, collected, history: history.slice(-24) };
}

export default function CouponCollectorGame() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ReturnType<typeof simulate> | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Estimate how many packs it will take, then simulate.");

  useEffect(() => {
    setBest(readStoredNumber("coupon-best"));
  }, []);

  function submitEstimate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const guess = Number(input);
    if (!Number.isFinite(guess) || guess <= 0) {
      setFeedback("Enter a positive pack estimate.");
      return;
    }

    const simulation = simulate(round);
    const correct = Math.abs(guess - simulation.packs) <= Math.max(3, simulation.packs * 0.35);
    const nextScore = score + (correct ? 1 : 0);

    setResult(simulation);
    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("coupon-best", nextScore);
    }
    setFeedback(correct ? `Good estimate. Simulation took ${simulation.packs} packs.` : `Simulation took ${simulation.packs} packs.`);

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(generateRound());
    setInput("");
    setResult(null);
    setFeedback("Estimate how many packs it will take, then simulate.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Coupon Collector Game</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-accent/25 bg-accent/10 p-5">
        <p className="text-sm font-black uppercase text-accent">Collection target</p>
        <p className="mt-3 text-2xl font-black">
          Collect {round.target} of {round.types} item types. Each pack has {round.packSize} item{round.packSize > 1 ? "s" : ""}.
        </p>
        <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${round.types}, minmax(0, 1fr))` }}>
          {Array.from({ length: round.types }, (_, index) => (
            <span
              key={index}
              className={`h-10 rounded-md border border-line ${
                result?.collected.has(index + 1) ? "bg-accent" : "bg-white"
              }`}
            />
          ))}
        </div>
      </div>

      <form onSubmit={submitEstimate} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          inputMode="numeric"
          className="min-w-0 flex-1 rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent-2"
          placeholder="Estimated packs"
        />
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Simulate
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg bg-accent px-4 py-2 font-black text-white">
          New collection
        </button>
      </form>

      {result && (
        <div className="mt-4 rounded-lg border border-line bg-panel p-3">
          <p className="text-xs font-black uppercase text-muted">Recent pulls</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {result.history.map((item, index) => (
              <span key={`${item}-${index}`} className="grid size-8 place-items-center rounded-md bg-white text-xs font-black">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
