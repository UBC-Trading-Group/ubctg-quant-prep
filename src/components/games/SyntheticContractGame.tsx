import { useEffect, useMemo, useState } from "react";
import { formatNumber, randomChoice, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Choice = {
  label: string;
  payoffs: number[];
};

type Round = {
  title: string;
  prompt: string;
  states: number[];
  target: number[];
  choices: Choice[];
  answerIndex: number;
};

function callPayoff(strike: number, states: number[]) {
  return states.map((spot) => Math.max(spot - strike, 0));
}

function putPayoff(strike: number, states: number[]) {
  return states.map((spot) => Math.max(strike - spot, 0));
}

function addPayoffs(...payoffs: number[][]) {
  return payoffs[0].map((_, index) => payoffs.reduce((sum, payoff) => sum + payoff[index], 0));
}

function subtractPayoffs(left: number[], right: number[]) {
  return left.map((value, index) => value - right[index]);
}

function generateRound(): Round {
  const kind = randomChoice(["bull-call", "bear-put", "straddle"]);
  const lowStrike = randomChoice([70, 80, 90, 100]);
  const highStrike = lowStrike + randomChoice([10, 20, 30]);
  const states = [lowStrike - 20, lowStrike, (lowStrike + highStrike) / 2, highStrike, highStrike + 20];

  if (kind === "bear-put") {
    const target = subtractPayoffs(putPayoff(highStrike, states), putPayoff(lowStrike, states));
    return {
      title: "Bear put spread",
      prompt: `Replicate a payoff that is capped at ${highStrike - lowStrike} when the asset falls below ${lowStrike}.`,
      states,
      target,
      choices: [
        { label: `Long put ${highStrike}, short put ${lowStrike}`, payoffs: target },
        { label: `Long put ${lowStrike}, short put ${highStrike}`, payoffs: target.map((value) => -value) },
        { label: `Long call ${lowStrike}, short call ${highStrike}`, payoffs: subtractPayoffs(callPayoff(lowStrike, states), callPayoff(highStrike, states)) },
      ],
      answerIndex: 0,
    };
  }

  if (kind === "straddle") {
    const strike = lowStrike;
    const target = addPayoffs(callPayoff(strike, states), putPayoff(strike, states));
    return {
      title: "Straddle",
      prompt: `Replicate a payoff that profits from a large move away from ${strike}.`,
      states,
      target,
      choices: [
        { label: `Long call ${strike}, long put ${strike}`, payoffs: target },
        { label: `Long call ${strike}, short put ${strike}`, payoffs: subtractPayoffs(callPayoff(strike, states), putPayoff(strike, states)) },
        { label: `Short call ${strike}, short put ${strike}`, payoffs: target.map((value) => -value) },
      ],
      answerIndex: 0,
    };
  }

  const target = subtractPayoffs(callPayoff(lowStrike, states), callPayoff(highStrike, states));
  return {
    title: "Capped call",
    prompt: `Replicate a call payoff capped once the asset reaches ${highStrike}.`,
    states,
    target,
    choices: [
      { label: `Long call ${lowStrike}, short call ${highStrike}`, payoffs: target },
      { label: `Long call ${highStrike}, short call ${lowStrike}`, payoffs: target.map((value) => -value) },
      { label: `Long call ${lowStrike}`, payoffs: callPayoff(lowStrike, states) },
    ],
    answerIndex: 0,
  };
}

export default function SyntheticContractGame() {
  const [round, setRound] = useState<Round>(generateRound);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Choose the portfolio that exactly replicates the target payoff.");

  useEffect(() => {
    setBest(readStoredNumber("synthetic-contract-best"));
  }, []);

  const maxPayoff = useMemo(() => Math.max(...round.target.map((value) => Math.abs(value)), 1), [round]);

  function choose(index: number) {
    const correct = index === round.answerIndex;
    const nextScore = score + (correct ? 1 : 0);

    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("synthetic-contract-best", nextScore);
    }

    setFeedback(
      correct
        ? `Correct. ${round.choices[round.answerIndex].label} matches every state.`
        : `Not quite. Correct replication: ${round.choices[round.answerIndex].label}.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(generateRound());
    setFeedback("Choose the portfolio that exactly replicates the target payoff.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Synthetic Contract Game</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-accent-2/25 bg-accent-2/10 p-5">
        <p className="text-sm font-black uppercase text-accent-2">{round.title}</p>
        <p className="mt-2 text-2xl font-black">{round.prompt}</p>
      </div>

      <div className="rounded-lg border border-line bg-panel p-4">
        <p className="text-xs font-black uppercase text-muted">Target payoff by final spot</p>
        <div className="mt-3 flex items-end gap-2 overflow-x-auto">
          {round.states.map((state, index) => (
            <div key={state} className="min-w-16 flex-1 text-center">
              <div className="flex h-24 items-end rounded-md bg-white p-2">
                <div
                  className="w-full rounded-md bg-accent-2"
                  style={{ height: `${Math.max(5, Math.abs(round.target[index]) / maxPayoff * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-black text-muted">S={formatNumber(state)}</p>
              <p className="text-xs font-bold">{formatNumber(round.target[index])}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {round.choices.map((choice, index) => (
          <button
            key={choice.label}
            type="button"
            onClick={() => choose(index)}
            className="rounded-lg border border-line bg-white px-4 py-3 text-left font-black transition hover:border-accent-2"
          >
            {choice.label}
          </button>
        ))}
      </div>

      <button type="button" onClick={nextRound} className="mt-4 rounded-lg border border-line bg-panel px-4 py-2 font-black">
        New payoff
      </button>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
