---
title: "Reroll Threshold"
description: "Choose the optimal threshold for rerolling a die once."
topic: "Expected Value"
difficulty: "Medium"
type: "numeric"
tags: ["dice", "optimal-stopping", "threshold"]
relatedConcepts: ["expected-value-vs-fair-price"]
relatedGames: ["ev-take-or-pass"]
---

## Problem

You roll a fair die. After seeing the result, you may keep it or reroll once and must accept the second roll. What results should you reroll?

## Hint 1

The expected value of a fresh die roll is $3.5$.

## Hint 2

Keep any first roll that is better than the expected reroll.

## Solution

Rerolling has expected value $3.5$. Keep any result above $3.5$, so keep 4, 5, and 6. Reroll 1, 2, and 3.
