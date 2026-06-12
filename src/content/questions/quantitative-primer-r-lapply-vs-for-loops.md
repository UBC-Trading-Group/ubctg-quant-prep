---
title: "Quantitative Primer: lapply vs for Loops"
description: "Compare lapply and for loops in R."
topic: "Programming"
difficulty: "Easy"
type: "coding"
tags: ["quantitative-primer", "r", "functional-programming"]
relatedGames: ["mental-math-sprint"]
---

## Problem

What is the difference between `lapply()` and for-loops in R? Which do you prefer?

## Hint 1

`lapply()` applies a function to each element and returns a list.

## Hint 2

Preference should depend on readability and context.

## Solution

`lapply()` applies a function over a list or vector and returns a list:

```r
out <- lapply(values, sqrt)
```

A for-loop is explicit:

```r
out <- vector("list", length(values))
for (i in seq_along(values)) {
  out[[i]] <- sqrt(values[[i]])
}
```

`lapply()` is concise and functional. A for-loop can be clearer when the body has multiple steps, side effects, or complex control flow. In modern R, a well-written for-loop with preallocated output can be perfectly reasonable; the best choice is the one that is correct, readable, and efficient enough.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 36.c, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed, examples supplied, and reformatted for UBCTG Quant Prep.
