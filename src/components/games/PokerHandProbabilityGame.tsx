import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { combination, formatPercent, randomChoice, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Round = {
  title: string;
  prompt: string;
  outs: number;
  unseenCards: number;
  cardsToCome: number;
  heroCards: string[];
  boardCards: string[];
};

const templates: Round[] = [
  {
    title: "Flush draw after flop",
    prompt: "You have four hearts after the flop. What is the chance you make a flush by the river?",
    outs: 9,
    unseenCards: 47,
    cardsToCome: 2,
    heroCards: ["AH", "7H"],
    boardCards: ["2H", "KH", "9C"],
  },
  {
    title: "Flush draw on turn",
    prompt: "You have four spades on the turn. What is the chance the river completes the flush?",
    outs: 9,
    unseenCards: 46,
    cardsToCome: 1,
    heroCards: ["QS", "8S"],
    boardCards: ["2S", "KS", "9C", "4D"],
  },
  {
    title: "Open-ended straight draw",
    prompt: "Eight cards complete your straight after the flop. What is the chance you hit by the river?",
    outs: 8,
    unseenCards: 47,
    cardsToCome: 2,
    heroCards: ["8C", "9D"],
    boardCards: ["6S", "7H", "KC"],
  },
  {
    title: "Gutshot straight draw",
    prompt: "Four cards complete your inside straight after the flop. What is the chance you hit by the river?",
    outs: 4,
    unseenCards: 47,
    cardsToCome: 2,
    heroCards: ["8C", "10D"],
    boardCards: ["6S", "7H", "KC"],
  },
  {
    title: "Two overcards",
    prompt: "Six cards pair one of your two overcards after the flop. What is the chance you pair by the river?",
    outs: 6,
    unseenCards: 47,
    cardsToCome: 2,
    heroCards: ["AC", "KD"],
    boardCards: ["2S", "7H", "9C"],
  },
  {
    title: "Combo draw",
    prompt: "You count 15 clean outs after the flop. What is the chance you hit at least one by the river?",
    outs: 15,
    unseenCards: 47,
    cardsToCome: 2,
    heroCards: ["QH", "JH"],
    boardCards: ["10H", "9H", "2C"],
  },
];

function probability(round: Round) {
  return 1 - combination(round.unseenCards - round.outs, round.cardsToCome) / combination(round.unseenCards, round.cardsToCome);
}

export default function PokerHandProbabilityGame() {
  const [round, setRound] = useState<Round>(templates[0]);
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Enter the probability as a percent.");

  useEffect(() => {
    setRound(randomChoice(templates));
    setBest(readStoredNumber("poker-hand-probability-best"));
  }, []);

  const answer = useMemo(() => probability(round), [round]);

  function submitGuess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const guessValue = Number(guess) / 100;
    if (!Number.isFinite(guessValue)) {
      setFeedback("Enter a percent, for example 35.2.");
      return;
    }

    const correct = Math.abs(guessValue - answer) <= 0.015;
    const nextScore = score + (correct ? 1 : 0);

    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("poker-hand-probability-best", nextScore);
    }
    setFeedback(
      correct
        ? `Correct. ${round.outs} outs over ${round.cardsToCome} card${round.cardsToCome === 1 ? "" : "s"} to come is ${formatPercent(answer, 1)}.`
        : `Answer: ${formatPercent(answer, 1)}. Use 1 - C(${round.unseenCards - round.outs}, ${round.cardsToCome}) / C(${round.unseenCards}, ${round.cardsToCome}).`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(randomChoice(templates));
    setGuess("");
    setFeedback("Enter the probability as a percent.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Poker-Hand Probability Game</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-warn/30 bg-warn/10 p-5">
        <p className="text-sm font-black uppercase text-warn">{round.title}</p>
        <p className="mt-2 text-2xl font-black">{round.prompt}</p>
        <p className="mt-3 text-sm font-bold text-muted">
          {round.outs} outs, {round.unseenCards} unseen cards, {round.cardsToCome} card{round.cardsToCome === 1 ? "" : "s"} to come.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-line bg-panel p-4">
          <p className="text-xs font-black uppercase text-muted">Your hand</p>
          <div className="mt-3 flex gap-2">
            {round.heroCards.map((card) => (
              <span key={card} className="grid h-16 w-12 place-items-center rounded-md border border-line bg-white text-sm font-black">
                {card}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-line bg-panel p-4">
          <p className="text-xs font-black uppercase text-muted">Board</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {round.boardCards.map((card) => (
              <span key={card} className="grid h-16 w-12 place-items-center rounded-md border border-line bg-white text-sm font-black">
                {card}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-line bg-white p-3">
        <p className="text-xs font-black uppercase text-muted">Clean outs</p>
        <div className="mt-2 grid gap-2" style={{ gridTemplateColumns: "repeat(15, minmax(0, 1fr))" }}>
          {Array.from({ length: 15 }, (_, index) => (
            <span
              key={index}
              className={`h-3 rounded-full ${index < round.outs ? "bg-accent" : "bg-panel"}`}
              aria-label={index < round.outs ? "out" : "non-out"}
            />
          ))}
        </div>
      </div>

      <form onSubmit={submitGuess} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <input
          value={guess}
          onChange={(event) => setGuess(event.target.value)}
          inputMode="decimal"
          className="min-w-0 rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent-2"
          placeholder="Probability percent"
        />
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Submit
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          New hand
        </button>
      </form>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
