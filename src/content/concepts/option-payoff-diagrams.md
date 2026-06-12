---
title: "Option Payoff Diagrams"
description: "How to reason about calls, puts, and spreads from their terminal payoff shapes."
topic: "Options"
difficulty: "Beginner"
tags: ["options", "payoffs", "derivatives"]
relatedGames: ["make-me-a-market"]
relatedQuestions: ["basic-delta-intuition"]
---

Payoff diagrams show the terminal value of an option position as the underlying price changes.

For a call with strike \(K\):

$$
\max(S_T - K, 0)
$$

For a put with strike \(K\):

$$
\max(K - S_T, 0)
$$

## Intuition

Start with the payoff at expiration before worrying about premium, Greeks, or dynamic hedging. The diagram tells you where the position gains or loses value.

## Common Mistake

Payoff and profit are not the same. Profit subtracts the premium paid or received.
