import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { randomChoice, randomInt, readStoredNumber, writeStoredNumber } from "./gameUtils";

type Round = {
  numerator: number;
  denominator: number;
  answer: number;
  mode: "Exact" | "Rounded";
  tolerance: number;
};

const defaultRound: Round = {
  numerator: 7,
  denominator: 16,
  answer: 7 / 16,
  mode: "Exact",
  tolerance: 0.0006,
};

function generateRound(): Round {
  const denominator = randomChoice([8, 16, 32, 64]);
  const numerator = randomInt(1, denominator - 1);
  const mode = denominator >= 32 && Math.random() > 0.35 ? "Rounded" : "Exact";

  return {
    numerator,
    denominator,
    answer: numerator / denominator,
    mode,
    tolerance: mode === "Rounded" ? 0.005 : 0.0006,
  };
}

export default function FractionsToDecimals() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [active, setActive] = useState(true);
  const [feedback, setFeedback] = useState("Convert the fraction.");

  useEffect(() => {
    setRound(generateRound());
    setBest(readStoredNumber("fractions-best"));
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
      writeStoredNumber("fractions-best", score);
    }
    setFeedback(`Drill complete. Score ${score}.`);
  }, [active, best, score, timeLeft]);

  const fillPercent = useMemo(
    () => (round.numerator / round.denominator) * 100,
    [round.denominator, round.numerator]
  );
  const segments = useMemo(() => Math.min(round.denominator, 16), [round.denominator]);
  const exactAnswer = useMemo(() => round.answer.toFixed(4).replace(/0+$/, "").replace(/\.$/, ""), [round.answer]);

  function startDrill() {
    setRound(generateRound());
    setInput("");
    setScore(0);
    setStreak(0);
    setTimeLeft(45);
    setFeedback("Convert the fraction.");
    setActive(true);
  }

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!active) return;

    const guess = Number(input);
    if (!Number.isFinite(guess)) {
      setFeedback("Enter a decimal answer.");
      return;
    }

    const correct = Math.abs(guess - round.answer) <= round.tolerance;
    const nextStreak = correct ? streak + 1 : 0;
    const nextScore = score + (correct ? 100 + Math.min(streak, 8) * 10 : 0);

    setScore(nextScore);
    setStreak(nextStreak);
    setFeedback(
      correct
        ? `Correct. ${round.numerator}/${round.denominator} = ${exactAnswer}.`
        : `Not quite. ${round.numerator}/${round.denominator} = ${exactAnswer}.`
    );
    setInput("");
    setRound(generateRound());
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Fractions to Decimals</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Streak {streak}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">{timeLeft}s</span>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-full bg-panel">
        <div
          className="h-3 rounded-full bg-accent-2 transition-all"
          style={{ width: `${(timeLeft / 45) * 100}%` }}
        />
      </div>

      <div className="my-5 rounded-lg border border-accent-2/25 bg-accent-2/10 p-5">
        <div className="grid gap-5 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div className="mx-auto grid w-40 place-items-center rounded-lg border border-line bg-white p-5 shadow-sm">
            <span className="text-5xl font-black">{round.numerator}</span>
            <span className="my-2 h-1 w-full rounded-full bg-ink" />
            <span className="text-5xl font-black">{round.denominator}</span>
          </div>
          <div>
            <p className="text-sm font-black uppercase text-accent-2">
              {round.mode === "Exact" ? "Exact decimal" : "Nearest cent"}
            </p>
            <div className="mt-4 overflow-hidden rounded-lg border border-line bg-white">
              <div className="h-8 bg-accent-2/25" style={{ width: `${fillPercent}%` }} />
            </div>
            <div className="mt-2 grid gap-1" style={{ gridTemplateColumns: `repeat(${segments}, minmax(0, 1fr))` }}>
              {Array.from({ length: segments }).map((_, index) => (
                <span
                  key={index}
                  className={`h-3 rounded-sm ${
                    index < Math.round((round.numerator / round.denominator) * segments)
                      ? "bg-accent-2"
                      : "bg-panel"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={submitAnswer} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          inputMode="decimal"
          disabled={!active}
          className="min-w-0 flex-1 rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent-2"
          placeholder="Decimal"
        />
        <button
          type="submit"
          disabled={!active}
          className="rounded-lg bg-ink px-4 py-2 font-black text-white"
        >
          Submit
        </button>
        <button type="button" onClick={startDrill} className="rounded-lg bg-accent-2 px-4 py-2 font-black text-white">
          Restart
        </button>
      </form>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
