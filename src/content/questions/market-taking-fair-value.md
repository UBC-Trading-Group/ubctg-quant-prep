---
title: "Market Taking from Fair Value"
description: "Decide whether to lift, hit, or pass based on your fair value."
topic: "Market Making"
difficulty: "Easy"
type: "market-making"
tags: ["market-making", "fair-value", "spread"]
relatedConcepts: ["expected-value-vs-fair-price"]
relatedGames: ["make-me-a-market"]
---

## Problem

You estimate a contract is worth 42. The visible market is 39 bid, 41 ask. Should you buy, sell, or pass?

## Hint 1

Compare your fair value to the ask when buying.

## Hint 2

If fair value is above the ask, buying has positive edge.

## Solution

You should buy at 41 because your fair value is 42. The expected edge is:

$$
42 - 41 = 1
$$

Selling at 39 would be unattractive because it is below your fair value.
