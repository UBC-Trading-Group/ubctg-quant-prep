import { useEffect, useState } from "react";
import { formatNumber, randomChoice, randomInt, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Round = {
  fairValue: number;
  bid: number;
  ask: number;
  fee: number;
  uncertainty: number;
  prompt: string;
};

const defaultRound: Round = {
  fairValue: 48,
  bid: 42,
  ask: 45,
  fee: 0.5,
  uncertainty: 2,
  prompt: "One-lot contract market",
};

function generateRound(): Round {
  const fairValue = randomInt(20, 90);
  const spread = randomChoice([2, 3, 4, 5, 8]);
  const skew = randomInt(-10, 10);
  const midpoint = fairValue + skew;
  const bid = midpoint - spread / 2;
  const ask = midpoint + spread / 2;
  return {
    fairValue,
    bid,
    ask,
    fee: randomChoice([0, 0.25, 0.5, 1]),
    uncertainty: randomChoice([1, 2, 4, 6]),
    prompt: randomChoice(["Known payoff contract", "Fermi market with your model", "Event contract", "Campus estimate market"]),
  };
}

function bestAction(round: Round) {
  const buyEdge = round.fairValue - round.ask - round.fee;
  const sellEdge = round.bid - round.fairValue - round.fee;
  if (buyEdge > Math.max(0.5, round.uncertainty * 0.25) && buyEdge >= sellEdge) return "buy";
  if (sellEdge > Math.max(0.5, round.uncertainty * 0.25)) return "sell";
  return "pass";
}

export default function MarketTakingGame() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Buy, sell, or pass against the displayed market.");

  useEffect(() => {
    setBest(readStoredNumber("market-taking-best"));
  }, []);

  const buyEdge = round.fairValue - round.ask - round.fee;
  const sellEdge = round.bid - round.fairValue - round.fee;
  const answer = bestAction(round);

  function choose(action: "buy" | "sell" | "pass") {
    const correct = action === answer;
    const nextScore = score + (correct ? 1 : 0);
    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("market-taking-best", nextScore);
    }
    setFeedback(
      correct
        ? `Correct. Buy edge ${formatNumber(buyEdge)}, sell edge ${formatNumber(sellEdge)}.`
        : `Best action: ${answer}. Buy edge ${formatNumber(buyEdge)}, sell edge ${formatNumber(sellEdge)}.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(generateRound());
    setFeedback("Buy, sell, or pass against the displayed market.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Market Taking Game</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-accent-2/25 bg-accent-2/10 p-5">
          <p className="text-sm font-black uppercase text-accent-2">{round.prompt}</p>
          <p className="mt-3 text-2xl font-black">Your fair value is {formatNumber(round.fairValue)}.</p>
          <p className="mt-3 text-sm font-bold text-muted">Fee {formatNumber(round.fee)} per trade. Model uncertainty +/-{round.uncertainty}.</p>
        </div>
        <div className="rounded-lg border border-line bg-panel p-5 text-center">
          <p className="text-sm font-black uppercase text-muted">Displayed market</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-white p-4">
              <p className="text-xs font-black uppercase text-muted">Bid</p>
              <p className="text-4xl font-black">{formatNumber(round.bid)}</p>
            </div>
            <div className="rounded-lg bg-white p-4">
              <p className="text-xs font-black uppercase text-muted">Ask</p>
              <p className="text-4xl font-black">{formatNumber(round.ask)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => choose("buy")} className="rounded-lg bg-accent px-4 py-2 font-black text-white">
          Buy
        </button>
        <button type="button" onClick={() => choose("sell")} className="rounded-lg bg-warn px-4 py-2 font-black text-white">
          Sell
        </button>
        <button type="button" onClick={() => choose("pass")} className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Pass
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          New market
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
