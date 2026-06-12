import { shuffle } from "./gameUtils";

export type CardSuit = "H" | "D" | "C" | "S";
export type CardRank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

export type PlayingCard = {
  rank: CardRank;
  suit: CardSuit;
  value: number;
  color: "red" | "black";
};

const ranks: CardRank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const suits: CardSuit[] = ["H", "D", "C", "S"];

const rankValues: Record<CardRank, number> = {
  A: 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  J: 10,
  Q: 10,
  K: 10,
};

export function buildDeck() {
  return suits.flatMap((suit) =>
    ranks.map((rank) => ({
      rank,
      suit,
      value: rankValues[rank],
      color: suit === "H" || suit === "D" ? "red" : "black",
    }))
  );
}

export function dealFromDeck(count: number, deck = buildDeck()) {
  const shuffled = shuffle(deck);

  return {
    drawn: shuffled.slice(0, count),
    remaining: shuffled.slice(count),
  };
}

export function cardLabel(card: PlayingCard) {
  return `${card.rank}${card.suit}`;
}

export function sumCards(cards: PlayingCard[]) {
  return cards.reduce((sum, card) => sum + card.value, 0);
}

export function averageCardValue(cards: PlayingCard[]) {
  if (cards.length === 0) return 0;
  return sumCards(cards) / cards.length;
}

export function removeCards(deck: PlayingCard[], cards: PlayingCard[]) {
  const cardKeys = new Set(cards.map((card) => cardLabel(card)));
  return deck.filter((card) => !cardKeys.has(cardLabel(card)));
}
