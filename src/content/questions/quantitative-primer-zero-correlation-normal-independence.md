---
title: "Quantitative Primer: Zero Correlation and Normal Independence"
description: "Decide when uncorrelated normal variables are independent."
topic: "Probability"
difficulty: "Medium"
type: "conceptual"
tags: ["quantitative-primer", "correlation", "independence"]
relatedConcepts: ["bayes-rule-for-quant-interviews"]
relatedGames: ["event-relationship-game"]
---

## Problem

Let $X\sim N(0,1)$ and $Y\sim N(0,1)$. If $\rho_{XY}=0$, are $X$ and $Y$ independent?

## Hint 1

The answer depends on whether the joint distribution is bivariate normal.

## Hint 2

Zero covariance alone is weaker than independence.

## Solution

Not necessarily. If $(X,Y)$ are jointly bivariate normal, then zero correlation implies independence. But knowing only the marginal distributions and $\rho_{XY}=0$ is not enough.

For example, let $X\sim N(0,1)$ and let $Y$ depend on $X$ in a nonlinear way while preserving a zero covariance. Nonlinear dependence can make covariance vanish even though the variables are not independent.

The interview-safe answer is:

1. If $X$ and $Y$ are jointly normal, then yes.
2. If only the marginals are normal and the correlation is zero, then no conclusion of independence follows.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 11, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
