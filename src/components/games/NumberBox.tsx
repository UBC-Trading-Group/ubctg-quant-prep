import { useEffect, useMemo, useState } from "react";
import { clamp, formatNumber, randomChoice, randomInt, readStoredNumber, scheduleAutoAdvance, writeStoredNumber } from "./gameUtils";

type Tile = {
  id: string;
  value: number;
};

type Puzzle = {
  target: number;
  tiles: Tile[];
};

type HistoryItem = {
  tiles: Tile[];
  note: string;
};

const operations = ["+", "-", "x", "/"] as const;
type Operation = (typeof operations)[number];

const defaultPuzzle: Puzzle = {
  target: 24,
  tiles: [
    { id: "default-0", value: 3 },
    { id: "default-1", value: 4 },
    { id: "default-2", value: 7 },
    { id: "default-3", value: 10 },
  ],
};

function applyOperation(a: number, b: number, operation: Operation) {
  if (operation === "+") return a + b;
  if (operation === "-") return a - b;
  if (operation === "x") return a * b;
  if (b === 0) return null;
  return a / b;
}

function makeTile(value: number, index: number): Tile {
  return { id: `${Date.now()}-${index}-${Math.random()}`, value };
}

function generatePuzzle(): Puzzle {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const values = Array.from({ length: 4 }, () => randomInt(2, 10));
    let working = [...values];

    for (let step = 0; step < 3; step += 1) {
      const firstIndex = randomInt(0, working.length - 1);
      const [first] = working.splice(firstIndex, 1);
      const secondIndex = randomInt(0, working.length - 1);
      const [second] = working.splice(secondIndex, 1);
      const validOps: Operation[] = ["+", "-", "x"];
      if (second !== 0 && first % second === 0) validOps.push("/");
      if (first !== 0 && second % first === 0) validOps.push("/");

      const operation = randomChoice(validOps);
      let result =
        operation === "-" ? Math.abs(first - second) : applyOperation(Math.max(first, second), Math.min(first, second), operation);
      if (result === null || result <= 0 || result > 200) result = first + second;
      working.push(result);
    }

    const target = working[0];
    if (Number.isFinite(target) && target >= 10 && target <= 120) {
      return {
        target,
        tiles: values.map(makeTile),
      };
    }
  }

  return {
    target: 24,
    tiles: [3, 4, 7, 10].map(makeTile),
  };
}

export default function NumberBox() {
  const [puzzle, setPuzzle] = useState<Puzzle>(defaultPuzzle);
  const [tiles, setTiles] = useState<Tile[]>(puzzle.tiles);
  const [selected, setSelected] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [timeLeft, setTimeLeft] = useState(90);
  const [active, setActive] = useState(true);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Select two numbers, then apply an operation.");

  useEffect(() => {
    const next = generatePuzzle();
    setPuzzle(next);
    setTiles(next.tiles);
    setBest(readStoredNumber("number-box-best"));
  }, []);

  useEffect(() => {
    if (!active) return;

    const timer = window.setInterval(() => {
      setTimeLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [active]);

  useEffect(() => {
    if (!active || timeLeft > 0) return;
    setActive(false);
    setFeedback("Time. Loading a new puzzle.");
    scheduleAutoAdvance(startPuzzle);
  }, [active, timeLeft]);

  const closest = useMemo(() => {
    const distances = tiles.map((tile) => Math.abs(tile.value - puzzle.target));
    return distances.length ? Math.min(...distances) : Math.abs(puzzle.target);
  }, [puzzle.target, tiles]);

  const targetProgress = useMemo(() => {
    const scale = Math.max(Math.abs(puzzle.target), 1);
    return clamp(100 - (closest / scale) * 100, 0, 100);
  }, [closest, puzzle.target]);

  function startPuzzle() {
    const next = generatePuzzle();
    setPuzzle(next);
    setTiles(next.tiles);
    setSelected([]);
    setHistory([]);
    setTimeLeft(90);
    setActive(true);
    setFeedback("Build the target using the number box.");
  }

  function chooseTile(id: string) {
    if (!active) return;

    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length === 2) return [current[1], id];
      return [...current, id];
    });
  }

  function useOperation(operation: Operation) {
    if (!active || selected.length !== 2) return;

    const first = tiles.find((tile) => tile.id === selected[0]);
    const second = tiles.find((tile) => tile.id === selected[1]);
    if (!first || !second) return;

    const value = applyOperation(first.value, second.value, operation);
    if (value === null || !Number.isFinite(value)) {
      setFeedback("That division is not available.");
      return;
    }

    const nextTile = makeTile(Number(value.toFixed(4)), tiles.length + history.length);
    const nextTiles = [...tiles.filter((tile) => !selected.includes(tile.id)), nextTile];
    const note = `${formatNumber(first.value)} ${operation} ${formatNumber(second.value)} = ${formatNumber(nextTile.value)}`;
    const solved = Math.abs(nextTile.value - puzzle.target) < 0.001;

    setHistory([...history, { tiles, note }]);
    setTiles(nextTiles);
    setSelected([]);

    if (solved) {
      const nextScore = score + 1;
      setScore(nextScore);
      setActive(false);
      setFeedback(`Solved: ${note}.`);
      if (nextScore > best) {
        setBest(nextScore);
        writeStoredNumber("number-box-best", nextScore);
      }
      scheduleAutoAdvance(startPuzzle);
      return;
    }

    setFeedback(note);
  }

  function undo() {
    const previous = history[history.length - 1];
    if (!previous) return;

    setTiles(previous.tiles);
    setHistory(history.slice(0, -1));
    setSelected([]);
    setFeedback("Last move undone.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Target Number Box</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Solved {score}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">{timeLeft}s</span>
        </div>
      </div>

      <div className="my-5 grid gap-4 md:grid-cols-[0.7fr_1.3fr]">
        <div className="rounded-lg border border-accent/25 bg-accent/10 p-5 text-center">
          <p className="text-sm font-black uppercase text-accent">Target</p>
          <p className="mt-3 text-6xl font-black">{formatNumber(puzzle.target)}</p>
          <div className="mt-5 overflow-hidden rounded-full bg-white">
            <div className="h-3 rounded-full bg-accent" style={{ width: `${targetProgress}%` }} />
          </div>
          <p className="mt-2 text-xs font-bold text-muted">Closest distance: {formatNumber(closest, 2)}</p>
        </div>

        <div className="rounded-lg border border-line bg-panel p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {tiles.map((tile) => (
              <button
                key={tile.id}
                type="button"
                onClick={() => chooseTile(tile.id)}
                className={`min-h-20 rounded-lg border px-3 text-3xl font-black transition ${
                  selected.includes(tile.id)
                    ? "border-accent bg-accent text-white"
                    : "border-line bg-white text-ink hover:border-accent"
                }`}
              >
                {formatNumber(tile.value)}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {operations.map((operation) => (
              <button
                key={operation}
                type="button"
                onClick={() => useOperation(operation)}
                disabled={!active || selected.length !== 2}
                className="rounded-lg bg-ink px-4 py-3 text-xl font-black text-white"
              >
                {operation}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={startPuzzle} className="rounded-lg bg-accent px-4 py-2 font-black text-white">
              New puzzle
            </button>
            <button type="button" onClick={undo} className="rounded-lg border border-line bg-white px-4 py-2 font-black">
              Undo
            </button>
          </div>
        </div>
      </div>

      <p className="min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
