import { useEffect, useState } from "react";
import { formatPercent, randomChoice, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Counterparty = {
  label: string;
  description: string;
  information: number;
  aggressiveness: number;
  answer: "tight" | "normal" | "wide" | "fade";
};

const counterparties: Counterparty[] = [
  {
    label: "Tourist flow",
    description: "Trades for convenience and tends not to know the true value.",
    information: 0.1,
    aggressiveness: 0.35,
    answer: "tight",
  },
  {
    label: "Club member hedging",
    description: "Has a reason to trade but only modest private information.",
    information: 0.35,
    aggressiveness: 0.45,
    answer: "normal",
  },
  {
    label: "Specialist trader",
    description: "Often shows up when your quote is stale or generous.",
    information: 0.75,
    aggressiveness: 0.7,
    answer: "wide",
  },
  {
    label: "Meteorologist trading weather",
    description: "Has a much sharper signal than you on this product.",
    information: 0.9,
    aggressiveness: 0.8,
    answer: "fade",
  },
];

export default function InformedVsUninformedFlow() {
  const [counterparty, setCounterparty] = useState<Counterparty>(counterparties[0]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Choose how to quote against this counterparty.");

  useEffect(() => {
    setBest(readStoredNumber("informed-flow-best"));
  }, []);

  function choose(action: Counterparty["answer"]) {
    const correct = action === counterparty.answer;
    const nextScore = score + (correct ? 1 : 0);
    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("informed-flow-best", nextScore);
    }
    setFeedback(
      correct
        ? "Correct. Quote tighter to benign flow and protect yourself against informed flow."
        : `Best response: ${counterparty.answer}. Information level drives adverse-selection risk.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setCounterparty(randomChoice(counterparties));
    setFeedback("Choose how to quote against this counterparty.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Informed vs Uninformed Flow</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-accent-2/25 bg-accent-2/10 p-5">
        <p className="text-sm font-black uppercase text-accent-2">Counterparty</p>
        <p className="mt-2 text-2xl font-black">{counterparty.label}</p>
        <p className="mt-3 text-sm font-bold text-muted">{counterparty.description}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-line bg-panel p-4">
          <p className="text-xs font-black uppercase text-muted">Information level</p>
          <div className="mt-3 h-4 rounded-full bg-white">
            <div className="h-4 rounded-full bg-warn" style={{ width: `${counterparty.information * 100}%` }} />
          </div>
          <p className="mt-2 text-sm font-bold">{formatPercent(counterparty.information, 0)}</p>
        </div>
        <div className="rounded-lg border border-line bg-panel p-4">
          <p className="text-xs font-black uppercase text-muted">Trade aggressiveness</p>
          <div className="mt-3 h-4 rounded-full bg-white">
            <div className="h-4 rounded-full bg-accent" style={{ width: `${counterparty.aggressiveness * 100}%` }} />
          </div>
          <p className="mt-2 text-sm font-bold">{formatPercent(counterparty.aggressiveness, 0)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => choose("tight")} className="rounded-lg bg-accent px-4 py-2 font-black text-white">
          Quote tight
        </button>
        <button type="button" onClick={() => choose("normal")} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          Normal quote
        </button>
        <button type="button" onClick={() => choose("wide")} className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Quote wide
        </button>
        <button type="button" onClick={() => choose("fade")} className="rounded-lg bg-warn px-4 py-2 font-black text-white">
          Fade/reduce size
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          New flow
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
