import { useEffect, useState } from "react";
import { formatNumber, randomChoice, randomInt, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Direction = "raise" | "lower" | "hold";

type Round = {
  prior: number;
  width: number;
  event: string;
  direction: Direction;
  magnitude: number;
  explanation: string;
};

const defaultRound: Round = {
  prior: 50,
  width: 8,
  event: "Three traders lifted your ask quickly.",
  direction: "raise",
  magnitude: 6,
  explanation: "Fast ask lifts suggest your market was too low or flow is informed.",
};

function generateRound(): Round {
  const prior = randomInt(25, 80);
  const event = randomChoice([
    {
      event: "Three traders lifted your ask quickly.",
      direction: "raise" as const,
      magnitude: randomChoice([4, 6, 8]),
      explanation: "Fast ask lifts suggest your market was too low or flow is informed.",
    },
    {
      event: "Two traders hit your bid and no one lifts your ask.",
      direction: "lower" as const,
      magnitude: randomChoice([3, 5, 7]),
      explanation: "Bid hits without ask interest point to a lower fair value.",
    },
    {
      event: "A reliable signal raises the expected payoff by 5.",
      direction: "raise" as const,
      magnitude: 5,
      explanation: "A positive information shock should move the midpoint up.",
    },
    {
      event: "New information cuts the expected payoff by 6.",
      direction: "lower" as const,
      magnitude: 6,
      explanation: "A negative information shock should move the midpoint down.",
    },
    {
      event: "Balanced two-way flow at your quoted size.",
      direction: "hold" as const,
      magnitude: 0,
      explanation: "Balanced flow gives little reason to move midpoint.",
    },
    {
      event: "No fills after three quote requests.",
      direction: "hold" as const,
      magnitude: 0,
      explanation: "No fills may mean your market is wide, but midpoint evidence is weak.",
    },
  ]);
  return { prior, width: randomChoice([4, 6, 8, 10]), ...event };
}

function revisedMid(round: Round) {
  if (round.direction === "raise") return round.prior + round.magnitude;
  if (round.direction === "lower") return round.prior - round.magnitude;
  return round.prior;
}

export default function QuoteRevisionGame() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [choice, setChoice] = useState<Direction | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Revise your quote after the new information.");

  useEffect(() => {
    setBest(readStoredNumber("quote-revision-best"));
  }, []);

  const oldBid = round.prior - round.width / 2;
  const oldAsk = round.prior + round.width / 2;
  const newMid = revisedMid(round);
  const newBid = newMid - round.width / 2;
  const newAsk = newMid + round.width / 2;

  function answer(direction: Direction) {
    setChoice(direction);
    const correct = direction === round.direction;
    const nextScore = score + (correct ? 1 : 0);
    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("quote-revision-best", nextScore);
    }
    setFeedback(correct ? `Correct. ${round.explanation}` : `Best revision: ${round.direction}. ${round.explanation}`);

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(generateRound());
    setChoice(null);
    setFeedback("Revise your quote after the new information.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Quote Revision Game</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-warn/30 bg-warn/10 p-5">
          <p className="text-sm font-black uppercase text-warn">New event</p>
          <p className="mt-2 text-2xl font-black">{round.event}</p>
        </div>
        <div className="rounded-lg border border-line bg-panel p-5">
          <p className="text-sm font-black uppercase text-muted">Current market</p>
          <p className="mt-3 text-4xl font-black">{formatNumber(oldBid)} / {formatNumber(oldAsk)}</p>
          {choice && (
            <p className="mt-3 text-sm font-bold text-muted">
              Suggested revision: {formatNumber(newBid)} / {formatNumber(newAsk)}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => answer("raise")} className="rounded-lg bg-accent px-4 py-2 font-black text-white">
          Raise quote
        </button>
        <button type="button" onClick={() => answer("lower")} className="rounded-lg bg-warn px-4 py-2 font-black text-white">
          Lower quote
        </button>
        <button type="button" onClick={() => answer("hold")} className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Hold midpoint
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          New revision
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
