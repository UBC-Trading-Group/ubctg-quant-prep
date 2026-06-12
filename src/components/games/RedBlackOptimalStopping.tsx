import { useEffect, useMemo, useState } from "react";
import { formatNumber, randomChoice, randomInt, readStoredNumber, scheduleAutoAdvance, writeStoredNumber } from "./gameUtils";

type DeckConfig = {
  red: number;
  black: number;
};

const defaultDeck: DeckConfig = {
  red: 6,
  black: 6,
};

function optimalValue(red: number, black: number, memo = new Map<string, number>()): number {
  if (red + black === 0) return 0;
  const key = `${red}-${black}`;
  const cached = memo.get(key);
  if (cached !== undefined) return cached;

  const total = red + black;
  const drawValue =
    (red > 0 ? (red / total) * (1 + optimalValue(red - 1, black, memo)) : 0) +
    (black > 0 ? (black / total) * (-1 + optimalValue(red, black - 1, memo)) : 0);
  const value = Math.max(0, drawValue);
  memo.set(key, value);
  return value;
}

function drawValue(red: number, black: number) {
  if (red + black === 0) return Number.NEGATIVE_INFINITY;
  const memo = new Map<string, number>();
  const total = red + black;
  return (
    (red > 0 ? (red / total) * (1 + optimalValue(red - 1, black, memo)) : 0) +
    (black > 0 ? (black / total) * (-1 + optimalValue(red, black - 1, memo)) : 0)
  );
}

function generateDeck(): DeckConfig {
  const total = randomChoice([10, 12, 16, 20]);
  const red = randomInt(Math.ceil(total * 0.35), Math.floor(total * 0.65));
  return { red, black: total - red };
}

export default function RedBlackOptimalStopping() {
  const [red, setRed] = useState(defaultDeck.red);
  const [black, setBlack] = useState(defaultDeck.black);
  const [pnl, setPnl] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState("Draw if the continuation value is positive; stop when it is not.");

  useEffect(() => {
    setBest(readStoredNumber("red-black-best"));
  }, []);

  const nextDrawValue = useMemo(() => drawValue(red, black), [red, black]);
  const shouldDraw = nextDrawValue > 0.0001;

  function updateStreak(correct: boolean) {
    const nextStreak = correct ? streak + 1 : 0;
    setStreak(nextStreak);
    if (nextStreak > best) {
      setBest(nextStreak);
      writeStoredNumber("red-black-best", nextStreak);
    }
  }

  function drawCard() {
    if (done || red + black === 0) return;
    const correct = shouldDraw;
    const isRed = Math.random() < red / (red + black);

    updateStreak(correct);
    setHistory((items) => [...items, isRed ? "R" : "B"]);
    setPnl((value) => value + (isRed ? 1 : -1));
    setRed((value) => value - (isRed ? 1 : 0));
    setBlack((value) => value - (isRed ? 0 : 1));
    setFeedback(
      correct
        ? `${isRed ? "Red" : "Black"} drawn. Good continue decision.`
        : `Drawing was not optimal. Continuation value was ${formatNumber(nextDrawValue)}.`
    );
    if (red + black <= 1) {
      scheduleAutoAdvance(newDeck);
    }
  }

  function stop() {
    if (done) return;
    const correct = !shouldDraw;
    updateStreak(correct);
    setDone(true);
    setFeedback(
      correct
        ? `Correct stop. Final P&L ${formatNumber(pnl)}.`
        : `Stopping early leaves EV. Draw value is ${formatNumber(nextDrawValue)}.`
    );
    scheduleAutoAdvance(newDeck);
  }

  function newDeck() {
    const next = generateDeck();
    setRed(next.red);
    setBlack(next.black);
    setPnl(0);
    setHistory([]);
    setDone(false);
    setFeedback("Draw if the continuation value is positive; stop when it is not.");
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 shadow-sm not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Red/Black Optimal Stopping</h2>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="rounded-md border border-line bg-panel px-3 py-1">Streak {streak}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">Best {best}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-1">P&L {formatNumber(pnl)}</span>
        </div>
      </div>

      <div className="my-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-accent/25 bg-accent/10 p-5">
          <p className="text-sm font-black uppercase text-accent">Remaining deck</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-white p-4 text-center">
              <p className="text-4xl font-black text-accent">{red}</p>
              <p className="text-xs font-bold uppercase text-muted">red</p>
            </div>
            <div className="rounded-lg bg-white p-4 text-center">
              <p className="text-4xl font-black text-ink">{black}</p>
              <p className="text-xs font-bold uppercase text-muted">black</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-line bg-panel p-5">
          <p className="text-sm font-black uppercase text-muted">Draw history</p>
          <div className="mt-4 flex min-h-24 flex-wrap gap-2">
            {history.length === 0 ? (
              <p className="text-sm font-bold text-muted">No cards drawn yet.</p>
            ) : (
              history.map((card, index) => (
                <span
                  key={`${card}-${index}`}
                  className={`grid size-9 place-items-center rounded-md font-black text-white ${card === "R" ? "bg-accent" : "bg-ink"}`}
                >
                  {card}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={drawCard} disabled={done || red + black === 0} className="rounded-lg bg-accent px-4 py-2 font-black text-white disabled:opacity-50">
          Draw
        </button>
        <button type="button" onClick={stop} disabled={done} className="rounded-lg bg-ink px-4 py-2 font-black text-white disabled:opacity-50">
          Stop
        </button>
        <button type="button" onClick={newDeck} className="rounded-lg border border-line bg-panel px-4 py-2 font-black">
          New deck
        </button>
      </div>

      <p className="mt-4 min-h-12 text-muted">{feedback}</p>
    </section>
  );
}
