---
title: "Quantitative Primer: SQL Effective-Dated Records"
description: "Query effective-dated customer records with start and end dates."
topic: "Programming"
difficulty: "Medium"
type: "coding"
tags: ["quantitative-primer", "sql", "dates"]
relatedGames: ["mental-math-sprint"]
---

## Problem

You are given a customer table with `customer_id`, `name`, `datestart`, and `dateend`. How would you query the current record for each customer?

## Hint 1

The current row is the one whose date interval contains the as-of date.

## Hint 2

If there can be overlapping rows, rank by start date.

## Solution

For a specific as-of date:

```sql
SELECT *
FROM customer_history
WHERE datestart <= DATE '2026-06-11'
  AND (dateend > DATE '2026-06-11' OR dateend IS NULL);
```

If you need one current row per customer and the data may contain overlaps, rank candidates:

```sql
WITH candidates AS (
  SELECT
    *,
    ROW_NUMBER() OVER (
      PARTITION BY customer_id
      ORDER BY datestart DESC
    ) AS rn
  FROM customer_history
  WHERE datestart <= CURRENT_DATE
    AND (dateend > CURRENT_DATE OR dateend IS NULL)
)
SELECT *
FROM candidates
WHERE rn = 1;
```

The exact SQL may vary by database, but the core idea is interval filtering plus ranking if multiple rows qualify.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 34, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: reconstructed the OCR-damaged prompt into the effective-dated SQL task and reformatted for UBCTG Quant Prep.
