---
title: "Quantitative Primer: Two Dice Comparison"
description: "Find the probability that one die is larger than the other."
topic: "Probability"
difficulty: "Easy"
type: "numeric"
tags: ["quantitative-primer", "dice", "probability"]
relatedConcepts: ["expected-value-vs-fair-price"]
relatedGames: ["dice-probability-grid"]
---

## Problem

Roll two fair six-sided dice. What is the probability that one is larger than the other?

## Hint 1

Count the outcomes in the $6 \times 6$ grid.

## Hint 2

The only outcomes where neither die is larger are the diagonal ties.

## Solution

There are $36$ equally likely ordered outcomes. The two dice are equal in $6$ outcomes:

$$
(1,1),(2,2),\ldots,(6,6).
$$

So the probability that one die is larger than the other, without specifying which die, is:

$$
\frac{36 - 6}{36} = \frac{30}{36} = \frac{5}{6}.
$$

If the intended question is "what is the probability that die A is larger than die B?", then symmetry gives half of the non-tie cases:

$$
\frac{15}{36} = \frac{5}{12}.
$$

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 1, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
