import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { randomChoice, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";
import { factorError, fermiPrompts, formatEstimate, type FermiPrompt } from "./fermiPrompts";

const defaultPrompt = fermiPrompts[0];

function emptyInputs(prompt: FermiPrompt) {
  return prompt.decomposition.map(() => "");
}

export default function AssumptionStackBuilder() {
  const [prompt, setPrompt] = useState<FermiPrompt>(defaultPrompt);
  const [inputs, setInputs] = useState(() => emptyInputs(defaultPrompt));
  const [submittedEstimate, setSubmittedEstimate] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Fill each assumption, then multiply the stack.");

  useEffect(() => {
    setBest(readStoredNumber("assumption-stack-best"));
  }, []);

  const currentEstimate = useMemo(() => {
    const values = inputs.map((value) => Number(value));
    if (values.some((value) => !Number.isFinite(value) || value <= 0)) return null;
    return values.reduce((product, value) => product * value, 1);
  }, [inputs]);

  function updateInput(index: number, value: string) {
    setInputs((current) => current.map((item, currentIndex) => (currentIndex === index ? value : item)));
  }

  function submitStack(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (currentEstimate === null) {
      setFeedback("Enter positive numeric assumptions in every field.");
      return;
    }

    const factor = factorError(currentEstimate, prompt.answer);
    const points = factor <= 1.5 ? 5 : factor <= 2 ? 4 : factor <= 5 ? 2 : factor <= 10 ? 1 : 0;
    const nextScore = score + points;

    setSubmittedEstimate(currentEstimate);
    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("assumption-stack-best", nextScore);
    }
    setFeedback(
      points > 0
        ? `Solid stack. Your product was within ${factor.toFixed(1)}x of ${formatEstimate(prompt.answer)} ${prompt.unit}.`
        : `Benchmark: ${formatEstimate(prompt.answer)} ${prompt.unit}. Your stack was off by ${factor.toFixed(1)}x.`
    );

    scheduleAutoAdvance(nextPrompt);
  }

  function nextPrompt() {
    const next = randomChoice(fermiPrompts);
    setPrompt(next);
    setInputs(emptyInputs(next));
    setSubmittedEstimate(null);
    setFeedback("Fill each assumption, then multiply the stack.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Assumption Stack Builder</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-accent/25 bg-accent/10 p-5">
        <p className="text-sm font-black uppercase text-accent">{prompt.category}</p>
        <p className="mt-2 text-2xl font-black">{prompt.prompt}</p>
        <p className="mt-3 text-sm font-bold text-muted">{prompt.assumption}</p>
      </div>

      <form onSubmit={submitStack}>
        <div className="grid gap-3 md:grid-cols-2">
          {prompt.decomposition.map((field, index) => (
            <label key={field.label} className="rounded-lg border border-line bg-panel p-4">
              <span className="text-sm font-black">{field.label}</span>
              <input
                value={inputs[index] ?? ""}
                onChange={(event) => updateInput(index, event.target.value)}
                inputMode="decimal"
                className="mt-3 w-full rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent"
                placeholder={field.suffix ? `Value (${field.suffix})` : "Value"}
              />
            </label>
          ))}
        </div>

        <div className="mt-5 rounded-lg border border-line bg-white p-4">
          <p className="text-xs font-black uppercase text-muted">Current product</p>
          <p className="mt-2 text-3xl font-black">
            {currentEstimate === null ? "Incomplete" : `${formatEstimate(currentEstimate)} ${prompt.unit}`}
          </p>
          {submittedEstimate !== null && (
            <p className="mt-2 text-sm font-bold text-muted">
              Benchmark: {formatEstimate(prompt.answer)} {prompt.unit}
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="submit" className="rounded-lg bg-ink px-4 py-2 font-black text-white">
            Check stack
          </button>
          <button type="button" onClick={nextPrompt} className="rounded-lg bg-accent px-4 py-2 font-black text-white">
            New stack
          </button>
        </div>
      </form>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
