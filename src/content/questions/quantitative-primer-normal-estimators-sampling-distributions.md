---
title: "Quantitative Primer: Normal Estimators and Sampling Distributions"
description: "Estimate normal parameters and identify the sampling distributions of the estimates."
topic: "Statistics"
difficulty: "Hard"
type: "conceptual"
tags: ["quantitative-primer", "sampling-distribution", "normal-distribution"]
relatedGames: ["distribution-builder"]
---

## Problem

Suppose $Y\sim N(\mu,\sigma^2)$. One million people each draw $1000$ samples and estimate $\mu$ and $\sigma^2$. How should they estimate the parameters, and what would the histograms of the estimates look like?

## Hint 1

Use the sample mean and unbiased sample variance.

## Hint 2

For normal data, the sample mean is normal and the scaled sample variance is chi-squared.

## Solution

For person $i$, estimate:

$$
\hat{\mu}_i=\bar{Y}_i=\frac{1}{n}\sum_{j=1}^n Y_{ij}
$$

and

$$
\hat{\sigma}_i^2=\frac{1}{n-1}\sum_{j=1}^n (Y_{ij}-\bar{Y}_i)^2.
$$

The sample mean has:

$$
\bar{Y}_i\sim N\left(\mu,\frac{\sigma^2}{n}\right).
$$

For normal samples, the variance estimator satisfies:

$$
\frac{(n-1)\hat{\sigma}_i^2}{\sigma^2}\sim \chi^2_{n-1}.
$$

So the histogram of $\hat{\mu}_i$ will look normal and centered at $\mu$. The histogram of $\hat{\sigma}_i^2$ will be a scaled chi-squared distribution, centered at $\sigma^2$ when using the $n-1$ denominator.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 8, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
