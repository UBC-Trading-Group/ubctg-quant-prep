import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { combination, formatPercent, randomChoice, randomInt, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Target = "clubs" | "hearts" | "red" | "aces" | "face";
type Rule = "with" | "without";

type Round = {
  draws: number;
  target: Target;
  deckSize: number;
  successCount: number;
  prompt: string;
};

const targetLabels: Record<Target, string> = {
  clubs: "clubs",
  hearts: "hearts",
  red: "red cards",
  aces: "aces",
  face: "face cards",
};

const defaultRound: Round = {
  draws: 2,
  target: "clubs",
  deckSize: 52,
  successCount: 13,
  prompt: "Probability both draws are clubs.",
};

function targetSuccessCount(target: Target) {
  if (target === "clubs" || target === "hearts") return 13;
  if (target === "red") return 26;
  if (target === "aces") return 4;
  return 12;
}

function generateRound(): Round {
  const target = randomChoice<Target>(["clubs", "hearts", "red", "aces", "face"]);
  const draws = randomInt(2, target === "aces" ? 3 : 4);
  return {
    draws,
    target,
    deckSize: 52,
    successCount: targetSuccessCount(target),
    prompt: `Probability all ${draws} draws are ${targetLabels[target]}.`,
  };
}

function probability(round: Round, rule: Rule) {
  if (rule === "with") return (round.successCount / round.deckSize) ** round.draws;
  return combination(round.successCount, round.draws) / combination(round.deckSize, round.draws);
}

export default function CardDrawLab() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [rule, setRule] = useState<Rule>("without");
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Choose a replacement rule and enter the probability as a percent.");

  useEffect(() => {
    setBest(readStoredNumber("card-lab-best"));
  }, []);

  const answer = useMemo(() => probability(round, rule), [round, rule]);
  const remainingSuccess = rule === "without" ? Math.max(0, round.successCount - round.draws) : round.successCount;
  const remainingDeck = rule === "without" ? round.deckSize - round.draws : round.deckSize;

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const guess = Number(input) / 100;

    if (!Number.isFinite(guess)) {
      setFeedback("Enter a percent, for example 6.25.");
      return;
    }

    const correct = Math.abs(guess - answer) <= 0.005;
    const nextScore = score + (correct ? 1 : 0);
    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("card-lab-best", nextScore);
    }
    setFeedback(
      correct
        ? `Correct. ${rule === "with" ? "Independent draws" : "Dependent draws"}: ${formatPercent(answer)}.`
        : `Not quite. ${rule === "with" ? "With" : "Without"} replacement gives ${formatPercent(answer)}.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(generateRound());
    setInput("");
    setRule(randomChoice<Rule>(["with", "without"]));
    setFeedback("Choose a replacement rule and enter the probability as a percent.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Card Draw Lab</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-accent-2/25 bg-accent-2/10 p-5">
          <p className="text-sm font-black uppercase text-accent-2">Scenario</p>
          <p className="mt-3 text-2xl font-black">{round.prompt}</p>
          <p className="mt-3 text-sm font-bold text-muted">
            Success cards: {round.successCount} / {round.deckSize}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-panel p-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRule("with")}
              className={`rounded-lg border px-4 py-3 font-black ${
                rule === "with" ? "border-accent-2 bg-accent-2 text-white" : "border-line bg-white"
              }`}
            >
              With replacement
            </button>
            <button
              type="button"
              onClick={() => setRule("without")}
              className={`rounded-lg border px-4 py-3 font-black ${
                rule === "without" ? "border-accent-2 bg-accent-2 text-white" : "border-line bg-white"
              }`}
            >
              Without replacement
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg border border-line bg-white p-4">
              <p className="text-xs font-black uppercase text-muted">After draw path</p>
              <p className="mt-2 text-3xl font-black">{remainingSuccess}</p>
              <p className="text-xs font-bold text-muted">target cards left</p>
            </div>
            <div className="rounded-lg border border-line bg-white p-4">
              <p className="text-xs font-black uppercase text-muted">Deck state</p>
              <p className="mt-2 text-3xl font-black">{remainingDeck}</p>
              <p className="text-xs font-bold text-muted">cards left</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={submitAnswer} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          inputMode="decimal"
          className="min-w-0 flex-1 rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent-2"
          placeholder="Probability percent"
        />
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Submit
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg bg-accent-2 px-4 py-2 font-black text-white">
          New draw
        </button>
      </form>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
