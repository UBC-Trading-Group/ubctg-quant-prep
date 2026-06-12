import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { formatNumber, readStoredNumber, scheduleAutoAdvance, writeStoredNumber } from "./gameUtils";
import { fermiPrompts, formatEstimate, type FermiPrompt } from "./fermiPrompts";
import { money, scoreMarket, type ContractRound } from "./marketMakingUtils";

type Revision = {
  prior: number;
  width: number;
  event: string;
  direction: "raise" | "lower" | "hold";
};

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function dailyKey() {
  return new Date().toISOString().slice(0, 10);
}

function buildDailyContract(seed: number): ContractRound {
  const sides = [6, 8, 10, 20][seed % 4];
  const threshold = Math.max(2, Math.min(sides, Math.floor(sides * 0.55) + (seed % 3)));
  const payout = [30, 40, 50, 75][Math.floor(seed / 7) % 4];
  const wins = sides - threshold + 1;
  return {
    title: `Daily d${sides} contract`,
    prompt: `Pays ${money(payout, 0)} if a d${sides} roll is ${threshold} or higher.`,
    fairValue: (wins / sides) * payout,
    maxSpread: Math.max(3, Math.round(payout * 0.08)),
    outcomes: Array.from({ length: sides }, (_, index) => {
      const face = index + 1;
      return { label: String(face), payoff: face >= threshold ? payout : 0, weight: 1 };
    }),
  };
}

function buildDailyRevision(seed: number): Revision {
  const options: Revision[] = [
    { prior: 46, width: 6, event: "Two sharp traders lifted your ask.", direction: "raise" },
    { prior: 62, width: 8, event: "Repeated bid hits arrive from informed flow.", direction: "lower" },
    { prior: 55, width: 6, event: "Balanced two-way flow at quoted size.", direction: "hold" },
    { prior: 38, width: 5, event: "A new public signal increases fair value.", direction: "raise" },
    { prior: 71, width: 9, event: "A new public signal decreases fair value.", direction: "lower" },
  ];
  return options[seed % options.length];
}

export default function DailyMarketMakingChallenge() {
  const [key, setKey] = useState("daily");
  const [stage, setStage] = useState(0);
  const [contract, setContract] = useState(() => buildDailyContract(1));
  const [fermi, setFermi] = useState<FermiPrompt>(fermiPrompts[0]);
  const [revision, setRevision] = useState<Revision>(() => buildDailyRevision(1));
  const [bid, setBid] = useState("");
  const [ask, setAsk] = useState("");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Complete the three-part daily market-making set.");

  useEffect(() => {
    const nextKey = dailyKey();
    const seed = hashString(nextKey);
    setKey(nextKey);
    setContract(buildDailyContract(seed));
    setFermi(fermiPrompts[seed % fermiPrompts.length]);
    setRevision(buildDailyRevision(seed));
    setBest(readStoredNumber("daily-mm-best"));
  }, []);

  const stageTitle = ["Contract market", "Fermi market", "Quote revision"][stage] ?? "Complete";
  const oldRevisionMarket = useMemo(
    () => `${formatNumber(revision.prior - revision.width / 2)} / ${formatNumber(revision.prior + revision.width / 2)}`,
    [revision]
  );

  function clearInputs() {
    setBid("");
    setAsk("");
  }

  function submitMarket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const bidValue = Number(bid);
    const askValue = Number(ask);
    let correct = false;
    let detail = "";

    if (stage === 0) {
      const result = scoreMarket({ bid: bidValue, ask: askValue, fairValue: contract.fairValue, maxSpread: contract.maxSpread });
      if (!result.valid) {
        setFeedback("Enter a valid bid and ask.");
        return;
      }
      correct = result.correct;
      detail = `Fair value ${money(contract.fairValue)}.`;
    } else if (stage === 1) {
      if (!Number.isFinite(bidValue) || !Number.isFinite(askValue) || bidValue <= 0 || askValue <= bidValue) {
        setFeedback("Enter a positive Fermi bid below ask.");
        return;
      }
      const widthFactor = Math.max(askValue / bidValue, 1);
      correct = bidValue <= fermi.answer && fermi.answer <= askValue && widthFactor <= 5;
      detail = `Benchmark ${formatEstimate(fermi.answer)} ${fermi.unit}.`;
    } else {
      return;
    }

    const nextScore = score + (correct ? 1 : 0);
    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("daily-mm-best", nextScore);
    }
    setFeedback(`${correct ? "Good" : "Not quite"}. ${detail}`);
    setStage((value) => Math.min(2, value + 1));
    clearInputs();
  }

  function answerRevision(direction: Revision["direction"]) {
    const correct = direction === revision.direction;
    const nextScore = score + (correct ? 1 : 0);
    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("daily-mm-best", nextScore);
    }
    setFeedback(correct ? "Good revision. Daily challenge complete." : `Best revision was ${revision.direction}. Daily challenge complete.`);
    setStage(3);
    scheduleAutoAdvance(resetDaily);
  }

  function resetDaily() {
    setStage(0);
    setScore(0);
    clearInputs();
    setFeedback("Complete the three-part daily market-making set.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Daily Market-Making Challenge</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">{key}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}/3</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-accent-2/25 bg-accent-2/10 p-5">
        <p className="text-sm font-black uppercase text-accent-2">{stageTitle}</p>
        {stage === 0 && <p className="mt-2 text-2xl font-black">{contract.prompt}</p>}
        {stage === 1 && <p className="mt-2 text-2xl font-black">{fermi.prompt}</p>}
        {stage === 2 && (
          <>
            <p className="mt-2 text-2xl font-black">{revision.event}</p>
            <p className="mt-3 text-sm font-bold text-muted">Current market {oldRevisionMarket}</p>
          </>
        )}
        {stage >= 3 && <p className="mt-2 text-2xl font-black">Daily set complete.</p>}
      </div>

      {stage < 2 && (
        <form onSubmit={submitMarket} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
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
            Submit
          </button>
        </form>
      )}

      {stage === 2 && (
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => answerRevision("raise")} className="rounded-lg bg-accent px-4 py-2 font-black text-white">
            Raise
          </button>
          <button type="button" onClick={() => answerRevision("lower")} className="rounded-lg bg-warn px-4 py-2 font-black text-white">
            Lower
          </button>
          <button type="button" onClick={() => answerRevision("hold")} className="rounded-lg bg-ink px-4 py-2 font-black text-white">
            Hold
          </button>
        </div>
      )}

      {stage >= 3 && (
        <button type="button" onClick={resetDaily} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          Replay daily set
        </button>
      )}

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
