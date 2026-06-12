import { useEffect, useMemo, useState } from "react";
import { formatNumber, randomChoice, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Position = -1 | 0 | 1;

type Instrument = {
  id: string;
  label: string;
  payoffs: number[];
};

type Round = {
  title: string;
  prompt: string;
  states: number[];
  target: number[];
  instruments: Instrument[];
  solution: Record<string, Position>;
};

function callPayoff(strike: number, states: number[]) {
  return states.map((spot) => Math.max(spot - strike, 0));
}

function putPayoff(strike: number, states: number[]) {
  return states.map((spot) => Math.max(strike - spot, 0));
}

function buildPositions(round: Round) {
  return Object.fromEntries(round.instruments.map((instrument) => [instrument.id, 0 as Position]));
}

function portfolioPayoff(round: Round, positions: Record<string, Position>) {
  return round.states.map((_, index) =>
    round.instruments.reduce((sum, instrument) => sum + (positions[instrument.id] ?? 0) * instrument.payoffs[index], 0)
  );
}

function arraysMatch(left: number[], right: number[]) {
  return left.length === right.length && left.every((value, index) => Math.abs(value - right[index]) < 1e-9);
}

function cappedCallRound(): Round {
  const lowStrike = randomChoice([70, 80, 90, 100]);
  const highStrike = lowStrike + randomChoice([10, 20, 30]);
  const states = [lowStrike - 20, lowStrike, (lowStrike + highStrike) / 2, highStrike, highStrike + 20];
  const lowCall = callPayoff(lowStrike, states);
  const highCall = callPayoff(highStrike, states);

  return {
    title: "Capped call",
    prompt: `Build a call that stops gaining after S = ${highStrike}.`,
    states,
    target: lowCall.map((value, index) => value - highCall[index]),
    instruments: [
      { id: "call-low", label: `Call ${lowStrike}`, payoffs: lowCall },
      { id: "call-high", label: `Call ${highStrike}`, payoffs: highCall },
      { id: "put-low", label: `Put ${lowStrike}`, payoffs: putPayoff(lowStrike, states) },
    ],
    solution: { "call-low": 1, "call-high": -1, "put-low": 0 },
  };
}

function bearPutRound(): Round {
  const lowStrike = randomChoice([70, 80, 90, 100]);
  const highStrike = lowStrike + randomChoice([10, 20, 30]);
  const states = [lowStrike - 20, lowStrike, (lowStrike + highStrike) / 2, highStrike, highStrike + 20];
  const lowPut = putPayoff(lowStrike, states);
  const highPut = putPayoff(highStrike, states);

  return {
    title: "Bear put spread",
    prompt: `Build a downside payoff capped below S = ${lowStrike}.`,
    states,
    target: highPut.map((value, index) => value - lowPut[index]),
    instruments: [
      { id: "put-low", label: `Put ${lowStrike}`, payoffs: lowPut },
      { id: "put-high", label: `Put ${highStrike}`, payoffs: highPut },
      { id: "call-high", label: `Call ${highStrike}`, payoffs: callPayoff(highStrike, states) },
    ],
    solution: { "put-low": -1, "put-high": 1, "call-high": 0 },
  };
}

function collarRound(): Round {
  const lowStrike = randomChoice([70, 80, 90]);
  const highStrike = lowStrike + randomChoice([20, 30, 40]);
  const states = [lowStrike - 20, lowStrike, (lowStrike + highStrike) / 2, highStrike, highStrike + 20];
  const stock = states;
  const putLow = putPayoff(lowStrike, states);
  const callHigh = callPayoff(highStrike, states);

  return {
    title: "Collar",
    prompt: `Build stock exposure protected below ${lowStrike} and capped above ${highStrike}.`,
    states,
    target: stock.map((value, index) => value + putLow[index] - callHigh[index]),
    instruments: [
      { id: "stock", label: "Stock", payoffs: stock },
      { id: "put-low", label: `Put ${lowStrike}`, payoffs: putLow },
      { id: "call-high", label: `Call ${highStrike}`, payoffs: callHigh },
    ],
    solution: { stock: 1, "put-low": 1, "call-high": -1 },
  };
}

function generateRound() {
  return randomChoice([cappedCallRound, bearPutRound, collarRound])();
}

const defaultRound = cappedCallRound();

export default function PayoffConstructor() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [positions, setPositions] = useState<Record<string, Position>>(buildPositions(defaultRound));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Set each instrument to short, flat, or long, then submit.");

  useEffect(() => {
    setBest(readStoredNumber("payoff-constructor-best"));
  }, []);

  const built = useMemo(() => portfolioPayoff(round, positions), [round, positions]);
  const maxPayoff = Math.max(...round.target.map((value) => Math.abs(value)), ...built.map((value) => Math.abs(value)), 1);

  function setPosition(id: string, position: Position) {
    setPositions((current) => ({ ...current, [id]: position }));
  }

  function submit() {
    const correct = arraysMatch(built, round.target);
    const nextScore = score + (correct ? 1 : 0);

    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("payoff-constructor-best", nextScore);
    }

    const solution = round.instruments
      .filter((instrument) => round.solution[instrument.id] !== 0)
      .map((instrument) => `${round.solution[instrument.id] === 1 ? "long" : "short"} ${instrument.label}`)
      .join(", ");

    setFeedback(correct ? `Correct. ${solution}.` : `Not quite. Target replication is ${solution}.`);

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    const next = generateRound();
    setRound(next);
    setPositions(buildPositions(next));
    setFeedback("Set each instrument to short, flat, or long, then submit.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Payoff Constructor</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-accent-2/25 bg-accent-2/10 p-5">
        <p className="text-sm font-black uppercase text-accent-2">{round.title}</p>
        <p className="mt-2 text-2xl font-black">{round.prompt}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-line bg-panel p-4">
          <p className="text-xs font-black uppercase text-muted">Target payoff</p>
          <div className="mt-3 flex items-end gap-2 overflow-x-auto">
            {round.states.map((state, index) => (
              <div key={state} className="min-w-14 flex-1 text-center">
                <div className="flex h-24 items-end rounded-md bg-white p-2">
                  <div className="w-full rounded-md bg-accent-2" style={{ height: `${Math.max(5, Math.abs(round.target[index]) / maxPayoff * 100)}%` }} />
                </div>
                <p className="mt-2 text-xs font-black text-muted">S={formatNumber(state)}</p>
                <p className="text-xs font-bold">{formatNumber(round.target[index])}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-line bg-panel p-4">
          <p className="text-xs font-black uppercase text-muted">Built payoff</p>
          <div className="mt-3 flex items-end gap-2 overflow-x-auto">
            {round.states.map((state, index) => (
              <div key={state} className="min-w-14 flex-1 text-center">
                <div className="flex h-24 items-end rounded-md bg-white p-2">
                  <div className="w-full rounded-md bg-warn" style={{ height: `${Math.max(5, Math.abs(built[index]) / maxPayoff * 100)}%` }} />
                </div>
                <p className="mt-2 text-xs font-black text-muted">S={formatNumber(state)}</p>
                <p className="text-xs font-bold">{formatNumber(built[index])}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {round.instruments.map((instrument) => (
          <div key={instrument.id} className="rounded-lg border border-line bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-black">{instrument.label}</p>
              <div className="grid grid-cols-3 gap-2 text-sm font-black">
                {[
                  ["Short", -1],
                  ["Flat", 0],
                  ["Long", 1],
                ].map(([label, value]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setPosition(instrument.id, value as Position)}
                    className={`rounded-md border px-3 py-2 ${
                      positions[instrument.id] === value ? "border-ink bg-ink text-white" : "border-line bg-panel"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={submit} className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Submit
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          New payoff
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
