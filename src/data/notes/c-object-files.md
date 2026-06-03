---
title: 'C/C++ Build Artifacts: .o, .a, and .so Files'
date: 2026-06-02
description: A breakdown of the three file types produced during C/C++ compilation — Object Files, Static Libraries, and Shared Objects
tags: ['C/C++']
type: writing
---

I stumbled into this topic while reading about C interop in Golang and Zig — and kept hitting `.o`, `.a`, and `.so` with no explanation. So I looked it up.

# .o Files (Object Files)

Think of a `.o` file as the raw, half-finished product of compiling a single source file. When the compiler chews through a `.c` or `.cpp` file, it outputs an `.o` containing machine code and a symbol table for that one module — but it hasn't been joined to anything else yet. Incomplete on its own, basically.

```bash
gcc -c main.c -o main.o
gcc -c geometry.c -o geometry.o
```

(Windows calls these `.obj` files. Same idea.)

# .a Files (Archive / Static Library)

A `.a` file is a static library — "archive" is what the 'a' stands for, in case you were wondering. It's a collection of `.o` files bundled together using the `ar` tool. Instead of juggling a dozen individual object files when distributing reusable code, you wrap them all up into one neat package.

```bash
ar rcs libmath.a geometry.o algebra.o
```

The Windows analog is `.lib` (static variant).

## Quick Comparison: .o vs .a

| Feature      | .o File (Object File)                | .a File (Archive / Static Library)           |
| ------------ | ------------------------------------ | -------------------------------------------- |
| What it is   | Compiled machine code for one module | A collection/archive of `.o` files           |
| Creation     | `gcc -c`                             | `ar rcs`                                     |
| Linker Rule  | Pulls in **100%** of its contents    | Pulls in only the specific `.o` units needed |
| Windows Twin | `.obj`                               | `.lib`                                       |

## Detailed Differences

### 1. Compilation Stage and Creation

Here's the distinction most people gloss over. Each source file compiles independently into its own `.o` — no surprises there. But `.a` files are different. You're using `ar` to physically bundle those individual objects into a single archive. Much easier to hand off than a zip full of scattered `.o` files.

### 2. How the Linker Treats Them

This one matters a lot. Arguably the most important difference between the two.

- **.o**: Pass a `.o` directly to the linker and it pulls in everything — every function, every symbol, whether your program actually uses them or not. All of it ends up in your executable.
- **.a**: The linker is smarter here. It checks what symbols your program actually needs, hunts through the archive, and extracts only the relevant `.o` files. The rest gets quietly ignored. Your binary stays lean.

### 3. Command Line Order Sensitivity

Here's a gotcha that has probably wasted someone's afternoon at least once — `.a` files are order-sensitive on the command line. Older GNU linkers scan left to right, so if you put the library before the file that calls it, the linker might skip the whole thing thinking nobody needs it. `.o` files don't have this problem; order simply doesn't matter for them.

## Static Linking Workflow Example

Say you've got a main logic file and some math utilities. Here's the whole flow:

```bash
# 1. Compile source files into individual .o object files
gcc -c main.c -o main.o
gcc -c geometry.c -o geometry.o
gcc -c algebra.c -o algebra.o

# 2. Package your math utilities into a single .a static library
ar rcs libmath.a geometry.o algebra.o

# 3. Final linking step to create an executable
# the -L. means to look in the current directory for libraries
gcc main.o -L. -lmath -o my_program
```

# .so Files (Shared Object / Dynamic Library)

Now this is where things get interesting. A `.so` file — Shared Object — is a dynamic library. Unlike `.o` and `.a`, which get baked directly into your executable at compile time, a `.so` doesn't get included in the binary at all. The program loads it at runtime, when it actually runs.

Windows calls these `.dll` files.

## Full Three-Way Comparison

| Feature      | .o File                | .a File                    | .so File (Shared Object)            |
| ------------ | ---------------------- | -------------------------- | ----------------------------------- |
| Type         | Individual object      | Static library             | **Dynamic library**                 |
| When Linked  | Compile time           | Compile time               | **Runtime** (or startup)            |
| File Size    | Small                  | Large (bundles `.o` files) | **Smallest executable footprint**   |
| Memory       | Duplicated per program | Duplicated per program     | **Shared** across multiple programs |
| Windows Twin | `.obj`                 | `.lib`                     | `.dll`                              |

## Detailed Differences

### 1. Runtime vs. Compile Time

Static libraries get their code physically copied into your executable. The resulting binary is entirely self-contained — run it anywhere, no external dependencies. Convenient.

Shared objects work differently. The linker only drops in a reference, basically a note saying "you'll need `libmath.so` to run this." When the program starts, the OS goes and finds that file, loads it into RAM, and wires everything up on the fly. Which is honestly kind of elegant when you think about it.

### 2. RAM and Disk Efficiency

This is where `.so` files really shine. Imagine five different programs all using the same static math library — you've got five copies on disk and five separate copies loaded in RAM simultaneously. Wasteful.

With a shared library? One copy on disk. And the OS kernel goes a step further: it shares the exact same physical memory pages among all five running programs. The savings add up fast, especially on servers handling dozens of processes at once.

### 3. Maintenance and Updates

Bug in your static library? Tough — you're recompiling every single application that linked against it. Every one.

With `.so` files, you swap out the old library for the patched version and every program picks up the fix automatically on their next launch. No recompilation, no redistributing executables. Just replace the file.

### 4. Compilation Requirement (`-fPIC`)

One thing you can't skip when building `.so` files — compiling your object files with Position Independent Code enabled. This lets the library load into any memory address the OS chooses at runtime, rather than assuming a fixed location.

```bash
gcc -fPIC -c geometry.c -o geometry.o
```

## Dynamic Linking Workflow Example

Same project as before, updated to use a dynamic library instead:

```bash
# 1. Compile source files with Position Independent Code (-fPIC)
gcc -fPIC -c geometry.c -o geometry.o
gcc -fPIC -c algebra.c -o algebra.o

# 2. Package your object files into a single .so dynamic library
gcc -shared geometry.o algebra.o -o libmath.so

# 3. Link your main program against the dynamic library
gcc main.o -L. -lmath -o my_program

# 4. Run the program (OS must know where to find the .so file)
export LD_LIBRARY_PATH=.:$LD_LIBRARY_PATH
./my_program
```

# Summary

|                          | .o                       | .a                    | .so             |
| ------------------------ | ------------------------ | --------------------- | --------------- |
| Purpose                  | Compilation intermediate | Static library bundle | Dynamic library |
| Link Time                | Compile time             | Compile time          | Runtime         |
| Executable Size          | —                        | Larger                | Smaller         |
| Memory Sharing           | No                       | No                    | Yes             |
| Update Without Recompile | —                        | No                    | Yes             |

The choice between static and dynamic linking basically comes down to your priorities. Need a single self-contained binary that runs anywhere with zero dependencies? Static linking is your answer. Care more about memory efficiency and being able to patch a library without touching every application that depends on it? Go dynamic.

Neither is objectively better. It really depends on what you're building.
