---
title: "Quantitative Primer: Missing Number in a Sorted Array"
description: "Use binary search to find a missing number in a sorted integer array."
topic: "Algorithms"
difficulty: "Medium"
type: "coding"
tags: ["quantitative-primer", "binary-search", "arrays"]
relatedGames: ["sequence-hunter"]
---

## Problem

You have a sorted array that should contain integers $1,2,3,\ldots,n$, but one number is missing. Describe an algorithm.

## Hint 1

In a perfect one-indexed array, value $i$ appears at position $i$.

## Hint 2

Check the middle value and decide which side contains the gap.

## Solution

A linear scan works in $O(n)$, but sortedness allows binary search.

If the array is zero-indexed and contains one missing value, then before the missing point we expect:

$$
\text{values}[i] = i+1.
$$

After the missing point, values are shifted by one:

$$
\text{values}[i] = i+2.
$$

Binary search for the first index where `values[i] != i + 1`.

```python
def missing_sorted(values):
    lo, hi = 0, len(values) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if values[mid] == mid + 1:
            lo = mid + 1
        else:
            hi = mid - 1
    return lo + 1
```

The complexity is $O(\log n)$.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 7.b, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
