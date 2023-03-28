# Cairo Programming Language Documentation

## Introduction

Cairo is a programming language designed for writing smart contracts for the StarkNet blockchain. It has similar semantics to Rust, but with a simpler, more limited feature set.

## Basic Syntax

Cairo syntax is similar to Rust, but with some important differences. For example, Rust lifetime syntax is not supported in Cairo. Additionally, Cairo does not support for loops, only recursion is supported. Neither does it support while loops. Functional operators such as map, filter, and iter are not supported either.

Here is an example of a constant declaration in Cairo:

```rust
const WRITER_ROLE: felt252 = 'WRITER_ROLE';
```

## Constants

Constants in Cairo are declared with the `const` keyword. Here is the syntax for declaring a constant:

```rust
const CONSTANT_NAME: data_type = value;
```

For example, to declare a constant named `MY_CONSTANT` with a value of `123`, you would use the following syntax:

```rust
const MY_CONSTANT: felt64 = 123;
```

## Data Types

Cairo has a number of built-in data types, including integers, floats, booleans, and strings. Here is a list of some of the data types available in Cairo:

- `felt`: A signed integer type with 252 bits.
- `felt*`: An array of signed integer types with a fixed number of elements. For example, `felt[5]` is an array of 5 `felt` values.
- `field`: An unsigned integer type with 254 bits.
- `field*`: An array of unsigned integer types with a fixed number of elements. For example, `field[5]` is an array of 5 `field` values.
- `bit`: A boolean type with a single bit.
- `bit*`: An array of boolean types with a fixed number of elements. For example, `bit[5]` is an array of 5 `bit` values.
- `string`: A string type with variable length.

## Functions

Cairo supports functions, which are defined using the `func` keyword. Here is the syntax for declaring a function:

```rust
func function_name(argument_name: argument_type) -> return_type {
    // function body
}
```

For example, to define a function named `my_function` that takes an argument of type `felt` and returns an `field` value, you would use the following syntax:

```rust
func my_function(my_argument: felt) -> field {
    return (2 * my_argument) + 1;
}
```

## Control Flow

Cairo supports if statements and recursion, but does not support for and while loops. Here is the syntax for an if statement:

```rust
if condition {
    // code to be executed if condition is true
} else {
    // code to be executed if condition is false
}
```

## Conclusion

Cairo is a programming language designed for writing smart contracts for the StarkNet blockchain. It has a simpler, more limited feature set than Rust, but has similar semantics. While it doesn't support for loops and functional operators like map, filter, and iter, it does support recursion, making it a powerful language for developing smart contracts.