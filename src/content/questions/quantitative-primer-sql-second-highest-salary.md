---
title: "Quantitative Primer: SQL Second Highest Salary"
description: "Write a SQL query for the second highest salary."
topic: "Programming"
difficulty: "Medium"
type: "coding"
tags: ["quantitative-primer", "sql", "ranking"]
relatedGames: ["mental-math-sprint"]
---

## Problem

Write a SQL query to return the second highest salary.

## Hint 1

Decide whether duplicate salaries should count as one rank.

## Hint 2

Use `DENSE_RANK()` for distinct salary ranks.

## Solution

If duplicate salaries should share a rank, use `DENSE_RANK()`:

```sql
WITH ranked AS (
  SELECT
    salary,
    DENSE_RANK() OVER (ORDER BY salary DESC) AS salary_rank
  FROM employees
)
SELECT DISTINCT salary
FROM ranked
WHERE salary_rank = 2;
```

If the database supports `LIMIT`/`OFFSET` and you want the second row after sorting distinct salaries:

```sql
SELECT DISTINCT salary
FROM employees
ORDER BY salary DESC
LIMIT 1 OFFSET 1;
```

Clarify duplicate handling during the interview.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 33.b, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: generalized table names, code supplied, and reformatted for UBCTG Quant Prep.
