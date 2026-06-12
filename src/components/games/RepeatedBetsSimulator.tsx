import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { formatNumber, formatPercent, randomChoice, randomInt, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Round = {
  trials: number;
  winProbability: number;
  winProfit: number;
  loss: number;
  bankroll: number;
};

type Simulation = {
  totals: number[];
  average: number;
  ruinRate: number;
};

const defaultRound: Round = {
  trials: 100,
  winProbability: 0.55,
  winProfit: 11,
  loss: 10,
  bankroll: 500,
};

function generateRound(): Round {
  return {
    trials: randomChoice([50, 75, 100, 150, 250]),
    winProbability: randomChoice([0.44, 0.48, 0.52, 0.56, 0.6, 0.64]),
    winProfit: randomChoice([8, 10, 12, 15, 20]),
    loss: randomChoice([8, 10, 12, 15]),
    bankroll: randomChoice([200, 500, 1000]),
  };
}

function simulate(round: Round): Simulation {
  const totals: number[] = [];
  let ruins = 0;

  for (let path = 0; path < 160; path += 1) {
    let pnl = 0;
    let bankroll = round.bankroll;
    let ruined = false;

    for (let trial = 0; trial < round.trials; trial += 1) {
      const result = Math.random() < round.winProbability ? round.winProfit : -round.loss;
      pnl += result;
      bankroll += result;
      if (bankroll <= 0) ruined = true;
    }

    totals.push(pnl);
    if (ruined) ruins += 1;
  }

  return {
    totals,
    average: totals.reduce((sum, value) => sum + value, 0) / totals.length,
    ruinRate: ruins / totals.length,
  };
}

function money(value: number) {
  return `$${formatNumber(value)}`;
}

export default function RepeatedBetsSimulator() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [input, setInput] = useState("");
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Estimate expected total P&L before simulating.");

  useEffect(() => {
    setBest(readStoredNumber("repeated-bets-best"));
  }, []);

  const singleEv = round.winProbability * round.winProfit - (1 - round.winProbability) * round.loss;
  const expectedTotal = singleEv * round.trials;
  const chartValues = useMemo(() => simulation?.totals.slice(0, 42) ?? [], [simulation]);
  const chartMin = Math.min(...chartValues, 0);
  const chartMax = Math.max(...chartValues, 1);

  function submitEstimate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const guess = Number(input);
    if (!Number.isFinite(guess)) {
      setFeedback("Enter a dollar P&L estimate.");
      return;
    }

    const nextSimulation = simulate(round);
    const correct = Math.abs(guess - expectedTotal) <= Math.max(8, Math.abs(expectedTotal) * 0.15);
    const nextScore = score + (correct ? 1 : 0);

    setSimulation(nextSimulation);
    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("repeated-bets-best", nextScore);
    }
    setFeedback(
      correct
        ? `Good estimate. EV total ${money(expectedTotal)}, simulated average ${money(nextSimulation.average)}.`
        : `EV total ${money(expectedTotal)}, simulated average ${money(nextSimulation.average)}.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(generateRound());
    setInput("");
    setSimulation(null);
    setFeedback("Estimate expected total P&L before simulating.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Repeated Bets Simulator</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-warn/30 bg-warn/10 p-5">
        <p className="text-sm font-black uppercase text-warn">Trial setup</p>
        <p className="mt-2 text-2xl font-black">
          Play {round.trials} bets. Win {money(round.winProfit)} with {formatPercent(round.winProbability, 0)}, otherwise lose {money(round.loss)}.
        </p>
        <p className="mt-3 text-sm font-bold text-muted">Starting bankroll {money(round.bankroll)}. Single-bet EV {money(singleEv)}.</p>
      </div>

      <form onSubmit={submitEstimate} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          inputMode="decimal"
          className="min-w-0 flex-1 rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent-2"
          placeholder="Expected total P&L"
        />
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Simulate
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg bg-warn px-4 py-2 font-black text-white">
          New trial set
        </button>
      </form>

      {simulation && (
        <div className="mt-5 rounded-lg border border-line bg-panel p-4">
          <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
            <span className="rounded-md bg-white px-3 py-2">Average {money(simulation.average)}</span>
            <span className="rounded-md bg-white px-3 py-2">Ruin rate {formatPercent(simulation.ruinRate, 1)}</span>
          </div>
          <div className="mt-4 flex h-32 items-end gap-1">
            {chartValues.map((value, index) => {
              const height = ((value - chartMin) / Math.max(1, chartMax - chartMin)) * 100;
              return (
                <div
                  key={`${value}-${index}`}
                  className={`flex-1 rounded-t-sm ${value >= 0 ? "bg-accent" : "bg-warn"}`}
                  style={{ height: `${Math.max(4, height)}%` }}
                  title={money(value)}
                />
              );
            })}
          </div>
        </div>
      )}

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
