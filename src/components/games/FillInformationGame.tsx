import { useEffect, useState } from "react";
import { formatNumber, randomChoice, randomInt, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Inference = "higher" | "lower" | "weak" | "too-wide";

type Round = {
  fairValue: number;
  bid: number;
  ask: number;
  event: string;
  answer: Inference;
  hiddenTrueValue: number;
  explanation: string;
};

const defaultRound: Round = {
  fairValue: 50,
  bid: 47,
  ask: 53,
  event: "Your ask gets lifted immediately by two traders.",
  answer: "higher",
  hiddenTrueValue: 59,
  explanation: "Fast ask lifts suggest the true value may be above your ask.",
};

function generateRound(): Round {
  const fairValue = randomInt(30, 80);
  const width = randomChoice([4, 6, 8, 12]);
  const bid = fairValue - width / 2;
  const ask = fairValue + width / 2;
  const template = randomChoice([
    {
      event: "Your ask gets lifted immediately by two traders.",
      answer: "higher" as const,
      move: randomInt(5, 14),
      explanation: "Fast ask lifts suggest the true value may be above your ask.",
    },
    {
      event: "Your bid gets hit immediately by a strong trader.",
      answer: "lower" as const,
      move: -randomInt(5, 14),
      explanation: "A strong trader selling to your bid is bad news for value.",
    },
    {
      event: "Nobody trades after several quote requests.",
      answer: width >= 10 ? ("too-wide" as const) : ("weak" as const),
      move: 0,
      explanation: width >= 10 ? "No fills on a wide quote mostly says the market was unattractive." : "No fill is weak evidence by itself.",
    },
    {
      event: "One small trader lifts your ask, then flow goes quiet.",
      answer: "weak" as const,
      move: randomInt(0, 3),
      explanation: "One small fill is not enough to move fair value much.",
    },
  ]);
  return { fairValue, bid, ask, hiddenTrueValue: fairValue + template.move, ...template };
}

export default function FillInformationGame() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Infer what the fill or non-fill says about value.");

  useEffect(() => {
    setBest(readStoredNumber("fill-info-best"));
  }, []);

  function choose(inference: Inference) {
    const correct = inference === round.answer;
    const nextScore = score + (correct ? 1 : 0);
    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("fill-info-best", nextScore);
    }
    setFeedback(
      correct
        ? `Correct. ${round.explanation}`
        : `Best inference: ${round.answer}. ${round.explanation} Hidden true value was ${formatNumber(round.hiddenTrueValue)}.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(generateRound());
    setFeedback("Infer what the fill or non-fill says about value.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Fill Information Game</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-line bg-panel p-5 text-center">
          <p className="text-xs font-black uppercase text-muted">Your market</p>
          <p className="mt-2 text-4xl font-black">{formatNumber(round.bid)} / {formatNumber(round.ask)}</p>
          <p className="mt-3 text-sm font-bold text-muted">Prior fair {formatNumber(round.fairValue)}</p>
        </div>
        <div className="rounded-lg border border-warn/30 bg-warn/10 p-5">
          <p className="text-sm font-black uppercase text-warn">Trade event</p>
          <p className="mt-2 text-2xl font-black">{round.event}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => choose("higher")} className="rounded-lg bg-accent px-4 py-2 font-black text-white">
          Value higher
        </button>
        <button type="button" onClick={() => choose("lower")} className="rounded-lg bg-warn px-4 py-2 font-black text-white">
          Value lower
        </button>
        <button type="button" onClick={() => choose("weak")} className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Weak signal
        </button>
        <button type="button" onClick={() => choose("too-wide")} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          Quote too wide
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          New fill
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
