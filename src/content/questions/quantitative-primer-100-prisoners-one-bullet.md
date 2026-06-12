---
title: "Quantitative Primer: One Bullet and 100 Prisoners"
description: "Use a deterministic punishment rule to stop every prisoner from escaping."
topic: "Game Theory"
difficulty: "Medium"
type: "conceptual"
tags: ["quantitative-primer", "game-theory", "logic"]
relatedGames: ["red-black-optimal-stopping"]
---

## Problem

You are guarding 100 prisoners in a field and have a gun with a single bullet. If any prisoner has a non-zero probability of surviving an escape attempt, he will try to escape. If he is certain to die, he will not. How do you stop them from escaping?

## Hint 1

You need to make each individual prisoner certain that he would be the one shot.

## Hint 2

Use a pre-announced deterministic ordering.

## Solution

Announce that if anyone attempts to escape, you will shoot the prisoner with the lowest assigned number among those who run.

Prisoner 1 now has zero chance of survival if he runs, so he will not run. Given prisoner 1 will not run, prisoner 2 would be the lowest-numbered escaping prisoner if he runs, so he also will not run. Continue by induction: each prisoner knows all lower-numbered prisoners will stay, so running would make him the lowest-numbered runner and therefore certain to be shot.

Thus no prisoner has a non-zero survival probability from attempting escape, and no one runs.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 27, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
