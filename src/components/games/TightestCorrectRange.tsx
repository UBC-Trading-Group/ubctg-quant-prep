import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { randomChoice, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";
import { factorError, fermiPrompts, formatEstimate, logPosition, type FermiPrompt } from "./fermiPrompts";

const defaultPrompt = fermiPrompts[3];

export default function TightestCorrectRange() {
  const [prompt, setPrompt] = useState<FermiPrompt>(defaultPrompt);
  const [low, setLow] = useState("");
  const [high, setHigh] = useState("");
  const [lastRange, setLastRange] = useState<{ low: number; high: number } | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Give the narrowest range you trust.");

  useEffect(() => {
    setBest(readStoredNumber("tightest-range-best"));
  }, []);

  const chart = useMemo(() => {
    if (!lastRange) return null;
    const min = Math.min(lastRange.low, prompt.answer) / 2;
    const max = Math.max(lastRange.high, prompt.answer) * 2;
    return {
      low: logPosition(lastRange.low, min, max),
      high: logPosition(lastRange.high, min, max),
      answer: logPosition(prompt.answer, min, max),
    };
  }, [lastRange, prompt]);

  function submitRange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const lowValue = Number(low);
    const highValue = Number(high);
    if (!Number.isFinite(lowValue) || !Number.isFinite(highValue) || lowValue <= 0 || highValue <= lowValue) {
      setFeedback("Enter positive bounds with high greater than low.");
      return;
    }

    const contains = lowValue <= prompt.answer && prompt.answer <= highValue;
    const widthFactor = factorError(highValue, lowValue);
    const points = contains ? Math.max(1, Math.round(12 / Math.max(1, Math.log2(widthFactor + 1)))) : 0;
    const nextScore = score + points;

    setLastRange({ low: lowValue, high: highValue });
    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("tightest-range-best", nextScore);
    }
    setFeedback(
      contains
        ? `Contained the benchmark. Width ${widthFactor.toFixed(1)}x; tighter correct ranges score more.`
        : `Missed. Benchmark: ${formatEstimate(prompt.answer)} ${prompt.unit}.`
    );

    scheduleAutoAdvance(nextPrompt);
  }

  function nextPrompt() {
    setPrompt(randomChoice(fermiPrompts));
    setLow("");
    setHigh("");
    setLastRange(null);
    setFeedback("Give the narrowest range you trust.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Tightest Correct Range</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-warn/30 bg-warn/10 p-5">
        <p className="text-sm font-black uppercase text-warn">{prompt.category}</p>
        <p className="mt-2 text-2xl font-black">{prompt.prompt}</p>
        <p className="mt-3 text-sm font-bold text-muted">Score is conditional on containing the benchmark.</p>
      </div>

      <form onSubmit={submitRange} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
        <input
          value={low}
          onChange={(event) => setLow(event.target.value)}
          inputMode="decimal"
          className="min-w-0 rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent-2"
          placeholder="Low"
        />
        <input
          value={high}
          onChange={(event) => setHigh(event.target.value)}
          inputMode="decimal"
          className="min-w-0 rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent-2"
          placeholder="High"
        />
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Score
        </button>
        <button type="button" onClick={nextPrompt} className="rounded-lg bg-warn px-4 py-2 font-black text-white">
          New range
        </button>
      </form>

      <div className="mt-5 rounded-lg border border-line bg-panel p-4">
        <p className="text-xs font-black uppercase text-muted">Precision vs uncertainty</p>
        {chart ? (
          <div className="relative mt-5 h-14 rounded-lg bg-white">
            <div
              className="absolute top-5 h-4 rounded-full bg-warn/30"
              style={{ left: `${chart.low}%`, width: `${Math.max(2, chart.high - chart.low)}%` }}
            />
            <div className="absolute top-3 h-8 w-1 rounded-full bg-ink" style={{ left: `${chart.answer}%` }} />
          </div>
        ) : (
          <p className="mt-3 text-sm font-bold text-muted">After scoring, the benchmark marker appears against your range.</p>
        )}
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
