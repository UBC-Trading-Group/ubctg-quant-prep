import { useEffect, useState } from "react";
import { formatNumber, randomChoice, randomInt, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Round = {
  product: string;
  fairValue: number;
  uncertainty: number;
  volatility: number;
  counterparty: "benign" | "mixed" | "sharp";
  confidence: number;
};

const defaultRound: Round = {
  product: "Known d6 payoff",
  fairValue: 42,
  uncertainty: 2,
  volatility: 1,
  counterparty: "mixed",
  confidence: 0.8,
};

function generateRound(): Round {
  return {
    product: randomChoice(["Known dice payoff", "Fermi campus estimate", "Card payoff contract", "Event probability", "Noisy market-size estimate"]),
    fairValue: randomInt(20, 90),
    uncertainty: randomChoice([1, 2, 4, 7, 12]),
    volatility: randomChoice([0.7, 1, 1.3, 1.8]),
    counterparty: randomChoice(["benign", "mixed", "sharp"] as const),
    confidence: randomChoice([0.6, 0.75, 0.9]),
  };
}

function counterpartyMultiplier(counterparty: Round["counterparty"]) {
  if (counterparty === "sharp") return 1.6;
  if (counterparty === "benign") return 0.8;
  return 1.1;
}

function targetWidth(round: Round) {
  const confidenceMultiplier = round.confidence >= 0.9 ? 2.1 : round.confidence >= 0.75 ? 1.6 : 1.2;
  return round.uncertainty * round.volatility * counterpartyMultiplier(round.counterparty) * confidenceMultiplier;
}

export default function SpreadWidthChallenge() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [width, setWidth] = useState(8);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Choose a spread width for the quoted product.");

  useEffect(() => {
    setBest(readStoredNumber("spread-width-best"));
  }, []);

  const target = targetWidth(round);
  const bid = round.fairValue - width / 2;
  const ask = round.fairValue + width / 2;

  function checkWidth() {
    const correct = width >= target * 0.8 && width <= target * 1.25;
    const nextScore = score + (correct ? 1 : 0);
    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("spread-width-best", nextScore);
    }
    setFeedback(
      correct
        ? `Good width. Target was about ${formatNumber(target)} wide.`
        : `Target width was about ${formatNumber(target)}. Quote should widen with uncertainty, volatility, and sharper flow.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    const next = generateRound();
    setRound(next);
    setWidth(Math.round(targetWidth(next)));
    setFeedback("Choose a spread width for the quoted product.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Spread Width Challenge</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-warn/30 bg-warn/10 p-5">
        <p className="text-sm font-black uppercase text-warn">{round.product}</p>
        <p className="mt-2 text-2xl font-black">Fair value {round.fairValue}. Choose how wide to quote.</p>
        <div className="mt-4 grid gap-2 text-sm font-bold text-muted sm:grid-cols-3">
          <span className="rounded-md bg-white px-3 py-2">Uncertainty +/-{round.uncertainty}</span>
          <span className="rounded-md bg-white px-3 py-2">Vol {round.volatility}x</span>
          <span className="rounded-md bg-white px-3 py-2">Flow {round.counterparty}</span>
        </div>
      </div>

      <label className="block rounded-lg border border-line bg-white p-4">
        <span className="flex items-center justify-between gap-3 font-black">
          <span>Width</span>
          <span>{formatNumber(width)} wide: {formatNumber(bid)} / {formatNumber(ask)}</span>
        </span>
        <input
          type="range"
          min="1"
          max="60"
          step="0.5"
          value={width}
          onChange={(event) => setWidth(Number(event.target.value))}
          className="mt-4 w-full"
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={checkWidth} className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Check width
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg bg-warn px-4 py-2 font-black text-white">
          New product
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
