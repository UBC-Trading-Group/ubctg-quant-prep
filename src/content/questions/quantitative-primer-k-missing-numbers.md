---
title: "Quantitative Primer: K Missing Numbers"
description: "Discuss algorithms for finding k missing numbers when k is small."
topic: "Algorithms"
difficulty: "Hard"
type: "coding"
tags: ["quantitative-primer", "arrays", "complexity"]
relatedGames: ["sequence-hunter"]
---

## Problem

You have an unsorted array containing integers from $1$ to $n$, but $k$ numbers are missing, where $k\ll n$. Describe an algorithm.

## Hint 1

One approach uses sums of powers.

## Hint 2

A simpler practical approach uses a boolean presence array.

## Solution

A practical solution is to allocate a boolean array of length $n$, initially false. Scan the input and mark each present value. Then scan the boolean array to find the false entries.

```python
def missing_k(values, n):
    seen = [False] * (n + 1)
    for value in values:
        seen[value] = True
    return [i for i in range(1, n + 1) if not seen[i]]
```

This is $O(n)$ time and $O(n)$ space.

If space matters more than simplicity, you can compare observed sums of powers with their theoretical values:

$$
\sum_{i=1}^n i,\quad \sum_{i=1}^n i^2,\quad \ldots,\quad \sum_{i=1}^n i^k.
$$

The differences produce $k$ equations in the $k$ missing values. This can use less storage, but solving the system is less straightforward and can be numerically awkward.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 7.a, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
