import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { randomChoice, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";
import { factorError, fermiPrompts, formatEstimate, logPosition, type FermiPrompt } from "./fermiPrompts";

const confidenceLevels = [0.5, 0.8, 0.9, 0.95];
const defaultPrompt = fermiPrompts[2];

export default function ConfidenceIntervalGame() {
  const [prompt, setPrompt] = useState<FermiPrompt>(defaultPrompt);
  const [confidence, setConfidence] = useState(0.9);
  const [low, setLow] = useState("");
  const [high, setHigh] = useState("");
  const [submittedRange, setSubmittedRange] = useState<{ low: number; high: number } | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Submit lower and upper bounds.");

  useEffect(() => {
    setBest(readStoredNumber("confidence-interval-best"));
  }, []);

  const chart = useMemo(() => {
    if (!submittedRange) return null;
    const min = Math.min(submittedRange.low, prompt.answer) / 2;
    const max = Math.max(submittedRange.high, prompt.answer) * 2;
    return {
      min,
      max,
      low: logPosition(submittedRange.low, min, max),
      high: logPosition(submittedRange.high, min, max),
      answer: logPosition(prompt.answer, min, max),
    };
  }, [prompt, submittedRange]);

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
    const confidenceBonus = confidence >= 0.9 ? 1 : 0;
    const points = contains ? Math.max(1, Math.round(7 - Math.log2(widthFactor))) + confidenceBonus : 0;
    const nextScore = score + points;

    setSubmittedRange({ low: lowValue, high: highValue });
    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("confidence-interval-best", nextScore);
    }
    setFeedback(
      contains
        ? `Captured it. Benchmark: ${formatEstimate(prompt.answer)} ${prompt.unit}. Range width was ${widthFactor.toFixed(1)}x.`
        : `Missed it. Benchmark: ${formatEstimate(prompt.answer)} ${prompt.unit}.`
    );

    scheduleAutoAdvance(nextPrompt);
  }

  function nextPrompt() {
    setPrompt(randomChoice(fermiPrompts));
    setConfidence(randomChoice(confidenceLevels));
    setLow("");
    setHigh("");
    setSubmittedRange(null);
    setFeedback("Submit lower and upper bounds.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Confidence Interval Game</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">{Math.round(confidence * 100)}% interval</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-accent-2/25 bg-accent-2/10 p-5">
        <p className="text-sm font-black uppercase text-accent-2">{prompt.category}</p>
        <p className="mt-2 text-2xl font-black">{prompt.prompt}</p>
      </div>

      <form onSubmit={submitRange} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
        <input
          value={low}
          onChange={(event) => setLow(event.target.value)}
          inputMode="decimal"
          className="min-w-0 rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent-2"
          placeholder="Low bound"
        />
        <input
          value={high}
          onChange={(event) => setHigh(event.target.value)}
          inputMode="decimal"
          className="min-w-0 rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent-2"
          placeholder="High bound"
        />
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Submit
        </button>
        <button type="button" onClick={nextPrompt} className="rounded-lg bg-accent-2 px-4 py-2 font-black text-white">
          New interval
        </button>
      </form>

      <div className="mt-5 rounded-lg border border-line bg-panel p-4">
        <p className="text-xs font-black uppercase text-muted">Range check</p>
        {chart ? (
          <div className="relative mt-5 h-14 rounded-lg bg-white">
            <div
              className="absolute top-5 h-4 rounded-full bg-accent-2/30"
              style={{ left: `${chart.low}%`, width: `${Math.max(2, chart.high - chart.low)}%` }}
            />
            <div className="absolute top-3 h-8 w-1 rounded-full bg-ink" style={{ left: `${chart.answer}%` }} />
            <div className="absolute -bottom-1 text-xs font-bold text-muted" style={{ left: `${chart.low}%` }}>
              low
            </div>
            <div className="absolute -bottom-1 text-xs font-bold text-muted" style={{ left: `${chart.high}%` }}>
              high
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm font-bold text-muted">Your interval and the benchmark will appear here after submission.</p>
        )}
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
