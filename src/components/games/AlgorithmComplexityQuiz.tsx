import { useEffect, useState } from "react";
import { randomChoice, readStoredNumber, writeStoredNumber, scheduleAutoAdvance } from "./gameUtils";

type Option = {
  label: string;
  complexity: string;
  explanation: string;
};

type Round = {
  prompt: string;
  constraint: string;
  options: Option[];
  answerIndex: number;
};

const rounds: Round[] = [
  {
    prompt: "Find one missing integer from the range 1..n in an unsorted array of length n - 1.",
    constraint: "Use O(n) time and O(1) extra space.",
    options: [
      { label: "Sum or xor scan", complexity: "O(n) time, O(1) space", explanation: "A single scan with sum or xor meets both constraints." },
      { label: "Sort then scan", complexity: "O(n log n) time, O(1) space", explanation: "Sorting violates the requested linear time bound." },
      { label: "Hash all values", complexity: "O(n) time, O(n) space", explanation: "Hashing violates the O(1) extra-space constraint." },
    ],
    answerIndex: 0,
  },
  {
    prompt: "Detect whether a stream has seen any duplicate so far.",
    constraint: "Values are arbitrary strings; optimize expected lookup time.",
    options: [
      { label: "Hash set", complexity: "Expected O(1) per item", explanation: "A hash set is the standard expected O(1) membership structure." },
      { label: "Sorted vector insert", complexity: "O(n) per item", explanation: "Binary search is O(log n), but insertion shifts O(n) elements." },
      { label: "Nested scan", complexity: "O(n) per item", explanation: "Scanning all prior values is too slow for a stream." },
    ],
    answerIndex: 0,
  },
  {
    prompt: "Maintain the median of a growing sequence of prices.",
    constraint: "Support each insertion faster than sorting the full history.",
    options: [
      { label: "Two heaps", complexity: "O(log n) insert, O(1) median", explanation: "A max heap below and min heap above maintain the median efficiently." },
      { label: "Resort on every insert", complexity: "O(n log n) per insert", explanation: "Resorting each time repeats too much work." },
      { label: "Keep only the average", complexity: "O(1) insert", explanation: "The average does not determine the median." },
    ],
    answerIndex: 0,
  },
  {
    prompt: "Return the k largest elements from a very large array where k is small.",
    constraint: "Avoid sorting the whole array.",
    options: [
      { label: "Min heap of size k", complexity: "O(n log k) time", explanation: "The heap stores only the current top k candidates." },
      { label: "Full sort", complexity: "O(n log n) time", explanation: "Full sorting does extra work when k is small." },
      { label: "Nested comparisons", complexity: "O(nk) time", explanation: "This can be fine for tiny k, but the heap is the scalable choice." },
    ],
    answerIndex: 0,
  },
  {
    prompt: "Find the first index where a sorted array is at least a target price.",
    constraint: "Use the ordering of the array.",
    options: [
      { label: "Binary search lower_bound", complexity: "O(log n) time", explanation: "lower_bound finds the first not-less-than target in logarithmic time." },
      { label: "Linear scan", complexity: "O(n) time", explanation: "A scan ignores the sorted structure." },
      { label: "Hash map lookup", complexity: "O(1) exact lookup", explanation: "Exact hash lookup does not find the first greater-or-equal index." },
    ],
    answerIndex: 0,
  },
];

export default function AlgorithmComplexityQuiz() {
  const [round, setRound] = useState<Round>(rounds[0]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Choose the algorithm that best matches the constraints.");

  useEffect(() => {
    setRound(randomChoice(rounds));
    setBest(readStoredNumber("algorithm-complexity-best"));
  }, []);

  function choose(index: number) {
    const correct = index === round.answerIndex;
    const nextScore = score + (correct ? 1 : 0);

    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      writeStoredNumber("algorithm-complexity-best", nextScore);
    }
    setFeedback(correct ? `Correct. ${round.options[index].explanation}` : `Best choice: ${round.options[round.answerIndex].label}. ${round.options[round.answerIndex].explanation}`);

    scheduleAutoAdvance(nextRound);
  }

  function nextRound() {
    setRound(randomChoice(rounds));
    setFeedback("Choose the algorithm that best matches the constraints.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Algorithm Complexity Quiz</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Score {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
        </div>
      </div>

      <div className="my-5 rounded-lg border border-accent/25 bg-accent/10 p-5">
        <p className="text-sm font-black uppercase text-accent">Prompt</p>
        <p className="mt-2 text-2xl font-black">{round.prompt}</p>
        <p className="mt-3 text-sm font-bold text-muted">{round.constraint}</p>
      </div>

      <div className="grid gap-3">
        {round.options.map((option, index) => (
          <button
            key={option.label}
            type="button"
            onClick={() => choose(index)}
            className="rounded-lg border border-line bg-white p-4 text-left transition hover:border-accent"
          >
            <span className="block font-black">{option.label}</span>
            <span className="mt-1 block text-sm font-bold text-muted">{option.complexity}</span>
          </button>
        ))}
      </div>

      <button type="button" onClick={nextRound} className="mt-4 rounded-lg border border-line bg-panel px-4 py-2 font-black">
        New prompt
      </button>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
