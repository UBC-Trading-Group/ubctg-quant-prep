---
title: "Quantitative Primer: AR(1) Mean and Variance"
description: "Derive the unconditional mean and variance of a stationary AR(1) process."
topic: "Time Series"
difficulty: "Medium"
type: "proof"
tags: ["quantitative-primer", "time-series", "ar1"]
relatedGames: ["distribution-builder"]
---

## Problem

Given

$$
Y_t=\alpha_0+\alpha_1Y_{t-1}+\varepsilon_t,\qquad
\varepsilon_t\sim N(0,\sigma_\varepsilon^2),
$$

what are $\mathrm{E}[Y_t]$ and $\operatorname{Var}(Y_t)$?

## Hint 1

Assume stationarity, so $\mathrm{E}[Y_t]=\mathrm{E}[Y_{t-1}]$.

## Hint 2

For variance, use independence of $\varepsilon_t$ and $Y_{t-1}$.

## Solution

Let $\mu=\mathrm{E}[Y_t]$. Under stationarity:

$$
\mu=\alpha_0+\alpha_1\mu.
$$

So:

$$
\mu=\frac{\alpha_0}{1-\alpha_1}.
$$

Let $v=\operatorname{Var}(Y_t)$. Since the shock is independent of the previous state,

$$
v=\alpha_1^2 v+\sigma_\varepsilon^2.
$$

Therefore:

$$
v=\frac{\sigma_\varepsilon^2}{1-\alpha_1^2}.
$$

These formulas require $|\alpha_1|<1$ for stationarity.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 18, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
