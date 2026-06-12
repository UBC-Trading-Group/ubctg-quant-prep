---
title: "Quantitative Primer: Stick Breaking Triangle"
description: "Find the probability that two random breaks of a stick form a triangle."
topic: "Probability"
difficulty: "Medium"
type: "numeric"
tags: ["quantitative-primer", "geometry", "probability"]
relatedGames: ["dice-probability-grid"]
---

## Problem

Break a 1m stick in two random places. What is the probability that the three resulting pieces form a triangle?

## Hint 1

A triangle forms exactly when the largest piece is shorter than $1/2$.

## Hint 2

Draw the two break points as $(x,y)$ in the unit square.

## Solution

Let the two break points be $x,y\sim U(0,1)$. The three pieces form a triangle iff no piece is at least half the stick.

In the unit square, the invalid cases are:

1. the left piece is at least $1/2$,
2. the middle piece is at least $1/2$,
3. the right piece is at least $1/2$.

Equivalently, the valid region is the central diamond/square formed by requiring all three lengths to be less than $1/2$. Its area is:

$$
\frac{1}{4}.
$$

Since $(x,y)$ is uniform over the unit square, the probability is the area:

$$
P(\text{triangle})=\frac{1}{4}.
$$

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 21 and Section 2.2, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
