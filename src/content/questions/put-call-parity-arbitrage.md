---
title: "Put-Call Parity Arbitrage"
description: "Spot a mispricing using the parity relationship."
topic: "Options"
difficulty: "Medium"
type: "numeric"
tags: ["options", "arbitrage", "put-call-parity"]
relatedConcepts: ["put-call-parity"]
relatedGames: ["make-me-a-market"]
---

## Problem

A non-dividend stock trades at 100. A European call with strike 100 costs 8, and the matching put costs 5. Assume rates are zero. Is parity violated?

## Hint 1

With zero rates and $K=S$, parity says $C - P = S - K$.

## Hint 2

The right side is zero.

## Solution

The observed option difference is:

$$
C - P = 8 - 5 = 3
$$

The parity value is:

$$
S - K = 100 - 100 = 0
$$

The call is rich relative to the put. One arbitrage direction is to sell the call, buy the put, buy the stock, and finance the strike payoff relationship.
