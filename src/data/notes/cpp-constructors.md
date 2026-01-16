---
title: C++ Move Constructor
date: 2024-05-08
description: Introduction to move constructors in C++ and a brief description of all four kinds of constructors.
readTime: 5 min read
tags: ['C/C++']
type: writing
---

# C++ Constructor Introduction

In the previous blog post, we talked about lvalues and rvalues in C++.
Now, let’s explore more advanced concepts like lvalue references, rvalue references, and move constructors.

## Lvalue Reference

An lvalue reference, denoted by `&`, is a reference that can bind to existing objects (typically lvalues).

- Lvalue references can be used to alias an existing object.
- They can also be used to implement pass-by-reference semantics.

For example:

```cpp
void swap(int& x, int& y) {
    int tmp = x;
    x = y;
    y = tmp;
}
```

## Rvalue Reference

In contrast, an rvalue reference, denoted by `&&`, is a reference that can bind to temporary objects (typically rvalues).
Rvalue references play a crucial role in enabling move semantics, allowing the efficient transfer of resources from temporary objects to newly constructed ones.

> Temporary object: An unnamed object created by the compiler to hold a temporary value.

For example:

```cpp
#include <iostream>

void printRefValue(int&& x) {
    std::cout << x << std::endl;
}

int main() {
    printRefValue(100);
    return 0;
}
```

## Move Constructor

Move constructors are special member functions that facilitate the efficient transfer of resources from one object to another.
They are most commonly used when the source object is a temporary (an rvalue), and the goal is to avoid expensive deep copies.

A moved-from object should remain valid (safe to destroy and assign to), but its state is typically unspecified.

### Syntax

```cpp
class MyClass {
  public:
    MyClass(MyClass&& other) noexcept {
        // Transfer resources from other to *this
    }
};
```

### Characteristics

- Efficient resource transfer: The primary purpose of a move constructor is to transfer resources (such as dynamically allocated memory, file handles, or other costly-to-copy resources) from the source object to the newly constructed object. This transfer typically involves pointer swaps or other lightweight operations, avoiding expensive deep copying.
- Declared as `noexcept`: Move constructors are often declared as `noexcept`, indicating they do not throw exceptions. This matters for certain optimizations and guarantees in the C++ standard library (especially for containers).
- Automatically generated: If a class does not explicitly define a move constructor, the compiler may generate one automatically under certain conditions.

### Use Cases

First, move constructors can significantly improve performance, especially when dealing with large objects or resource-heavy types.
By efficiently transferring resources instead of copying them, move constructors can reduce allocations and improve execution speed.

Second, many standard library containers and algorithms in C++ take advantage of move semantics to optimize memory management and performance.
Using move constructors allows you to benefit from these optimizations when working with containers like `std::vector`, `std::string`, or `std::unique_ptr`.

For example (a minimal, safer “owning pointer” demo):

```cpp
#include <iostream>
#include <utility>

class MyClass {
  public:
    explicit MyClass(int v) : data(new int(v)) {}

    // Disable copying for this demo to avoid double-free.
    MyClass(const MyClass&) = delete;
    MyClass& operator=(const MyClass&) = delete;

    MyClass(MyClass&& other) noexcept : data(other.data) {
        other.data = nullptr;
    }

    MyClass& operator=(MyClass&& other) noexcept {
        if (this != &other) {
            delete data;
            data = other.data;
            other.data = nullptr;
        }
        return *this;
    }

    ~MyClass() { delete data; }

    int* data = nullptr;
};

int main() {
    MyClass myclass(5);
    MyClass newclass(std::move(myclass));

    std::cout << "newclass.data = " << *newclass.data << std::endl;
    return 0;
}
```

### Rule of Five (and Rule of Zero)

When your type directly manages a resource (like a raw pointer, file handle, mutex, etc.), you need to think about C++’s _special member functions_.

The **Rule of Five** says: if you define (or meaningfully customize) any of these, you should usually consider defining all of them:

- Destructor
- Copy constructor
- Copy assignment operator
- Move constructor
- Move assignment operator

The goal is to prevent bugs like double-free, leaks, or accidentally expensive copies.

In modern C++, a common alternative is the **Rule of Zero**: avoid owning raw resources directly, and instead store RAII types like `std::unique_ptr`, `std::vector`, or `std::string`. Then the compiler-generated special member functions are usually correct.

### Advanced Usage

Consider the following example:

```cpp
#include <iostream>
#include <vector>

class Obj {
  public:
    Obj() {
        std::cout << "Constructing Obj" << std::endl;
    }

    Obj(Obj&& other) noexcept {
        (void)other;
        std::cout << "Move constructor invoked" << std::endl;
    }

    // Other member functions ...
};

int main() {
    std::vector<Obj> vec;

    // Inserting Obj into the vector may invoke the move constructor.
    vec.push_back(Obj());
    return 0;
}
```

Expected output:

```txt
Constructing Obj
Move constructor invoked
```

Explanation:

The default constructor is called first when the temporary object is created.
Then, the move constructor may be invoked when the temporary object is moved into the vector.

Note: In real code, whether the move happens can depend on optimization and overload resolution (e.g., `push_back` vs `emplace_back`), but the example demonstrates the general idea.

## Other Constructors in C++

C++ commonly refers to four constructor categories:

1. Default constructor

   ```cpp
   class ClassName {
     public:
       ClassName() { /* Body of constructor */ }
   };
   ```

   A constructor that doesn’t take any arguments.

2. Parameterized constructor

   ```cpp
   class ClassName {
     public:
       ClassName(int x) { /* Body logic */ }
   };
   ```

   A constructor that accepts parameters.

3. Copy constructor

   ```cpp
   class ClassName {
     public:
       ClassName(const ClassName& other) { /* Copy from other */ }
   };
   ```

   A constructor that initializes an object using another object of the same class.

4. Move constructor

   ```cpp
   class ClassName {
     public:
       ClassName(ClassName&& other) noexcept { /* Move from other */ }
   };
   ```

   A constructor that initializes an object by taking over resources from an rvalue (often a temporary).

## Conclusion

Understanding move constructors in C++ is essential for optimizing performance, managing resources efficiently, and writing expressive and robust code.
Try using move constructors in your next C++ project and see where they help simplify ownership and improve performance.

Happy coding!
