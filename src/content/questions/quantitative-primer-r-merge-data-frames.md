---
title: "Quantitative Primer: Merge Data Frames in R"
description: "Describe R syntax for merging two data frames."
topic: "Programming"
difficulty: "Easy"
type: "coding"
tags: ["quantitative-primer", "r", "data-frames"]
relatedGames: ["mental-math-sprint"]
---

## Problem

Describe the syntax you would use to merge two data frames in R.

## Hint 1

Base R uses `merge()`.

## Hint 2

Specify the join keys with `by`, `by.x`, or `by.y`.

## Solution

In base R:

```r
merged <- merge(left, right, by = "id")
```

For different key names:

```r
merged <- merge(left, right, by.x = "left_id", by.y = "right_id")
```

Common join variants:

```r
inner <- merge(left, right, by = "id")
left_join <- merge(left, right, by = "id", all.x = TRUE)
full_join <- merge(left, right, by = "id", all = TRUE)
```

If using `dplyr`, the equivalent would be `inner_join()`, `left_join()`, and related verbs.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 36.b, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed, examples supplied, and reformatted for UBCTG Quant Prep.
