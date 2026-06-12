---
title: "Quantitative Primer: SQL Department Average"
description: "Add each employee's department average salary using SQL."
topic: "Programming"
difficulty: "Medium"
type: "coding"
tags: ["quantitative-primer", "sql", "window-functions"]
relatedGames: ["mental-math-sprint"]
---

## Problem

Given an employee table with department and salary columns, add a column showing the average department salary for each employee.

## Hint 1

Use a window function.

## Hint 2

Partition by department.

## Solution

Use `AVG()` as a window function:

```sql
SELECT
  employee_id,
  employee_name,
  department,
  salary,
  AVG(salary) OVER (PARTITION BY department) AS department_avg_salary
FROM employees;
```

This keeps one row per employee while computing the average over the employee's department. A grouped query alone would collapse the result to one row per department, so the window function is the cleanest fit.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 33.a, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: generalized table names, code supplied, and reformatted for UBCTG Quant Prep.
