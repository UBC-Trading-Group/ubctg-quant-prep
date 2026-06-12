---
title: "Quantitative Primer: C++ Virtual Functions"
description: "Explain virtual functions and why they matter in C++."
topic: "Programming"
difficulty: "Medium"
type: "coding"
tags: ["quantitative-primer", "cpp", "polymorphism"]
relatedGames: ["make-me-a-market"]
---

## Problem

What is a C++ virtual function, and why do we need them?

## Hint 1

Think about a base-class pointer pointing to a derived-class object.

## Hint 2

The key phrase is runtime polymorphism.

## Solution

A virtual function is a member function declared in a base class that can be overridden in derived classes. When the function is called through a base-class pointer or reference, C++ chooses the correct implementation at runtime.

```cpp
struct Instrument {
  virtual double price() const = 0;
};

struct Option : Instrument {
  double price() const override { return 4.25; }
};
```

This lets generic code work with an `Instrument*` while still calling the `Option` pricing method when the underlying object is an option. Without virtual functions, the compiler would bind calls statically to the base-class method, making extensible interfaces much harder to design.

Virtual functions are used for runtime polymorphism, abstraction, and separating an interface from the implementation chosen by each derived class.

## Attribution

Adapted from Dirk Bester, *An Interview Primer for Quantitative Finance*, v1.2.0 (2017), Question 5, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Changes: condensed, example changed, and reformatted for UBCTG Quant Prep.
