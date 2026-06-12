import { useEffect, useMemo, useState } from "react";
import { formatNumber, randomChoice, randomInt, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type PayoffPoint = {
  label: string;
  payoff: number;
};

type Scenario = {
  title: string;
  prompt: string;
  answer: number;
  maxPrice: number;
  points: PayoffPoint[];
};

const defaultScenario: Scenario = {
  title: "One fair d6",
  prompt: "Contract pays $3 per pip on the roll.",
  answer: 10.5,
  maxPrice: 25,
  points: [1, 2, 3, 4, 5, 6].map((face) => ({ label: String(face), payoff: face * 3 })),
};

function money(value: number) {
  return `$${formatNumber(value)}`;
}

function generateScenario(): Scenario {
  const kind = randomChoice(["pip", "threshold", "coins", "max", "card"] as const);

  if (kind === "pip") {
    const multiplier = randomInt(2, 7);
    return {
      title: "One fair d6",
      prompt: `Contract pays ${money(multiplier)} per pip on the roll.`,
      answer: 3.5 * multiplier,
      maxPrice: multiplier * 7,
      points: [1, 2, 3, 4, 5, 6].map((face) => ({ label: String(face), payoff: face * multiplier })),
    };
  }

  if (kind === "threshold") {
    const threshold = randomInt(3, 6);
    const payout = randomChoice([20, 30, 45, 60, 75, 90]);
    const wins = 7 - threshold;
    return {
      title: "One fair d6",
      prompt: `Contract pays ${money(payout)} if the roll is at least ${threshold}.`,
      answer: (wins / 6) * payout,
      maxPrice: payout,
      points: [1, 2, 3, 4, 5, 6].map((face) => ({ label: String(face), payoff: face >= threshold ? payout : 0 })),
    };
  }

  if (kind === "coins") {
    const headsPay = randomChoice([4, 6, 8, 10, 12]);
    const bonus = randomChoice([8, 12, 16, 20]);
    return {
      title: "Two fair coins",
      prompt: `Pays ${money(headsPay)} per head plus a ${money(bonus)} bonus for HH.`,
      answer: headsPay + bonus / 4,
      maxPrice: headsPay * 2 + bonus,
      points: [
        { label: "TT", payoff: 0 },
        { label: "TH", payoff: headsPay },
        { label: "HT", payoff: headsPay },
        { label: "HH", payoff: headsPay * 2 + bonus },
      ],
    };
  }

  if (kind === "max") {
    const sides = randomChoice([4, 6, 8]);
    const multiplier = randomChoice([2, 3, 4, 5]);
    const points = Array.from({ length: sides }, (_, index) => {
      const face = index + 1;
      const probabilityCount = face * face - (face - 1) * (face - 1);
      return { label: `max ${face}`, payoff: face * multiplier, probabilityCount };
    });
    const answer = points.reduce((sum, point) => sum + (point.probabilityCount / (sides * sides)) * point.payoff, 0);
    return {
      title: `Max of two fair d${sides}`,
      prompt: `Contract pays ${money(multiplier)} times the maximum roll.`,
      answer,
      maxPrice: sides * multiplier,
      points: points.map(({ label, payoff }) => ({ label, payoff })),
    };
  }

  const redPay = randomChoice([10, 15, 20, 25]);
  const aceBonus = randomChoice([20, 30, 40, 50]);
  return {
    title: "One card from a standard deck",
    prompt: `Pays ${money(redPay)} if red plus ${money(aceBonus)} if ace.`,
    answer: redPay / 2 + (4 / 52) * aceBonus,
    maxPrice: redPay + aceBonus,
    points: [
      { label: "black non-ace", payoff: 0 },
      { label: "red non-ace", payoff: redPay },
      { label: "black ace", payoff: aceBonus },
      { label: "red ace", payoff: redPay + aceBonus },
    ],
  };
}

export default function FairPriceSlider() {
  const [scenario, setScenario] = useState<Scenario>(defaultScenario);
  const [guess, setGuess] = useState(12);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Move the slider to the fair value.");

  useEffect(() => {
    setBest(readStoredNumber("fair-price-best"));
  }, []);

  const maxPayoff = useMemo(() => Math.max(...scenario.points.map((point) => point.payoff), 1), [scenario]);

  function checkAnswer() {
    const tolerance = Math.max(0.75, scenario.answer * 0.08);
    const correct = Math.abs(guess - scenario.answer) <= tolerance;
    const nextScore = score + (correct ? 1 : 0);

    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("fair-price-best", nextScore);
    }
    setFeedback(
      correct
        ? `Correct. Fair value is ${money(scenario.answer)}.`
        : `Not quite. Fair value is ${money(scenario.answer)}.`
    );

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    const next = generateScenario();
    setScenario(next);
    setGuess(Math.round(next.maxPrice / 2));
    setFeedback("Move the slider to the fair value.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Fair Price Slider</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-accent-2/25 bg-accent-2/10 p-5">
        <p className="text-sm font-black uppercase text-accent-2">{scenario.title}</p>
        <p className="mt-2 text-2xl font-black">{scenario.prompt}</p>
      </div>

      <div className="rounded-lg border border-line bg-panel p-4">
        <div className="flex items-end gap-2 overflow-x-auto">
          {scenario.points.map((point) => (
            <div key={point.label} className="min-w-20 flex-1 text-center">
              <div className="flex h-28 items-end rounded-md bg-white p-2">
                <div className="w-full rounded-md bg-accent-2" style={{ height: `${Math.max(5, (point.payoff / maxPayoff) * 100)}%` }} />
              </div>
              <p className="mt-2 text-xs font-black text-muted">{point.label}</p>
              <p className="text-sm font-bold">{money(point.payoff)}</p>
            </div>
          ))}
        </div>
      </div>

      <label className="mt-5 block rounded-lg border border-line bg-white p-4">
        <span className="flex items-center justify-between gap-3 text-sm font-black">
          <span>Your price</span>
          <span className="text-2xl">{money(guess)}</span>
        </span>
        <input
          type="range"
          min="0"
          max={scenario.maxPrice}
          step="0.5"
          value={guess}
          onChange={(event) => setGuess(Number(event.target.value))}
          className="mt-4 w-full"
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={checkAnswer} className="rounded-lg bg-ink px-4 py-2 font-black text-white">
          Check price
        </button>
        <button type="button" onClick={nextRound} className="rounded-lg bg-accent-2 px-4 py-2 font-black text-white">
          New payoff
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
