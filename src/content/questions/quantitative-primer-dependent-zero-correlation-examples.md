---
title: "Quantitative Primer: Dependent but Uncorrelated Examples"
description: "Give examples of dependent random variables with zero correlation."
topic: "Probability"
difficulty: "Medium"
type: "conceptual"
tags: ["quantitative-primer", "correlation", "dependence"]
relatedConcepts: ["bayes-rule-for-quant-interviews"]
relatedGames: ["event-relationship-game"]
---

## Problem

Give examples where $X$ and $Y$ are dependent but $\rho_{XY}=0$.

## Hint 1

Try a symmetric $X$ and a nonlinear function of $X$.

## Hint 2

$\operatorname{Cov}(X,X^2)=\mathrm{E}[X^3]-\mathrm{E}[X]\mathrm{E}[X^2]$.

## Solution

Let $X\sim N(0,1)$ and set $Y=X^2$. Then $Y$ is completely determined by $X$, so the variables are dependent.

But:

$$
\operatorname{Cov}(X,Y)=\operatorname{Cov}(X,X^2)
=\mathrm{E}[X^3]-\mathrm{E}[X]\mathrm{E}[X^2].
$$

For a centered normal distribution, $\mathrm{E}[X]=0$ and $\mathrm{E}[X^3]=0$, so:

$$
\operatorname{Cov}(X,X^2)=0.
$$

Thus zero covariance does not imply independence.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 11.a, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
