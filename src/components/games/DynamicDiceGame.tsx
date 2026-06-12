import { useEffect, useMemo, useState } from "react";
import { formatNumber, randomChoice, randomInt, readStoredNumber, scheduleAutoAdvance, writeStoredNumber } from "./gameUtils";

type Config = {
  sides: number;
  totalRerolls: number;
  penalty: number;
  multiplier: number;
  bonusThreshold: number;
  bonus: number;
};

const defaultConfig: Config = {
  sides: 6,
  totalRerolls: 2,
  penalty: 1,
  multiplier: 2,
  bonusThreshold: 6,
  bonus: 5,
};

function facePayoff(face: number, config: Config) {
  return face * config.multiplier + (face >= config.bonusThreshold ? config.bonus : 0);
}

function optimalAfterRoll(face: number, rerollsLeft: number, config: Config): number {
  const keep = facePayoff(face, config);
  if (rerollsLeft <= 0) return keep;
  const rollAgain =
    -config.penalty +
    Array.from({ length: config.sides }, (_, index) => optimalAfterRoll(index + 1, rerollsLeft - 1, config)).reduce(
      (sum, value) => sum + value,
      0
    ) /
      config.sides;
  return Math.max(keep, rollAgain);
}

function continueEv(rerollsLeft: number, config: Config) {
  if (rerollsLeft <= 0) return Number.NEGATIVE_INFINITY;
  return (
    -config.penalty +
    Array.from({ length: config.sides }, (_, index) => optimalAfterRoll(index + 1, rerollsLeft - 1, config)).reduce(
      (sum, value) => sum + value,
      0
    ) /
      config.sides
  );
}

function generateConfig(): Config {
  const sides = randomChoice([6, 8, 10]);
  return {
    sides,
    totalRerolls: randomInt(1, 3),
    penalty: randomChoice([0, 1, 2, 3]),
    multiplier: randomChoice([1, 2, 3]),
    bonusThreshold: randomInt(Math.max(3, sides - 2), sides),
    bonus: randomChoice([0, 5, 8, 10, 15]),
  };
}

export default function DynamicDiceGame() {
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [current, setCurrent] = useState(4);
  const [rerollsLeft, setRerollsLeft] = useState(defaultConfig.totalRerolls);
  const [path, setPath] = useState([4]);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Choose the optimal stop or continue decision.");

  useEffect(() => {
    setBest(readStoredNumber("dynamic-dice-best"));
  }, []);

  const keepValue = facePayoff(current, config);
  const rollValue = continueEv(rerollsLeft, config);
  const shouldStop = keepValue >= rollValue;
  const threshold = useMemo(() => {
    const face = Array.from({ length: config.sides }, (_, index) => index + 1).find(
      (candidate) => facePayoff(candidate, config) >= rollValue
    );
    return face ?? config.sides + 1;
  }, [config, rollValue]);

  function scoreDecision(correct: boolean) {
    const nextScore = score + (correct ? 1 : 0);
    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("dynamic-dice-best", nextScore);
    }
  }

  function chooseStop() {
    if (done) return;
    const correct = shouldStop;
    scoreDecision(correct);
    setDone(true);
    setFeedback(
      correct
        ? `Correct stop. You lock ${formatNumber(keepValue)}.`
        : `Stopping leaves value. Roll EV was ${formatNumber(rollValue)} vs keep ${formatNumber(keepValue)}.`
    );
    scheduleAutoAdvance(newGame);
  }

  function chooseContinue() {
    if (done || rerollsLeft <= 0) return;
    const correct = !shouldStop;
    const nextRoll = randomInt(1, config.sides);
    scoreDecision(correct);
    setCurrent(nextRoll);
    setRerollsLeft((value) => value - 1);
    setPath((items) => [...items, nextRoll]);
    setFeedback(
      correct
        ? `Correct continue. New roll is ${nextRoll}.`
        : `Reroll was not optimal: keep ${formatNumber(keepValue)} vs roll EV ${formatNumber(rollValue)}. New roll is ${nextRoll}.`
    );
  }

  function newGame() {
    const next = generateConfig();
    const firstRoll = randomInt(1, next.sides);
    setConfig(next);
    setCurrent(firstRoll);
    setRerollsLeft(next.totalRerolls);
    setPath([firstRoll]);
    setDone(false);
    setFeedback("Choose the optimal stop or continue decision.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Dynamic Dice Game</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-accent-2/25 bg-accent-2/10 p-5 text-center">
          <p className="text-sm font-black uppercase text-accent-2">Current roll</p>
          <p className="mt-2 text-7xl font-black">{current}</p>
          <p className="mt-3 text-sm font-bold text-muted">{rerollsLeft} reroll{rerollsLeft === 1 ? "" : "s"} left</p>
        </div>
        <div className="rounded-lg border border-line bg-panel p-4">
          <p className="text-sm font-black uppercase text-muted">Payoff rule</p>
          <p className="mt-2 text-lg font-black">
            Payoff = {config.multiplier}x roll{config.bonus > 0 ? ` + ${config.bonus} bonus for ${config.bonusThreshold}+` : ""}. Reroll cost {formatNumber(config.penalty)}.
          </p>
          <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${config.sides}, minmax(0, 1fr))` }}>
            {Array.from({ length: config.sides }, (_, index) => index + 1).map((face) => (
              <span
                key={face}
                className={`grid aspect-square place-items-center rounded-md border text-sm font-black ${
                  face >= threshold ? "border-accent-2 bg-accent-2 text-white" : "border-line bg-white text-muted"
                }`}
              >
                {face}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-line bg-white p-3">
        <p className="text-xs font-black uppercase text-muted">Roll path</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {path.map((roll, index) => (
            <span key={`${roll}-${index}`} className="grid size-10 place-items-center rounded-md bg-panel font-black">
              {roll}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={chooseStop} disabled={done} className="rounded-lg bg-accent px-4 py-2 font-black text-white disabled:opacity-50">
          Stop
        </button>
        <button
          type="button"
          onClick={chooseContinue}
          disabled={done || rerollsLeft <= 0}
          className="rounded-lg bg-ink px-4 py-2 font-black text-white disabled:opacity-50"
        >
          Continue
        </button>
        <button type="button" onClick={newGame} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          New game
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
