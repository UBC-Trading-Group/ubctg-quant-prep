import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  averageCardValue,
  buildDeck,
  cardLabel,
  dealFromDeck,
  removeCards,
  sumCards,
  type PlayingCard,
} from "./cardDiceHiddenUtils";
import { formatNumber, randomInt, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Round = {
  hand: PlayingCard[];
  revealCount: number;
};

const sampleHand: PlayingCard[] = [
  { rank: "7", suit: "H", value: 7, color: "red" },
  { rank: "Q", suit: "S", value: 10, color: "black" },
  { rank: "3", suit: "D", value: 3, color: "red" },
  { rank: "A", suit: "C", value: 1, color: "black" },
];

const defaultRound: Round = {
  hand: sampleHand,
  revealCount: 2,
};

function generateRound(): Round {
  const handSize = randomInt(3, 5);
  const { drawn } = dealFromDeck(handSize);

  return {
    hand: drawn,
    revealCount: randomInt(1, handSize - 1),
  };
}

function fairTotal(round: Round) {
  const revealed = round.hand.slice(0, round.revealCount);
  const remainingCount = round.hand.length - revealed.length;
  const unseenDeck = removeCards(buildDeck(), revealed);

  return sumCards(revealed) + remainingCount * averageCardValue(unseenDeck);
}

export default function CardRevealGame() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Quote the fair value of the full hand after the reveal.");

  useEffect(() => {
    setRound(generateRound());
    setBest(readStoredNumber("card-reveal-best"));
  }, []);

  const revealed = round.hand.slice(0, round.revealCount);
  const hiddenCount = Math.max(0, round.hand.length - round.revealCount);
  const fairValue = useMemo(() => fairTotal(round), [round]);
  const actualTotal = sumCards(round.hand);

  function submitGuess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const guessValue = Number(guess);
    if (!Number.isFinite(guessValue)) {
      setFeedback("Enter a numeric fair value.");
      return;
    }

    const correct = Math.abs(guessValue - fairValue) <= 1;
    const nextScore = score + (correct ? 1 : 0);

    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("card-reveal-best", nextScore);
    }
    setFeedback(
      correct
        ? `Correct. Fair value is ${formatNumber(fairValue)}; actual hand total is ${actualTotal}.`
        : `Fair value is ${formatNumber(fairValue)}. Actual hand total is ${actualTotal}.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function revealAnother() {
    setRound((current) => ({
      ...current,
      revealCount: Math.min(current.hand.length, current.revealCount + 1),
    }));
    setGuess("");
    setFeedback("Quote the updated fair value after the new reveal.");
  }

  function nextRound() {
    setRound(generateRound());
    setGuess("");
    setFeedback("Quote the fair value of the full hand after the reveal.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Card Reveal Game</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-accent-2/25 bg-accent-2/10 p-5">
        <p className="text-sm font-black uppercase text-accent-2">Current reveal</p>
        <p className="mt-2 text-2xl font-black">
          {revealed.length} card{revealed.length === 1 ? "" : "s"} revealed, {hiddenCount} still hidden.
        </p>
        <p className="mt-3 text-sm font-bold text-muted">Quote the expected total of the whole hand.</p>
      </div>

      <div className="rounded-lg border border-line bg-panel p-4">
        <p className="text-xs font-black uppercase text-muted">Hand state</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {round.hand.map((card, index) => {
            const revealedCard = index < round.revealCount;
            return (
              <span
                key={`${cardLabel(card)}-${index}`}
                className={`grid h-16 w-12 place-items-center rounded-md border text-sm font-black ${
                  revealedCard
                    ? card.color === "red"
                      ? "border-warn/30 bg-white text-warn"
                      : "border-line bg-white text-ink"
                    : "border-ink bg-ink text-white"
                }`}
              >
                {revealedCard ? cardLabel(card) : "?"}
              </span>
            );
          })}
        </div>
      </div>

      <form onSubmit={submitGuess} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <input
          value={guess}
          onChange={(event) => setGuess(event.target.value)}
          inputMode="decimal"
          className="min-w-0 rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent-2"
          placeholder="Fair value"
        />
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Submit
        </button>
        <button
          type="button"
          onClick={revealAnother}
          disabled={hiddenCount === 0}
          className="rounded-lg bg-accent-2 px-4 py-2 font-black text-white disabled:opacity-50"
        >
          Reveal
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          New hand
        </button>
      </form>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
