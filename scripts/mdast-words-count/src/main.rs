use std::{env, error::Error, process};

use mdast_words_count::{run, Config};

fn main() -> Result<(), Box<dyn Error>> {
    let config = Config::build(env::args());

    if let Err(err) = run(config) {
        eprintln!("An error occurred: {}", err);
        process::exit(1);
    };

    Ok(())
}
