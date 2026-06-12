---
title: "Monty Hall: Should You Switch?"
description: "A classic conditional probability problem with a clean interview explanation."
topic: "Conditional Probability"
difficulty: "Easy"
type: "conceptual"
tags: ["conditional-probability", "bayes", "games"]
relatedConcepts: ["bayes-rule-for-quant-interviews"]
relatedGames: ["mental-math-sprint"]
---

## Problem

Three doors hide one prize and two blanks. You pick one door. The host, who knows where the prize is, opens a different blank door. Should you switch?

## Hint 1

Your original choice had probability $1/3$ of being correct.

## Hint 2

The host's action concentrates the remaining $2/3$ probability on the unopened door.

## Solution

You should switch. Your first pick wins with probability $1/3$. The other two doors collectively had probability $2/3$. After the host opens a blank among them, the unopened other door carries that $2/3$ chance.
