---
title: "Quantitative Primer: Measuring Two Wood Pieces"
description: "Choose the best two measurements to estimate two lengths with minimal variance."
topic: "Statistics"
difficulty: "Hard"
type: "conceptual"
tags: ["quantitative-primer", "measurement-error", "variance"]
relatedGames: ["confidence-interval-game"]
---

## Problem

You have two pieces of wood of lengths $a$ and $b$, where $a<b$, and a measuring device with error variance $\sigma^2$ per use. Each use costs GBP 1 and you have GBP 2. What is the best strategy to measure $a$ and $b$ with minimal variance?

## Hint 1

Measure the sum and the difference.

## Hint 2

Solve $s=a+b$ and $d=a-b$ for $a$ and $b$.

## Solution

Instead of measuring $a$ once and $b$ once, measure:

1. the sum $s=a+b$,
2. the difference $d=a-b$.

Then estimate:

$$
\hat{a}=\frac{s+d}{2},\qquad \hat{b}=\frac{s-d}{2}.
$$

Each measured quantity has error variance $\sigma^2$. Assuming independent measurement errors:

$$
\operatorname{Var}(\hat{a})
=\operatorname{Var}\left(\frac{s+d}{2}\right)
=\frac{1}{4}(\sigma^2+\sigma^2)
=\frac{\sigma^2}{2}.
$$

Similarly:

$$
\operatorname{Var}(\hat{b})=\frac{\sigma^2}{2}.
$$

Measuring $a$ and $b$ directly would give each estimate variance $\sigma^2$. Measuring the sum and difference effectively uses both observations in both estimates, cutting each variance in half.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 29, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
