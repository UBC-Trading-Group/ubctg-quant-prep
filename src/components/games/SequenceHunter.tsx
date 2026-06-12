import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { randomChoice, randomInt, readStoredNumber, writeStoredNumber } from "./gameUtils";

type Round = {
  terms: number[];
  answer: number;
  family: string;
  explanation: string;
};

const defaultRound: Round = {
  terms: [2, 6, 12, 20, 30],
  answer: 42,
  family: "Quadratic",
  explanation: "Differences increase by 2: 4, 6, 8, 10, then 12.",
};

function generateRound(): Round {
  const family = randomChoice(["arithmetic", "geometric", "quadratic", "alternating", "fibonacci", "mixed"]);

  if (family === "arithmetic") {
    const start = randomInt(-12, 40);
    const diff = randomChoice([-9, -7, -5, 4, 6, 8, 11, 13]);
    const terms = Array.from({ length: 6 }, (_, index) => start + diff * index);
    return {
      terms: terms.slice(0, 5),
      answer: terms[5],
      family: "Arithmetic",
      explanation: `Add ${diff} each time.`,
    };
  }

  if (family === "geometric") {
    const start = randomInt(1, 6);
    const ratio = randomChoice([2, 3, 4]);
    const terms = Array.from({ length: 6 }, (_, index) => start * ratio ** index);
    return {
      terms: terms.slice(0, 5),
      answer: terms[5],
      family: "Geometric",
      explanation: `Multiply by ${ratio} each time.`,
    };
  }

  if (family === "quadratic") {
    const a = randomInt(1, 3);
    const b = randomInt(-3, 5);
    const c = randomInt(-4, 8);
    const terms = Array.from({ length: 6 }, (_, index) => {
      const n = index + 1;
      return a * n * n + b * n + c;
    });
    return {
      terms: terms.slice(0, 5),
      answer: terms[5],
      family: "Quadratic",
      explanation: "Second differences are constant.",
    };
  }

  if (family === "alternating") {
    const start = randomInt(3, 20);
    const up = randomInt(4, 12);
    const down = randomInt(1, 7);
    const terms = [start];
    for (let index = 1; index < 6; index += 1) {
      terms.push(terms[index - 1] + (index % 2 === 1 ? up : -down));
    }
    return {
      terms: terms.slice(0, 5),
      answer: terms[5],
      family: "Alternating",
      explanation: `Alternate +${up}, -${down}.`,
    };
  }

  if (family === "fibonacci") {
    const first = randomInt(1, 8);
    const second = randomInt(2, 12);
    const offset = randomChoice([0, 1, 2, 3]);
    const terms = [first, second];
    for (let index = 2; index < 6; index += 1) {
      terms.push(terms[index - 1] + terms[index - 2] + offset);
    }
    return {
      terms: terms.slice(0, 5),
      answer: terms[5],
      family: "Fibonacci-style",
      explanation: offset === 0 ? "Each term is the sum of the previous two." : `Sum the previous two, then add ${offset}.`,
    };
  }

  const start = randomInt(1, 15);
  const terms = Array.from({ length: 6 }, (_, index) => start + (index + 1) ** 2 + index);
  return {
    terms: terms.slice(0, 5),
    answer: terms[5],
    family: "Mixed",
    explanation: "Square numbers with a small linear drift.",
  };
}

export default function SequenceHunter() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [input, setInput] = useState("");
  const [active, setActive] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Find the next term.");

  useEffect(() => {
    setRound(generateRound());
    setBest(readStoredNumber("sequence-best"));
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
      writeStoredNumber("sequence-best", score);
    }
    setFeedback(`Hunt complete. Score ${score}.`);
  }, [active, best, score, timeLeft]);

  function startHunt() {
    setRound(generateRound());
    setInput("");
    setActive(true);
    setScore(0);
    setStreak(0);
    setTimeLeft(60);
    setFeedback("Find the next term.");
  }

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!active) return;

    const guess = Number(input);
    if (!Number.isFinite(guess)) {
      setFeedback("Enter a numeric next term.");
      return;
    }

    const correct = Math.abs(guess - round.answer) < 0.001;
    const nextStreak = correct ? streak + 1 : 0;
    const nextScore = score + (correct ? 100 + Math.min(streak, 8) * 10 : 0);

    setScore(nextScore);
    setStreak(nextStreak);
    setFeedback(
      correct
        ? `Correct. ${round.explanation}`
        : `Not quite. Next term: ${round.answer}. ${round.explanation}`
    );
    setInput("");
    setRound(generateRound());
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Sequence Hunter</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Streak {streak}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">{timeLeft}s</span>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-full bg-panel">
        <div className="h-3 rounded-full bg-accent transition-all" style={{ width: `${(timeLeft / 60) * 100}%` }} />
      </div>

      <div className="my-5 rounded-lg border border-accent/25 bg-accent/10 p-5">
        <p className="text-sm font-black uppercase text-accent">{round.family}</p>
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {round.terms.map((term, index) => (
            <div key={`${term}-${index}`} className="grid min-h-20 place-items-center rounded-lg border border-line bg-white p-3">
              <span className="text-2xl font-black">{term}</span>
            </div>
          ))}
          <div className="grid min-h-20 place-items-center rounded-lg border border-dashed border-accent bg-white p-3">
            <span className="text-2xl font-black">?</span>
          </div>
        </div>
      </div>

      <form onSubmit={submitAnswer} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          inputMode="numeric"
          disabled={!active}
          className="min-w-0 flex-1 rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent-2"
          placeholder="Next term"
        />
        <button type="submit" disabled={!active} className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Submit
        </button>
        <button type="button" onClick={startHunt} className="rounded-lg bg-accent px-4 py-2 font-black text-white">
          Restart
        </button>
      </form>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
