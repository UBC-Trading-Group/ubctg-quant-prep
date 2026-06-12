---
title: "Quantitative Primer: Find a Duplicate"
description: "Find a duplicate in an unsorted array of arbitrary integers."
topic: "Algorithms"
difficulty: "Easy"
type: "coding"
tags: ["quantitative-primer", "arrays", "hashing"]
relatedGames: ["sequence-hunter"]
---

## Problem

You have an unsorted array of $N$ integers. All are unique except two equal values. The integers are arbitrary, not necessarily $1$ through $N$. How would you find the duplicate without sorting? What if sorting is allowed?

## Hint 1

Without sorting, store what you have seen.

## Hint 2

With sorting, equal duplicates become adjacent.

## Solution

Without sorting, use a set:

```python
def find_duplicate(values):
    seen = set()
    for value in values:
        if value in seen:
            return value
        seen.add(value)
    return None
```

This is $O(n)$ expected time and $O(n)$ space.

With sorting:

```python
def find_duplicate_sorted(values):
    values = sorted(values)
    for i in range(1, len(values)):
        if values[i] == values[i - 1]:
            return values[i]
    return None
```

This is $O(n\log n)$ time and can be $O(1)$ extra space if in-place sorting is allowed.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 26, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed, code supplied, and reformatted for UBCTG Quant Prep.
