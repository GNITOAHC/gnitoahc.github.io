---
title: L-Value & R-Value in C++
date: 2024-05-06
description: The difference between L-Value and R-Value in C++.
readTime: 2 min read
tags: ['C/C++']
type: writing
---

Recently, while wrestling with some issues in C++ variant usage, I stumbled upon a fascinating aspect of C++: the move constructor.
Intrigued by its potential to optimize performance and resolve certain bugs, I decided to delve deeper into its workings.
In my exploration, I came across the concepts of L-Value and R-Value, which are fundamental to understanding the move constructor.

In this blog post, I will try to explain the difference between L-Value & R-Value by grasping some basic concepts and examples.

# L-Values

A L-Value (Locator Value) is an expression that refers to a memory location, such as a variable or an object.
They represent storage locations that can be modified.

```c++
int x = 10; // x is an L-Value
```

In this example, x is an L-value because it represents a memory location where the value 10 is stored. You can assign a new value to x because it is modifiable.

# R-Values

A R-Value (Read Value) is an expression that does not refer to a memory location.
R-Values are typically the result of expressions or computations and cannot appear on the left-hand side (LHS) of an assignment operator (`=`).

```c++
int y = 20; // 20 is an R-Value
```

In this example, `20` is an R-value because it is a temporary value that doesn't have a specific memory location.
You cannot assign a new value to `20` because it is not a modifiable storage location.

# Examples

Here are some additional examples to illustrate the concept:

```c++
int a = 5;       // 'a' is an L-value
int b = a + 3;   // 'a + 3' is an R-value
int& ref = a;    // 'ref' is an L-value reference
int&& rref = 10; // '10' is an R-value reference
```

# Conclusion

L-Values and R-Values are essential concepts in C++ that help distinguish between expressions that refer to memory locations and those that do not.
L-Values represent modifiable storage locations, while R-Values are temporary values that cannot be modified.

In the next blog post, I will explore how these concepts relate to the move constructor and how they can be used to optimize performance in C++ programs.
