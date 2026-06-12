import { useEffect, useMemo, useState } from "react";
import { formatNumber, randomChoice, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Round = {
  title: string;
  transformA: string;
  transformB: string;
  answer: "yes" | "no";
  explanation: string;
  pairs: Array<{ b: number; r: number; a: number; c: number }>;
};

function buildPairs(transform: "sum-product" | "sum-diff" | "max-min" | "split-sources"): Round {
  const pairs = Array.from({ length: 2 }, (_, b) =>
    Array.from({ length: 6 }, (_, index) => {
      const r = index + 1;
      if (transform === "sum-product") return { b, r, a: b + r, c: b * r };
      if (transform === "sum-diff") return { b, r, a: b + r, c: r - b };
      if (transform === "split-sources") return { b, r, a: b, c: r % 2 };
      return { b, r, a: Math.max(b, r), c: Math.min(b, r) };
    })
  ).flat();

  if (transform === "sum-product") {
    return {
      title: "B is Bernoulli(1/2), R is a fair d6.",
      transformA: "A = B + R",
      transformB: "C = B x R",
      answer: "no",
      explanation: "When B=0, C is always 0, while A still reveals information about R. The transforms are dependent.",
      pairs,
    };
  }

  if (transform === "sum-diff") {
    return {
      title: "B is Bernoulli(1/2), R is a fair d6.",
      transformA: "A = B + R",
      transformB: "C = R - B",
      answer: "no",
      explanation: "Both transforms contain the same R and B, so knowing one changes beliefs about the other.",
      pairs,
    };
  }

  if (transform === "split-sources") {
    return {
      title: "B is Bernoulli(1/2), R is a fair d6.",
      transformA: "A = B",
      transformB: "C = R mod 2",
      answer: "yes",
      explanation: "A only uses B and C only uses R. Because B and R are independent, these transforms stay independent.",
      pairs,
    };
  }

  return {
    title: "B is Bernoulli(1/2), R is a fair d6.",
    transformA: "A = max(B, R)",
    transformB: "C = min(B, R)",
    answer: "no",
    explanation: "C reveals B for most outcomes, and A shares R, so the transformed variables are dependent.",
    pairs,
  };
}

const defaultRound = buildPairs("sum-product");

function generateRound() {
  return buildPairs(randomChoice(["sum-product", "sum-diff", "max-min", "split-sources"] as const));
}

export default function RandomVariableTransformer() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Decide whether the transformed variables are independent.");

  useEffect(() => {
    setBest(readStoredNumber("rv-transformer-best"));
  }, []);

  const stats = useMemo(() => {
    const meanA = round.pairs.reduce((sum, item) => sum + item.a, 0) / round.pairs.length;
    const meanC = round.pairs.reduce((sum, item) => sum + item.c, 0) / round.pairs.length;
    return { meanA, meanC };
  }, [round]);

  function answer(choice: "yes" | "no") {
    const correct = choice === round.answer;
    const nextScore = score + (correct ? 1 : 0);
    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("rv-transformer-best", nextScore);
    }
    setFeedback(correct ? `Correct. ${round.explanation}` : `Not quite. ${round.explanation}`);

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(generateRound());
    setFeedback("Decide whether the transformed variables are independent.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Random Variable Transformer</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-accent-2/25 bg-accent-2/10 p-5">
        <p className="text-sm font-black uppercase text-accent-2">{round.title}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-line bg-white p-4">
            <p className="text-2xl font-black">{round.transformA}</p>
            <p className="mt-2 text-sm text-muted">E[A] = {formatNumber(stats.meanA)}</p>
          </div>
          <div className="rounded-lg border border-line bg-white p-4">
            <p className="text-2xl font-black">{round.transformB}</p>
            <p className="mt-2 text-sm text-muted">E[C] = {formatNumber(stats.meanC)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-2 rounded-lg border border-line bg-panel p-3 sm:grid-cols-6">
        {round.pairs.slice(0, 12).map((item) => (
          <div key={`${item.b}-${item.r}`} className="rounded-md bg-white p-2 text-center text-xs font-bold">
            <p>B={item.b}, R={item.r}</p>
            <p className="text-accent-2">A={item.a}, C={item.c}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => answer("yes")} className="rounded-lg bg-accent-2 px-4 py-2 font-black text-white">
          Independent
        </button>
        <button type="button" onClick={() => answer("no")} className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Dependent
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          New transform
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
