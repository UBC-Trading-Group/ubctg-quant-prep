import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { averageCardValue, cardLabel, dealFromDeck, sumCards, type PlayingCard } from "./cardDiceHiddenUtils";
import { formatNumber, randomInt, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type BotAction = "lift" | "hit" | "pass";

type Round = {
  publicCards: PlayingCard[];
  hiddenCards: PlayingCard[];
  botPeek: PlayingCard;
  publicFair: number;
  botFair: number;
  maxSpread: number;
};

const fallbackCard: PlayingCard = {
  rank: "A",
  suit: "S",
  value: 1,
  color: "black",
};

const samplePublicCards: PlayingCard[] = [
  { rank: "K", suit: "D", value: 10, color: "red" },
  { rank: "5", suit: "C", value: 5, color: "black" },
  { rank: "2", suit: "H", value: 2, color: "red" },
];

const sampleHiddenCards: PlayingCard[] = [
  { rank: "9", suit: "S", value: 9, color: "black" },
  { rank: "4", suit: "D", value: 4, color: "red" },
  fallbackCard,
];

const defaultRound: Round = {
  publicCards: samplePublicCards,
  hiddenCards: sampleHiddenCards,
  botPeek: sampleHiddenCards[0],
  publicFair: 20,
  botFair: 18,
  maxSpread: 5,
};

function generateRound(): Round {
  const publicCount = randomInt(2, 5);
  const hiddenCount = 3;
  const { drawn, remaining } = dealFromDeck(publicCount + hiddenCount);
  const publicCards = drawn.slice(0, publicCount);
  const hiddenCards = drawn.slice(publicCount);
  const publicDeck = [...hiddenCards, ...remaining];
  const botPeek = hiddenCards[randomInt(0, hiddenCards.length - 1)];
  const botRemainingDeck = publicDeck.filter((card) => cardLabel(card) !== cardLabel(botPeek));

  return {
    publicCards,
    hiddenCards,
    botPeek,
    publicFair: hiddenCount * averageCardValue(publicDeck),
    botFair: botPeek.value + (hiddenCount - 1) * averageCardValue(botRemainingDeck),
    maxSpread: randomInt(4, 6),
  };
}

function botAction(round: Round, bid: number, ask: number): BotAction {
  if (round.botFair > ask + 0.5) return "lift";
  if (round.botFair < bid - 0.5) return "hit";
  return "pass";
}

function botActionText(action: BotAction) {
  if (action === "lift") return "Bot lifts your ask";
  if (action === "hit") return "Bot hits your bid";
  return "Bot passes";
}

export default function MarketOfCardsLite() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [bid, setBid] = useState("");
  const [ask, setAsk] = useState("");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Quote a market before the bot trades on its private card.");

  useEffect(() => {
    setRound(generateRound());
    setBest(readStoredNumber("market-cards-lite-best"));
  }, []);

  const actualTotal = useMemo(() => sumCards(round.hiddenCards), [round.hiddenCards]);

  function submitMarket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const bidValue = Number(bid);
    const askValue = Number(ask);

    if (!Number.isFinite(bidValue) || !Number.isFinite(askValue) || bidValue > askValue) {
      setFeedback("Enter numeric bid and ask values with bid no greater than ask.");
      return;
    }

    const action = botAction(round, bidValue, askValue);
    const spread = askValue - bidValue;
    const expectedPnl = action === "lift" ? askValue - round.botFair : action === "hit" ? round.botFair - bidValue : 0;
    const realizedPnl = action === "lift" ? askValue - actualTotal : action === "hit" ? actualTotal - bidValue : 0;
    const publicMarketOk = bidValue <= round.publicFair && round.publicFair <= askValue && spread <= round.maxSpread;
    const correct = publicMarketOk && expectedPnl >= -0.25;
    const nextScore = score + (correct ? 1 : 0);

    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("market-cards-lite-best", nextScore);
    }
    setFeedback(
      `${botActionText(action)}. Public fair ${formatNumber(round.publicFair)}, bot fair ${formatNumber(round.botFair)}, actual total ${actualTotal}, realized P&L ${formatNumber(realizedPnl)}.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(generateRound());
    setBid("");
    setAsk("");
    setFeedback("Quote a market before the bot trades on its private card.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Market of Cards Lite</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Max spread {round.maxSpread}</span>
        </div>
      </div>

      <div className="my-5 grid gap-4 md:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-accent-2/25 bg-accent-2/10 p-5">
          <p className="text-sm font-black uppercase text-accent-2">Contract</p>
          <p className="mt-2 text-2xl font-black">Pays the sum of 3 hidden cards.</p>
          <p className="mt-3 text-sm font-bold text-muted">The bot sees one hidden card before choosing to trade.</p>
        </div>

        <div className="rounded-lg border border-line bg-panel p-4">
          <p className="text-xs font-black uppercase text-muted">Public blockers</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {round.publicCards.map((card) => (
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
        </div>
      </div>

      <div className="rounded-lg border border-line bg-white p-3">
        <p className="text-xs font-black uppercase text-muted">Hidden contract cards</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {round.hiddenCards.map((card, index) => (
            <span key={`${cardLabel(card)}-${index}`} className="grid h-14 w-11 place-items-center rounded-md bg-ink text-sm font-black text-white">
              ?
            </span>
          ))}
        </div>
      </div>

      <form onSubmit={submitMarket} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
        <input
          value={bid}
          onChange={(event) => setBid(event.target.value)}
          inputMode="decimal"
          className="min-w-0 rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent-2"
          placeholder="Bid"
        />
        <input
          value={ask}
          onChange={(event) => setAsk(event.target.value)}
          inputMode="decimal"
          className="min-w-0 rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent-2"
          placeholder="Ask"
        />
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Quote
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          New market
        </button>
      </form>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
