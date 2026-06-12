---
title: "Quantitative Primer: Coin Gamble Normal Approximation"
description: "Use a binomial tail approximation to decide whether a coin-flip gamble is worth playing."
topic: "Expected Value"
difficulty: "Medium"
type: "numeric"
tags: ["quantitative-primer", "binomial", "expected-value"]
relatedConcepts: ["expected-value-vs-fair-price"]
relatedGames: ["ev-take-or-pass"]
---

## Problem

You flip 100 fair coins. If 60 or more land heads, you win GBP 10; otherwise you win nothing. Should you play for GBP 1?

## Hint 1

The number of heads is $X\sim \operatorname{Binomial}(100,0.5)$.

## Hint 2

Approximate $X$ with a normal distribution.

## Solution

Let $X\sim \operatorname{Binomial}(100,0.5)$. Then:

$$
\mathrm{E}[X]=50,\qquad \operatorname{sd}(X)=\sqrt{100(0.5)(0.5)}=5.
$$

The cutoff $60$ is roughly two standard deviations above the mean:

$$
z=\frac{60-50}{5}=2.
$$

Using the normal approximation,

$$
P(X\ge 60)\approx P(Z\ge 2)\approx 0.0228.
$$

The expected payout is approximately:

$$
10(0.0228)=0.228.
$$

That is far below the GBP 1 entry cost, so you should not play.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 10, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
