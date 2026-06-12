import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { randomChoice, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";
import { factorError, fermiPrompts, formatEstimate, type FermiPrompt } from "./fermiPrompts";

const defaultPrompt = fermiPrompts[0];

function scoreFactor(factor: number) {
  if (factor <= 1.5) return 4;
  if (factor <= 2) return 3;
  if (factor <= 5) return 2;
  if (factor <= 10) return 1;
  return 0;
}

export default function FermiAnswerGame() {
  const [prompt, setPrompt] = useState<FermiPrompt>(defaultPrompt);
  const [input, setInput] = useState("");
  const [lastFactor, setLastFactor] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Submit one order-of-magnitude estimate.");

  useEffect(() => {
    setBest(readStoredNumber("fermi-answer-best"));
  }, []);

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const estimate = Number(input);
    if (!Number.isFinite(estimate) || estimate <= 0) {
      setFeedback("Enter a positive numeric estimate.");
      return;
    }

    const factor = factorError(estimate, prompt.answer);
    const points = scoreFactor(factor);
    const nextScore = score + points;
    setLastFactor(factor);
    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("fermi-answer-best", nextScore);
    }
    setFeedback(
      points > 0
        ? `Good estimate. Benchmark: ${formatEstimate(prompt.answer)} ${prompt.unit}; you were within ${factor.toFixed(1)}x.`
        : `Benchmark: ${formatEstimate(prompt.answer)} ${prompt.unit}; your estimate was off by ${factor.toFixed(1)}x.`
    );

    scheduleAutoAdvance(nextPrompt);
  }

  function nextPrompt() {
    setPrompt(randomChoice(fermiPrompts));
    setInput("");
    setLastFactor(null);
    setFeedback("Submit one order-of-magnitude estimate.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Fermi Answer Game</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-accent/25 bg-accent/10 p-5">
        <p className="text-sm font-black uppercase text-accent">{prompt.category}</p>
        <p className="mt-2 text-2xl font-black">{prompt.prompt}</p>
        <p className="mt-3 text-sm font-bold text-muted">{prompt.assumption}</p>
      </div>

      <form onSubmit={submitAnswer} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          inputMode="decimal"
          className="min-w-0 flex-1 rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent-2"
          placeholder={`Estimate in ${prompt.unit}`}
        />
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Submit
        </button>
        <button type="button" onClick={nextPrompt} className="rounded-lg bg-accent px-4 py-2 font-black text-white">
          New prompt
        </button>
      </form>

      <div className="mt-5 rounded-lg border border-line bg-panel p-4">
        <p className="text-xs font-black uppercase text-muted">Error factor</p>
        <div className="mt-3 h-4 rounded-full bg-white">
          <div
            className={`h-4 rounded-full ${lastFactor === null || lastFactor <= 5 ? "bg-accent" : "bg-warn"}`}
            style={{ width: `${lastFactor === null ? 0 : Math.max(6, Math.min(100, 100 / Math.max(1, lastFactor / 2)))}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs font-bold text-muted">
          <span>exact</span>
          <span>within 2x</span>
          <span>within 10x</span>
        </div>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
