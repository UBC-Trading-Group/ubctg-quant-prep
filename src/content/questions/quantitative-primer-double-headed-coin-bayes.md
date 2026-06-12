---
title: "Quantitative Primer: Double-Headed Coin Bayes"
description: "Use Bayes' rule after observing ten heads from a randomly selected coin."
topic: "Bayes Rule"
difficulty: "Medium"
type: "numeric"
tags: ["quantitative-primer", "bayes", "coins"]
relatedConcepts: ["bayes-rule-for-quant-interviews"]
relatedGames: ["mental-math-sprint"]
---

## Problem

A bag contains 1000 coins. One is double-headed and the other 999 are fair. A coin is selected at random and flipped ten times. It lands heads all ten times. What is the probability that the selected coin is the double-headed coin?

## Hint 1

Compare the probability of the evidence under each coin type.

## Hint 2

Use Bayes' rule with prior $1/1000$.

## Solution

Let $R$ be the event that the selected coin is rigged, and let $10H$ be ten heads in a row.

$$
P(R|10H)=\frac{P(10H|R)P(R)}{P(10H|R)P(R)+P(10H|F)P(F)}.
$$

Substitute:

$$
P(10H|R)=1,\quad P(R)=\frac{1}{1000},\quad P(10H|F)=\frac{1}{1024},\quad P(F)=\frac{999}{1000}.
$$

Then:

$$
P(R|10H)
=\frac{1/1000}{1/1000+(999/1000)(1/1024)}
=\frac{1024}{2023}.
$$

So the probability is slightly above $1/2$.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 41, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
