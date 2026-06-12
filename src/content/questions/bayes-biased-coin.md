---
title: "Bayes: Biased Coin"
description: "Update the probability that a chosen coin is biased after observing heads."
topic: "Conditional Probability"
difficulty: "Medium"
type: "numeric"
tags: ["bayes", "coins", "probability"]
relatedConcepts: ["bayes-rule-for-quant-interviews"]
relatedGames: ["mental-math-sprint"]
---

## Problem

A box has one fair coin and one biased coin that lands heads with probability $0.8$. You pick one coin uniformly at random and flip heads. What is the probability you picked the biased coin?

## Hint 1

Use Bayes rule with the event $B$ for biased coin and $H$ for heads.

## Hint 2

The total probability of heads is $0.5(0.8) + 0.5(0.5)$.

## Solution

$$
P(B \mid H) = \frac{P(H \mid B)P(B)}{P(H)}
$$

$$
P(B \mid H) = \frac{0.8 \cdot 0.5}{0.8 \cdot 0.5 + 0.5 \cdot 0.5}
= \frac{0.4}{0.65}
= 0.615
$$

The posterior probability is about $61.5\%$.
