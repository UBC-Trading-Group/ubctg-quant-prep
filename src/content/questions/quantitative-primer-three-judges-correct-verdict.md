---
title: "Quantitative Primer: Three Judges"
description: "Compute the probability that a majority vote reaches the correct verdict."
topic: "Probability"
difficulty: "Medium"
type: "numeric"
tags: ["quantitative-primer", "conditional-probability", "voting"]
relatedGames: ["event-relationship-game"]
---

## Problem

Three judges have probabilities of reaching the correct verdict $p$, $p$, and $1/2$. A verdict is decided by majority vote. What is the probability that the court reaches the correct verdict?

## Hint 1

Condition on whether the third judge is correct.

## Hint 2

The first two judges have the same accuracy.

## Solution

The majority is correct if at least two judges are correct. Let the first two judges have accuracy $p$, and the third have accuracy $1/2$.

The probability all three are correct is:

$$
p^2\cdot \frac{1}{2}.
$$

The probability exactly two are correct is:

$$
p^2\cdot \frac{1}{2}
+2\left(p(1-p)\cdot \frac{1}{2}\right).
$$

Adding the cases for at least two correct:

$$
P(\text{correct majority})
=p^2\cdot \frac{1}{2}+p^2\cdot \frac{1}{2}+p(1-p)
=p.
$$

The random judge with accuracy $1/2$ does not change the court's accuracy; the majority decision has probability $p$ of being correct.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 13, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
