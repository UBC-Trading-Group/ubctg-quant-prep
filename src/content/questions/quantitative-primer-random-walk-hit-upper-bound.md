---
title: "Quantitative Primer: Random Walk Hit Upper Bound"
description: "Find the probability a simple random walk hits l before 0."
topic: "Probability"
difficulty: "Hard"
type: "proof"
tags: ["quantitative-primer", "random-walk", "martingale"]
relatedGames: ["red-black-optimal-stopping"]
---

## Problem

Let

$$
X_t=\sum_{i=1}^t Z_i,\qquad P(Z_i=1)=P(Z_i=-1)=0.5.
$$

If the process currently starts at $X_0=k$, what is the probability it hits $l$ before hitting $0$, where $k<l$?

## Hint 1

Let $p_k$ be the desired probability starting from $k$.

## Hint 2

Use $p_k=\frac{1}{2}p_{k-1}+\frac{1}{2}p_{k+1}$ with boundary conditions.

## Solution

Let $p_k=P(\text{hit }l\text{ before }0\mid X_0=k)$. For $0<k<l$:

$$
p_k=\frac{1}{2}p_{k-1}+\frac{1}{2}p_{k+1}.
$$

The boundary conditions are:

$$
p_0=0,\qquad p_l=1.
$$

The recursion says $p_k$ is linear in $k$, so write $p_k=ak+b$. The boundaries give $b=0$ and $al=1$, so $a=1/l$.

Therefore:

$$
p_k=\frac{k}{l}.
$$

A martingale proof reaches the same result by applying optional stopping to $X_t$ at the first hitting time of $0$ or $l$.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 38, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
