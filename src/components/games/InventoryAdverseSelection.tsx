import { useEffect, useMemo, useState } from "react";
import { formatNumber, formatPercent, randomChoice, randomInt, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Action = "skew-down" | "skew-up" | "widen" | "hold";

type Round = {
  inventory: number;
  flowToxicity: number;
  volatility: number;
  targetRisk: number;
  flow: "buyers lifting ask" | "sellers hitting bid" | "balanced flow";
};

const defaultRound: Round = {
  inventory: 50,
  flowToxicity: 0.75,
  volatility: 1.6,
  targetRisk: 35,
  flow: "sellers hitting bid",
};

function generateRound(): Round {
  return {
    inventory: randomChoice([-120, -80, -50, -25, 0, 25, 50, 80, 120]),
    flowToxicity: randomChoice([0.15, 0.3, 0.5, 0.7, 0.9]),
    volatility: randomChoice([0.8, 1, 1.4, 1.8, 2.4]),
    targetRisk: randomChoice([25, 40, 60, 90]),
    flow: randomChoice(["buyers lifting ask", "sellers hitting bid", "balanced flow"] as const),
  };
}

function bestAction(round: Round): Action {
  if (round.flowToxicity >= 0.65 || Math.abs(round.inventory) > round.targetRisk * 1.5) return "widen";
  if (round.inventory > round.targetRisk * 0.4) return "skew-down";
  if (round.inventory < -round.targetRisk * 0.4) return "skew-up";
  return "hold";
}

export default function InventoryAdverseSelection() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Manage inventory while protecting against toxic flow.");

  useEffect(() => {
    setBest(readStoredNumber("inventory-adverse-best"));
  }, []);

  const answer = bestAction(round);
  const inventoryPosition = useMemo(() => Math.min(100, Math.abs(round.inventory) / 150 * 100), [round.inventory]);

  function choose(action: Action) {
    const correct = action === answer;
    const nextScore = score + (correct ? 1 : 0);
    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("inventory-adverse-best", nextScore);
    }
    setFeedback(
      correct
        ? "Correct. Toxic flow and inventory both affect skew and size."
        : `Best action: ${answer}. High toxicity calls for wider markets; inventory imbalance calls for skew.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(generateRound());
    setFeedback("Manage inventory while protecting against toxic flow.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Inventory + Adverse Selection</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-warn/30 bg-warn/10 p-5">
        <p className="text-sm font-black uppercase text-warn">Position state</p>
        <p className="mt-2 text-2xl font-black">
          Inventory {round.inventory > 0 ? "long" : round.inventory < 0 ? "short" : "flat"} {Math.abs(round.inventory)}.
        </p>
        <p className="mt-3 text-sm font-bold text-muted">Recent flow: {round.flow}. Target risk {round.targetRisk}.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-line bg-panel p-4">
          <p className="text-xs font-black uppercase text-muted">Inventory load</p>
          <div className="mt-3 h-4 rounded-full bg-white">
            <div className="h-4 rounded-full bg-warn" style={{ width: `${inventoryPosition}%` }} />
          </div>
          <p className="mt-2 text-sm font-bold">{formatNumber(Math.abs(round.inventory), 0)} units</p>
        </div>
        <div className="rounded-lg border border-line bg-panel p-4">
          <p className="text-xs font-black uppercase text-muted">Flow toxicity</p>
          <div className="mt-3 h-4 rounded-full bg-white">
            <div className="h-4 rounded-full bg-ink" style={{ width: `${round.flowToxicity * 100}%` }} />
          </div>
          <p className="mt-2 text-sm font-bold">{formatPercent(round.flowToxicity, 0)}</p>
        </div>
        <div className="rounded-lg border border-line bg-panel p-4">
          <p className="text-xs font-black uppercase text-muted">Volatility</p>
          <p className="mt-2 text-3xl font-black">{round.volatility}x</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => choose("skew-down")} className="rounded-lg bg-warn px-4 py-2 font-black text-white">
          Skew down
        </button>
        <button type="button" onClick={() => choose("skew-up")} className="rounded-lg bg-accent px-4 py-2 font-black text-white">
          Skew up
        </button>
        <button type="button" onClick={() => choose("widen")} className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Widen/cut size
        </button>
        <button type="button" onClick={() => choose("hold")} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          Hold
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          New inventory
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
