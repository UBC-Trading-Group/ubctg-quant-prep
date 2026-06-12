import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { formatNumber, randomChoice, randomInt, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Round = {
  fairValue: number;
  bankroll: number;
  edge: number;
  variance: number;
  adverseSelection: number;
  liquidityCap: number;
};

const defaultRound: Round = {
  fairValue: 50,
  bankroll: 10000,
  edge: 3,
  variance: 12,
  adverseSelection: 0.25,
  liquidityCap: 80,
};

function generateRound(): Round {
  return {
    fairValue: randomInt(20, 90),
    bankroll: randomChoice([2500, 5000, 10000, 25000]),
    edge: randomChoice([1, 2, 3, 5, 8, 12]),
    variance: randomChoice([5, 8, 12, 18, 25]),
    adverseSelection: randomChoice([0.05, 0.15, 0.25, 0.4, 0.6]),
    liquidityCap: randomChoice([20, 40, 80, 120, 200]),
  };
}

function targetSize(round: Round) {
  const riskBudget = round.bankroll * 0.015;
  const riskAdjustedEdge = round.edge * (1 - round.adverseSelection);
  const rawSize = (riskBudget * Math.max(0.2, riskAdjustedEdge)) / Math.max(1, round.variance);
  return Math.max(1, Math.min(round.liquidityCap, rawSize));
}

export default function SizeSelectionGame() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [bid, setBid] = useState("");
  const [ask, setAsk] = useState("");
  const [size, setSize] = useState(25);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Quote a two-sided market and choose how much size to show.");

  useEffect(() => {
    setBest(readStoredNumber("size-selection-best"));
  }, []);

  const target = targetSize(round);
  const riskBars = useMemo(
    () => [
      { label: "Edge", value: round.edge, max: 12, color: "bg-accent" },
      { label: "Variance", value: round.variance, max: 25, color: "bg-warn" },
      { label: "Adverse", value: round.adverseSelection * 100, max: 100, color: "bg-ink" },
    ],
    [round]
  );

  function submitQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const bidValue = Number(bid);
    const askValue = Number(ask);
    if (!Number.isFinite(bidValue) || !Number.isFinite(askValue) || bidValue >= askValue) {
      setFeedback("Enter a valid bid below ask.");
      return;
    }

    const containsFair = bidValue <= round.fairValue && round.fairValue <= askValue;
    const sizeGood = size >= target * 0.65 && size <= target * 1.45;
    const spreadGood = askValue - bidValue <= Math.max(4, round.edge * 2 + round.variance * 0.2);
    const correct = containsFair && sizeGood && spreadGood;
    const nextScore = score + (correct ? 1 : 0);

    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("size-selection-best", nextScore);
    }
    setFeedback(
      correct
        ? `Good quote and size. Target size was about ${formatNumber(target, 0)} up.`
        : `Target size was about ${formatNumber(target, 0)} up. Keep fair inside and size down when variance/adverse selection is high.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    const next = generateRound();
    setRound(next);
    setBid("");
    setAsk("");
    setSize(Math.round(targetSize(next)));
    setFeedback("Quote a two-sided market and choose how much size to show.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Size Selection Game</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Bankroll ${formatNumber(round.bankroll, 0)}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-accent/25 bg-accent/10 p-5">
        <p className="text-sm font-black uppercase text-accent">Risk setup</p>
        <p className="mt-2 text-2xl font-black">Fair value {round.fairValue}. Choose quote and size.</p>
        <p className="mt-3 text-sm font-bold text-muted">Liquidity cap {round.liquidityCap} up.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {riskBars.map((bar) => (
          <div key={bar.label} className="rounded-lg border border-line bg-panel p-4">
            <p className="text-xs font-black uppercase text-muted">{bar.label}</p>
            <p className="mt-2 text-2xl font-black">{formatNumber(bar.value)}</p>
            <div className="mt-3 h-3 rounded-full bg-white">
              <div className={`h-3 rounded-full ${bar.color}`} style={{ width: `${Math.max(4, (bar.value / bar.max) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={submitQuote} className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto_auto]">
        <input
          value={bid}
          onChange={(event) => setBid(event.target.value)}
          inputMode="decimal"
          className="min-w-0 rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent"
          placeholder="Bid"
        />
        <input
          value={ask}
          onChange={(event) => setAsk(event.target.value)}
          inputMode="decimal"
          className="min-w-0 rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent"
          placeholder="Ask"
        />
        <label className="rounded-lg border border-line bg-white px-4 py-2">
          <span className="text-xs font-black uppercase text-muted">Size {size} up</span>
          <input
            type="range"
            min="1"
            max={round.liquidityCap}
            value={size}
            onChange={(event) => setSize(Number(event.target.value))}
            className="w-full"
          />
        </label>
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Quote
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg bg-accent px-4 py-2 font-black text-white">
          New risk
        </button>
      </form>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
