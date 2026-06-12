---
title: "Quantitative Primer: Red Socks Half Probability"
description: "Find the smallest number of socks such that two random socks are both red with probability one half."
topic: "Probability"
difficulty: "Hard"
type: "numeric"
tags: ["quantitative-primer", "combinatorics", "diophantine"]
relatedGames: ["card-draw-lab"]
---

## Problem

A bag contains $N$ socks, some black and some red. If two random socks are picked, the probability that both are red is $1/2$. What is the smallest possible $N$?

## Hint 1

Let $r$ be the number of red socks.

## Hint 2

Solve $r(r-1)/(N(N-1))=1/2$ in positive integers.

## Solution

Let $r$ be the number of red socks. Then:

$$
\frac{\binom{r}{2}}{\binom{N}{2}}=\frac{1}{2}.
$$

So:

$$
2r(r-1)=N(N-1).
$$

Search small integer values. $N=2$ cannot work unless both socks are red, which gives probability $1$. For $N=3$, no integer $r$ solves the equation. For $N=4$, $r=3$ works:

$$
r=3,\qquad N=4.
$$

Check:

$$
\frac{\binom{3}{2}}{\binom{4}{2}}
=\frac{3}{6}
=\frac{1}{2}.
$$

Thus the smallest possible total is $N=4$, with 3 red socks and 1 black sock.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 30, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
