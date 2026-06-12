---
title: "Quantitative Primer: Counting Game to 50"
description: "Solve a deterministic counting game by working backward from the target."
topic: "Game Theory"
difficulty: "Easy"
type: "conceptual"
tags: ["quantitative-primer", "game-theory", "backward-induction"]
relatedGames: ["target-number-box"]
---

## Problem

Two players take turns adding an integer from 1 to 10 to the running total. You start. The first person to say 50 wins. How much would you wager on the game?

## Hint 1

Work backward from 50.

## Hint 2

You want to leave your opponent at numbers from which every move lets you hit the next target.

## Solution

To win, you want to say $50$. That is guaranteed if your previous target was $39$, because your opponent must say a number from $40$ to $49$, and you can add enough to reach $50$.

Work backward by subtracting $11$:

$$
50,\ 39,\ 28,\ 17,\ 6.
$$

Since you start, say $6$. Whatever your opponent adds, add the complementary amount to make the two moves sum to $11$. This lets you say $17$, then $28$, then $39$, then $50$.

With optimal play, the starting player wins with certainty, so the wager is limited only by practical risk constraints, not game probability.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 39, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
