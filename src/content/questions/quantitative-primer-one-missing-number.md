---
title: "Quantitative Primer: One Missing Number"
description: "Find one missing integer from an unsorted array containing 1 through n."
topic: "Algorithms"
difficulty: "Easy"
type: "coding"
tags: ["quantitative-primer", "arrays", "algorithms"]
relatedGames: ["sequence-hunter"]
---

## Problem

You have an unsorted array containing integers $1,2,3,\ldots,n$, but one number is missing. Describe an algorithm to find the missing number and discuss its complexity.

## Hint 1

You know what the full sum should be.

## Hint 2

Compare the observed sum with $n(n+1)/2$.

## Solution

The sum of all numbers from $1$ to $n$ is:

$$
\frac{n(n+1)}{2}.
$$

Add the numbers in the array and subtract from the theoretical sum. The difference is the missing number.

```python
def missing_one(values, n):
    return n * (n + 1) // 2 - sum(values)
```

This takes $O(n)$ time and $O(1)$ extra space.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 7, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
