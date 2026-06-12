import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { formatNumber, randomChoice, randomInt, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type PayoffKind = "sum" | "max" | "threshold" | "match";

type OutcomeBar = {
  label: string;
  probability: number;
  payoff: number;
};

type Round = {
  diceCount: number;
  sides: number;
  kind: PayoffKind;
  multiplier: number;
  payout: number;
  threshold: number;
  maxSpread: number;
  prompt: string;
};

const defaultRound: Round = {
  diceCount: 3,
  sides: 6,
  kind: "max",
  multiplier: 4,
  payout: 30,
  threshold: 12,
  maxSpread: 5,
  prompt: "Make a market on 4x the maximum of 3 d6.",
};

function enumerateRolls(diceCount: number, sides: number): number[][] {
  if (diceCount === 0) return [[]];

  const smallerRolls = enumerateRolls(diceCount - 1, sides);
  return smallerRolls.flatMap((roll) => Array.from({ length: sides }, (_, index) => [...roll, index + 1]));
}

function payoffForRoll(roll: number[], round: Round) {
  const sum = roll.reduce((total, face) => total + face, 0);

  if (round.kind === "sum") return sum * round.multiplier;
  if (round.kind === "max") return Math.max(...roll) * round.multiplier;
  if (round.kind === "threshold") return sum >= round.threshold ? round.payout : 0;

  return new Set(roll).size < roll.length ? round.payout : 0;
}

function outcomeLabel(roll: number[], round: Round) {
  const sum = roll.reduce((total, face) => total + face, 0);

  if (round.kind === "sum") return String(sum);
  if (round.kind === "max") return String(Math.max(...roll));
  if (round.kind === "threshold") return sum >= round.threshold ? "Pays" : "Misses";
  return new Set(roll).size < roll.length ? "Match" : "No match";
}

function summarizeRound(round: Round) {
  const rolls = enumerateRolls(round.diceCount, round.sides);
  const buckets = new Map<string, { payoff: number; count: number }>();

  rolls.forEach((roll) => {
    const label = outcomeLabel(roll, round);
    const current = buckets.get(label) ?? { payoff: payoffForRoll(roll, round), count: 0 };
    current.count += 1;
    buckets.set(label, current);
  });

  const outcomes = [...buckets.entries()]
    .map(([label, bucket]) => ({
      label,
      payoff: bucket.payoff,
      probability: bucket.count / rolls.length,
    }))
    .sort((left, right) => Number(left.label) - Number(right.label));

  const fairValue = outcomes.reduce((sum, outcome) => sum + outcome.payoff * outcome.probability, 0);

  return { outcomes, fairValue };
}

function generateRound(): Round {
  const diceCount = randomChoice([2, 3, 4]);
  const sides = randomChoice([6, 8, 10]);
  const kind = randomChoice<PayoffKind>(["sum", "max", "threshold", "match"]);
  const multiplier = randomChoice([2, 3, 4, 5]);
  const payout = randomChoice([20, 30, 40, 50, 60]);
  const threshold = randomInt(Math.ceil(diceCount * sides * 0.55), Math.ceil(diceCount * sides * 0.8));

  const prompt =
    kind === "sum"
      ? `Make a market on ${multiplier}x the sum of ${diceCount} d${sides}.`
      : kind === "max"
        ? `Make a market on ${multiplier}x the maximum of ${diceCount} d${sides}.`
        : kind === "threshold"
          ? `Pays ${payout} if the sum of ${diceCount} d${sides} is at least ${threshold}.`
          : `Pays ${payout} if any two of ${diceCount} d${sides} match.`;

  return {
    diceCount,
    sides,
    kind,
    multiplier,
    payout,
    threshold,
    maxSpread: randomChoice([4, 5, 6, 8]),
    prompt,
  };
}

export default function DiceMarketGame() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [bid, setBid] = useState("");
  const [ask, setAsk] = useState("");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Quote a bid and ask around the exact fair value.");

  useEffect(() => {
    setBest(readStoredNumber("dice-market-best"));
  }, []);

  const { outcomes, fairValue } = useMemo(() => summarizeRound(round), [round]);
  const maxProbability = Math.max(...outcomes.map((outcome) => outcome.probability), 0.01);

  function submitQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const bidValue = Number(bid);
    const askValue = Number(ask);

    if (!Number.isFinite(bidValue) || !Number.isFinite(askValue) || bidValue > askValue) {
      setFeedback("Enter numeric bid and ask values with bid no greater than ask.");
      return;
    }

    const spread = askValue - bidValue;
    const correct = bidValue <= fairValue && fairValue <= askValue && spread <= round.maxSpread;
    const nextScore = score + (correct ? 1 : 0);

    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("dice-market-best", nextScore);
    }
    setFeedback(
      correct
        ? `Good market. Fair value is ${formatNumber(fairValue)} with max spread ${round.maxSpread}.`
        : `Fair value is ${formatNumber(fairValue)}. Keep it inside a spread of ${round.maxSpread} or less.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(generateRound());
    setBid("");
    setAsk("");
    setFeedback("Quote a bid and ask around the exact fair value.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Dice Market Game</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Max spread {round.maxSpread}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-warn/30 bg-warn/10 p-5">
        <p className="text-sm font-black uppercase text-warn">
          {round.diceCount}d{round.sides} contract
        </p>
        <p className="mt-2 text-2xl font-black">{round.prompt}</p>
      </div>

      <div className="rounded-lg border border-line bg-panel p-4">
        <p className="text-xs font-black uppercase text-muted">Outcome distribution</p>
        <div className="mt-3 flex items-end gap-2 overflow-x-auto">
          {outcomes.map((outcome) => (
            <div key={outcome.label} className="min-w-16 flex-1 text-center">
              <div className="flex h-24 items-end rounded-md bg-white p-2">
                <div
                  className="w-full rounded-md bg-warn"
                  style={{ height: `${Math.max(6, (outcome.probability / maxProbability) * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-black text-muted">{outcome.label}</p>
              <p className="text-xs font-bold">{formatNumber(outcome.payoff, 1)}</p>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={submitQuote} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
        <input
          value={bid}
          onChange={(event) => setBid(event.target.value)}
          inputMode="decimal"
          className="min-w-0 rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent-2"
          placeholder="Bid"
        />
        <input
          value={ask}
          onChange={(event) => setAsk(event.target.value)}
          inputMode="decimal"
          className="min-w-0 rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent-2"
          placeholder="Ask"
        />
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Quote
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          New market
        </button>
      </form>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
