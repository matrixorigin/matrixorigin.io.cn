# Printer

This project helps export the whole document to a single `pdf`.

## How to Run

Node.js is required to run a headless chromium.

```shell
# Make sure you are at the correct directory
cd printer

npm ci

# On Linux
./pinter
# On Windows
start printer.exe

npm run dev

# In another terminal
npm run print
```

You'll see a `book.pdf` emitted.

## Build from source

To build the executable from source, you will first need to install Rust and Cargo.

```shell
# Make sure you are at the correct directory
cd printer

# Build the executable.
cargo build
```

Move the `printer` executable under `target/debug` to `printer`.
