use std::fs;
use std::{error::Error, path::PathBuf};

use humansize::{format_size, DECIMAL};
use markdown::mdast::Node;
use num_format::{Locale, ToFormattedString};
use walkdir::{DirEntry, WalkDir};
use words_count;

pub struct Config {
    pub dir: PathBuf,
}

impl Config {
    pub fn build(mut args: impl Iterator<Item = String>) -> Config {
        args.next();

        let dir = args
            .next()
            .map(|arg| PathBuf::from(arg))
            .unwrap_or_else(|| PathBuf::from(DEFAULT_DIR_PATTERN));

        Config { dir }
    }
}

pub fn run(config: Config) -> Result<(), Box<dyn Error>> {
    println!("Processing Directory: {}", config.dir.display());

    let (count, file_size) = iterate_md_docs(&config.dir)?;

    println!("-------------------------------------");
    println!("Total Words: {}", count.to_formatted_string(&Locale::en));
    println!("Total Size: {}", format_size(file_size, DECIMAL));
    println!("-------------------------------------");

    Ok(())
}

const DEFAULT_DIR_PATTERN: &str = "../../docs/MatrixOne";

/// Iterates all the markdown doc files.
fn iterate_md_docs(dir: &PathBuf) -> Result<(usize, usize), Box<dyn Error>> {
    let parse_config = markdown::ParseOptions::gfm();

    let mut file_size = 0_usize;

    let count = WalkDir::new(dir).into_iter().fold(0, |acc, entry| {
        let entry = entry.unwrap();
        if is_md(&entry) {
            file_size += fs::metadata(&entry.path()).unwrap().len() as usize;
            let content = fs::read_to_string(&entry.path()).unwrap();
            let root = markdown::to_mdast(&content, &parse_config).unwrap();
            let count = word_count(&root);
            acc + count
        } else {
            acc
        }
    });

    Ok((count, file_size))
}

/// Asserts `markdown` files.
fn is_md(entry: &DirEntry) -> bool {
    entry
        .file_name()
        .to_str()
        .map(|e| e.ends_with(".md"))
        .unwrap_or(false)
}

/// Traverse the syntax tree.
fn word_count(node: &Node) -> usize {
    match node {
        // Container:
        // Node::BlockQuote(n) => words_count_of_children(&n.children),
        // Node::List(n) => words_count_of_children(&n.children),

        // Phrasing:
        Node::InlineCode(n) => words_count_of_str(&n.value),
        Node::InlineMath(n) => words_count_of_str(&n.value),
        // Node::Delete(n) => words_count_of_children(&n.children),
        // Node::Emphasis(n) => words_count_of_children(&n.children),
        Node::Html(n) => words_count_of_str(&n.value),
        Node::Image(n) => words_count_of_str(&n.alt),
        Node::Link(n) => n
            .title
            .as_ref()
            .map(|title| words_count_of_str(title))
            .unwrap_or(0),
        // Node::Strong(n) => words_count_of_children(&n.children),
        Node::Text(n) => words_count_of_str(&n.value),

        // Flow:
        Node::Code(n) => words_count_of_str(&n.value),
        Node::Math(n) => words_count_of_str(&n.value),
        // Node::Heading(n) => words_count_of_children(&n.children),

        // Table content:
        // Node::Table(n) => words_count_of_children(&n.children),
        // Node::TableRow(n) => words_count_of_children(&n.children),
        // Node::TableCell(n) => words_count_of_children(&n.children),

        // List content:
        // Node::ListItem(n) => words_count_of_children(&n.children),

        // Content:
        Node::Definition(n) => n
            .title
            .as_ref()
            .map(|title| words_count_of_str(title))
            .unwrap_or(0),
        // Node::Paragraph(n) => words_count_of_children(&n.children),

        // Omit:
        // FootnoteDefinition, FootnoteReference, ImageReference, LinkReference
        // Toml, Yaml
        // MdxJsxFlowElement, MdxjsEsm, MdxTextExpression, MdxJsxTextElement, MdxFlowExpression
        // Break, ThematicBreak
        _ => node
            .children()
            .map(|children| words_count_of_children(children))
            .unwrap_or(0),
    }
}

fn words_count_of_str(s: &str) -> usize {
    words_count::count(s).words
}

fn words_count_of_children(children: &[Node]) -> usize {
    children.iter().fold(0, |acc, node| acc + word_count(node))
}
