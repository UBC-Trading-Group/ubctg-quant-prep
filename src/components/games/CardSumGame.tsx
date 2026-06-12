import { useEffect, useMemo, useState } from "react";
import { averageCardValue, cardLabel, dealFromDeck, sumCards, type PlayingCard } from "./cardDiceHiddenUtils";
import { formatNumber, randomChoice, randomInt, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Action = "buy" | "sell" | "pass";

type Round = {
  visibleCards: PlayingCard[];
  hiddenCards: PlayingCard[];
  fairValue: number;
  bid: number;
  ask: number;
};

const sampleCards: Record<string, PlayingCard> = {
  KH: { rank: "K", suit: "H", value: 10, color: "red" },
  "4C": { rank: "4", suit: "C", value: 4, color: "black" },
  "9S": { rank: "9", suit: "S", value: 9, color: "black" },
  "6D": { rank: "6", suit: "D", value: 6, color: "red" },
  AC: { rank: "A", suit: "C", value: 1, color: "black" },
  QD: { rank: "Q", suit: "D", value: 10, color: "red" },
};

const defaultRound: Round = {
  visibleCards: [sampleCards.KH, sampleCards["4C"], sampleCards["9S"]],
  hiddenCards: [sampleCards["6D"], sampleCards.AC, sampleCards.QD],
  fairValue: 21,
  bid: 18,
  ask: 22,
};

function actionLabel(action: Action) {
  if (action === "buy") return "Buy";
  if (action === "sell") return "Sell";
  return "Pass";
}

function bestAction(round: Round): Action {
  if (round.fairValue > round.ask + 0.75) return "buy";
  if (round.fairValue < round.bid - 0.75) return "sell";
  return "pass";
}

function generateRound(): Round {
  const visibleCount = randomInt(2, 6);
  const hiddenCount = randomInt(2, 4);
  const { drawn, remaining } = dealFromDeck(visibleCount + hiddenCount);
  const visibleCards = drawn.slice(0, visibleCount);
  const hiddenCards = drawn.slice(visibleCount);
  const publicDeck = [...hiddenCards, ...remaining];
  const fairValue = hiddenCount * averageCardValue(publicDeck);
  const width = randomChoice([3, 4, 5, 6]);
  const midpoint = fairValue + randomChoice([-5, -3, -1, 0, 1, 3, 5]);

  return {
    visibleCards,
    hiddenCards,
    fairValue,
    bid: Math.max(0, Math.round(midpoint - width / 2)),
    ask: Math.round(midpoint + width / 2),
  };
}

export default function CardSumGame() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Trade the hidden-card sum against the shown market.");

  useEffect(() => {
    const nextRound = generateRound();
    setRound(nextRound);
    setBest(readStoredNumber("card-sum-best"));
  }, []);

  const answer = useMemo(() => bestAction(round), [round]);
  const hiddenTotal = sumCards(round.hiddenCards);

  function choose(action: Action) {
    const correct = action === answer;
    const nextScore = score + (correct ? 1 : 0);

    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("card-sum-best", nextScore);
    }
    setFeedback(
      correct
        ? `Correct: ${actionLabel(answer)}. Fair value is ${formatNumber(round.fairValue)}; hidden cards totaled ${hiddenTotal}.`
        : `Best action was ${actionLabel(answer)}. Fair value is ${formatNumber(round.fairValue)}; hidden cards totaled ${hiddenTotal}.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(generateRound());
    setFeedback("Trade the hidden-card sum against the shown market.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Card Sum Game</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-accent-2/25 bg-accent-2/10 p-5">
          <p className="text-sm font-black uppercase text-accent-2">Hidden sum market</p>
          <p className="mt-2 text-5xl font-black">
            {round.bid} / {round.ask}
          </p>
          <p className="mt-3 text-sm font-bold text-muted">
            Contract settles to the sum of {round.hiddenCards.length} hidden cards.
          </p>
        </div>

        <div className="rounded-lg border border-line bg-panel p-4">
          <p className="text-xs font-black uppercase text-muted">Visible blockers</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {round.visibleCards.map((card) => (
              <span
                key={cardLabel(card)}
                className={`grid h-14 w-11 place-items-center rounded-md border bg-white text-sm font-black ${
                  card.color === "red" ? "border-warn/30 text-warn" : "border-line text-ink"
                }`}
              >
                {cardLabel(card)}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted">Face cards count as 10 and aces count as 1.</p>
        </div>
      </div>

      <div className="rounded-lg border border-line bg-white p-3">
        <p className="text-xs font-black uppercase text-muted">Hidden cards</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {round.hiddenCards.map((card, index) => (
            <span key={`${cardLabel(card)}-${index}`} className="grid h-14 w-11 place-items-center rounded-md bg-ink text-sm font-black text-white">
              ?
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => choose("buy")} className="rounded-lg bg-accent px-4 py-2 font-black text-white">
          Buy
        </button>
        <button type="button" onClick={() => choose("sell")} className="rounded-lg bg-warn px-4 py-2 font-black text-white">
          Sell
        </button>
        <button type="button" onClick={() => choose("pass")} className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Pass
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          New market
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
