import { useEffect, useMemo, useState } from "react";
import { formatNumber, randomChoice, randomInt, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Target =
  | { kind: "mean"; value: number; label: string }
  | { kind: "six"; value: number; label: string }
  | { kind: "variance"; value: number; label: string };

const defaultTarget: Target = {
  kind: "six",
  value: 0.5,
  label: "Build a die where 6 occurs half the time.",
};

function generateTarget(): Target {
  const kind = randomChoice(["mean", "six", "variance"] as const);
  if (kind === "six") {
    const value = randomChoice([0.25, 0.33, 0.4, 0.5]);
    return { kind, value, label: `Build a die where 6 occurs ${formatNumber(value * 100, 0)}% of the time.` };
  }
  if (kind === "variance") {
    const value = randomChoice([2.2, 2.8, 3.5, 4.2]);
    return { kind, value, label: `Build a six-outcome distribution with variance near ${value}.` };
  }
  const value = randomChoice([2.8, 3.25, 3.75, 4.2]);
  return { kind, value, label: `Build a six-outcome distribution with mean near ${value}.` };
}

function normalize(weights: number[]) {
  const total = weights.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return weights.map(() => 1 / weights.length);
  return weights.map((value) => value / total);
}

export default function DistributionBuilder() {
  const [target, setTarget] = useState<Target>(defaultTarget);
  const [weights, setWeights] = useState([10, 10, 10, 10, 10, 50]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Adjust the bars, then check whether your distribution hits the target.");

  useEffect(() => {
    setBest(readStoredNumber("distribution-builder-best"));
  }, []);

  const probs = useMemo(() => normalize(weights), [weights]);
  const mean = probs.reduce((sum, probability, index) => sum + probability * (index + 1), 0);
  const variance = probs.reduce((sum, probability, index) => sum + probability * (index + 1 - mean) ** 2, 0);

  function setWeight(index: number, value: number) {
    setWeights((current) => current.map((item, currentIndex) => (currentIndex === index ? value : item)));
  }

  function checkDistribution() {
    const measure = target.kind === "mean" ? mean : target.kind === "six" ? probs[5] : variance;
    const tolerance = target.kind === "six" ? 0.035 : target.kind === "mean" ? 0.15 : 0.35;
    const correct = Math.abs(measure - target.value) <= tolerance;
    const nextScore = score + (correct ? 1 : 0);

    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("distribution-builder-best", nextScore);
    }

    setFeedback(
      correct
        ? `Nice build. Mean ${formatNumber(mean)}, variance ${formatNumber(variance)}, P(6) ${formatNumber(probs[5] * 100)}%.`
        : `Close? Mean ${formatNumber(mean)}, variance ${formatNumber(variance)}, P(6) ${formatNumber(probs[5] * 100)}%.`
    );

    scheduleAutoAdvance(nextTarget);
  }

  function nextTarget() {
    setTarget(generateTarget());
    setWeights(Array.from({ length: 6 }, () => randomInt(5, 30)));
    setFeedback("Adjust the bars, then check whether your distribution hits the target.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Distribution Builder</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-accent/25 bg-accent/10 p-5">
        <p className="text-sm font-black uppercase text-accent">Target</p>
        <p className="mt-2 text-2xl font-black">{target.label}</p>
        <div className="mt-4 grid gap-2 text-sm font-bold text-muted sm:grid-cols-3">
          <span className="rounded-md bg-white px-3 py-2">Mean {formatNumber(mean)}</span>
          <span className="rounded-md bg-white px-3 py-2">Variance {formatNumber(variance)}</span>
          <span className="rounded-md bg-white px-3 py-2">P(6) {formatNumber(probs[5] * 100)}%</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-6">
        {probs.map((probability, index) => (
          <label key={index} className="rounded-lg border border-line bg-panel p-3 text-center">
            <span className="text-sm font-black">Face {index + 1}</span>
            <div className="mt-3 flex h-32 items-end rounded-md bg-white p-2">
              <div className="w-full rounded-md bg-accent" style={{ height: `${Math.max(4, probability * 100)}%` }} />
            </div>
            <span className="mt-2 block text-sm font-bold text-muted">{formatNumber(probability * 100)}%</span>
            <input
              type="range"
              min="0"
              max="100"
              value={weights[index]}
              onChange={(event) => setWeight(index, Number(event.target.value))}
              className="mt-2 w-full"
            />
          </label>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={checkDistribution} className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Check
        </button>
        <button type="button" onClick={nextTarget} className="rounded-lg bg-accent px-4 py-2 font-black text-white">
          New target
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
