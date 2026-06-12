import { useEffect, useMemo, useState } from "react";
import { formatNumber, randomChoice, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";
import { blackScholesGreeks, blackScholesPrice, type OptionParams } from "./optionUtils";

type Target =
  | { kind: "delta"; value: number }
  | { kind: "gamma"; value: number }
  | { kind: "vega"; value: number }
  | { kind: "theta"; value: number };

const defaultParams: OptionParams = {
  spot: 100,
  strike: 100,
  volatility: 0.25,
  rate: 0.03,
  time: 0.5,
};

const defaultTarget: Target = { kind: "gamma", value: 0.045 };

function generateTarget(): Target {
  return randomChoice<Target>([
    { kind: "delta", value: randomChoice([0.35, 0.5, 0.65, 0.8]) },
    { kind: "gamma", value: randomChoice([0.035, 0.045, 0.055]) },
    { kind: "vega", value: randomChoice([0.28, 0.34, 0.4]) },
    { kind: "theta", value: randomChoice([-0.025, -0.02, -0.015]) },
  ]);
}

function targetPrompt(target: Target) {
  if (target.kind === "delta") return `Adjust the sliders until call delta is near ${formatNumber(target.value, 2)}.`;
  if (target.kind === "gamma") return `Find a setup with gamma above ${formatNumber(target.value, 3)}.`;
  if (target.kind === "vega") return `Find a setup with vega above ${formatNumber(target.value, 2)} per vol point.`;
  return `Find a setup with daily theta less negative than ${formatNumber(target.value, 3)}.`;
}

function targetMet(target: Target, greeks: ReturnType<typeof blackScholesGreeks>) {
  if (target.kind === "delta") return Math.abs(greeks.delta - target.value) <= 0.04;
  if (target.kind === "gamma") return greeks.gamma >= target.value;
  if (target.kind === "vega") return greeks.vega >= target.value;
  return greeks.theta >= target.value;
}

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (value: number) => void;
};

function Slider({ label, value, min, max, step, suffix = "", onChange }: SliderProps) {
  return (
    <label className="grid gap-2 rounded-lg border border-line bg-white p-3">
      <span className="flex items-center justify-between gap-3 text-sm font-bold">
        <span>{label}</span>
        <span className="text-muted">
          {formatNumber(value, step < 0.01 ? 3 : 2)}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-accent-2"
      />
    </label>
  );
}

export default function GreeksSliderLab() {
  const [params, setParams] = useState<OptionParams>(defaultParams);
  const [target, setTarget] = useState<Target>(defaultTarget);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Move the sliders, then check the target.");

  useEffect(() => {
    setBest(readStoredNumber("greeks-slider-best"));
  }, []);

  const price = useMemo(() => blackScholesPrice(params, "call"), [params]);
  const greeks = useMemo(() => blackScholesGreeks(params, "call"), [params]);
  const complete = targetMet(target, greeks);

  function updateParam(key: keyof OptionParams, value: number) {
    setParams((current) => ({ ...current, [key]: value }));
  }

  function checkTarget() {
    const correct = targetMet(target, greeks);
    const nextScore = score + (correct ? 1 : 0);

    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("greeks-slider-best", nextScore);
    }
    setFeedback(
      correct
        ? `Nice. Delta ${formatNumber(greeks.delta, 3)}, gamma ${formatNumber(greeks.gamma, 4)}, vega ${formatNumber(greeks.vega, 3)}, theta ${formatNumber(greeks.theta, 4)}.`
        : `Not there yet. Current delta ${formatNumber(greeks.delta, 3)}, gamma ${formatNumber(greeks.gamma, 4)}, vega ${formatNumber(greeks.vega, 3)}, theta ${formatNumber(greeks.theta, 4)}.`
    );

    scheduleAutoAdvance(nextTarget);
  }

  function nextTarget() {
    setTarget(generateTarget());
    setFeedback("Move the sliders, then check the target.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Greeks Slider Lab</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-accent-2/25 bg-accent-2/10 p-5">
        <p className="text-sm font-black uppercase text-accent-2">Target</p>
        <p className="mt-2 text-2xl font-black">{targetPrompt(target)}</p>
        <p className="mt-3 text-sm font-bold text-muted">Call price {formatNumber(price)}. Target status: {complete ? "met" : "open"}.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-3">
          <Slider label="Spot" value={params.spot} min={60} max={140} step={1} onChange={(value) => updateParam("spot", value)} />
          <Slider label="Strike" value={params.strike} min={70} max={130} step={1} onChange={(value) => updateParam("strike", value)} />
          <Slider label="Volatility" value={params.volatility} min={0.08} max={0.8} step={0.01} onChange={(value) => updateParam("volatility", value)} />
          <Slider label="Rate" value={params.rate} min={0} max={0.08} step={0.005} onChange={(value) => updateParam("rate", value)} />
          <Slider label="Time" value={params.time} min={0.03} max={2} step={0.01} suffix="y" onChange={(value) => updateParam("time", value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            ["Delta", greeks.delta, 3],
            ["Gamma", greeks.gamma, 4],
            ["Theta/day", greeks.theta, 4],
            ["Vega/pt", greeks.vega, 3],
          ].map(([label, value, decimals]) => (
            <div key={String(label)} className="rounded-lg border border-line bg-panel p-4 text-center">
              <p className="text-xs font-black uppercase text-muted">{label}</p>
              <p className="mt-2 text-3xl font-black">{formatNumber(Number(value), Number(decimals))}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={checkTarget} className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Check target
        </button>
        <button type="button" onClick={nextTarget} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          New question
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
