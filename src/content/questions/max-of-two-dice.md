---
title: "Expected Max of Two Dice"
description: "Compute the expected maximum of two fair six-sided dice."
topic: "Expected Value"
difficulty: "Medium"
type: "numeric"
tags: ["dice", "expectation", "distribution"]
relatedConcepts: ["expected-value-vs-fair-price"]
relatedGames: ["mental-math-sprint"]
---

## Problem

Roll two fair six-sided dice. What is the expected value of the maximum roll?

## Hint 1

Find $P(\max = k)$.

## Hint 2

$P(\max \le k) = (k/6)^2$.

## Solution

$$
P(\max = k) = P(\max \le k) - P(\max \le k-1)
= \frac{k^2 - (k-1)^2}{36}
$$

Then:

$$
E[\max] = \sum_{k=1}^{6} k \frac{k^2 - (k-1)^2}{36}
= \frac{161}{36}
\approx 4.47
$$
