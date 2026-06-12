import { useEffect, useMemo, useState } from "react";
import { formatNumber, randomChoice, randomInt, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Action = "call-package-rich" | "put-package-rich" | "no-trade";

type Round = {
  stock: number;
  strike: number;
  rate: number;
  call: number;
  put: number;
  fee: number;
};

const defaultRound: Round = {
  stock: 100,
  strike: 100,
  rate: 0.05,
  call: 9.2,
  put: 5.1,
  fee: 0.5,
};

function presentValueStrike(round: Round) {
  return round.strike / (1 + round.rate);
}

function parityResidual(round: Round) {
  return round.call - round.put - (round.stock - presentValueStrike(round));
}

function bestAction(round: Round): Action {
  const residual = parityResidual(round);

  if (residual > round.fee) return "call-package-rich";
  if (residual < -round.fee) return "put-package-rich";
  return "no-trade";
}

function actionLabel(action: Action) {
  if (action === "call-package-rich") return "Call side rich";
  if (action === "put-package-rich") return "Put side rich";
  return "No trade";
}

function generateRound(): Round {
  const stock = randomInt(80, 125);
  const strike = stock + randomChoice([-15, -10, -5, 0, 5, 10, 15]);
  const rate = randomChoice([0, 0.02, 0.04, 0.06]);
  const pvStrike = strike / (1 + rate);
  const fairPut = Math.max(strike - stock, 0) * 0.45 + randomInt(4, 12);
  const fairCall = fairPut + stock - pvStrike;
  const violation = randomChoice([-3, -2, -1, 0, 1, 2, 3]);

  return {
    stock,
    strike,
    rate,
    call: Math.max(0.5, fairCall + violation),
    put: fairPut,
    fee: randomChoice([0.4, 0.6, 0.8, 1]),
  };
}

export default function PutCallParityArbitrage() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Check whether C - P equals S - PV(K) after fees.");

  useEffect(() => {
    setBest(readStoredNumber("put-call-parity-arb-best"));
  }, []);

  const residual = useMemo(() => parityResidual(round), [round]);
  const answer = useMemo(() => bestAction(round), [round]);

  function choose(action: Action) {
    const correct = action === answer;
    const nextScore = score + (correct ? 1 : 0);

    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("put-call-parity-arb-best", nextScore);
    }

    setFeedback(
      correct
        ? `Correct. Residual is ${formatNumber(residual)} against a ${formatNumber(round.fee)} fee.`
        : `Best action: ${actionLabel(answer)}. C - P - (S - PV(K)) = ${formatNumber(residual)}.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(generateRound());
    setFeedback("Check whether C - P equals S - PV(K) after fees.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Put-Call Parity Arbitrage</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Fee {formatNumber(round.fee)}</span>
        </div>
      </div>

      <div className="my-5 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-warn/30 bg-warn/10 p-5">
          <p className="text-sm font-black uppercase text-warn">Same strike, same expiry</p>
          <p className="mt-2 text-2xl font-black">C + PV(K) should match P + S.</p>
          <p className="mt-3 text-sm font-bold text-muted">
            Strike {formatNumber(round.strike)}, rate {(round.rate * 100).toFixed(0)}%, PV(K) {formatNumber(presentValueStrike(round))}.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["Stock", round.stock],
            ["Call", round.call],
            ["Put", round.put],
            ["PV(K)", presentValueStrike(round)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-line bg-panel p-4 text-center">
              <p className="text-xs font-black uppercase text-muted">{label}</p>
              <p className="mt-2 text-4xl font-black">{formatNumber(Number(value))}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => choose("call-package-rich")} className="rounded-lg bg-warn px-4 py-2 font-black text-white">
          Call side rich
        </button>
        <button type="button" onClick={() => choose("put-package-rich")} className="rounded-lg bg-accent px-4 py-2 font-black text-white">
          Put side rich
        </button>
        <button type="button" onClick={() => choose("no-trade")} className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          No trade
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          New parity
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
