---
title: "Expected Value vs Fair Price"
description: "Why expected value matters in quant interviews, and when it is not enough."
topic: "Expected Value"
difficulty: "Beginner"
tags: ["probability", "expected-value", "trading"]
relatedGames: ["ev-take-or-pass", "make-me-a-market"]
relatedQuestions: ["dice-ev-take-or-pass"]
---

Expected value is the weighted average payoff of a random outcome.

$$
EV = \sum_i p_i x_i
$$

In interviews, expected value is often the first approximation of fair value. If a game has positive expected value after cost, a risk-neutral trader usually wants to take it.

## Intuition

Imagine repeating the same bet thousands of times. The average outcome should drift toward the expected value. A fair price is the price that makes the trade have zero expected profit before fees, risk limits, and capital constraints.

## Common Mistake

Positive expected value does not automatically mean a trade is good. You also need to consider variance, bankroll, drawdown, and whether the game can be repeated.
