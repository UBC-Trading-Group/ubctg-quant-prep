---
title: "Quantitative Primer: e^pi vs pi^e"
description: "Compare e to the pi and pi to the e without a calculator."
topic: "Calculus"
difficulty: "Medium"
type: "proof"
tags: ["quantitative-primer", "calculus", "inequalities"]
relatedGames: ["mental-math-sprint"]
---

## Problem

Which is larger, $e^\pi$ or $\pi^e$?

## Hint 1

Take logs of both quantities.

## Hint 2

Compare $\pi$ with $e\log \pi$, or compare $\log x/x$.

## Solution

Take logs:

$$
\log(e^\pi)=\pi,\qquad \log(\pi^e)=e\log \pi.
$$

So we need to compare $\pi/e$ with $\log \pi$.

The function

$$
f(x)=\frac{\log x}{x}
$$

has derivative:

$$
f'(x)=\frac{1-\log x}{x^2}.
$$

It increases until $x=e$ and decreases after $x=e$. Since $\pi>e$, we have:

$$
\frac{\log \pi}{\pi}<\frac{\log e}{e}=\frac{1}{e}.
$$

Thus $e\log \pi<\pi$, so:

$$
\pi^e<e^\pi.
$$

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 17, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
