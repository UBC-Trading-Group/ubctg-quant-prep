import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { formatNumber, randomChoice, randomInt, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";
import { blackScholesPrice, type OptionParams } from "./optionUtils";

type Round = OptionParams & {
  marketPrice: number;
  trueVol: number;
  method: "bisection" | "newton";
};

const defaultRound: Round = {
  spot: 100,
  strike: 100,
  volatility: 0.2,
  rate: 0.03,
  time: 0.5,
  marketPrice: 6.37,
  trueVol: 0.2,
  method: "bisection",
};

function priceAt(round: Round, volatility: number) {
  return blackScholesPrice({ ...round, volatility }, "call");
}

function generateRound(): Round {
  const params: OptionParams = {
    spot: randomInt(80, 125),
    strike: randomInt(80, 125),
    volatility: randomChoice([0.12, 0.16, 0.2, 0.25, 0.32, 0.4, 0.5]),
    rate: randomChoice([0, 0.02, 0.04, 0.06]),
    time: randomChoice([0.1, 0.25, 0.5, 1, 1.5]),
  };

  return {
    ...params,
    marketPrice: blackScholesPrice(params, "call"),
    trueVol: params.volatility,
    method: randomChoice(["bisection", "newton"]),
  };
}

export default function ImpliedVolSolver() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [low, setLow] = useState(0.05);
  const [high, setHigh] = useState(0.8);
  const [guess, setGuess] = useState("20");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Use the bracket and submit the implied volatility as a percent.");

  useEffect(() => {
    setBest(readStoredNumber("implied-vol-solver-best"));
  }, []);

  const midpoint = (low + high) / 2;
  const midPrice = useMemo(() => priceAt(round, midpoint), [round, midpoint]);

  function bisect() {
    if (midPrice < round.marketPrice) {
      setLow(midpoint);
      setFeedback(`Mid vol ${formatNumber(midpoint * 100, 1)}% is too cheap; move the low bound up.`);
    } else {
      setHigh(midpoint);
      setFeedback(`Mid vol ${formatNumber(midpoint * 100, 1)}% is too expensive; move the high bound down.`);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const volGuess = Number(guess) / 100;
    if (!Number.isFinite(volGuess)) {
      setFeedback("Enter volatility as a percent, for example 24.");
      return;
    }

    const correct = Math.abs(volGuess - round.trueVol) <= 0.015;
    const nextScore = score + (correct ? 1 : 0);

    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("implied-vol-solver-best", nextScore);
    }
    setFeedback(
      correct
        ? `Correct. Implied vol is ${formatNumber(round.trueVol * 100, 1)}%.`
        : `Implied vol is ${formatNumber(round.trueVol * 100, 1)}%. Your price at ${formatNumber(volGuess * 100, 1)}% is ${formatNumber(priceAt(round, volGuess))}.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    const next = generateRound();
    setRound(next);
    setLow(0.05);
    setHigh(0.8);
    setGuess(String(Math.round(next.trueVol * 100)));
    setFeedback("Use the bracket and submit the implied volatility as a percent.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Implied Vol Solver</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">{round.method}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-warn/30 bg-warn/10 p-5">
        <p className="text-sm font-black uppercase text-warn">Market call</p>
        <p className="mt-2 text-2xl font-black">
          S {round.spot}, K {round.strike}, T {formatNumber(round.time)}y, market price {formatNumber(round.marketPrice)}.
        </p>
        <p className="mt-3 text-sm font-bold text-muted">Find the volatility that matches the market price.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-line bg-panel p-4">
          <p className="text-xs font-black uppercase text-muted">Current bracket</p>
          <p className="mt-2 text-4xl font-black">
            {formatNumber(low * 100, 1)}% / {formatNumber(high * 100, 1)}%
          </p>
          <p className="mt-3 text-sm text-muted">
            Midpoint {formatNumber(midpoint * 100, 1)}% prices at {formatNumber(midPrice)}.
          </p>
          <button type="button" onClick={bisect} className="mt-4 rounded-lg bg-accent px-4 py-2 font-black text-white">
            Bisection step
          </button>
        </div>

        <form onSubmit={submit} className="rounded-lg border border-line bg-panel p-4">
          <label className="text-xs font-black uppercase text-muted" htmlFor="implied-vol-input">
            Implied vol percent
          </label>
          <input
            id="implied-vol-input"
            value={guess}
            onChange={(event) => setGuess(event.target.value)}
            inputMode="decimal"
            className="mt-3 w-full rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent-2"
            placeholder="Volatility percent"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="submit" className="rounded-lg bg-ink px-4 py-2 font-black text-white">
              Submit
            </button>
            <button type="button" onClick={nextRound} className="rounded-lg border border-line bg-white px-4 py-2 font-black">
              New option
            </button>
          </div>
        </form>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
