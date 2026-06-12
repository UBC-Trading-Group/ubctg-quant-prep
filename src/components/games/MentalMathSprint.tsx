import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { randomChoice, randomInt, readStoredNumber, writeStoredNumber } from "./gameUtils";

type Round = {
  prompt: string;
  answer: number;
  tolerance: number;
  operation: string;
  detail: string;
};

type Difficulty = "Warmup" | "Desk" | "Interview";

const durationOptions = [30, 45, 60];

const defaultRound: Round = {
  prompt: "54% of 110",
  answer: 59.4,
  tolerance: 0.01,
  operation: "Percent",
  detail: "Percent of a round lot",
};

function generateRound(difficulty: Difficulty): Round {
  const pool =
    difficulty === "Warmup"
      ? ["add", "subtract", "multiply", "percent"]
      : difficulty === "Desk"
        ? ["multiply", "divide", "percent", "decimal", "approx"]
        : ["multiply", "divide", "percent", "decimal", "approx", "fraction"];

  const kind = randomChoice(pool);

  if (kind === "add") {
    const a = randomInt(20, 160);
    const b = randomInt(20, 160);
    return {
      prompt: `${a} + ${b}`,
      answer: a + b,
      tolerance: 0.01,
      operation: "Add",
      detail: "Quick aggregation",
    };
  }

  if (kind === "subtract") {
    const a = randomInt(120, 400);
    const b = randomInt(20, 180);
    return {
      prompt: `${a} - ${b}`,
      answer: a - b,
      tolerance: 0.01,
      operation: "Subtract",
      detail: "Fast difference",
    };
  }

  if (kind === "multiply") {
    const max = difficulty === "Warmup" ? 15 : difficulty === "Desk" ? 24 : 34;
    const a = randomInt(7, max);
    const b = randomInt(6, max);
    return {
      prompt: `${a} x ${b}`,
      answer: a * b,
      tolerance: 0.01,
      operation: "Multiply",
      detail: "Mental product",
    };
  }

  if (kind === "divide") {
    const divisor = randomInt(4, difficulty === "Interview" ? 19 : 12);
    const quotient = randomInt(6, difficulty === "Interview" ? 35 : 22);
    const dividend = divisor * quotient;
    return {
      prompt: `${dividend} / ${divisor}`,
      answer: quotient,
      tolerance: 0.01,
      operation: "Divide",
      detail: "Clean quotient",
    };
  }

  if (kind === "decimal") {
    const a = randomInt(15, 95) / 10;
    const b = randomInt(15, 95) / 10;
    const op = randomChoice(["+", "-"]);
    return {
      prompt: `${a.toFixed(1)} ${op} ${b.toFixed(1)}`,
      answer: op === "+" ? a + b : a - b,
      tolerance: 0.01,
      operation: "Decimal",
      detail: "Decimal handling",
    };
  }

  if (kind === "approx") {
    const a = randomInt(180, 980);
    const b = randomInt(11, 39);
    return {
      prompt: `Round ${a} / ${b}`,
      answer: Math.round(a / b),
      tolerance: 1,
      operation: "Approx",
      detail: "Nearest whole number",
    };
  }

  if (kind === "fraction") {
    const numerator = randomChoice([1, 3, 5, 7, 9, 11, 13, 15]);
    const denominator = randomChoice([8, 16, 32]);
    return {
      prompt: `${numerator}/${denominator} as decimal`,
      answer: numerator / denominator,
      tolerance: 0.0006,
      operation: "Fraction",
      detail: "Quote fluency",
    };
  }

  const base = randomChoice([80, 100, 110, 120, 150, 160, 200, 240, 320, 500]);
  const pct = randomChoice([5, 10, 12.5, 15, 20, 25, 40, 54]);
  return {
    prompt: `${pct}% of ${base}`,
    answer: (pct / 100) * base,
    tolerance: 0.01,
    operation: "Percent",
    detail: "Percent of a base",
  };
}

export default function MentalMathSprint() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [input, setInput] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Desk");
  const [duration, setDuration] = useState(45);
  const [timeLeft, setTimeLeft] = useState(45);
  const [active, setActive] = useState(true);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Go.");

  useEffect(() => {
    setRound(generateRound("Desk"));
    setBest(readStoredNumber("mental-math-best"));
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
      writeStoredNumber("mental-math-best", score);
    }
    setFeedback(`Sprint complete. Score ${score} across ${attempts} attempts.`);
  }, [active, attempts, best, score, timeLeft]);

  const timePercent = useMemo(() => (timeLeft / duration) * 100, [duration, timeLeft]);
  const expected = useMemo(() => Number(round.answer.toFixed(4)), [round.answer]);

  function startSprint() {
    setScore(0);
    setStreak(0);
    setAttempts(0);
    setTimeLeft(duration);
    setRound(generateRound(difficulty));
    setInput("");
    setFeedback("Go.");
    setActive(true);
  }

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!active) return;

    const guess = Number(input);
    if (!Number.isFinite(guess)) {
      setFeedback("Enter a numeric answer.");
      return;
    }

    const correct = Math.abs(guess - round.answer) <= round.tolerance;
    const nextStreak = correct ? streak + 1 : 0;
    const nextScore = score + (correct ? 100 + Math.min(streak, 10) * 10 : 0);

    setScore(nextScore);
    setStreak(nextStreak);
    setAttempts(attempts + 1);
    setFeedback(correct ? `Correct. Streak ${nextStreak}.` : `Not quite. Answer: ${expected}.`);
    setInput("");
    setRound(generateRound(difficulty));
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Mental Math Sprint</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Streak {streak}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <label className="grid gap-1 text-sm font-bold text-muted">
          Difficulty
          <select
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value as Difficulty)}
            disabled={active}
            className="rounded-lg border border-line bg-white px-3 py-2 text-ink"
          >
            <option>Warmup</option>
            <option>Desk</option>
            <option>Interview</option>
          </select>
        </label>
        <div className="grid gap-1 text-sm font-bold text-muted">
          Timer
          <div className="flex rounded-lg border border-line bg-white p-1">
            {durationOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setDuration(option);
                  setTimeLeft(option);
                }}
                disabled={active}
                className={`rounded-md px-3 py-1 font-black ${
                  duration === option ? "bg-ink text-white" : "text-muted"
                }`}
              >
                {option}s
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={startSprint}
          className="self-end rounded-lg bg-accent px-4 py-2 font-black text-white"
        >
          Restart
        </button>
      </div>

      <div className="mt-5 overflow-hidden rounded-full bg-panel">
        <div
          className="h-3 rounded-full bg-accent transition-all"
          style={{ width: `${timePercent}%` }}
        />
      </div>

      <div className="my-5 grid min-h-40 place-items-center rounded-lg border border-accent/25 bg-accent/10 p-5 text-center">
        <p className="rounded-md border border-accent/30 bg-white/70 px-3 py-1 text-xs font-black uppercase text-accent">
          {round.operation} / {round.detail}
        </p>
        <p className="mt-4 text-4xl font-black">{round.prompt}</p>
        <p className="mt-3 text-sm font-bold text-muted">Time left: {timeLeft}s</p>
      </div>

      <form onSubmit={submitAnswer} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          inputMode="decimal"
          className="min-w-0 flex-1 rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent-2"
          placeholder="Answer"
          disabled={!active}
        />
        <button
          type="submit"
          disabled={!active}
          className="rounded-lg bg-ink px-4 py-2 font-black text-white"
        >
          Submit
        </button>
      </form>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
