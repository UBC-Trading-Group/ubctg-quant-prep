---
title: "Quantitative Primer: Derivative of an Inverse Function"
description: "Derive the derivative of g inverse from g prime."
topic: "Calculus"
difficulty: "Easy"
type: "proof"
tags: ["quantitative-primer", "calculus", "inverse-functions"]
relatedGames: ["mental-math-sprint"]
---

## Problem

If we know $g'(x)$, what can we say about $\frac{d}{dx}g^{-1}(x)$?

## Hint 1

Start from $g(g^{-1}(x))=x$.

## Hint 2

Differentiate both sides using the chain rule.

## Solution

Start with the identity:

$$
g(g^{-1}(x))=x.
$$

Differentiate both sides:

$$
g'(g^{-1}(x))\frac{d}{dx}g^{-1}(x)=1.
$$

Therefore:

$$
\frac{d}{dx}g^{-1}(x)=\frac{1}{g'(g^{-1}(x))}.
$$

This assumes the inverse exists and $g'(g^{-1}(x))\neq 0$.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 9, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
