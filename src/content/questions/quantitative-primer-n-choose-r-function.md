---
title: "Quantitative Primer: n Choose r Function"
description: "Implement nCr with and without recursion."
topic: "Algorithms"
difficulty: "Medium"
type: "coding"
tags: ["quantitative-primer", "combinatorics", "recursion"]
relatedGames: ["card-draw-lab"]
---

## Problem

Without using the standard library, write a function for $nC_r$. Do a version with and without recursion.

## Hint 1

Use $\binom{n}{r}=\frac{n!}{r!(n-r)!}$, but avoid unnecessary large factorials.

## Hint 2

The recursive identity is $\binom{n}{r}=\binom{n-1}{r-1}+\binom{n-1}{r}$.

## Solution

Iterative version:

```python
def ncr(n, r):
    if r < 0 or r > n:
        return 0
    r = min(r, n - r)
    ans = 1
    for i in range(1, r + 1):
        ans = ans * (n - r + i) // i
    return ans
```

Recursive version:

```python
def ncr_recursive(n, r):
    if r < 0 or r > n:
        return 0
    if r == 0 or r == n:
        return 1
    return ncr_recursive(n - 1, r - 1) + ncr_recursive(n - 1, r)
```

The recursive version mirrors Pascal's triangle but is exponential without memoization. The iterative version runs in $O(r)$ time and $O(1)$ space.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 23, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed, code supplied, and reformatted for UBCTG Quant Prep.
