---
title: "Quantitative Primer: Covariance Zero and Independence"
description: "Explain why zero covariance does not generally imply independence."
topic: "Probability"
difficulty: "Easy"
type: "conceptual"
tags: ["quantitative-primer", "covariance", "independence"]
relatedConcepts: ["bayes-rule-for-quant-interviews"]
relatedGames: ["event-relationship-game"]
---

## Problem

If $\operatorname{Cov}(X,Y)=0$, are $X$ and $Y$ independent?

## Hint 1

Independence implies zero covariance when moments exist.

## Hint 2

The converse is not true in general.

## Solution

No. Zero covariance means no linear relationship:

$$
\operatorname{Cov}(X,Y)=\mathrm{E}[XY]-\mathrm{E}[X]\mathrm{E}[Y]=0.
$$

But variables can have a nonlinear relationship and still have zero covariance. For example, if $X\sim N(0,1)$ and $Y=X^2$, then $Y$ is determined by $X$, so the variables are dependent. Yet:

$$
\operatorname{Cov}(X,X^2)=\mathrm{E}[X^3]-\mathrm{E}[X]\mathrm{E}[X^2]=0.
$$

So independence is stronger than zero covariance. A notable exception is the jointly normal case, where zero covariance does imply independence.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 20, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
