---
title: "Quantitative Primer: Aces After Shredding Cards"
description: "Find the probability of drawing two aces after randomly discarding cards."
topic: "Probability"
difficulty: "Easy"
type: "numeric"
tags: ["quantitative-primer", "cards", "combinatorics"]
relatedGames: ["card-draw-lab"]
---

## Problem

A 52-card deck is shuffled, then 20 cards are randomly discarded. You draw two cards from what remains. What is the probability that both are aces?

## Hint 1

Randomly discarding cards before your draw does not change the distribution of your two-card hand.

## Hint 2

Use combinations or sequential probabilities.

## Solution

Your final two-card hand is equivalent to a random two-card hand from the original deck. Therefore:

$$
P(\text{two aces})=\frac{\binom{4}{2}}{\binom{52}{2}}.
$$

Compute:

$$
\frac{\binom{4}{2}}{\binom{52}{2}}
=\frac{6}{1326}
=\frac{1}{221}.
$$

Equivalently:

$$
\frac{4}{52}\cdot\frac{3}{51}=\frac{1}{221}.
$$

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 40, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
