---
title: "Put-Call Parity"
description: "The no-arbitrage relationship between European calls, puts, stock, and cash."
topic: "Options"
difficulty: "Intermediate"
tags: ["options", "arbitrage", "put-call-parity"]
relatedGames: ["make-me-a-market"]
relatedQuestions: ["put-call-parity-arbitrage"]
---

For European options with the same strike and expiry, put-call parity is:

$$
C - P = S - K e^{-rT}
$$

The left side is long a call and short a put. The right side is long stock and short the present value of the strike.

## Intuition

Both portfolios create the same terminal payoff. If two portfolios have identical future payoffs, no-arbitrage pricing says they should have the same value today.

## Common Mistake

Put-call parity is cleanest for European options. American exercise features and dividends require adjustments.
