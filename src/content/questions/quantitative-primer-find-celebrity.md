---
title: "Quantitative Primer: Find the Celebrity"
description: "Find a person known by everyone who knows no one else."
topic: "Algorithms"
difficulty: "Medium"
type: "coding"
tags: ["quantitative-primer", "graphs", "algorithms"]
relatedGames: ["sequence-hunter"]
---

## Problem

At a party, `knows(a,b)` returns whether person $a$ knows person $b$. One person is known by everyone but knows no one. How would you determine that person's number?

## Hint 1

Use elimination: if $a$ knows $b$, then $a$ cannot be the celebrity.

## Hint 2

After one pass, verify the candidate.

## Solution

Maintain a candidate. Compare the candidate with each person:

```python
def find_celebrity(n, knows):
    candidate = 0
    for person in range(1, n):
        if knows(candidate, person):
            candidate = person

    for person in range(n):
        if person == candidate:
            continue
        if knows(candidate, person) or not knows(person, candidate):
            return None
    return candidate
```

The first pass eliminates one impossible candidate per comparison. The second pass verifies that the survivor knows nobody and is known by everybody. Complexity is $O(n)$ calls to select plus $O(n)$ calls to verify.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 25, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed, example code supplied, and reformatted for UBCTG Quant Prep.
