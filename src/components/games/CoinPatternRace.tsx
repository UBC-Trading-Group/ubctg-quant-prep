import { useEffect, useState } from "react";
import { formatPercent, randomChoice, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Round = {
  left: string;
  right: string;
  bias: number;
  leftWinRate: number;
};

const patterns = ["HHT", "THH", "HTH", "TTH", "HTT", "THT", "HHH", "TTT"];

const defaultRound: Round = {
  left: "HHT",
  right: "THH",
  bias: 0.5,
  leftWinRate: 0.5,
};

function flip(bias: number) {
  return Math.random() < bias ? "H" : "T";
}

function race(left: string, right: string, bias: number) {
  let sequence = "";
  for (let step = 0; step < 400; step += 1) {
    sequence += flip(bias);
    if (sequence.endsWith(left)) return { winner: "left" as const, sequence };
    if (sequence.endsWith(right)) return { winner: "right" as const, sequence };
  }
  return { winner: "right" as const, sequence };
}

function estimateLeftRate(left: string, right: string, bias: number) {
  let wins = 0;
  const trials = 900;
  for (let index = 0; index < trials; index += 1) {
    if (race(left, right, bias).winner === "left") wins += 1;
  }
  return wins / trials;
}

function generateRound(): Round {
  const left = randomChoice(patterns);
  let right = randomChoice(patterns);
  while (right === left) right = randomChoice(patterns);
  const bias = randomChoice([0.45, 0.5, 0.55, 0.6]);
  return { left, right, bias, leftWinRate: estimateLeftRate(left, right, bias) };
}

export default function CoinPatternRace() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [sequence, setSequence] = useState("");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Pick the pattern that is more likely to appear first.");

  useEffect(() => {
    setBest(readStoredNumber("coin-race-best"));
  }, []);

  function choose(side: "left" | "right") {
    const predictedLeft = round.leftWinRate >= 0.5;
    const correct = (side === "left") === predictedLeft;
    const run = race(round.left, round.right, round.bias);
    const nextScore = score + (correct ? 1 : 0);

    setSequence(run.sequence.slice(-36));
    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("coin-race-best", nextScore);
    }
    setFeedback(
      correct
        ? `Correct. ${round.left} wins about ${formatPercent(round.leftWinRate)} of simulations.`
        : `Not quite. ${round.left} wins about ${formatPercent(round.leftWinRate)} of simulations.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(generateRound());
    setSequence("");
    setFeedback("Pick the pattern that is more likely to appear first.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Coin Pattern Race</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">P(H) {formatPercent(round.bias, 0)}</span>
        </div>
      </div>

      <div className="my-5 grid gap-4 md:grid-cols-2">
        <button type="button" onClick={() => choose("left")} className="rounded-lg border border-accent bg-accent/10 p-6 text-left">
          <p className="text-sm font-black uppercase text-accent">Pattern A</p>
          <p className="mt-3 text-5xl font-black">{round.left}</p>
        </button>
        <button type="button" onClick={() => choose("right")} className="rounded-lg border border-warn bg-warn/10 p-6 text-left">
          <p className="text-sm font-black uppercase text-warn">Pattern B</p>
          <p className="mt-3 text-5xl font-black">{round.right}</p>
        </button>
      </div>

      <div className="rounded-lg border border-line bg-panel p-3">
        <p className="text-xs font-black uppercase text-muted">Latest simulated race tail</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {sequence ? (
            sequence.split("").map((char, index) => (
              <span key={`${char}-${index}`} className="grid size-8 place-items-center rounded-md bg-white text-sm font-black">
                {char}
              </span>
            ))
          ) : (
            <p className="px-1 py-2 text-sm font-bold text-muted">Press a pattern to simulate.</p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <button type="button" onClick={nextRound} className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          New race
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
