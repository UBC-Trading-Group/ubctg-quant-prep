---
title: "Quantitative Primer: Imperfect Disease Test"
description: "Use Bayes' rule to compute the probability of disease after a positive test."
topic: "Bayes Rule"
difficulty: "Easy"
type: "numeric"
tags: ["quantitative-primer", "bayes", "base-rate"]
relatedConcepts: ["bayes-rule-for-quant-interviews"]
relatedGames: ["mental-math-sprint"]
---

## Problem

One percent of people have a disease. A test shows positive with probability $80\%$ if someone has the disease, and has a $10\%$ false-positive rate if they do not. What is the probability that you have the disease given a positive test?

## Hint 1

Use Bayes' rule.

## Hint 2

Most positive tests may come from the much larger healthy group.

## Solution

Let $D$ be the event of having the disease and $+$ be the event of a positive test. Then:

$$
P(D|+)=\frac{P(+|D)P(D)}{P(+|D)P(D)+P(+|\neg D)P(\neg D)}.
$$

Substitute:

$$
P(D|+)=\frac{0.80(0.01)}{0.80(0.01)+0.10(0.99)}
=\frac{0.008}{0.107}
\approx 0.0748.
$$

So the probability is about $7.5\%$.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 15, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
