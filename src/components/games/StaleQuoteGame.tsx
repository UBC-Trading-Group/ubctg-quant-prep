import { useEffect, useState } from "react";
import { formatNumber, randomChoice, randomInt, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Action = "cancel" | "update-up" | "update-down" | "leave";

type Round = {
  fairValue: number;
  bid: number;
  ask: number;
  shock: number;
  latency: number;
  quoteAge: number;
  volatility: number;
};

const defaultRound: Round = {
  fairValue: 50,
  bid: 47,
  ask: 53,
  shock: 8,
  latency: 900,
  quoteAge: 18,
  volatility: 1.4,
};

function generateRound(): Round {
  const fairValue = randomInt(30, 80);
  const width = randomChoice([4, 6, 8, 10]);
  return {
    fairValue,
    bid: fairValue - width / 2,
    ask: fairValue + width / 2,
    shock: randomChoice([-14, -9, -5, -2, 2, 5, 9, 14]),
    latency: randomChoice([150, 300, 650, 1100, 1800]),
    quoteAge: randomChoice([2, 6, 12, 25, 45]),
    volatility: randomChoice([0.8, 1, 1.4, 2]),
  };
}

function bestAction(round: Round): Action {
  const pickoffRisk = Math.abs(round.shock) * round.volatility + round.latency / 500 + round.quoteAge / 20;
  if (pickoffRisk > 14) return "cancel";
  if (round.shock >= 4) return "update-up";
  if (round.shock <= -4) return "update-down";
  return "leave";
}

export default function StaleQuoteGame() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("React before your stale quote gets picked off.");

  useEffect(() => {
    setBest(readStoredNumber("stale-quote-best"));
  }, []);

  const answer = bestAction(round);
  const newFair = round.fairValue + round.shock;

  function choose(action: Action) {
    const correct = action === answer;
    const nextScore = score + (correct ? 1 : 0);
    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("stale-quote-best", nextScore);
    }
    setFeedback(
      correct
        ? `Correct. New fair value is ${formatNumber(newFair)}.`
        : `Best action: ${answer}. New fair value is ${formatNumber(newFair)}; latency and quote age drive pickoff risk.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(generateRound());
    setFeedback("React before your stale quote gets picked off.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Stale Quote Game</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-line bg-panel p-5">
          <p className="text-xs font-black uppercase text-muted">Resting quote</p>
          <p className="mt-2 text-4xl font-black">{formatNumber(round.bid)} / {formatNumber(round.ask)}</p>
          <p className="mt-3 text-sm font-bold text-muted">Old fair {formatNumber(round.fairValue)}</p>
        </div>
        <div className="rounded-lg border border-accent/25 bg-accent/10 p-5">
          <p className="text-sm font-black uppercase text-accent">News shock</p>
          <p className="mt-2 text-2xl font-black">{round.shock > 0 ? "+" : ""}{round.shock} fair-value move</p>
          <div className="mt-4 grid gap-2 text-sm font-bold text-muted sm:grid-cols-3">
            <span className="rounded-md bg-white px-3 py-2">{round.latency}ms latency</span>
            <span className="rounded-md bg-white px-3 py-2">{round.quoteAge}s old</span>
            <span className="rounded-md bg-white px-3 py-2">{round.volatility}x vol</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => choose("cancel")} className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Cancel quote
        </button>
        <button type="button" onClick={() => choose("update-up")} className="rounded-lg bg-accent px-4 py-2 font-black text-white">
          Update up
        </button>
        <button type="button" onClick={() => choose("update-down")} className="rounded-lg bg-warn px-4 py-2 font-black text-white">
          Update down
        </button>
        <button type="button" onClick={() => choose("leave")} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          Leave quote
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          New news
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
