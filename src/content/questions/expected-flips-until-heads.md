---
title: "Expected Flips Until Heads"
description: "Find the expected waiting time for the first heads."
topic: "Expected Value"
difficulty: "Easy"
type: "numeric"
tags: ["expectation", "coins", "geometric"]
relatedConcepts: ["expected-value-vs-fair-price"]
relatedGames: ["mental-math-sprint"]
---

## Problem

You flip a fair coin until the first heads appears. What is the expected number of flips?

## Hint 1

Let $E$ be the expected number of flips.

## Hint 2

After a tails, you are back where you started, but one flip has been used.

## Solution

Condition on the first flip:

$$
E = \frac{1}{2}(1) + \frac{1}{2}(1 + E)
$$

Solving gives:

$$
E = 2
$$
