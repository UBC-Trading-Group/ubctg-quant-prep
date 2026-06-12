import { useEffect, useMemo, useState } from "react";
import { formatNumber, formatPercent, randomChoice, randomInt, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Action = "long-a" | "short-a" | "pass";

type Round = {
  assetA: string;
  assetB: string;
  hedgeRatio: number;
  priceA: number;
  priceB: number;
  volatility: number;
  meanReversion: number;
  cost: number;
};

const defaultRound: Round = {
  assetA: "North",
  assetB: "South",
  hedgeRatio: 2,
  priceA: 104,
  priceB: 50,
  volatility: 2,
  meanReversion: 0.7,
  cost: 1,
};

function fairA(round: Round) {
  return round.hedgeRatio * round.priceB;
}

function tradeHurdle(round: Round) {
  return round.cost + round.volatility * (1 - round.meanReversion);
}

function bestAction(round: Round): Action {
  const spread = round.priceA - fairA(round);
  const hurdle = tradeHurdle(round);

  if (spread > hurdle) return "short-a";
  if (spread < -hurdle) return "long-a";
  return "pass";
}

function actionLabel(action: Action) {
  if (action === "long-a") return "Long A, short B";
  if (action === "short-a") return "Short A, long B";
  return "Pass";
}

function generateRound(): Round {
  const pairs = randomChoice([
    ["North", "South"],
    ["Alpha", "Beta"],
    ["Copper", "Zinc"],
    ["Metro", "Rail"],
    ["Cloud", "Server"],
  ]);
  const hedgeRatio = randomChoice([0.75, 1, 1.25, 1.5, 2, 2.5]);
  const priceB = randomInt(24, 80);
  const fair = hedgeRatio * priceB;

  return {
    assetA: pairs[0],
    assetB: pairs[1],
    hedgeRatio,
    priceA: fair + randomChoice([-8, -5, -3, -1, 0, 1, 3, 5, 8]),
    priceB,
    volatility: randomChoice([1, 1.5, 2, 3, 4]),
    meanReversion: randomChoice([0.35, 0.5, 0.65, 0.8, 0.9]),
    cost: randomChoice([0.5, 1, 1.5, 2]),
  };
}

export default function PairsMispricingGame() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Compare the current spread to the hedge-ratio fair value.");

  useEffect(() => {
    setBest(readStoredNumber("pairs-mispricing-best"));
  }, []);

  const fairValue = useMemo(() => fairA(round), [round]);
  const spread = round.priceA - fairValue;
  const answer = useMemo(() => bestAction(round), [round]);
  const spreadPercent = Math.min(100, Math.abs(spread) / Math.max(tradeHurdle(round) * 2, 1) * 100);

  function choose(action: Action) {
    const correct = action === answer;
    const nextScore = score + (correct ? 1 : 0);

    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("pairs-mispricing-best", nextScore);
    }

    setFeedback(
      correct
        ? `Correct. Fair A is ${formatNumber(fairValue)} and spread is ${formatNumber(spread)}.`
        : `Best action: ${actionLabel(answer)}. Fair A is ${formatNumber(fairValue)}, spread ${formatNumber(spread)}, hurdle ${formatNumber(tradeHurdle(round))}.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(generateRound());
    setFeedback("Compare the current spread to the hedge-ratio fair value.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Pairs Mispricing Game</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-accent/25 bg-accent/10 p-5">
          <p className="text-sm font-black uppercase text-accent">Linked pair</p>
          <p className="mt-2 text-2xl font-black">
            {round.assetA} usually trades {formatNumber(round.hedgeRatio)}x {round.assetB}
          </p>
          <p className="mt-3 text-sm font-bold text-muted">
            Mean reversion {formatPercent(round.meanReversion, 0)}, volatility {formatNumber(round.volatility)}, cost {formatNumber(round.cost)}.
          </p>
        </div>

        <div className="rounded-lg border border-line bg-panel p-4">
          <p className="text-xs font-black uppercase text-muted">Current prices</p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg border border-line bg-white p-4">
              <p className="text-xs font-black uppercase text-muted">{round.assetA}</p>
              <p className="mt-2 text-4xl font-black">{formatNumber(round.priceA)}</p>
            </div>
            <div className="rounded-lg border border-line bg-white p-4">
              <p className="text-xs font-black uppercase text-muted">{round.assetB}</p>
              <p className="mt-2 text-4xl font-black">{formatNumber(round.priceB)}</p>
            </div>
          </div>
          <div className="mt-4 h-3 rounded-full bg-white">
            <div className={`h-3 rounded-full ${spread >= 0 ? "bg-warn" : "bg-accent"}`} style={{ width: `${Math.max(6, spreadPercent)}%` }} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => choose("long-a")} className="rounded-lg bg-accent px-4 py-2 font-black text-white">
          Long A
        </button>
        <button type="button" onClick={() => choose("short-a")} className="rounded-lg bg-warn px-4 py-2 font-black text-white">
          Short A
        </button>
        <button type="button" onClick={() => choose("pass")} className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Pass
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          New pair
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
