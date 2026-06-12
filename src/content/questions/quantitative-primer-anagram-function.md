---
title: "Quantitative Primer: Anagram Function"
description: "Write an algorithm to check whether two strings are anagrams."
topic: "Algorithms"
difficulty: "Easy"
type: "coding"
tags: ["quantitative-primer", "strings", "algorithms"]
relatedGames: ["sequence-hunter"]
---

## Problem

Write a Python function to check whether two strings are anagrams. Do a version with and without sorting. Why might you want the version without sorting?

## Hint 1

With sorting, compare sorted characters.

## Hint 2

Without sorting, count character frequencies.

## Solution

With sorting:

```python
def are_anagrams_sorted(a, b):
    return sorted(a) == sorted(b)
```

This is simple and usually $O(n\log n)$.

Without sorting:

```python
from collections import Counter

def are_anagrams_counted(a, b):
    return Counter(a) == Counter(b)
```

The counting approach is $O(n)$ expected time and can be better for long strings or streaming-style constraints. If imports are not allowed, use a dictionary and increment/decrement counts manually.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 22, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed, code supplied, and reformatted for UBCTG Quant Prep.
