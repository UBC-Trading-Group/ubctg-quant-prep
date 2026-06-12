import { useEffect, useMemo, useState } from "react";
import { formatNumber, randomChoice, randomInt, readStoredNumber, shuffle, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Action = "buy" | "sell" | "pass";

type FruitComponent = {
  name: string;
  price: number;
  weight: number;
};

type Round = {
  components: FruitComponent[];
  bid: number;
  ask: number;
  fee: number;
};

const defaultRound: Round = {
  components: [
    { name: "Apple", price: 4, weight: 3 },
    { name: "Pear", price: 7, weight: 2 },
  ],
  bid: 24,
  ask: 28,
  fee: 1,
};

function basketValue(round: Round) {
  return round.components.reduce((sum, component) => sum + component.price * component.weight, 0);
}

function bestAction(round: Round): Action {
  const fairValue = basketValue(round);
  const buyEdge = fairValue - round.ask - round.fee;
  const sellEdge = round.bid - fairValue - round.fee;

  if (buyEdge > 0) return "buy";
  if (sellEdge > 0) return "sell";
  return "pass";
}

function actionLabel(action: Action) {
  if (action === "buy") return "Buy basket";
  if (action === "sell") return "Sell basket";
  return "Pass";
}

function generateRound(): Round {
  const names = shuffle(["Apple", "Pear", "Orange", "Mango", "Plum", "Berry"]).slice(0, randomInt(2, 4));
  const components = names.map((name) => ({
    name,
    price: randomInt(2, 14),
    weight: randomInt(1, 5),
  }));
  const fairValue = components.reduce((sum, component) => sum + component.price * component.weight, 0);
  const width = randomChoice([2, 3, 4, 5, 6]);
  const midpoint = fairValue + randomChoice([-8, -5, -3, -1, 0, 1, 3, 5, 8]);

  return {
    components,
    bid: Math.max(0, Math.round(midpoint - width / 2)),
    ask: Math.max(1, Math.round(midpoint + width / 2)),
    fee: randomChoice([0, 1, 2, 3]),
  };
}

export default function FruitMarket() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Compute the basket value and trade only if edge clears the fee.");

  useEffect(() => {
    setBest(readStoredNumber("fruit-market-best"));
  }, []);

  const fairValue = useMemo(() => basketValue(round), [round]);
  const answer = useMemo(() => bestAction(round), [round]);
  const maxContribution = Math.max(...round.components.map((component) => component.price * component.weight), 1);

  function choose(action: Action) {
    const correct = action === answer;
    const nextScore = score + (correct ? 1 : 0);

    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("fruit-market-best", nextScore);
    }

    setFeedback(
      correct
        ? `Correct. Basket value is ${formatNumber(fairValue)} and the best action is ${actionLabel(answer)}.`
        : `Basket value is ${formatNumber(fairValue)}. Best action: ${actionLabel(answer)} after ${formatNumber(round.fee)} fee.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(generateRound());
    setFeedback("Compute the basket value and trade only if edge clears the fee.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Fruit Market</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Fee {formatNumber(round.fee)}</span>
        </div>
      </div>

      <div className="my-5 grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border border-accent/25 bg-accent/10 p-5">
          <p className="text-sm font-black uppercase text-accent">Basket market</p>
          <p className="mt-2 text-5xl font-black">
            {round.bid} / {round.ask}
          </p>
          <p className="mt-3 text-sm font-bold text-muted">
            Basket = {round.components.map((component) => `${component.weight} ${component.name}`).join(" + ")}.
          </p>
        </div>

        <div className="rounded-lg border border-line bg-panel p-4">
          <p className="text-xs font-black uppercase text-muted">Component prices</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {round.components.map((component) => (
              <div key={component.name} className="rounded-lg border border-line bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black">{component.name}</p>
                  <p className="text-sm font-bold text-muted">{component.weight}x</p>
                </div>
                <p className="mt-2 text-3xl font-black">{component.price}</p>
                <div className="mt-3 h-2 rounded-full bg-panel">
                  <div
                    className="h-2 rounded-full bg-accent"
                    style={{ width: `${Math.max(8, (component.price * component.weight / maxContribution) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => choose("buy")} className="rounded-lg bg-accent px-4 py-2 font-black text-white">
          Buy basket
        </button>
        <button type="button" onClick={() => choose("sell")} className="rounded-lg bg-warn px-4 py-2 font-black text-white">
          Sell basket
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
