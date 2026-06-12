---
title: "Quantitative Primer: Linear Regression Beta"
description: "State regression assumptions and derive the least-squares estimator."
topic: "Statistics"
difficulty: "Medium"
type: "proof"
tags: ["quantitative-primer", "linear-regression", "least-squares"]
relatedGames: ["distribution-builder"]
---

## Problem

Suppose you model $Y$ using $X$ with

$$
Y=X\beta+\varepsilon.
$$

What assumptions are being made? How would you find $\beta$? What tests can be done afterwards?

## Hint 1

Minimize squared residuals.

## Hint 2

The normal equations are $X^TX\beta=X^TY$.

## Solution

Common linear-regression assumptions include linearity, exogeneity, no perfect multicollinearity, independent errors, constant error variance, and often normally distributed errors for inference.

For least squares, minimize:

$$
S(\beta)=(Y-X\beta)^T(Y-X\beta).
$$

Differentiate and set equal to zero:

$$
\frac{\partial S}{\partial \beta}=-2X^TY+2X^TX\beta=0.
$$

Therefore:

$$
\hat{\beta}=(X^TX)^{-1}X^TY,
$$

assuming $X^TX$ is invertible.

After estimating $\beta$, common checks include t-tests for individual coefficients, F-tests for joint restrictions, confidence intervals, residual diagnostics, and goodness-of-fit measures such as $R^2$.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 14, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
