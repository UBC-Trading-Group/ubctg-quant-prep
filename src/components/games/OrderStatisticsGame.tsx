import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { formatNumber, randomChoice, randomInt, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Statistic = "maximum" | "minimum" | "kth largest";

type Round = {
  n: number;
  k: number;
  statistic: Statistic;
  answer: number;
  sample: number[];
};

const defaultRound: Round = {
  n: 5,
  k: 1,
  statistic: "maximum",
  answer: (5 / 6) * 100,
  sample: [12, 45, 62, 71, 88],
};

function generateRound(): Round {
  const n = randomInt(3, 9);
  const statistic = randomChoice<Statistic>(["maximum", "minimum", "kth largest"]);
  const k = statistic === "kth largest" ? randomInt(2, Math.min(4, n)) : 1;
  const answer =
    statistic === "maximum"
      ? (n / (n + 1)) * 100
      : statistic === "minimum"
        ? (1 / (n + 1)) * 100
        : ((n - k + 1) / (n + 1)) * 100;
  const sample = Array.from({ length: n }, () => randomInt(0, 100));
  return { n, k, statistic, answer, sample };
}

export default function OrderStatisticsGame() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Estimate the expected statistic for uniform draws from 0 to 100.");

  useEffect(() => {
    setBest(readStoredNumber("order-stat-best"));
  }, []);

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const guess = Number(input);
    if (!Number.isFinite(guess)) {
      setFeedback("Enter an expected value between 0 and 100.");
      return;
    }

    const correct = Math.abs(guess - round.answer) <= 4;
    const nextScore = score + (correct ? 1 : 0);
    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("order-stat-best", nextScore);
    }
    setFeedback(correct ? `Good estimate. Answer is ${formatNumber(round.answer)}.` : `Answer is ${formatNumber(round.answer)}.`);

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(generateRound());
    setInput("");
    setFeedback("Estimate the expected statistic for uniform draws from 0 to 100.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Order Statistics Game</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-warn/30 bg-warn/10 p-5">
        <p className="text-sm font-black uppercase text-warn">Uniform(0, 100)</p>
        <p className="mt-3 text-2xl font-black">
          Estimate E[{round.statistic === "kth largest" ? `${round.k}${round.k === 2 ? "nd" : "th"} largest` : round.statistic}] from {round.n} draws.
        </p>
        <div className="mt-5 flex h-36 items-end gap-2 rounded-lg border border-line bg-white p-3">
          {round.sample.map((value, index) => (
            <div key={`${value}-${index}`} className="flex flex-1 flex-col items-center gap-1">
              <div className="w-full rounded-md bg-warn" style={{ height: `${Math.max(4, value)}%` }} />
              <span className="text-xs font-bold text-muted">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={submitAnswer} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          inputMode="decimal"
          className="min-w-0 flex-1 rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent-2"
          placeholder="Expected value"
        />
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Submit
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg bg-warn px-4 py-2 font-black text-white">
          New statistic
        </button>
      </form>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
