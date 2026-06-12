import { useEffect, useMemo, useState } from "react";
import { readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Bet = {
  cost: number;
  win: number;
  probability: number;
};

const defaultBet: Bet = {
  cost: 10,
  win: 70,
  probability: 1 / 6,
};

function generateBet(): Bet {
  const probabilities = [1 / 6, 0.2, 0.25, 0.35, 0.5, 0.65];
  const probability = probabilities[Math.floor(Math.random() * probabilities.length)];
  const win = Math.floor(20 + Math.random() * 100);
  const fairValue = probability * win;
  const costOffset = Math.floor(Math.random() * 21) - 10;
  const cost = Math.max(1, Math.round(fairValue + costOffset));

  return { cost, win, probability };
}

export default function EVTakeOrPass() {
  const [bet, setBet] = useState<Bet>(defaultBet);
  const [feedback, setFeedback] = useState("Choose take or pass.");
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    setBet(generateBet());
    setScore(readStoredNumber("ev-score"));
  }, []);

  const ev = useMemo(() => bet.probability * bet.win - bet.cost, [bet]);

  function answer(take: boolean) {
    if (answered) return;

    const correct = take === (ev > 0);
    const nextScore = score + (correct ? 1 : 0);

    setAnswered(true);
    setScore(nextScore);
    writeStoredNumber("ev-score", nextScore);
    setFeedback(
      `${correct ? "Correct" : "Not quite"}. EV = ${ev.toFixed(2)}. ` +
        `A risk-neutral trader would ${ev > 0 ? "take" : "pass on"} this bet.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setBet(generateBet());
    setFeedback("Choose take or pass.");
    setAnswered(false);
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">EV Take or Pass</h2>
        <p className="rounded-md border border-line bg-panel px-3 py-1 text-sm font-bold text-muted">
          Score {score}
        </p>
      </div>

      <div className="my-5 rounded-lg border border-accent-2/25 bg-accent-2/10 p-4">
        <p className="text-lg">
          Pay <strong>${bet.cost}</strong>. Win <strong>${bet.win}</strong> with probability{" "}
          <strong>{(bet.probability * 100).toFixed(1)}%</strong>. Otherwise, win $0.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => answer(true)}
          disabled={answered}
          className="rounded-lg bg-accent px-4 py-2 font-black text-white"
        >
          Take
        </button>
        <button
          type="button"
          onClick={() => answer(false)}
          disabled={answered}
          className="rounded-lg border border-line bg-surface px-4 py-2 font-black text-ink"
        >
          Pass
        </button>
        <button
          type="button"
          onClick={nextRound}
          className="rounded-lg border border-line bg-panel px-4 py-2 font-black text-ink"
        >
          New round
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
