---
title: "Quantitative Primer: Linear vs Logistic Regression Assumptions"
description: "Compare assumptions and significance tests for linear and logistic regression."
topic: "Statistics"
difficulty: "Medium"
type: "conceptual"
tags: ["quantitative-primer", "linear-regression", "logistic-regression"]
relatedGames: ["distribution-builder"]
---

## Problem

What assumptions are needed for linear regression? Are they the same for logistic regression? How would you test parameter significance in each?

## Hint 1

Linear regression models the conditional mean directly.

## Hint 2

Logistic regression models the log-odds of a binary outcome.

## Solution

Linear regression assumes a linear conditional mean, exogeneity, no perfect multicollinearity, independent errors, and often homoscedastic and normally distributed errors for inference.

Logistic regression assumes a binary response with:

$$
\log\left(\frac{p}{1-p}\right)=X\beta.
$$

It shares ideas such as exogeneity and no perfect multicollinearity, but it does not assume normally distributed additive errors or constant variance in the OLS sense.

For linear regression, individual parameters are often tested with t-tests. For logistic regression, common tests are Wald tests, likelihood-ratio tests, and score tests, typically using asymptotic normal or chi-squared approximations.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 35, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
