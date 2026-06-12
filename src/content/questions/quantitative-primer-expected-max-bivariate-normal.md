---
title: "Quantitative Primer: Expected Max of Correlated Normals"
description: "Compute the expected maximum of two standard normal variables with correlation rho."
topic: "Probability"
difficulty: "Hard"
type: "proof"
tags: ["quantitative-primer", "normal-distribution", "expectation"]
relatedConcepts: ["bayes-rule-for-quant-interviews"]
relatedGames: ["random-variable-transformer"]
---

## Problem

Let

$$
\begin{bmatrix}X\\Y\end{bmatrix}
\sim N\left(
\begin{bmatrix}0\\0\end{bmatrix},
\begin{bmatrix}1&\rho\\ \rho&1\end{bmatrix}
\right).
$$

Find $\mathrm{E}[\max(X,Y)]$.

## Hint 1

Use $\max(X,Y)=\frac{X+Y+|X-Y|}{2}$.

## Hint 2

$X-Y\sim N(0,2(1-\rho))$.

## Solution

Use the identity:

$$
\max(X,Y)=\frac{X+Y+|X-Y|}{2}.
$$

Since $\mathrm{E}[X]=\mathrm{E}[Y]=0$,

$$
\mathrm{E}[\max(X,Y)]
=\frac{1}{2}\mathrm{E}[|X-Y|].
$$

Now

$$
\operatorname{Var}(X-Y)=1+1-2\rho=2(1-\rho),
$$

so $X-Y\sim N(0,2(1-\rho))$. If $Z\sim N(0,\sigma^2)$, then

$$
\mathrm{E}|Z|=\sigma\sqrt{\frac{2}{\pi}}.
$$

Here $\sigma=\sqrt{2(1-\rho)}$, so:

$$
\mathrm{E}[\max(X,Y)]
=\frac{1}{2}\sqrt{2(1-\rho)}\sqrt{\frac{2}{\pi}}
=\sqrt{\frac{1-\rho}{\pi}}.
$$

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 2, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed, alternate identity-based derivation, and reformatted for UBCTG Quant Prep.
