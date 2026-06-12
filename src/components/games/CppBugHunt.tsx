import { useEffect, useState } from "react";
import { randomChoice, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Choice = {
  label: string;
  explanation: string;
};

type Round = {
  title: string;
  snippet: string;
  choices: Choice[];
  answerIndex: number;
};

const rounds: Round[] = [
  {
    title: "Polymorphic payoff",
    snippet: `struct Payoff {
  virtual double value(double spot) const = 0;
};

struct CallPayoff : Payoff {
  double strike;
  double value(double spot) const override {
    return std::max(spot - strike, 0.0);
  }
};

Payoff* payoff = new CallPayoff{100.0};
delete payoff;`,
    choices: [
      { label: "Missing virtual destructor", explanation: "Deleting through a base pointer without a virtual destructor is undefined behavior." },
      { label: "value should not be const", explanation: "The const method is fine because payoff evaluation should not mutate state." },
      { label: "std::max cannot compare doubles", explanation: "std::max works with doubles when both arguments have the same type." },
    ],
    answerIndex: 0,
  },
  {
    title: "Monte Carlo average",
    snippet: `double price(const std::vector<double>& payoffs) {
  int sum = 0;
  for (double payoff : payoffs) {
    sum += payoff;
  }
  return sum / payoffs.size();
}`,
    choices: [
      { label: "Integer accumulation loses precision", explanation: "The sum should be double; int truncates every payoff." },
      { label: "Range-for copies too much memory", explanation: "Copying a double is harmless here." },
      { label: "payoffs.size() must be cast to int", explanation: "Casting size down would make the precision issue worse." },
    ],
    answerIndex: 0,
  },
  {
    title: "Stored reference",
    snippet: `class Pricer {
 public:
  explicit Pricer(const std::vector<double>& path) : path_(path) {}

  double last() const {
    return path_.back();
  }

 private:
  const std::vector<double>& path_;
};

Pricer makePricer() {
  std::vector<double> path{100.0, 101.0};
  return Pricer(path);
}`,
    choices: [
      { label: "Dangling reference", explanation: "The pricer stores a reference to a local vector that dies when makePricer returns." },
      { label: "back() is O(n)", explanation: "std::vector::back is constant time." },
      { label: "Constructor should not be explicit", explanation: "explicit is reasonable for a single-argument constructor." },
    ],
    answerIndex: 0,
  },
  {
    title: "Base method dispatch",
    snippet: `struct Instrument {
  double price() const { return 0.0; }
};

struct Option : Instrument {
  double price() const { return 5.25; }
};

double mark(const Instrument& instrument) {
  return instrument.price();
}`,
    choices: [
      { label: "price is not virtual", explanation: "Calling through Instrument& dispatches to Instrument::price unless the method is virtual." },
      { label: "mark should take by value", explanation: "Taking by value would slice derived objects and make the issue worse." },
      { label: "price cannot be const", explanation: "A const price method is appropriate for read-only valuation." },
    ],
    answerIndex: 0,
  },
];

export default function CppBugHunt() {
  const [round, setRound] = useState<Round>(rounds[0]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Identify the bug in the quant-dev snippet.");

  useEffect(() => {
    setRound(randomChoice(rounds));
    setBest(readStoredNumber("cpp-bug-hunt-best"));
  }, []);

  function choose(index: number) {
    const correct = index === round.answerIndex;
    const nextScore = score + (correct ? 1 : 0);

    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("cpp-bug-hunt-best", nextScore);
    }
    setFeedback(correct ? `Correct. ${round.choices[index].explanation}` : `Not quite. ${round.choices[round.answerIndex].explanation}`);

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(randomChoice(rounds));
    setFeedback("Identify the bug in the quant-dev snippet.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">C++ Bug Hunt</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-warn/30 bg-warn/10 p-5">
        <p className="text-sm font-black uppercase text-warn">Bug category</p>
        <p className="mt-2 text-2xl font-black">{round.title}</p>
      </div>

      <pre className="overflow-x-auto rounded-lg border border-line bg-ink p-4 text-sm leading-6 text-white">
        <code>{round.snippet}</code>
      </pre>

      <div className="mt-4 grid gap-3">
        {round.choices.map((choice, index) => (
          <button
            key={choice.label}
            type="button"
            onClick={() => choose(index)}
            className="rounded-lg border border-line bg-white px-4 py-3 text-left font-black transition hover:border-warn"
          >
            {choice.label}
          </button>
        ))}
      </div>

      <button type="button" onClick={nextRound} className="mt-4 rounded-lg border border-line bg-panel px-4 py-2 font-black">
        New snippet
      </button>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
