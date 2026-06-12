import { useEffect, useMemo, useState } from "react";
import { formatPercent, randomChoice, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Label = "independent" | "dependent" | "mutually exclusive" | "overlapping" | "conditional";

type Scenario = {
  space: number[];
  title: string;
  eventA: string;
  eventB: string;
  a: (value: number) => boolean;
  b: (value: number) => boolean;
  preferred: Label;
  explanation: string;
};

const labels: Label[] = ["independent", "dependent", "mutually exclusive", "overlapping", "conditional"];

const defaultScenario: Scenario = {
  space: [1, 2, 3, 4, 5, 6],
  title: "One fair die",
  eventA: "A: roll is even",
  eventB: "B: roll is 1 or 2",
  a: (value) => value % 2 === 0,
  b: (value) => value <= 2,
  preferred: "independent",
  explanation: "P(A)=1/2, P(B)=1/3, and P(A and B)=1/6.",
};

function buildScenarios(): Scenario[] {
  const die = [1, 2, 3, 4, 5, 6];
  const cards = Array.from({ length: 52 }, (_, index) => index);
  const ints = Array.from({ length: 20 }, (_, index) => index + 1);

  return [
    defaultScenario,
    {
      space: die,
      title: "One fair die",
      eventA: "A: roll is even",
      eventB: "B: roll is prime",
      a: (value) => value % 2 === 0,
      b: (value) => [2, 3, 5].includes(value),
      preferred: "dependent",
      explanation: "The only overlap is 2, so P(A and B)=1/6 instead of P(A)P(B)=1/4.",
    },
    {
      space: die,
      title: "One fair die",
      eventA: "A: roll is 1",
      eventB: "B: roll is 6",
      a: (value) => value === 1,
      b: (value) => value === 6,
      preferred: "mutually exclusive",
      explanation: "Both cannot happen on one roll.",
    },
    {
      space: die,
      title: "One fair die",
      eventA: "A: roll is greater than 3",
      eventB: "B: roll is even",
      a: (value) => value > 3,
      b: (value) => value % 2 === 0,
      preferred: "dependent",
      explanation: "Knowing the roll is greater than 3 changes the chance it is even.",
    },
    {
      space: cards,
      title: "One card from a standard deck",
      eventA: "A: card is a heart",
      eventB: "B: card is red",
      a: (value) => value % 4 === 0,
      b: (value) => value % 4 === 0 || value % 4 === 1,
      preferred: "conditional",
      explanation: "A is contained in B, so P(B given A)=1.",
    },
    {
      space: cards,
      title: "One card from a standard deck",
      eventA: "A: card is a king",
      eventB: "B: card is a spade",
      a: (value) => Math.floor(value / 4) === 12,
      b: (value) => value % 4 === 2,
      preferred: "independent",
      explanation: "Rank and suit are independent in a standard deck.",
    },
    {
      space: ints,
      title: "Uniform integer from 1 to 20",
      eventA: "A: number is prime",
      eventB: "B: number is even",
      a: (value) => [2, 3, 5, 7, 11, 13, 17, 19].includes(value),
      b: (value) => value % 2 === 0,
      preferred: "overlapping",
      explanation: "Some values are both, but neither event contains the other.",
    },
  ];
}

function generateScenario() {
  return randomChoice(buildScenarios());
}

export default function EventRelationshipGame() {
  const [scenario, setScenario] = useState<Scenario>(defaultScenario);
  const [selected, setSelected] = useState<Label | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Classify the event relationship.");

  useEffect(() => {
    setBest(readStoredNumber("event-relation-best"));
  }, []);

  const stats = useMemo(() => {
    const a = scenario.space.filter(scenario.a).length;
    const b = scenario.space.filter(scenario.b).length;
    const both = scenario.space.filter((value) => scenario.a(value) && scenario.b(value)).length;
    const total = scenario.space.length;
    return { a, b, both, total };
  }, [scenario]);

  function checkAnswer(label: Label) {
    setSelected(label);
    const correct = label === scenario.preferred;
    const nextScore = score + (correct ? 1 : 0);

    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("event-relation-best", nextScore);
    }
    setFeedback(correct ? `Correct. ${scenario.explanation}` : `Not quite. Best label: ${scenario.preferred}. ${scenario.explanation}`);

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setScenario(generateScenario());
    setSelected(null);
    setFeedback("Classify the event relationship.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Event Relationship Game</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-warn/30 bg-warn/10 p-5">
        <p className="text-sm font-black uppercase text-warn">{scenario.title}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-line bg-white p-4">
            <p className="font-black">{scenario.eventA}</p>
            <p className="mt-2 text-sm text-muted">P(A) = {formatPercent(stats.a / stats.total)}</p>
          </div>
          <div className="rounded-lg border border-line bg-white p-4">
            <p className="font-black">{scenario.eventB}</p>
            <p className="mt-2 text-sm text-muted">P(B) = {formatPercent(stats.b / stats.total)}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm font-bold">
          <div className="rounded-lg bg-white p-3">A only: {stats.a - stats.both}</div>
          <div className="rounded-lg bg-ink p-3 text-white">Both: {stats.both}</div>
          <div className="rounded-lg bg-white p-3">B only: {stats.b - stats.both}</div>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-5">
        {labels.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => checkAnswer(label)}
            className={`rounded-lg border px-3 py-3 text-sm font-black capitalize ${
              selected === label ? "border-warn bg-warn text-white" : "border-line bg-panel text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <button type="button" onClick={nextRound} className="rounded-lg bg-warn px-4 py-2 font-black text-white">
          New events
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
