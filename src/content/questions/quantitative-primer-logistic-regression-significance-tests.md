---
title: "Quantitative Primer: Logistic Regression Significance Tests"
description: "Compare significance tests for linear and logistic regression parameters."
topic: "Statistics"
difficulty: "Medium"
type: "conceptual"
tags: ["quantitative-primer", "logistic-regression", "statistics"]
relatedGames: ["distribution-builder"]
---

## Problem

What significance tests are used for parameters estimated in a logistic regression? How are they different from those used for a linear regression?

## Hint 1

Linear regression often uses t-tests.

## Hint 2

Logistic regression commonly uses Wald, likelihood-ratio, or score tests.

## Solution

In ordinary linear regression with normal errors, individual coefficients are often tested with t-statistics:

$$
t=\frac{\hat{\beta}-\beta_0}{\operatorname{se}(\hat{\beta})}.
$$

In logistic regression, coefficients are commonly tested using asymptotic tests, especially the Wald statistic:

$$
W=\left(\frac{\hat{\beta}-\beta_0}{\operatorname{se}(\hat{\beta})}\right)^2,
$$

which is approximately $\chi^2_1$ under the null. Likelihood-ratio tests and score tests are also standard.

The difference is that logistic regression has no normally distributed additive error term with constant variance in the same way OLS does, so inference is usually asymptotic and likelihood-based.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 28, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
