import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { formatPercent, randomChoice, randomInt, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Observation = "H" | "T";

type Round = {
  priorBiased: number;
  biasedHeadProbability: number;
  observations: Observation[];
};

const defaultRound: Round = {
  priorBiased: 0.35,
  biasedHeadProbability: 0.7,
  observations: ["H", "H", "T"],
};

function likelihood(observations: Observation[], headProbability: number) {
  return observations.reduce(
    (probability, observation) => probability * (observation === "H" ? headProbability : 1 - headProbability),
    1
  );
}

function posteriorBiased(round: Round) {
  const biasedLikelihood = likelihood(round.observations, round.biasedHeadProbability);
  const fairLikelihood = likelihood(round.observations, 0.5);
  const numerator = round.priorBiased * biasedLikelihood;
  const denominator = numerator + (1 - round.priorBiased) * fairLikelihood;

  return denominator === 0 ? 0 : numerator / denominator;
}

function generateRound(): Round {
  const priorBiased = randomChoice([0.15, 0.2, 0.3, 0.4, 0.5]);
  const biasedHeadProbability = randomChoice([0.65, 0.7, 0.75, 0.8, 0.85]);
  const hiddenIsBiased = Math.random() < priorBiased;
  const headProbability = hiddenIsBiased ? biasedHeadProbability : 0.5;
  const observations = Array.from({ length: randomInt(3, 6) }, () => (Math.random() < headProbability ? "H" : "T") as Observation);

  return {
    priorBiased,
    biasedHeadProbability,
    observations,
  };
}

export default function HiddenSignalGame() {
  const [round, setRound] = useState<Round>(defaultRound);
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Enter the posterior probability that the hidden coin is biased.");

  useEffect(() => {
    setRound(generateRound());
    setBest(readStoredNumber("hidden-signal-best"));
  }, []);

  const answer = useMemo(() => posteriorBiased(round), [round]);
  const heads = round.observations.filter((observation) => observation === "H").length;
  const tails = round.observations.length - heads;

  function submitGuess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const guessValue = Number(guess) / 100;
    if (!Number.isFinite(guessValue)) {
      setFeedback("Enter a percent, for example 62.5.");
      return;
    }

    const correct = Math.abs(guessValue - answer) <= 0.025;
    const nextScore = score + (correct ? 1 : 0);

    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("hidden-signal-best", nextScore);
    }
    setFeedback(
      correct
        ? `Correct. Posterior P(biased | signal) is ${formatPercent(answer, 1)}.`
        : `Posterior is ${formatPercent(answer, 1)} from ${heads} H and ${tails} T observations.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(generateRound());
    setGuess("");
    setFeedback("Enter the posterior probability that the hidden coin is biased.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Hidden Signal Game</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border border-accent-2/25 bg-accent-2/10 p-5">
          <p className="text-sm font-black uppercase text-accent-2">Hidden model</p>
          <p className="mt-2 text-2xl font-black">Coin is fair or biased.</p>
          <p className="mt-3 text-sm font-bold text-muted">
            Prior biased {formatPercent(round.priorBiased, 0)}. If biased, P(H) = {formatPercent(round.biasedHeadProbability, 0)}.
          </p>
        </div>

        <div className="rounded-lg border border-line bg-panel p-4">
          <p className="text-xs font-black uppercase text-muted">Observed signal</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {round.observations.map((observation, index) => (
              <span
                key={`${observation}-${index}`}
                className={`grid size-12 place-items-center rounded-md text-sm font-black text-white ${
                  observation === "H" ? "bg-accent" : "bg-warn"
                }`}
              >
                {observation}
              </span>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={submitGuess} className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <input
          value={guess}
          onChange={(event) => setGuess(event.target.value)}
          inputMode="decimal"
          className="min-w-0 rounded-lg border border-line bg-white px-4 py-2 outline-none focus:border-accent-2"
          placeholder="Posterior percent"
        />
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Submit
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          New signal
        </button>
      </form>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
