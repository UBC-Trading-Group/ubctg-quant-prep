import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { randomChoice, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";
import { factorError, fermiPrompts, formatEstimate, logPosition, type FermiPrompt } from "./fermiPrompts";

const defaultPrompt = fermiPrompts[0];

export default function FermiMarketMaking() {
  const [prompt, setPrompt] = useState<FermiPrompt>(defaultPrompt);
  const [maxWidthFactor, setMaxWidthFactor] = useState(4);
  const [bid, setBid] = useState("");
  const [ask, setAsk] = useState("");
  const [lastMarket, setLastMarket] = useState<{ bid: number; ask: number } | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Quote a Fermi market that contains the benchmark.");

  useEffect(() => {
    setBest(readStoredNumber("fermi-market-best"));
  }, []);

  const chart = useMemo(() => {
    if (!lastMarket) return null;
    const min = Math.min(lastMarket.bid, prompt.answer, prompt.crowdLow) / 2;
    const max = Math.max(lastMarket.ask, prompt.answer, prompt.crowdHigh) * 2;
    return {
      bid: logPosition(lastMarket.bid, min, max),
      ask: logPosition(lastMarket.ask, min, max),
      answer: logPosition(prompt.answer, min, max),
      crowd: logPosition(prompt.crowdMedian, min, max),
    };
  }, [lastMarket, prompt]);

  function submitMarket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const bidValue = Number(bid);
    const askValue = Number(ask);
    if (!Number.isFinite(bidValue) || !Number.isFinite(askValue) || bidValue <= 0 || askValue <= bidValue) {
      setFeedback("Enter positive bid and ask values with ask above bid.");
      return;
    }

    const contains = bidValue <= prompt.answer && prompt.answer <= askValue;
    const widthFactor = factorError(askValue, bidValue);
    const correct = contains && widthFactor <= maxWidthFactor;
    const nextScore = score + (correct ? 1 : 0);

    setLastMarket({ bid: bidValue, ask: askValue });
    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("fermi-market-best", nextScore);
    }
    setFeedback(
      correct
        ? `Good quote. Benchmark: ${formatEstimate(prompt.answer)} ${prompt.unit}; width ${widthFactor.toFixed(1)}x.`
        : `Benchmark: ${formatEstimate(prompt.answer)} ${prompt.unit}. Keep it inside a ${maxWidthFactor.toFixed(1)}x width.`
    );

    scheduleAutoAdvance(nextPrompt);
  }

  function nextPrompt() {
    setPrompt(randomChoice(fermiPrompts));
    setMaxWidthFactor(randomChoice([2.5, 3, 4, 5]));
    setBid("");
    setAsk("");
    setLastMarket(null);
    setFeedback("Quote a Fermi market that contains the benchmark.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Make Me a Market: Fermi Edition</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Max width {maxWidthFactor.toFixed(1)}x</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-accent/25 bg-accent/10 p-5">
        <p className="text-sm font-black uppercase text-accent">{prompt.category}</p>
        <p className="mt-2 text-2xl font-black">{prompt.prompt}</p>
        <p className="mt-3 text-sm font-bold text-muted">{prompt.assumption}</p>
      </div>

      <form onSubmit={submitMarket} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
        <input
          value={bid}
          onChange={(event) => setBid(event.target.value)}
          inputMode="decimal"
          className="min-w-0 rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent"
          placeholder={`Bid in ${prompt.unit}`}
        />
        <input
          value={ask}
          onChange={(event) => setAsk(event.target.value)}
          inputMode="decimal"
          className="min-w-0 rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent"
          placeholder={`Ask in ${prompt.unit}`}
        />
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Quote
        </button>
        <button type="button" onClick={nextPrompt} className="rounded-lg bg-accent px-4 py-2 font-black text-white">
          New Fermi
        </button>
      </form>

      <div className="mt-5 rounded-lg border border-line bg-panel p-4">
        <p className="text-xs font-black uppercase text-muted">Market check</p>
        {chart ? (
          <div className="relative mt-5 h-16 rounded-lg bg-white">
            <div
              className="absolute top-6 h-4 rounded-full bg-accent/25"
              style={{ left: `${chart.bid}%`, width: `${Math.max(2, chart.ask - chart.bid)}%` }}
            />
            <div className="absolute top-3 h-10 w-1 rounded-full bg-ink" style={{ left: `${chart.answer}%` }} />
            <div className="absolute top-5 h-6 w-1 rounded-full bg-warn" style={{ left: `${chart.crowd}%` }} />
          </div>
        ) : (
          <p className="mt-3 text-sm font-bold text-muted">Your market, crowd median, and benchmark appear after quoting.</p>
        )}
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
