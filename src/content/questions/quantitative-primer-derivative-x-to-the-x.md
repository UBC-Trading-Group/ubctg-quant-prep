---
title: "Quantitative Primer: Derivative of x to the x"
description: "Differentiate x^x using logarithmic differentiation."
topic: "Calculus"
difficulty: "Easy"
type: "numeric"
tags: ["quantitative-primer", "calculus", "derivatives"]
relatedGames: ["mental-math-sprint"]
---

## Problem

What is $\frac{d}{dx}x^x$?

## Hint 1

Take logs first.

## Hint 2

Write $x^x=e^{x\log x}$.

## Solution

For $x>0$,

$$
x^x=e^{x\log x}.
$$

Differentiate:

$$
\frac{d}{dx}x^x
=e^{x\log x}\frac{d}{dx}(x\log x).
$$

Since

$$
\frac{d}{dx}(x\log x)=\log x+1,
$$

the derivative is:

$$
\frac{d}{dx}x^x=x^x(\log x+1).
$$

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 16, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
