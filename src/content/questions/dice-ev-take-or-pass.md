---
title: "Dice EV: Should You Take the Bet?"
description: "A simple expected value question using a die roll."
topic: "Expected Value"
difficulty: "Easy"
type: "numeric"
tags: ["dice", "ev", "betting"]
relatedConcepts: ["expected-value-vs-fair-price"]
relatedGames: ["ev-take-or-pass"]
---

## Problem

You pay 10 dollars to roll a fair six-sided die. If you roll a 6, you win 70 dollars. Otherwise, you get nothing. Should you take the bet?

## Hint 1

Compute the expected payout first.

## Hint 2

The only winning outcome has probability $1/6$.

## Solution

The expected payout is:

$$
\frac{1}{6}(70) + \frac{5}{6}(0) = 11.67
$$

The cost is 10 dollars, so the expected value is:

$$
11.67 - 10 = 1.67
$$

A risk-neutral trader would take the bet.
