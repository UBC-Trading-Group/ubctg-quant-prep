---
title: "Bayes Rule for Quant Interviews"
description: "A compact way to update probabilities after observing new information."
topic: "Conditional Probability"
difficulty: "Beginner"
tags: ["bayes", "probability", "conditional-probability"]
relatedGames: ["mental-math-sprint"]
relatedQuestions: ["bayes-biased-coin"]
---

Bayes rule updates a prior probability after evidence arrives.

$$
P(A \mid B) = \frac{P(B \mid A)P(A)}{P(B)}
$$

In interview problems, the hard part is usually defining the event space clearly. Once the events are named, the formula is mechanical.

## Intuition

The numerator is the probability that both the hypothesis and evidence happen. The denominator normalizes across every way the evidence could happen.

## Common Mistake

Do not confuse \(P(A \mid B)\) with \(P(B \mid A)\). They are often very different.
