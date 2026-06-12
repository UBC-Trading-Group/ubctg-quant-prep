---
title: "Quantitative Primer: Romeo and Juliet Meeting"
description: "Use unit-square geometry to find the probability that two random arrivals overlap."
topic: "Probability"
difficulty: "Medium"
type: "numeric"
tags: ["quantitative-primer", "geometry", "uniform"]
relatedGames: ["dice-probability-grid"]
---

## Problem

Romeo and Juliet agree to meet between 08:00 and 09:00. Each arrives at a random time in the hour and waits 15 minutes. What is the probability that they meet?

## Hint 1

Let their arrival times be $X,Y\sim U(0,60)$.

## Hint 2

They meet if $|X-Y|\le 15$.

## Solution

Scale the hour to the unit interval. Waiting 15 minutes is waiting $1/4$ of the interval.

They meet when:

$$
|X-Y|\le \frac{1}{4}.
$$

In the unit square, the invalid region consists of two corner triangles where $|X-Y|>1/4$. Each triangle has side length $3/4$, so total invalid area is:

$$
2\cdot \frac{1}{2}\left(\frac{3}{4}\right)^2=\frac{9}{16}.
$$

Therefore:

$$
P(\text{meet})=1-\frac{9}{16}=\frac{7}{16}.
$$

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 24, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
