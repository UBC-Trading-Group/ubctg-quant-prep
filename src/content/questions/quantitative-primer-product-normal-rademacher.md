---
title: "Quantitative Primer: Product of Normal and Rademacher"
description: "Find the distribution of a standard normal multiplied by an independent random sign."
topic: "Probability"
difficulty: "Medium"
type: "proof"
tags: ["quantitative-primer", "normal-distribution", "transforms"]
relatedGames: ["random-variable-transformer"]
---

## Problem

Let $X\sim N(0,1)$. Let $Y$ take values $-1$ and $1$, each with probability $1/2$, independent of $X$. What is the CDF of $Z=XY$?

## Hint 1

Multiplying a symmetric normal by $-1$ does not change its distribution.

## Hint 2

Condition on $Y$.

## Solution

Condition on $Y$:

$$
P(Z\le z)=P(XY\le z|Y=1)P(Y=1)+P(XY\le z|Y=-1)P(Y=-1).
$$

This gives:

$$
P(Z\le z)=\frac{1}{2}P(X\le z)+\frac{1}{2}P(-X\le z).
$$

Since $X$ is symmetric, $-X\sim N(0,1)$, so both terms are $\Phi(z)$. Therefore:

$$
F_Z(z)=\Phi(z).
$$

So $Z\sim N(0,1)$.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 19, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
