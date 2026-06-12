---
title: "Quantitative Primer: Model Choice Case Study"
description: "Structure an answer to an open-ended model selection interview problem."
topic: "Modeling"
difficulty: "Medium"
type: "conceptual"
tags: ["quantitative-primer", "modeling", "interview"]
relatedGames: ["assumption-stack-builder"]
---

## Problem

Here is a specific problem the team faced last year. What model will you build to solve it, and why?

## Hint 1

Start by asking about the objective, data, constraints, and evaluation metric.

## Hint 2

Do not jump to a complex model before defining the baseline.

## Solution

A strong answer starts with clarification:

- What decision will the model support?
- What data is available and at what frequency?
- What is the target variable?
- What is the cost of false positives versus false negatives?
- What does success mean: prediction error, calibration, interpretability, speed, stability, or profit?

Then propose a baseline, such as a simple regression, logistic model, rules-based benchmark, or historical average. After that, suggest a more flexible model only if it is justified by the data and objective.

Close with validation: train/test split by time if the data is temporal, out-of-sample testing, robustness checks, monitoring, and a plan for model failure. The point is to show modeling judgment, not to name the most sophisticated model.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 37, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed into a general framework and reformatted for UBCTG Quant Prep.
