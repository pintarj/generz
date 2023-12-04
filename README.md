# generz
![Node.js CI](https://github.com/pintarj/generz/workflows/Node.js%20CI/badge.svg?branch=master) [![install size](https://packagephobia.now.sh/badge?p=generz)](https://packagephobia.now.sh/result?p=generz)

A programming (?) language that generates code for building compilers.

---
## Preface

Compilers have various architectures. The [most common one](https://cs.lmu.edu/~ray/notes/compilerarchitecture/) is building a pipeline, consisting in some phases, where output of one phase is the input for the next phase. Compilers are commonly separated in *front-end* (source language dependent) and *back-end* (source language independent):

- Front-end
    - Lexical analysis
    - Syntax analysis
    - Semantic analysis
- Back-end
    - Intermediate code generation
    - Code optimization
    - Target code generation

The *de facto* standard for the *back-end* implementation is the [LLVM](https://llvm.org/) project.

Meanwhile, as the *front-end* is source language dependant, it's implementation is generally coded (manually written and/or partially generated) by the compiler's developers.

---
## Description

The purpose of `generz` is to generate **highly-optimized code**\*, that implements specific *lexical and syntax analysis* phases, AKA code that accepts input source (sequence of characters) and emits AST ([Abstract Syntax Tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree)), leaving to the developers of a compiler to implement just the *semantic analysis* and interact with the *intermediate code generation*.

The behavior of the generated phases is described with the [**Generz Language**](#generz-language) (`.erz` source files).


\*As *highly-optimized code* is intended that kind of code that sacrifices readability in favor of performances, reducing everything to a low-level of abstraction and builds an API that should be considered as a magical black box, that transform the input in the proper output.

---
## Project status

**TLDR**: `.erz` source files can be validated, but nothing is produced yet.

The architecture of `generz` also include phases, some of them *(lexical, syntax, derivation-tree and semantic analysis)* are already implemented. Those allow the `.erz` source files to be validated but no code is actually generated.

The following steps would be:

### `v0.7` - Intermediate code generation

This phase would generate IC (or [Intermediate representation](https://en.wikipedia.org/wiki/Intermediate_representation)). Still nothing is produced.

### `v0.8` - Output code generation (TypeScript)

This phase would produce the actual code that (at this point) would be only capable of validating a source code, without building the AST.

> Generated code for TypeScript, why? Because `generz` itself is written in TypeScript and one of the first things it should do is generating code for itself. Obviously the next targets are C++ and Rust. 

### `v0.9` - Language capable of building AST

Design the language so that is becomes capable of building AST from the derivation-tree, using user-defined data structures of the target programming language.

### `v0.10` - Generz builds its own phases

At this point, with some minor feature implementations, `generz` will be capable of producing code for its own use, and therefore run on code produced by itself. 

### Beyond `v0.10`:

- Migration to [Deno](https://deno.land/)
- Support for [context-sensitive grammar](https://en.wikipedia.org/wiki/Context-sensitive_grammar)
- Output code generation for C++
- Output code generation for Rust
- Output code generation for any language (via plugin)

---
## Generz language

TBD. Some drafts and ideas. But language is evolving fast, nothing stable or worth to be documented yet.

---
## Installation

_Node.js v16+_ is required to install/run `generz`. You can check which version it's installed on your system (if any):

```shell
node --version
```

If it's not installed you can obtain _Node.js_ in different ways:
- using [nvm](https://github.com/nvm-sh/nvm) **[recommended]**
- directly download and install the binaries from [https://nodejs.org/](https://nodejs.org/)

Once `node` (and therefore `npm`) is installed on your system you can install `generz`:

```shell
npm install --global generz
```

---
## Testing

Every piece of code in this repository is unit-tested. To run the tests clone the repository on your local machine and run:

```shell
npm install
npm test
```

> Prepare yourself for some fancy experience on your shell.

---
## Contributions

**Any** contribution is welcome, even just a star ★ on [Github repository](https://github.com/pintarj/generz).
