---
title: "Quantitative Primer: Regression Assumptions and Multicollinearity"
description: "Discuss linear regression assumptions, multicollinearity, and goodness of fit."
topic: "Statistics"
difficulty: "Medium"
type: "conceptual"
tags: ["quantitative-primer", "linear-regression", "multicollinearity"]
relatedGames: ["distribution-builder"]
---

## Problem

What assumptions are required for linear regression? What is multicollinearity, what are its implications, and how would you measure goodness of fit?

## Hint 1

Separate model assumptions from inference assumptions.

## Hint 2

Multicollinearity makes individual coefficient estimates unstable.

## Solution

Core assumptions include linearity, exogeneity, no perfect multicollinearity, independent errors, and constant error variance. Normal errors are often added for exact small-sample inference.

Multicollinearity means explanatory variables are highly correlated. Perfect multicollinearity makes $X^TX$ singular, so OLS cannot uniquely estimate coefficients. High but imperfect multicollinearity can inflate standard errors and make individual coefficient estimates unstable, even when predictions remain usable.

Goodness of fit can be summarized with $R^2$, adjusted $R^2$, residual plots, out-of-sample error, RMSE/MAE, and domain-specific diagnostics. For interviews, mention that a high $R^2$ is not proof of a good model; it must be assessed against assumptions, stability, and out-of-sample behavior.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 31, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
