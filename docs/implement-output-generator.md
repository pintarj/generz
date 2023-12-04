# Implement output generator

This document explains how to implement an output generator. The generated code communicates through an interface of predefined functions, these are: [current](#function-current), [advance](#function-advance), [mark](#function-mark), [lexeme](#function-lexeme) and [reset](#function-reset). Function calls to these functions are performed by the generated code, it is the responsibility of the _output generator_ implementer to implement these functions.

#### Sequence buffer

The _sequence buffer_ is represented by some concepts:
 - `buffer`: contains the read, but not yet consumed, input characters.
 - `cursor`: stores the position of the _current_ character in the _buffer_. Initially the cursor is undefined (`∅`).
 - `mark`: stores the length (from the start of the _buffer_) of marked input.

We could, for example, represent it as:
```
buffer:   [i, f, e, l, f]
cursor: ∅
mark:   ∅
```


#### Function `current`

Returns the input character delimided by the cursor.

Before the call:

```
buffer:   [i, f, e, l, f]
cursor: 2        ^
mark:   ∅
```

Returns `e`.

#### Function `advance`

 Increments the position of the cursor.

Before the call:
```
buffer:   [i, f, e, l, f]
cursor: 1     ^
mark:   2 |----|
```

After the call:
```
buffer:   [i, f, e, l, f]
cursor: 2        ^
mark:   2 |----|
```

#### Function `mark`

Remembers the length of the string delimited by the cursor.

Before the call:

```
buffer:   [i, f, e, l, f]
cursor: 1     ^
mark:   ∅
```

After the call:
```
buffer:   [i, f, e, l, f]
cursor: 1     ^
mark:   2 |----| 
```

#### Function `lexeme`

Returns a string from elements in the buffer at range [0, mark).

Before the call:
```
buffer:   [i, f, e, l, f]
cursor: 4              ^
mark:   2 |----|
```
Returns `"if"`.

#### Function `reset`

Removes from the buffer all elements in range [0, mark]. 
Resets the pointer and the mark to their initial values.

Before the call:
```
buffer:   [i, f, e, l, f]
cursor: 4              ^
mark:   2 |----|
```

After the call:
```
buffer:   [e, l, f]
cursor: ∅
mark:   ∅
```
