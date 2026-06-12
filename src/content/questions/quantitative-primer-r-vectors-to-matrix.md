---
title: "Quantitative Primer: Vectors to Matrix in R"
description: "Describe how to assemble vectors into a matrix in R."
topic: "Programming"
difficulty: "Easy"
type: "coding"
tags: ["quantitative-primer", "r", "matrix"]
relatedGames: ["mental-math-sprint"]
---

## Problem

How would you make a matrix from a bunch of vectors in R?

## Hint 1

Decide whether the vectors should become rows or columns.

## Hint 2

R has separate helpers for row binding and column binding.

## Solution

Use `cbind()` if each vector should become a column:

```r
x <- c(1, 2, 3)
y <- c(4, 5, 6)
z <- c(7, 8, 9)

m <- cbind(x, y, z)
```

Use `rbind()` if each vector should become a row:

```r
m <- rbind(x, y, z)
```

If the data is already in one long vector, use `matrix()` and specify the dimensions:

```r
m <- matrix(1:9, nrow = 3, ncol = 3, byrow = TRUE)
```

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 3, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: expanded into runnable examples and reformatted for UBCTG Quant Prep.
