import { useEffect, useMemo, useState } from "react";
import { formatNumber, randomChoice, randomInt, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Action = "buy" | "sell" | "pass";

type Round = {
  leader: string;
  follower: string;
  leaderMove: number;
  beta: number;
  followerPrice: number;
  cost: number;
  duration: number;
  botPressure: number;
};

const defaultRound: Round = {
  leader: "FastTech",
  follower: "SlowCloud",
  leaderMove: 4,
  beta: 0.7,
  followerPrice: 50,
  cost: 0.8,
  duration: 5,
  botPressure: 0.35,
};

function fairFollower(round: Round) {
  return round.followerPrice + round.leaderMove * round.beta;
}

function bestAction(round: Round): Action {
  const edge = fairFollower(round) - round.followerPrice;
  const hurdle = round.cost + round.botPressure;

  if (edge > hurdle) return "buy";
  if (-edge > hurdle) return "sell";
  return "pass";
}

function actionLabel(action: Action) {
  if (action === "buy") return "Buy follower";
  if (action === "sell") return "Sell follower";
  return "Pass";
}

function generateRound(): Round {
  const names = randomChoice([
    ["FastTech", "SlowCloud"],
    ["LeadOil", "LagGas"],
    ["IndexFuture", "CashBasket"],
    ["ADR", "LocalShare"],
    ["MegaRetail", "Supplier"],
  ]);

  return {
    leader: names[0],
    follower: names[1],
    leaderMove: randomChoice([-6, -4, -2.5, -1, 1, 2.5, 4, 6]),
    beta: randomChoice([0.4, 0.55, 0.7, 0.85, 1]),
    followerPrice: randomInt(35, 95),
    cost: randomChoice([0.3, 0.5, 0.8, 1]),
    duration: randomInt(3, 7),
    botPressure: randomChoice([0.2, 0.4, 0.6, 0.8]),
  };
}

export default function LatencyRaceLite() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [timeLeft, setTimeLeft] = useState(defaultRound.duration);
  const [active, setActive] = useState(true);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Act before the opportunity disappears.");

  useEffect(() => {
    setBest(readStoredNumber("latency-race-lite-best"));
  }, []);

  useEffect(() => {
    if (!active) return undefined;

    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 0) return 0;
        const next = Math.max(0, current - 0.1);
        if (next === 0) {
          setActive(false);
          setFeedback("Opportunity expired. Loading a new race.");
          scheduleAutoAdvance(nextRound);
        }
        return next;
      });
    }, 100);

    return () => window.clearInterval(timer);
  }, [active]);

  const fairValue = useMemo(() => fairFollower(round), [round]);
  const answer = useMemo(() => bestAction(round), [round]);
  const progress = Math.max(0, Math.min(100, (timeLeft / round.duration) * 100));

  function choose(action: Action) {
    if (!active) {
      setFeedback("That race already expired.");
      return;
    }

    const correct = action === answer;
    const speedBonus = Math.ceil(timeLeft);
    const nextScore = score + (correct ? 1 + speedBonus : 0);

    setActive(false);
    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("latency-race-lite-best", nextScore);
    }

    setFeedback(
      correct
        ? `Correct with ${formatNumber(timeLeft, 1)}s left. Fair follower ${formatNumber(fairValue)} vs current ${formatNumber(round.followerPrice)}.`
        : `Best action: ${actionLabel(answer)}. Fair follower ${formatNumber(fairValue)}, current ${formatNumber(round.followerPrice)}.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    const next = generateRound();
    setRound(next);
    setTimeLeft(next.duration);
    setActive(true);
    setFeedback("Act before the opportunity disappears.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Latency Race Lite</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">{formatNumber(timeLeft, 1)}s</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-warn/30 bg-warn/10 p-5">
        <p className="text-sm font-black uppercase text-warn">Lead-lag opportunity</p>
        <p className="mt-2 text-2xl font-black">
          {round.leader} moved {round.leaderMove > 0 ? "+" : ""}
          {formatNumber(round.leaderMove)}. {round.follower} has not updated.
        </p>
        <p className="mt-3 text-sm font-bold text-muted">
          Beta {formatNumber(round.beta)}, cost {formatNumber(round.cost)}, bot pressure {formatNumber(round.botPressure)}.
        </p>
        <div className="mt-4 h-3 rounded-full bg-white">
          <div className="h-3 rounded-full bg-warn transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-line bg-panel p-4 text-center">
          <p className="text-xs font-black uppercase text-muted">{round.leader}</p>
          <p className="mt-2 text-4xl font-black">{round.leaderMove > 0 ? "+" : ""}{formatNumber(round.leaderMove)}</p>
        </div>
        <div className="rounded-lg border border-line bg-panel p-4 text-center">
          <p className="text-xs font-black uppercase text-muted">{round.follower}</p>
          <p className="mt-2 text-4xl font-black">{formatNumber(round.followerPrice)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => choose("buy")} disabled={!active} className="rounded-lg bg-accent px-4 py-2 font-black text-white disabled:opacity-50">
          Buy
        </button>
        <button type="button" onClick={() => choose("sell")} disabled={!active} className="rounded-lg bg-warn px-4 py-2 font-black text-white disabled:opacity-50">
          Sell
        </button>
        <button type="button" onClick={() => choose("pass")} disabled={!active} className="rounded-lg bg-ink px-4 py-2 font-black text-white disabled:opacity-50">
          Pass
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          New race
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
