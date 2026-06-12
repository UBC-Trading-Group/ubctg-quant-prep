import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";
import { generateContractRound, money, scoreMarket, type ContractRound } from "./marketMakingUtils";

const defaultRound: ContractRound = {
  title: "d20 threshold contract",
  prompt: "Pays $50 if a d20 roll is 15 or higher.",
  fairValue: 15,
  maxSpread: 5,
  outcomes: Array.from({ length: 20 }, (_, index) => {
    const face = index + 1;
    return { label: String(face), payoff: face >= 15 ? 50 : 0, weight: 1 };
  }),
};

export default function MakeMeAMarket() {
  const [round, setRound] = useState<ContractRound>(defaultRound);
  const [bid, setBid] = useState("");
  const [ask, setAsk] = useState("");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Quote a bid and ask around fair value.");

  useEffect(() => {
    setRound(generateContractRound());
    setScore(readStoredNumber("market-score"));
    setBest(readStoredNumber("market-contract-best"));
  }, []);

  const maxPayoff = useMemo(() => Math.max(...round.outcomes.map((outcome) => outcome.payoff), 1), [round]);

  function submitMarket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const bidValue = Number(bid);
    const askValue = Number(ask);
    const result = scoreMarket({ bid: bidValue, ask: askValue, fairValue: round.fairValue, maxSpread: round.maxSpread });

    if (!result.valid) {
      setFeedback("Bid and ask must be numeric.");
      return;
    }

    const nextScore = score + (result.correct ? 1 : 0);

    setScore(nextScore);
    writeStoredNumber("market-score", nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("market-contract-best", nextScore);
    }
    setFeedback(
      result.correct
        ? `Good market. Fair value is ${money(round.fairValue)}.`
        : `Fair value is ${money(round.fairValue)}. Keep fair inside a spread of ${round.maxSpread} or less.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(generateContractRound());
    setBid("");
    setAsk("");
    setFeedback("Quote a bid and ask around fair value.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Make Me a Market: Contract Edition</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Max spread {round.maxSpread}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-warn/30 bg-warn/10 p-5">
        <p className="text-sm font-black uppercase text-warn">{round.title}</p>
        <p className="mt-2 text-2xl font-black">{round.prompt}</p>
      </div>

      <div className="rounded-lg border border-line bg-panel p-4">
        <p className="text-xs font-black uppercase text-muted">Payoff map</p>
        <div className="mt-3 flex items-end gap-2 overflow-x-auto">
          {round.outcomes.map((outcome) => (
            <div key={outcome.label} className="min-w-16 flex-1 text-center">
              <div className="flex h-24 items-end rounded-md bg-white p-2">
                <div className="w-full rounded-md bg-warn" style={{ height: `${Math.max(5, (outcome.payoff / maxPayoff) * 100)}%` }} />
              </div>
              <p className="mt-2 text-xs font-black text-muted">{outcome.label}</p>
              <p className="text-xs font-bold">{money(outcome.payoff, 0)}</p>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={submitMarket} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
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
        <button
          type="button"
          onClick={nextRound}
          className="rounded-lg border border-line bg-panel px-4 py-2 font-black"
        >
          New round
        </button>
      </form>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
