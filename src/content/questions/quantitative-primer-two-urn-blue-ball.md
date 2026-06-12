---
title: "Quantitative Primer: Two Urns and Blue Balls"
description: "Maximize the probability of drawing a blue ball by distributing balls across two urns."
topic: "Probability"
difficulty: "Medium"
type: "numeric"
tags: ["quantitative-primer", "optimization", "probability"]
relatedConcepts: ["expected-value-vs-fair-price"]
relatedGames: ["ev-take-or-pass"]
---

## Problem

You have two urns, five red balls, and five blue balls. You may distribute the balls however you like, but each urn must contain at least one ball. An urn is chosen uniformly at random, then one ball is drawn. If the ball is blue, you win. How should you distribute the balls?

## Hint 1

Put one blue ball alone in one urn.

## Hint 2

Then put all remaining balls in the other urn.

## Solution

Put one blue ball in urn 1, and put the other nine balls in urn 2. Then:

$$
P(\text{blue})=\frac{1}{2}(1)+\frac{1}{2}\left(\frac{4}{9}\right).
$$

So:

$$
P(\text{blue})=\frac{1}{2}+\frac{2}{9}=\frac{13}{18}.
$$

This is better than splitting the balls evenly, which would give $1/2$. The trick is to create one urn with a guaranteed blue draw, while preserving a reasonable blue fraction in the other urn.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 12, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
