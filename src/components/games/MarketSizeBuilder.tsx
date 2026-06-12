import { useEffect, useMemo, useState } from "react";
import { formatPercent, randomChoice, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";
import { factorError, formatEstimate, marketPrompts, type MarketAssumption, type MarketPrompt } from "./fermiPrompts";

const defaultPrompt = marketPrompts[0];

function defaultValues(prompt: MarketPrompt) {
  return prompt.assumptions.map((assumption) => assumption.defaultValue);
}

function formatAssumptionValue(assumption: MarketAssumption, value: number) {
  if (assumption.suffix === "as decimal") return formatPercent(value, 0);
  const prefix = assumption.prefix ?? "";
  const suffix = assumption.suffix && assumption.suffix !== "as decimal" ? ` ${assumption.suffix}` : "";
  return `${prefix}${formatEstimate(value)}${suffix}`;
}

export default function MarketSizeBuilder() {
  const [prompt, setPrompt] = useState<MarketPrompt>(defaultPrompt);
  const [values, setValues] = useState(() => defaultValues(defaultPrompt));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Tune the assumptions until the market size feels defensible.");

  useEffect(() => {
    setBest(readStoredNumber("market-size-best"));
  }, []);

  const estimate = useMemo(() => values.reduce((product, value) => product * value, 1), [values]);
  const factor = factorError(estimate, prompt.answer);

  function updateValue(index: number, value: number) {
    setValues((current) => current.map((item, currentIndex) => (currentIndex === index ? value : item)));
    setSubmitted(false);
  }

  function checkMarket() {
    const points = factor <= 1.5 ? 5 : factor <= 2 ? 4 : factor <= 5 ? 2 : factor <= 10 ? 1 : 0;
    const nextScore = score + points;

    setSubmitted(true);
    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("market-size-best", nextScore);
    }
    setFeedback(
      points > 0
        ? `Good market size. Benchmark: ${formatEstimate(prompt.answer)} ${prompt.unit}; you were within ${factor.toFixed(1)}x.`
        : `Benchmark: ${formatEstimate(prompt.answer)} ${prompt.unit}; your estimate was off by ${factor.toFixed(1)}x.`
    );

    scheduleAutoAdvance(nextMarket);
  }

  function nextMarket() {
    const next = randomChoice(marketPrompts);
    setPrompt(next);
    setValues(defaultValues(next));
    setSubmitted(false);
    setFeedback("Tune the assumptions until the market size feels defensible.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Market-Size Builder</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-warn/30 bg-warn/10 p-5">
        <p className="text-sm font-black uppercase text-warn">Market sizing</p>
        <p className="mt-2 text-2xl font-black">{prompt.prompt}</p>
        <p className="mt-3 text-sm font-bold text-muted">Population x penetration x usage x price.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {prompt.assumptions.map((assumption, index) => (
          <label key={assumption.label} className="rounded-lg border border-line bg-panel p-4">
            <span className="flex items-center justify-between gap-3 text-sm font-black">
              <span>{assumption.label}</span>
              <span>{formatAssumptionValue(assumption, values[index])}</span>
            </span>
            <input
              type="range"
              min={assumption.min}
              max={assumption.max}
              step={assumption.step}
              value={values[index]}
              onChange={(event) => updateValue(index, Number(event.target.value))}
              className="mt-4 w-full"
            />
          </label>
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-line bg-white p-4">
        <p className="text-xs font-black uppercase text-muted">Current market size</p>
        <p className="mt-2 text-3xl font-black">
          {formatEstimate(estimate)} {prompt.unit}
        </p>
        {submitted && (
          <p className="mt-2 text-sm font-bold text-muted">
            Benchmark: {formatEstimate(prompt.answer)} {prompt.unit}
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={checkMarket} className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Check size
        </button>
        <button type="button" onClick={nextMarket} className="rounded-lg bg-warn px-4 py-2 font-black text-white">
          New market
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
