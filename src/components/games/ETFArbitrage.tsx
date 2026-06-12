import { useEffect, useMemo, useState } from "react";
import { formatNumber, randomChoice, randomInt, readStoredNumber, shuffle, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Action = "buy-etf" | "sell-etf" | "pass";

type Component = {
  ticker: string;
  shares: number;
  price: number;
};

type Round = {
  components: Component[];
  etfPrice: number;
  transactionCost: number;
  latencyRisk: number;
};

const defaultRound: Round = {
  components: [
    { ticker: "AAA", shares: 1, price: 42 },
    { ticker: "BBB", shares: 2, price: 18 },
    { ticker: "CCC", shares: 1, price: 21 },
  ],
  etfPrice: 101,
  transactionCost: 0.6,
  latencyRisk: 0.4,
};

function nav(round: Round) {
  return round.components.reduce((sum, component) => sum + component.shares * component.price, 0);
}

function hurdle(round: Round) {
  return round.transactionCost + round.latencyRisk;
}

function bestAction(round: Round): Action {
  const basket = nav(round);
  const edge = basket - round.etfPrice;
  const neededEdge = hurdle(round);

  if (edge > neededEdge) return "buy-etf";
  if (-edge > neededEdge) return "sell-etf";
  return "pass";
}

function actionLabel(action: Action) {
  if (action === "buy-etf") return "Buy ETF, sell basket";
  if (action === "sell-etf") return "Sell ETF, buy basket";
  return "Pass";
}

function generateRound(): Round {
  const tickers = shuffle(["AAA", "BBB", "CCC", "DDD", "EEE", "FFF"]).slice(0, randomInt(3, 5));
  const components = tickers.map((ticker) => ({
    ticker,
    shares: randomChoice([0.5, 1, 1.5, 2]),
    price: randomInt(12, 65),
  }));
  const basket = components.reduce((sum, component) => sum + component.shares * component.price, 0);
  const etfPrice = basket + randomChoice([-4, -2.5, -1, -0.25, 0.25, 1, 2.5, 4]);

  return {
    components,
    etfPrice,
    transactionCost: randomChoice([0.25, 0.5, 0.75, 1, 1.25]),
    latencyRisk: randomChoice([0.2, 0.4, 0.6, 0.8, 1]),
  };
}

export default function ETFArbitrage() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Compare ETF price to basket NAV after costs.");

  useEffect(() => {
    setBest(readStoredNumber("etf-arbitrage-best"));
  }, []);

  const basket = useMemo(() => nav(round), [round]);
  const answer = useMemo(() => bestAction(round), [round]);
  const maxValue = Math.max(...round.components.map((component) => component.shares * component.price), 1);

  function choose(action: Action) {
    const correct = action === answer;
    const nextScore = score + (correct ? 1 : 0);

    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("etf-arbitrage-best", nextScore);
    }

    setFeedback(
      correct
        ? `Correct. NAV ${formatNumber(basket)} vs ETF ${formatNumber(round.etfPrice)} clears a ${formatNumber(hurdle(round))} hurdle.`
        : `Best action: ${actionLabel(answer)}. NAV ${formatNumber(basket)}, ETF ${formatNumber(round.etfPrice)}, hurdle ${formatNumber(hurdle(round))}.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(generateRound());
    setFeedback("Compare ETF price to basket NAV after costs.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">ETF Arbitrage</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Hurdle {formatNumber(hurdle(round))}</span>
        </div>
      </div>

      <div className="my-5 grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-lg border border-warn/30 bg-warn/10 p-5">
          <p className="text-sm font-black uppercase text-warn">ETF price</p>
          <p className="mt-2 text-6xl font-black">{formatNumber(round.etfPrice)}</p>
          <p className="mt-3 text-sm font-bold text-muted">
            Transaction cost {formatNumber(round.transactionCost)} plus latency risk {formatNumber(round.latencyRisk)}.
          </p>
        </div>

        <div className="rounded-lg border border-line bg-panel p-4">
          <p className="text-xs font-black uppercase text-muted">Basket components</p>
          <div className="mt-3 grid gap-2">
            {round.components.map((component) => (
              <div key={component.ticker} className="rounded-md border border-line bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black">{component.ticker}</p>
                  <p className="text-sm font-bold text-muted">
                    {formatNumber(component.shares)} x {formatNumber(component.price)}
                  </p>
                </div>
                <div className="mt-2 h-2 rounded-full bg-panel">
                  <div
                    className="h-2 rounded-full bg-warn"
                    style={{ width: `${Math.max(8, (component.shares * component.price / maxValue) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => choose("buy-etf")} className="rounded-lg bg-accent px-4 py-2 font-black text-white">
          Buy ETF
        </button>
        <button type="button" onClick={() => choose("sell-etf")} className="rounded-lg bg-warn px-4 py-2 font-black text-white">
          Sell ETF
        </button>
        <button type="button" onClick={() => choose("pass")} className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Pass
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          New ETF
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
