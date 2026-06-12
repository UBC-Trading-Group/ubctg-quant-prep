import { useEffect, useMemo, useState } from "react";
import { formatNumber, randomChoice, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Shape = "put-skew" | "smile" | "flat" | "call-skew";

type Round = {
  shape: Shape;
  baseVol: number;
};

const strikes = [80, 90, 100, 110, 120];

const defaultRound: Round = {
  shape: "put-skew",
  baseVol: 0.24,
};

function targetVol(round: Round, strike: number) {
  const moneyness = (strike - 100) / 20;

  if (round.shape === "put-skew") return round.baseVol - 0.035 * moneyness;
  if (round.shape === "call-skew") return round.baseVol + 0.03 * moneyness;
  if (round.shape === "smile") return round.baseVol + 0.035 * Math.abs(moneyness);
  return round.baseVol;
}

function builtVol(left: number, atm: number, right: number, strike: number) {
  if (strike <= 100) {
    const weight = (strike - 80) / 20;
    return left + (atm - left) * weight;
  }

  const weight = (strike - 100) / 20;
  return atm + (right - atm) * weight;
}

function shapePrompt(shape: Shape) {
  if (shape === "put-skew") return "Fit a surface where lower strikes have higher implied vol.";
  if (shape === "call-skew") return "Fit a surface where higher strikes have higher implied vol.";
  if (shape === "smile") return "Fit a smile where both wings are richer than ATM.";
  return "Fit a flat volatility surface.";
}

function generateRound(): Round {
  return {
    shape: randomChoice<Shape>(["put-skew", "smile", "flat", "call-skew"]),
    baseVol: randomChoice([0.18, 0.22, 0.26, 0.3, 0.35]),
  };
}

export default function VolSmileBuilder() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [leftVol, setLeftVol] = useState(0.28);
  const [atmVol, setAtmVol] = useState(0.24);
  const [rightVol, setRightVol] = useState(0.2);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Adjust the wing and ATM vol sliders to match the target shape.");

  useEffect(() => {
    setBest(readStoredNumber("vol-smile-builder-best"));
  }, []);

  const points = useMemo(
    () =>
      strikes.map((strike) => ({
        strike,
        target: targetVol(round, strike),
        built: builtVol(leftVol, atmVol, rightVol, strike),
      })),
    [round, leftVol, atmVol, rightVol]
  );
  const maxError = Math.max(...points.map((point) => Math.abs(point.built - point.target)), 0);

  function checkSmile() {
    const correct = maxError <= 0.025;
    const nextScore = score + (correct ? 1 : 0);

    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("vol-smile-builder-best", nextScore);
    }
    setFeedback(
      correct
        ? `Good fit. Max error ${formatNumber(maxError * 100, 1)} vol points.`
        : `Max error ${formatNumber(maxError * 100, 1)} vol points. Try matching the target wing direction more closely.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    const next = generateRound();
    setRound(next);
    setLeftVol(next.baseVol);
    setAtmVol(next.baseVol);
    setRightVol(next.baseVol);
    setFeedback("Adjust the wing and ATM vol sliders to match the target shape.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Vol Smile Builder</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-accent-2/25 bg-accent-2/10 p-5">
        <p className="text-sm font-black uppercase text-accent-2">Target surface</p>
        <p className="mt-2 text-2xl font-black">{shapePrompt(round.shape)}</p>
        <p className="mt-3 text-sm font-bold text-muted">Base ATM vol {formatNumber(round.baseVol * 100, 0)}%.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-3">
          {[
            ["80 strike wing", leftVol, setLeftVol],
            ["100 strike ATM", atmVol, setAtmVol],
            ["120 strike wing", rightVol, setRightVol],
          ].map(([label, value, setter]) => (
            <label key={String(label)} className="grid gap-2 rounded-lg border border-line bg-white p-3">
              <span className="flex items-center justify-between gap-3 text-sm font-bold">
                <span>{label}</span>
                <span className="text-muted">{formatNumber(Number(value) * 100, 1)}%</span>
              </span>
              <input
                type="range"
                min={0.1}
                max={0.6}
                step={0.005}
                value={Number(value)}
                onChange={(event) => (setter as (next: number) => void)(Number(event.target.value))}
                className="w-full accent-accent-2"
              />
            </label>
          ))}
        </div>

        <div className="rounded-lg border border-line bg-panel p-4">
          <p className="text-xs font-black uppercase text-muted">Target vs built vol</p>
          <div className="mt-3 grid gap-3">
            {points.map((point) => (
              <div key={point.strike} className="rounded-md border border-line bg-white p-3">
                <div className="flex items-center justify-between gap-3 text-sm font-bold">
                  <span>K {point.strike}</span>
                  <span>Target {formatNumber(point.target * 100, 1)}% / Built {formatNumber(point.built * 100, 1)}%</span>
                </div>
                <div className="mt-2 grid gap-1">
                  <div className="h-2 rounded-full bg-accent-2" style={{ width: `${Math.max(8, point.target * 180)}%` }} />
                  <div className="h-2 rounded-full bg-warn" style={{ width: `${Math.max(8, point.built * 180)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={checkSmile} className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Check fit
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          New surface
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
