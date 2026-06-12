import { useEffect, useMemo, useState } from "react";
import { formatNumber, formatPercent, randomChoice, randomInt, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Action = "move-up" | "move-down" | "wait";

type Round = {
  priorUncertainty: number;
  signalPrecision: number;
  lifts: number;
  hits: number;
  trades: number;
};

const defaultRound: Round = {
  priorUncertainty: 8,
  signalPrecision: 0.7,
  lifts: 4,
  hits: 1,
  trades: 5,
};

function generateRound(): Round {
  const trades = randomChoice([1, 2, 3, 5, 8, 12]);
  const lifts = randomInt(0, trades);
  return {
    priorUncertainty: randomChoice([3, 5, 8, 12, 18]),
    signalPrecision: randomChoice([0.25, 0.4, 0.6, 0.8, 0.9]),
    lifts,
    hits: trades - lifts,
    trades,
  };
}

function evidence(round: Round) {
  const imbalance = (round.lifts - round.hits) / Math.max(1, round.trades);
  return imbalance * round.signalPrecision * round.priorUncertainty;
}

function bestAction(round: Round): Action {
  const score = evidence(round);
  if (score > 2.5) return "move-up";
  if (score < -2.5) return "move-down";
  return "wait";
}

export default function SignalVsNoiseGame() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Decide whether the fill pattern is real signal or random noise.");

  useEffect(() => {
    setBest(readStoredNumber("signal-noise-best"));
  }, []);

  const evidenceValue = evidence(round);
  const answer = bestAction(round);
  const tradeTape = useMemo(
    () => [
      ...Array.from({ length: round.lifts }, () => "lift"),
      ...Array.from({ length: round.hits }, () => "hit"),
    ],
    [round]
  );

  function choose(action: Action) {
    const correct = action === answer;
    const nextScore = score + (correct ? 1 : 0);
    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("signal-noise-best", nextScore);
    }
    setFeedback(
      correct
        ? `Correct. Evidence score ${formatNumber(evidenceValue)}.`
        : `Best action: ${answer}. Evidence score ${formatNumber(evidenceValue)}; weak or low-precision flow is noise.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(generateRound());
    setFeedback("Decide whether the fill pattern is real signal or random noise.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Signal vs Noise Game</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-accent-2/25 bg-accent-2/10 p-5">
        <p className="text-sm font-black uppercase text-accent-2">Trade tape</p>
        <p className="mt-2 text-2xl font-black">
          {round.lifts} ask lift{round.lifts === 1 ? "" : "s"} and {round.hits} bid hit{round.hits === 1 ? "" : "s"}.
        </p>
        <p className="mt-3 text-sm font-bold text-muted">
          Signal precision {formatPercent(round.signalPrecision, 0)}. Prior uncertainty +/-{round.priorUncertainty}.
        </p>
      </div>

      <div className="rounded-lg border border-line bg-panel p-4">
        <p className="text-xs font-black uppercase text-muted">Tape visualization</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {tradeTape.map((trade, index) => (
            <span
              key={`${trade}-${index}`}
              className={`rounded-md px-3 py-2 text-xs font-black text-white ${trade === "lift" ? "bg-accent" : "bg-warn"}`}
            >
              {trade === "lift" ? "Lift" : "Hit"}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => choose("move-up")} className="rounded-lg bg-accent px-4 py-2 font-black text-white">
          Move fair up
        </button>
        <button type="button" onClick={() => choose("move-down")} className="rounded-lg bg-warn px-4 py-2 font-black text-white">
          Move fair down
        </button>
        <button type="button" onClick={() => choose("wait")} className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Wait for more
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          New tape
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
