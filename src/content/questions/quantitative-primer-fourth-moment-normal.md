---
title: "Quantitative Primer: Fourth Moment of a Normal"
description: "Derive E[X^4] for a centered normal random variable."
topic: "Statistics"
difficulty: "Medium"
type: "proof"
tags: ["quantitative-primer", "normal-distribution", "moments"]
relatedGames: ["distribution-builder"]
---

## Problem

Derive $\mathrm{E}[X^4]$ where $X\sim N(0,\sigma^2)$.

## Hint 1

Standardize using $Z=X/\sigma$.

## Hint 2

For a standard normal, the fourth moment is $3$.

## Solution

Let $Z=X/\sigma$. Then $Z\sim N(0,1)$ and $X=\sigma Z$, so:

$$
\mathrm{E}[X^4]=\sigma^4\mathrm{E}[Z^4].
$$

For a standard normal, the moment generating function is:

$$
M_Z(t)=\mathrm{E}[e^{tZ}]=e^{t^2/2}.
$$

The fourth moment is the fourth derivative at zero:

$$
M_Z^{(4)}(0)=3.
$$

Therefore:

$$
\mathrm{E}[X^4]=3\sigma^4.
$$

Equivalently, since $X^2/\sigma^2\sim \chi^2_1$, use $\operatorname{Var}(\chi^2_1)=2$ and $\mathrm{E}[\chi^2_1]=1$ to get the same result.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 6, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
