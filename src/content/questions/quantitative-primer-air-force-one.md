---
title: "Quantitative Primer: Air Force One"
description: "Solve the drunken passenger seat assignment problem."
topic: "Probability"
difficulty: "Medium"
type: "conceptual"
tags: ["quantitative-primer", "recursion", "probability"]
relatedGames: ["event-relationship-game"]
---

## Problem

One hundred people board a plane with exactly 100 assigned seats. The first passenger chooses a random seat. Each later passenger sits in their own seat if available; otherwise they choose a random available seat. What is the probability that the final passenger sits in their assigned seat?

## Hint 1

Only two seats ultimately matter: the first passenger's seat and the last passenger's seat.

## Hint 2

Whenever a displaced passenger chooses an unrelated seat, the same problem restarts with fewer people.

## Solution

Track the process only when someone is displaced. At any such moment, if the displaced passenger chooses seat 1, the chain ends and everyone else, including the last passenger, gets the correct seat. If the displaced passenger chooses seat 100, the last passenger loses their seat.

If the displaced passenger chooses any other seat, the problem restarts with a smaller set of passengers and the same two absorbing outcomes: seat 1 or seat 100.

The last meaningful random choice must be between seat 1 and seat 100. These are equally likely, so:

$$
P(\text{last passenger gets assigned seat})=\frac{1}{2}.
$$

The same result can be shown by recursion: $p_n=\frac{1}{n}(1+p_{n-1}+p_{n-2}+\cdots+p_2+0)$, with $p_2=1/2$, giving $p_n=1/2$ for all $n\ge 2$.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Section 2.1 "Air Force One", licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
