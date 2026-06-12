import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { formatNumber, randomChoice, randomInt, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type TraderType = "uninformed" | "mixed" | "strong";
type TradeEvent = "buys ask" | "sells bid" | "no trade";
type Action = "raise" | "lower" | "widen" | "hold";

type Round = {
  fairValue: number;
  trueValue: number;
  traderType: TraderType;
  signalStrength: number;
  quoteHint: string;
};

const defaultRound: Round = {
  fairValue: 50,
  trueValue: 43,
  traderType: "strong",
  signalStrength: 0.85,
  quoteHint: "A strong trader sees a private signal before trading.",
};

function generateRound(): Round {
  const fairValue = randomInt(30, 80);
  const signalStrength = randomChoice([0.25, 0.45, 0.65, 0.85]);
  const traderType = signalStrength >= 0.75 ? "strong" : signalStrength >= 0.45 ? "mixed" : "uninformed";
  const trueValue = fairValue + randomChoice([-1, 1]) * randomInt(3, 16);
  return {
    fairValue,
    trueValue,
    traderType,
    signalStrength,
    quoteHint:
      traderType === "strong"
        ? "A strong trader sees a private signal before trading."
        : traderType === "mixed"
          ? "This trader has partial information and some noise."
          : "This trader mostly trades for liquidity.",
  };
}

function observeTrade(round: Round, bid: number, ask: number): TradeEvent {
  if (round.traderType === "strong" || round.traderType === "mixed") {
    if (round.trueValue > ask) return "buys ask";
    if (round.trueValue < bid) return "sells bid";
  }
  if (round.traderType === "uninformed") return randomChoice(["buys ask", "sells bid", "no trade"] as const);
  return "no trade";
}

function bestAction(event: TradeEvent, traderType: TraderType): Action {
  if (event === "buys ask") return traderType === "strong" ? "raise" : "widen";
  if (event === "sells bid") return traderType === "strong" ? "lower" : "widen";
  return "hold";
}

export default function AdverseSelectionSimulator() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [bid, setBid] = useState("");
  const [ask, setAsk] = useState("");
  const [event, setEvent] = useState<TradeEvent | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Quote a market, observe the trade, then update your belief.");

  useEffect(() => {
    setBest(readStoredNumber("adverse-selection-best"));
  }, []);

  function submitMarket(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const bidValue = Number(bid);
    const askValue = Number(ask);
    if (!Number.isFinite(bidValue) || !Number.isFinite(askValue) || bidValue >= askValue) {
      setFeedback("Enter a valid bid below ask.");
      return;
    }

    const trade = observeTrade(round, bidValue, askValue);
    setEvent(trade);
    setFeedback(
      trade === "no trade"
        ? "No trade. Decide whether that is information or just no interest."
        : `The ${round.traderType} trader ${trade}. What should you do now?`
    );
  }

  function choose(action: Action) {
    if (!event) {
      setFeedback("Quote first so you can observe the trade.");
      return;
    }

    const correctAction = bestAction(event, round.traderType);
    const correct = action === correctAction;
    const nextScore = score + (correct ? 1 : 0);
    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("adverse-selection-best", nextScore);
    }
    setFeedback(
      correct
        ? `Correct. True value was ${formatNumber(round.trueValue)} vs your prior ${formatNumber(round.fairValue)}.`
        : `Best action: ${correctAction}. True value was ${formatNumber(round.trueValue)} vs prior ${formatNumber(round.fairValue)}.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(generateRound());
    setBid("");
    setAsk("");
    setEvent(null);
    setFeedback("Quote a market, observe the trade, then update your belief.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Adverse Selection Simulator</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 grid gap-4 md:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-accent/25 bg-accent/10 p-5">
          <p className="text-sm font-black uppercase text-accent">Prior model</p>
          <p className="mt-2 text-2xl font-black">Your fair value is {formatNumber(round.fairValue)}.</p>
          <p className="mt-3 text-sm font-bold text-muted">{round.quoteHint}</p>
        </div>
        <div className="rounded-lg border border-line bg-panel p-5">
          <p className="text-sm font-black uppercase text-muted">Observed flow</p>
          <p className="mt-2 text-3xl font-black">{event ?? "No quote yet"}</p>
          <div className="mt-4 h-3 rounded-full bg-white">
            <div className="h-3 rounded-full bg-warn" style={{ width: `${round.signalStrength * 100}%` }} />
          </div>
          <p className="mt-2 text-xs font-bold text-muted">Signal strength</p>
        </div>
      </div>

      <form onSubmit={submitMarket} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input
          value={bid}
          onChange={(inputEvent) => setBid(inputEvent.target.value)}
          inputMode="decimal"
          className="min-w-0 rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent"
          placeholder="Bid"
        />
        <input
          value={ask}
          onChange={(inputEvent) => setAsk(inputEvent.target.value)}
          inputMode="decimal"
          className="min-w-0 rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent"
          placeholder="Ask"
        />
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Quote
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => choose("raise")} className="rounded-lg bg-accent px-4 py-2 font-black text-white">
          Raise fair
        </button>
        <button type="button" onClick={() => choose("lower")} className="rounded-lg bg-warn px-4 py-2 font-black text-white">
          Lower fair
        </button>
        <button type="button" onClick={() => choose("widen")} className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Widen
        </button>
        <button type="button" onClick={() => choose("hold")} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          Hold
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          New flow
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
