import { useEffect, useMemo, useState } from "react";
import { clamp, formatNumber, formatPercent, randomChoice, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Round = {
  bankroll: number;
  winProbability: number;
  payoutRatio: number;
  maxDrawdown: number;
};

const defaultRound: Round = {
  bankroll: 5000,
  winProbability: 0.55,
  payoutRatio: 1.2,
  maxDrawdown: 0.15,
};

function generateRound(): Round {
  return {
    bankroll: randomChoice([1000, 2500, 5000, 10000]),
    winProbability: randomChoice([0.38, 0.45, 0.52, 0.56, 0.62, 0.68]),
    payoutRatio: randomChoice([0.8, 1, 1.2, 1.5, 2, 3]),
    maxDrawdown: randomChoice([0.05, 0.1, 0.15, 0.2, 0.25]),
  };
}

function money(value: number) {
  return `$${formatNumber(value, 0)}`;
}

function kellyFraction(round: Round) {
  const edge = round.winProbability * round.payoutRatio - (1 - round.winProbability);
  return edge / round.payoutRatio;
}

export default function BankrollSizingGame() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [fraction, setFraction] = useState(0.08);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Choose a stake size that respects edge and drawdown.");

  useEffect(() => {
    setBest(readStoredNumber("bankroll-sizing-best"));
  }, []);

  const rawKelly = kellyFraction(round);
  const target = clamp(rawKelly, 0, round.maxDrawdown);
  const stake = round.bankroll * fraction;
  const expectedProfit = stake * (round.winProbability * round.payoutRatio - (1 - round.winProbability));
  const winProfit = stake * round.payoutRatio;

  const outcomeBars = useMemo(
    () => [
      { label: "Win", value: winProfit, color: "bg-accent" },
      { label: "Loss", value: -stake, color: "bg-warn" },
      { label: "EV", value: expectedProfit, color: expectedProfit >= 0 ? "bg-accent-2" : "bg-warn" },
    ],
    [expectedProfit, stake, winProfit]
  );

  function checkAnswer() {
    const tolerance = target === 0 ? 0.02 : 0.035;
    const correct = Math.abs(fraction - target) <= tolerance;
    const nextScore = score + (correct ? 1 : 0);

    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("bankroll-sizing-best", nextScore);
    }
    setFeedback(
      correct
        ? `Good sizing. Kelly cap target is ${formatPercent(target, 1)} of bankroll.`
        : `Target is about ${formatPercent(target, 1)}. Raw Kelly is ${formatPercent(Math.max(0, rawKelly), 1)} and drawdown cap is ${formatPercent(round.maxDrawdown, 0)}.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    const next = generateRound();
    setRound(next);
    setFraction(Math.min(0.1, next.maxDrawdown));
    setFeedback("Choose a stake size that respects edge and drawdown.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Bankroll Sizing Game</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-accent/25 bg-accent/10 p-5">
        <p className="text-sm font-black uppercase text-accent">Bet terms</p>
        <p className="mt-2 text-2xl font-black">
          Bankroll {money(round.bankroll)}. Win probability {formatPercent(round.winProbability, 0)}. Win {formatNumber(round.payoutRatio)}x stake, lose stake.
        </p>
        <p className="mt-3 text-sm font-bold text-muted">Max allowed one-bet drawdown: {formatPercent(round.maxDrawdown, 0)}</p>
      </div>

      <label className="block rounded-lg border border-line bg-white p-4">
        <span className="flex flex-wrap items-center justify-between gap-3 font-black">
          <span>Stake</span>
          <span>{money(stake)} ({formatPercent(fraction, 1)})</span>
        </span>
        <input
          type="range"
          min="0"
          max="0.5"
          step="0.005"
          value={fraction}
          onChange={(event) => setFraction(Number(event.target.value))}
          className="mt-4 w-full"
        />
      </label>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {outcomeBars.map((item) => (
          <div key={item.label} className="rounded-lg border border-line bg-panel p-4">
            <p className="text-xs font-black uppercase text-muted">{item.label}</p>
            <p className="mt-2 text-2xl font-black">{money(item.value)}</p>
            <div className="mt-3 h-3 rounded-full bg-white">
              <div className={`h-3 rounded-full ${item.color}`} style={{ width: `${Math.min(100, Math.abs(item.value) / Math.max(stake, 1) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={checkAnswer} className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Check size
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg bg-accent px-4 py-2 font-black text-white">
          New bankroll
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
