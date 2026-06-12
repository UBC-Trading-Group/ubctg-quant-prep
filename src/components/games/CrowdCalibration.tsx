import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { randomChoice, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";
import { factorError, fermiPrompts, formatEstimate, logPosition, type FermiPrompt } from "./fermiPrompts";

type Comparison = {
  low: number;
  estimate: number;
  high: number;
  crowdMedian: number;
  localCount: number;
};

const defaultPrompt = fermiPrompts[0];
const storageKey = "crowd-calibration-submissions";

function readSubmissions(): Record<string, number[]> {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) ?? "{}");
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

export default function CrowdCalibration() {
  const [prompt, setPrompt] = useState<FermiPrompt>(defaultPrompt);
  const [low, setLow] = useState("");
  const [estimate, setEstimate] = useState("");
  const [high, setHigh] = useState("");
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Submit your estimate and range, then compare against the crowd.");

  useEffect(() => {
    setBest(readStoredNumber("crowd-calibration-best"));
  }, []);

  const chart = useMemo(() => {
    if (!comparison) return null;
    const min = Math.min(comparison.low, prompt.crowdLow, prompt.answer) / 2;
    const max = Math.max(comparison.high, prompt.crowdHigh, prompt.answer) * 2;
    return {
      userLow: logPosition(comparison.low, min, max),
      userHigh: logPosition(comparison.high, min, max),
      userEstimate: logPosition(comparison.estimate, min, max),
      crowdMedian: logPosition(comparison.crowdMedian, min, max),
      answer: logPosition(prompt.answer, min, max),
    };
  }, [comparison, prompt]);

  function submitEstimate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const lowValue = Number(low);
    const estimateValue = Number(estimate);
    const highValue = Number(high);
    if (
      !Number.isFinite(lowValue) ||
      !Number.isFinite(estimateValue) ||
      !Number.isFinite(highValue) ||
      lowValue <= 0 ||
      estimateValue <= 0 ||
      highValue <= lowValue
    ) {
      setFeedback("Enter positive low, estimate, and high values.");
      return;
    }

    const submissions = readSubmissions();
    const local = [...(submissions[prompt.id] ?? []), estimateValue].slice(-40);
    submissions[prompt.id] = local;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(submissions));
    } catch {
      // Local crowd history is optional.
    }

    const crowdMedian = median([prompt.crowdMedian, ...local]);
    const contains = lowValue <= prompt.answer && prompt.answer <= highValue;
    const userFactor = factorError(estimateValue, prompt.answer);
    const crowdFactor = factorError(crowdMedian, prompt.answer);
    const points = (contains ? 2 : 0) + (userFactor <= crowdFactor ? 2 : 0);
    const nextScore = score + points;

    setComparison({ low: lowValue, estimate: estimateValue, high: highValue, crowdMedian, localCount: local.length });
    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("crowd-calibration-best", nextScore);
    }
    setFeedback(
      `Benchmark ${formatEstimate(prompt.answer)} ${prompt.unit}. Your estimate was ${userFactor.toFixed(1)}x off; crowd median was ${crowdFactor.toFixed(1)}x off.`
    );

    scheduleAutoAdvance(nextPrompt);
  }

  function nextPrompt() {
    setPrompt(randomChoice(fermiPrompts));
    setLow("");
    setEstimate("");
    setHigh("");
    setComparison(null);
    setFeedback("Submit your estimate and range, then compare against the crowd.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Crowd Calibration</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-accent-2/25 bg-accent-2/10 p-5">
        <p className="text-sm font-black uppercase text-accent-2">{prompt.category}</p>
        <p className="mt-2 text-2xl font-black">{prompt.prompt}</p>
        <p className="mt-3 text-sm font-bold text-muted">Seeded club range: {formatEstimate(prompt.crowdLow)} to {formatEstimate(prompt.crowdHigh)} {prompt.unit}</p>
      </div>

      <form onSubmit={submitEstimate} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto_auto]">
        <input
          value={low}
          onChange={(event) => setLow(event.target.value)}
          inputMode="decimal"
          className="min-w-0 rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent-2"
          placeholder="Your low"
        />
        <input
          value={estimate}
          onChange={(event) => setEstimate(event.target.value)}
          inputMode="decimal"
          className="min-w-0 rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent-2"
          placeholder="Your estimate"
        />
        <input
          value={high}
          onChange={(event) => setHigh(event.target.value)}
          inputMode="decimal"
          className="min-w-0 rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent-2"
          placeholder="Your high"
        />
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Compare
        </button>
        <button type="button" onClick={nextPrompt} className="rounded-lg bg-accent-2 px-4 py-2 font-black text-white">
          New crowd
        </button>
      </form>

      <div className="mt-5 rounded-lg border border-line bg-panel p-4">
        <p className="text-xs font-black uppercase text-muted">You vs crowd vs benchmark</p>
        {chart && comparison ? (
          <>
            <div className="relative mt-5 h-16 rounded-lg bg-white">
              <div
                className="absolute top-6 h-4 rounded-full bg-accent-2/25"
                style={{ left: `${chart.userLow}%`, width: `${Math.max(2, chart.userHigh - chart.userLow)}%` }}
              />
              <div className="absolute top-4 h-8 w-1 rounded-full bg-accent-2" style={{ left: `${chart.userEstimate}%` }} />
              <div className="absolute top-4 h-8 w-1 rounded-full bg-warn" style={{ left: `${chart.crowdMedian}%` }} />
              <div className="absolute top-2 h-12 w-1 rounded-full bg-ink" style={{ left: `${chart.answer}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-muted">
              <span className="rounded-md bg-white px-2 py-1">local entries {comparison.localCount}</span>
              <span className="rounded-md bg-white px-2 py-1">blue: you</span>
              <span className="rounded-md bg-white px-2 py-1">orange: crowd</span>
              <span className="rounded-md bg-white px-2 py-1">black: benchmark</span>
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm font-bold text-muted">Comparison appears after you submit.</p>
        )}
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
