import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { clamp, formatNumber, randomChoice, randomInt, readStoredNumber, writeStoredNumber } from "./gameUtils";

type Round = {
  prompt: string;
  answer: number;
  tolerancePct: number;
  family: string;
  hint: string;
};

type Result = {
  guess: number;
  answer: number;
  lower: number;
  upper: number;
  correct: boolean;
};

const defaultRound: Round = {
  prompt: "sqrt(1420)",
  answer: Math.sqrt(1420),
  tolerancePct: 0.08,
  family: "Roots",
  hint: "Nearest useful benchmark",
};

function generateRound(): Round {
  const family = randomChoice(["sqrt", "percent", "power", "log2", "market"]);

  if (family === "sqrt") {
    const root = randomInt(14, 70);
    const value = root * root + randomInt(-root, root);
    return {
      prompt: `sqrt(${value})`,
      answer: Math.sqrt(value),
      tolerancePct: 0.06,
      family: "Roots",
      hint: "Anchor on nearby squares",
    };
  }

  if (family === "percent") {
    const pct = randomChoice([7, 9, 11, 13, 17, 19, 22, 37, 54]);
    const base = randomInt(80, 2200);
    return {
      prompt: `${pct}% of ${base}`,
      answer: (pct / 100) * base,
      tolerancePct: 0.07,
      family: "Percent",
      hint: "Break into 10%, 5%, 1%",
    };
  }

  if (family === "power") {
    const rate = randomChoice([1.03, 1.05, 1.08, 1.12]);
    const years = randomInt(2, 6);
    const base = randomChoice([100, 250, 500, 1000]);
    return {
      prompt: `${base} x ${rate.toFixed(2)}^${years}`,
      answer: base * rate ** years,
      tolerancePct: 0.08,
      family: "Compounding",
      hint: "Use repeated percentage moves",
    };
  }

  if (family === "log2") {
    const exponent = randomInt(5, 12);
    const value = Math.round(2 ** exponent * randomChoice([0.75, 0.9, 1.1, 1.25]));
    return {
      prompt: `log2(${value})`,
      answer: Math.log2(value),
      tolerancePct: 0.09,
      family: "Logs",
      hint: "Find the closest power of two",
    };
  }

  const population = randomChoice([750000, 1200000, 2000000, 3500000, 5200000]);
  const householdSize = randomChoice([2.2, 2.5, 2.8]);
  return {
    prompt: `Households if population is ${population.toLocaleString()} and size is ${householdSize}`,
    answer: population / householdSize,
    tolerancePct: 0.12,
    family: "Fermi",
    hint: "One clean division is enough",
  };
}

export default function ApproximationDrill() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [input, setInput] = useState("");
  const [active, setActive] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [feedback, setFeedback] = useState("Estimate fast. Exact calculation is not required.");

  useEffect(() => {
    setRound(generateRound());
    setBest(readStoredNumber("approximation-best"));
  }, []);

  useEffect(() => {
    if (!active) return;

    const timer = window.setInterval(() => {
      setTimeLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [active]);

  useEffect(() => {
    if (!active || timeLeft > 0) return;

    setActive(false);
    if (score > best) {
      setBest(score);
      writeStoredNumber("approximation-best", score);
    }
    setFeedback(`Drill complete. Score ${score}.`);
  }, [active, best, score, timeLeft]);

  const answerBand = useMemo(() => {
    const lower = round.answer * (1 - round.tolerancePct);
    const upper = round.answer * (1 + round.tolerancePct);
    return { lower, upper };
  }, [round]);

  const marker = useMemo(() => {
    if (!result) return null;
    const min = result.answer * (1 - round.tolerancePct * 2.4);
    const max = result.answer * (1 + round.tolerancePct * 2.4);
    const guessPct = clamp(((result.guess - min) / (max - min)) * 100, 0, 100);
    const lowerPct = clamp(((result.lower - min) / (max - min)) * 100, 0, 100);
    const upperPct = clamp(((result.upper - min) / (max - min)) * 100, 0, 100);
    return { guessPct, lowerPct, upperPct };
  }, [result, round.tolerancePct]);

  function startDrill() {
    setRound(generateRound());
    setInput("");
    setActive(true);
    setTimeLeft(60);
    setScore(0);
    setStreak(0);
    setResult(null);
    setFeedback("Estimate fast. Exact calculation is not required.");
  }

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!active) return;

    const guess = Number(input);
    if (!Number.isFinite(guess)) {
      setFeedback("Enter a numeric estimate.");
      return;
    }

    const lower = round.answer * (1 - round.tolerancePct);
    const upper = round.answer * (1 + round.tolerancePct);
    const correct = guess >= lower && guess <= upper;
    const nextStreak = correct ? streak + 1 : 0;
    const nextScore = score + (correct ? 100 + Math.min(streak, 8) * 10 : 0);

    setResult({ guess, answer: round.answer, lower, upper, correct });
    setScore(nextScore);
    setStreak(nextStreak);
    setFeedback(
      correct
        ? `Inside the band. Answer is about ${formatNumber(round.answer, 2)}.`
        : `Outside the band. Answer is about ${formatNumber(round.answer, 2)}.`
    );
    setInput("");
    setRound(generateRound());
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Approximation Drill</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Streak {streak}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">{timeLeft}s</span>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-full bg-panel">
        <div className="h-3 rounded-full bg-warn transition-all" style={{ width: `${(timeLeft / 60) * 100}%` }} />
      </div>

      <div className="my-5 rounded-lg border border-warn/30 bg-warn/10 p-5">
        <p className="text-sm font-black uppercase text-warn">{round.family} / {round.hint}</p>
        <p className="mt-4 text-3xl font-black">{round.prompt}</p>
        <p className="mt-3 text-sm font-bold text-muted">
          Current acceptable band: {formatNumber(answerBand.lower, 2)} to {formatNumber(answerBand.upper, 2)}
        </p>

        <div className="relative mt-6 h-12 rounded-lg border border-line bg-white">
          {marker && (
            <>
              <span
                className="absolute top-0 h-full rounded-md bg-accent/20"
                style={{
                  left: `${marker.lowerPct}%`,
                  width: `${Math.max(3, marker.upperPct - marker.lowerPct)}%`,
                }}
              />
              <span
                className={`absolute top-0 h-full w-1 rounded-full ${result?.correct ? "bg-accent" : "bg-warn"}`}
                style={{ left: `${marker.guessPct}%` }}
              />
            </>
          )}
        </div>
      </div>

      <form onSubmit={submitAnswer} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          inputMode="decimal"
          disabled={!active}
          className="min-w-0 flex-1 rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent-2"
          placeholder="Estimate"
        />
        <button type="submit" disabled={!active} className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Submit
        </button>
        <button type="button" onClick={startDrill} className="rounded-lg bg-warn px-4 py-2 font-black text-white">
          Restart
        </button>
      </form>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
