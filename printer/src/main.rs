use std::{error::Error, process};

use printer::run;

fn main() -> Result<(), Box<dyn Error>> {
    if let Err(err) = run() {
        eprintln!("An error occurred: {}", err);
        process::exit(1);
    };

    Ok(())
}
