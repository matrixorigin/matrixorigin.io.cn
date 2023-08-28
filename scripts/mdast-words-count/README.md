# mdast-words-count

Helps calculate the word count and total file size of Markdown documents. Powered by [markdown-rs](https://github.com/wooorm/markdown-rs) for AST generation and [words-count](https://github.com/magiclen/words-count) for word counting.

## Use

To calculate word counts and file sizes, use the provided executables located at the project's root (including `aarch64-apple-darwin`, `x86_64-pc-windows-gnu` and `x86_64-unknown-linux-gnu`):

> Note
> If the provided executables do not work on your machine, you can build them yourself using the instructions in the [Build](#build) section.

```bash
# The default target path is `../../docs/MatrixOne`.
./mdast-words-count ../../docs/MatrixOne/Deploy
```

Yields:

```text
Processing Directory: ../../docs/MatrixOne/Deploy
-------------------------------------
Total Words: 20,932
Total Size: 129.38 kB
-------------------------------------
```

## Build

To build the executable from source, you will first need to install Rust and Cargo.

```shell
# Build the executable.
cargo build
```
