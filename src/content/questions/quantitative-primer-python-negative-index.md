---
title: "Quantitative Primer: Python Negative Index"
description: "Explain what mylist[-1] means in Python."
topic: "Programming"
difficulty: "Easy"
type: "coding"
tags: ["quantitative-primer", "python", "lists"]
relatedGames: ["mental-math-sprint"]
---

## Problem

If `mylist` is a list in Python, what is `mylist[-1]`?

## Hint 1

Python supports negative indexing from the end of a sequence.

## Hint 2

`-1` is the last valid negative index.

## Solution

`mylist[-1]` returns the last item in the list.

```python
mylist = [10, 20, 30]
mylist[-1]  # 30
```

Similarly, `mylist[-2]` returns the second-to-last item. This differs from R indexing, where negative indices commonly mean "exclude this position."

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 4, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed and reformatted for UBCTG Quant Prep.
