---
title: Rust Enums
date: 2024-10-16
description: Article about Rust Enums, including Option, Result and some manipulation examples.
readTime: 5 min read
tags: ['Rust']
type: writing
---

# Rust Enums

Rust enums are a powerful feature that let you model “one of a fixed set of possibilities” in a single type. They shine when a value can be one of a few different things, especially when each possibility carries different data.

In this note, we’ll cover how to define enums, and then dive into Rust’s two most common enums—`Option` and `Result`—plus the control-flow patterns (`match`, `if let`, `let else`) you’ll use to work with them.

- [Defining Enums](#defining-enums)
- [Option](#option)
- [If Let](#if-let)
- [Let Else](#let-else)
- [Result](#result)
- [Unwrap](#unwrap)
- [Question Mark Operator](#question-mark-operator)
- [Pattern Matching](#pattern-matching)
- [Test Cases](#test-cases)

## Defining Enums

For instance, let’s define an enum that represents the `IpAddrKind` type, which can be either `V4` or `V6`:

```rust
enum IpAddrKind {
    V4,
    V6,
}
```

We can create instances of this enum like this:

```rust
let four = IpAddrKind::V4;
let six = IpAddrKind::V6;
```

There’s another advantage to using an enum rather than a struct: each variant can have different types and amounts of associated data.

```rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}
```

A good rule of thumb:

- Use a struct when you have one “shape” of data.
- Use an enum when you have multiple shapes and exactly one is valid at a time.

## Option

`Option<T>` is Rust’s way of representing “a value that might be present.” It replaces the need for `null` in most Rust code.

```rust
enum Option<T> {
    Some(T),
    None,
}
```

Typical use cases:

- Searching (`find`) that may or may not return something
- Parsing that may fail but doesn’t need an error message
- Looking up values in a map

Basic usage:

```rust
fn first_char(s: &str) -> Option<char> {
    s.chars().next()
}

let a = first_char("rust");
let b = first_char("");

assert_eq!(a, Some('r'));
assert_eq!(b, None);
```

### Useful `Option` helpers

Many `Option` workflows can avoid explicit `match` by using combinators:

```rust
let maybe_port: Option<&str> = Some("8080");

let port: Option<u16> = maybe_port
    .map(|s| s.parse::<u16>())
    .ok() // converts Result<u16, _> to Option<u16>
    .flatten();

assert_eq!(port, Some(8080));
```

And when you want a default value:

```rust
let maybe_name: Option<&str> = None;
let name = maybe_name.unwrap_or("anonymous");
assert_eq!(name, "anonymous");
```

If you need to compute a default lazily, use `unwrap_or_else`:

```rust
let computed = None::<i32>.unwrap_or_else(|| 40 + 2);
assert_eq!(computed, 42);
```

## If Let

`if let` is a concise way to handle “one pattern I care about right now” without writing a full `match`.

```rust
let maybe_id: Option<u32> = Some(7);

if let Some(id) = maybe_id {
    println!("id = {id}");
} else {
    println!("no id");
}
```

When it helps:

- You only care about `Some(...)` and want a simple `else` for everything else.
- You want to bind variables from inside the enum variant.

When it doesn’t:

- You need to handle multiple variants differently (use `match`).
- You need exhaustive handling (use `match`).

## Let Else

`let ... else` is useful when you want to _extract_ a value and return/exit early if it doesn’t match.

This reads nicely in functions where you want the “happy path” unindented.

```rust
fn parse_positive(input: &str) -> Option<u32> {
    let Ok(n) = input.parse::<u32>() else {
        return None;
    };

    if n == 0 {
        return None;
    }

    Some(n)
}

assert_eq!(parse_positive("12"), Some(12));
assert_eq!(parse_positive("0"), None);
assert_eq!(parse_positive("nope"), None);
```

The `else` block must diverge (e.g., `return`, `break`, `continue`, or `panic!`). That’s what makes it safe.

## Result

`Result<T, E>` represents either success (`Ok(T)`) or failure (`Err(E)`). Unlike `Option`, it carries _why_ something failed.

```rust
enum Result<T, E> {
    Ok(T),
    Err(E),
}
```

A common example is parsing:

```rust
fn parse_port(s: &str) -> Result<u16, std::num::ParseIntError> {
    s.parse::<u16>()
}

assert!(parse_port("8080").is_ok());
assert!(parse_port("oops").is_err());
```

### Mapping and chaining

`Result` has combinators similar to `Option`:

```rust
fn half_even(n: i32) -> Result<i32, &'static str> {
    if n % 2 != 0 {
        return Err("expected an even number");
    }
    Ok(n / 2)
}

let v = half_even(10).map(|x| x + 1);
assert_eq!(v, Ok(6));

let chained = half_even(10)
    .and_then(half_even) // only runs if previous was Ok
    .map(|x| x * 3);

assert_eq!(chained, Ok(6));
```

## Unwrap

`unwrap()` is a quick way to get the value out of `Option`/`Result`—but it will panic on `None`/`Err`.

It’s fine when:

- You’re writing a small experiment or a quick script.
- A failure truly indicates a programmer error.
- You’re in a test and want it to fail loudly.

In production code, prefer one of these:

- Use `match`/`if let`/`let else` to handle errors explicitly.
- Use `?` to propagate errors.
- Use `unwrap_or`, `unwrap_or_else`, or `expect("meaningful message")`.

Example:

```rust
let maybe = Some("hello");
assert_eq!(maybe.unwrap(), "hello");

// Better than bare unwrap when you are sure it can't fail:
let v = maybe.expect("value should exist here");
assert_eq!(v, "hello");
```

## Question Mark Operator

The `?` operator is the idiomatic way to propagate failures. It works with both `Result` and `Option`.

### With `Result`

If a `Result` is `Ok`, `?` unwraps it. If it’s `Err`, `?` returns early from the current function.

```rust
use std::num::ParseIntError;

fn sum_ports(a: &str, b: &str) -> Result<u16, ParseIntError> {
    let a = a.parse::<u16>()?;
    let b = b.parse::<u16>()?;
    Ok(a + b)
}

assert_eq!(sum_ports("80", "443"), Ok(523));
assert!(sum_ports("nope", "443").is_err());
```

### With `Option`

`?` on an `Option` returns `None` early.

```rust
fn third_char(s: &str) -> Option<char> {
    let mut it = s.chars();
    it.next()?;
    it.next()?;
    it.next()
}

assert_eq!(third_char("rust"), Some('s'));
assert_eq!(third_char("hi"), None);
```

## Pattern Matching

`match` is Rust’s most powerful tool for enums because it is _exhaustive_: you must handle every possible variant (or use `_`).

```rust
fn describe_message(msg: Message) -> String {
    match msg {
        Message::Quit => "quit".to_string(),
        Message::Move { x, y } => format!("move to ({x}, {y})"),
        Message::Write(s) => format!("write: {s}"),
        Message::ChangeColor(r, g, b) => format!("color: {r},{g},{b}"),
    }
}
```

You can add match guards when a pattern needs an extra condition:

```rust
fn classify(n: i32) -> &'static str {
    match n {
        x if x < 0 => "negative",
        0 => "zero",
        1..=9 => "small",
        _ => "large",
    }
}

assert_eq!(classify(-1), "negative");
assert_eq!(classify(7), "small");
```

### Matching `Option` and `Result`

```rust
fn to_status_code(r: Result<(), &'static str>) -> u16 {
    match r {
        Ok(()) => 200,
        Err("not found") => 404,
        Err(_) => 500,
    }
}

assert_eq!(to_status_code(Ok(())), 200);
assert_eq!(to_status_code(Err("not found")), 404);
assert_eq!(to_status_code(Err("boom")), 500);
```

## Test Cases

A few quick tests help lock in behavior, especially when you start chaining combinators and pattern matching.

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn option_unwrap_or() {
        let maybe: Option<i32> = None;
        assert_eq!(maybe.unwrap_or(10), 10);
    }

    #[test]
    fn result_question_mark() {
        fn parse_and_add_one(s: &str) -> Result<i32, std::num::ParseIntError> {
            let n = s.parse::<i32>()?;
            Ok(n + 1)
        }

        assert_eq!(parse_and_add_one("41"), Ok(42));
        assert!(parse_and_add_one("oops").is_err());
    }

    #[test]
    fn match_custom_enum() {
        enum E {
            A,
            B(i32),
        }

        fn value(e: E) -> i32 {
            match e {
                E::A => 0,
                E::B(n) => n,
            }
        }

        assert_eq!(value(E::A), 0);
        assert_eq!(value(E::B(7)), 7);
    }
}
```

If you want to practice, try rewriting one section using a different style:

- Replace an `if let` with a `match`.
- Replace a `match` with `if let` + `else` (only when you truly don’t care about the other cases).
- Replace explicit error handling with `?` in a helper function.
