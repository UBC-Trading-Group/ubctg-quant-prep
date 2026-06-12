import { useEffect, useMemo, useState } from "react";
import { formatNumber, randomChoice, randomInt, readStoredNumber, scheduleAutoAdvance, writeStoredNumber } from "./gameUtils";
import { blackScholesGreeks, type OptionParams } from "./optionUtils";

type Action = "buy" | "sell" | "hold";

type Round = {
  strike: number;
  volatility: number;
  rate: number;
  path: number[];
};

const defaultRound: Round = {
  strike: 100,
  volatility: 0.25,
  rate: 0.03,
  path: [100, 104, 99, 96, 103, 108],
};

function optionParams(round: Round, step: number): OptionParams {
  const remainingSteps = Math.max(1, round.path.length - step);

  return {
    spot: round.path[step],
    strike: round.strike,
    volatility: round.volatility,
    rate: round.rate,
    time: remainingSteps / 12,
  };
}

function hedgeDelta(round: Round, step: number) {
  return blackScholesGreeks(optionParams(round, step), "call").delta;
}

function correctAction(currentHedge: number, targetHedge: number): Action {
  if (targetHedge > currentHedge + 0.04) return "buy";
  if (targetHedge < currentHedge - 0.04) return "sell";
  return "hold";
}

function actionLabel(action: Action) {
  if (action === "buy") return "Buy shares";
  if (action === "sell") return "Sell shares";
  return "Hold";
}

function generateRound(): Round {
  const start = randomInt(85, 115);
  const volatility = randomChoice([0.18, 0.25, 0.35, 0.45]);
  const path = [start];

  for (let index = 1; index < 6; index += 1) {
    const move = randomChoice([-1, 1]) * randomInt(1, Math.round(volatility * 18));
    path.push(Math.max(40, path[index - 1] + move));
  }

  return {
    strike: start + randomChoice([-10, -5, 0, 5, 10]),
    volatility,
    rate: randomChoice([0.01, 0.03, 0.05]),
    path,
  };
}

export default function DeltaHedgingSimulator() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [step, setStep] = useState(1);
  const [hedge, setHedge] = useState(() => hedgeDelta(defaultRound, 0));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("You are short one call and hedge with shares. Choose the rebalance direction.");

  useEffect(() => {
    setBest(readStoredNumber("delta-hedging-best"));
  }, []);

  const targetHedge = useMemo(() => hedgeDelta(round, step), [round, step]);
  const answer = correctAction(hedge, targetHedge);
  const done = step >= round.path.length - 1;

  function choose(action: Action) {
    const correct = action === answer;
    const nextScore = score + (correct ? 1 : 0);

    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("delta-hedging-best", nextScore);
    }

    setFeedback(
      correct
        ? `Correct. Move hedge from ${formatNumber(hedge, 3)} to target delta ${formatNumber(targetHedge, 3)}.`
        : `Best action: ${actionLabel(answer)}. Hedge ${formatNumber(hedge, 3)}, target ${formatNumber(targetHedge, 3)}.`
    );
    setHedge(targetHedge);
    setStep((current) => Math.min(round.path.length - 1, current + 1));
    if (step >= round.path.length - 2) {
      scheduleAutoAdvance(nextRound);
    }
  }

  function nextRound() {
    const next = generateRound();
    setRound(next);
    setStep(1);
    setHedge(hedgeDelta(next, 0));
    setFeedback("You are short one call and hedge with shares. Choose the rebalance direction.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Delta Hedging Simulator</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Step {step}</span>
        </div>
      </div>

      <div className="my-5 grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border border-warn/30 bg-warn/10 p-5">
          <p className="text-sm font-black uppercase text-warn">Short call hedge</p>
          <p className="mt-2 text-2xl font-black">
            Stock moved from {formatNumber(round.path[step - 1])} to {formatNumber(round.path[step])}.
          </p>
          <p className="mt-3 text-sm font-bold text-muted">
            Strike {formatNumber(round.strike)}, vol {formatNumber(round.volatility * 100, 0)}%, current hedge {formatNumber(hedge, 3)} shares.
          </p>
        </div>

        <div className="rounded-lg border border-line bg-panel p-4">
          <p className="text-xs font-black uppercase text-muted">Price path</p>
          <div className="mt-3 flex items-end gap-2 overflow-x-auto">
            {round.path.map((price, index) => (
              <div key={`${price}-${index}`} className="min-w-12 flex-1 text-center">
                <div className={`rounded-md ${index <= step ? "bg-accent" : "bg-white"}`} style={{ height: `${Math.max(18, price - 40)}px` }} />
                <p className="mt-2 text-xs font-black text-muted">{formatNumber(price)}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted">Target hedge now: {formatNumber(targetHedge, 3)} shares.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => choose("buy")} disabled={done} className="rounded-lg bg-accent px-4 py-2 font-black text-white disabled:opacity-50">
          Buy shares
        </button>
        <button type="button" onClick={() => choose("sell")} disabled={done} className="rounded-lg bg-warn px-4 py-2 font-black text-white disabled:opacity-50">
          Sell shares
        </button>
        <button type="button" onClick={() => choose("hold")} disabled={done} className="rounded-lg bg-ink px-4 py-2 font-black text-white disabled:opacity-50">
          Hold
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          New path
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{done ? `${feedback} Loading a new path.` : feedback}</p>
    </section>
  );
}
