import { useEffect, useMemo, useState } from "react";
import { formatNumber, randomChoice, randomInt, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";
import { blackScholesPrice, createSeededRandom, seededNormal, type OptionParams } from "./optionUtils";

type Round = OptionParams & {
  seed: number;
  tolerance: number;
};

type SampleChoice = 100 | 1000 | 10000;

const sampleChoices: SampleChoice[] = [100, 1000, 10000];

const defaultRound: Round = {
  spot: 100,
  strike: 100,
  volatility: 0.25,
  rate: 0.03,
  time: 1,
  seed: 101,
  tolerance: 1,
};

function estimateCall(round: Round, paths: number) {
  const random = createSeededRandom(round.seed + paths);
  let payoffSum = 0;

  for (let index = 0; index < paths; index += 1) {
    const z = seededNormal(random);
    const drift = (round.rate - 0.5 * round.volatility * round.volatility) * round.time;
    const shock = round.volatility * Math.sqrt(round.time) * z;
    const terminalSpot = round.spot * Math.exp(drift + shock);
    payoffSum += Math.max(terminalSpot - round.strike, 0);
  }

  return Math.exp(-round.rate * round.time) * (payoffSum / paths);
}

function generateRound(): Round {
  return {
    spot: randomInt(80, 125),
    strike: randomInt(80, 125),
    volatility: randomChoice([0.15, 0.2, 0.28, 0.35, 0.45]),
    rate: randomChoice([0, 0.02, 0.04, 0.06]),
    time: randomChoice([0.25, 0.5, 1, 1.5]),
    seed: randomInt(1, 100000),
    tolerance: randomChoice([0.5, 0.75, 1, 1.5, 2]),
  };
}

export default function MonteCarloConvergenceGame() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Choose the smallest sample size likely to clear the error tolerance.");

  useEffect(() => {
    setBest(readStoredNumber("monte-carlo-convergence-best"));
  }, []);

  const exact = useMemo(() => blackScholesPrice(round, "call"), [round]);
  const estimates = useMemo(
    () =>
      sampleChoices.map((paths) => ({
        paths,
        estimate: estimateCall(round, paths),
      })),
    [round]
  );
  const bestChoice = estimates.find((item) => Math.abs(item.estimate - exact) <= round.tolerance)?.paths ?? 10000;
  const maxError = Math.max(...estimates.map((item) => Math.abs(item.estimate - exact)), 1);

  function choose(paths: SampleChoice) {
    const correct = paths === bestChoice;
    const nextScore = score + (correct ? 1 : 0);

    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("monte-carlo-convergence-best", nextScore);
    }

    const chosen = estimates.find((item) => item.paths === paths);
    setFeedback(
      correct
        ? `Correct. ${paths.toLocaleString()} paths is the smallest choice inside ${formatNumber(round.tolerance)} of exact price ${formatNumber(exact)}.`
        : `${paths.toLocaleString()} paths estimated ${formatNumber(chosen?.estimate ?? 0)}. Smallest passing choice: ${bestChoice.toLocaleString()} paths.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(generateRound());
    setFeedback("Choose the smallest sample size likely to clear the error tolerance.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Monte Carlo Convergence Game</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Tolerance {formatNumber(round.tolerance)}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-accent/25 bg-accent/10 p-5">
        <p className="text-sm font-black uppercase text-accent">Call option simulation</p>
        <p className="mt-2 text-2xl font-black">
          S {round.spot}, K {round.strike}, vol {formatNumber(round.volatility * 100, 0)}%, T {formatNumber(round.time)}y.
        </p>
        <p className="mt-3 text-sm font-bold text-muted">Exact Black-Scholes price is hidden until you choose.</p>
      </div>

      <div className="rounded-lg border border-line bg-panel p-4">
        <p className="text-xs font-black uppercase text-muted">Simulation error preview</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {estimates.map((item) => {
            const error = Math.abs(item.estimate - exact);
            return (
              <button
                key={item.paths}
                type="button"
                onClick={() => choose(item.paths)}
                className="rounded-lg border border-line bg-white p-4 text-left transition hover:border-accent"
              >
                <p className="text-sm font-black">{item.paths.toLocaleString()} paths</p>
                <p className="mt-2 text-3xl font-black">{formatNumber(item.estimate)}</p>
                <div className="mt-3 h-2 rounded-full bg-panel">
                  <div className="h-2 rounded-full bg-accent" style={{ width: `${Math.max(6, (error / maxError) * 100)}%` }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <button type="button" onClick={nextRound} className="mt-4 rounded-lg border border-line bg-panel px-4 py-2 font-black">
        New simulation
      </button>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
