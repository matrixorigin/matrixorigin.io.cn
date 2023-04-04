use std::{error::Error, fs};

use fancy_regex::{Captures, Regex};
use walkdir::{DirEntry, WalkDir};

// pub struct CLIConfig {
//     pub book_root: PathBuf,
//     pub config_src_path: PathBuf,
//     pub serve: bool,
// }

// impl CLIConfig {
//     pub fn build(args: &[String]) -> CLIConfig {
//         let len = args.len();

//         let book_root = if len > 0 {
//             args[0].clone()
//         } else {
//             "../docs/MatrixOne".to_string()
//         };
//         let config_src_path = if len > 1 {
//             args[1].clone()
//         } else {
//             "../docs/MatrixOne/book.toml".to_string()
//         };
//         let serve = env::var("SERVE").is_ok();

//         CLIConfig {
//             book_root: PathBuf::from(book_root),
//             config_src_path: PathBuf::from(config_src_path),
//             serve,
//         }
//     }
// }

/// Asserts `markdown` files.
fn is_md(entry: &DirEntry) -> bool {
    entry
        .file_name()
        .to_str()
        .map(|e| e.ends_with(".md"))
        .unwrap_or(false)
}

/// Asserts `mdx` files.
fn is_mdx(entry: &DirEntry) -> bool {
    entry
        .file_name()
        .to_str()
        .map(|e| e.ends_with(".mdx"))
        .unwrap_or(false)
}

/// Process markdown source.
fn process_markdown_source(entry: &DirEntry) -> Result<bool, Box<dyn Error>> {
    let mut modified: bool = false;
    let mut result = fs::read_to_string(entry.path())?;

    if let Ok((m, after)) = replace_admonitions(&result) {
        modified = m;
        result = after;
    }
    if modified {
        if let Ok((_m, after)) = escape_mdx_preserved(&result) {
            result = after;
        }
    }

    if modified {
        fs::write(entry.path(), result.to_string())?;
    }

    Ok(modified)
}

/// Replace mkdocs-style admonition component syntax.
fn replace_admonitions(src: &str) -> Result<(bool, String), Box<dyn Error>> {
    let adm_re = Regex::new(
        r"(?s)!!![^\r\n\S]*(?<type>[^\s]+)?[^\r\n\S]*(?<title>[^\r\n]+)?((.(?!\n\n|\r\n\r\n))*.)",
    )?;

    let match_adm = adm_re.is_match(src)?;

    if !match_adm {
        return Ok((match_adm, src.to_string()));
    }

    let after = adm_re.replace_all(&src, |caps: &Captures| {
        let adm_type = caps.get(1).map(|m| m.as_str()).unwrap_or("info");
        let adm_title = caps.get(2).map(|m| m.as_str()).unwrap_or("注意");
        let adm_content = &caps[3];
        format!(":::{}[{}]{}\r\n:::", adm_type, adm_title, adm_content)
    });

    Ok((match_adm, after.to_string()))
}

/// Escape mdx preserved keywords.
///
/// TODO: Join the three regexes.
fn escape_mdx_preserved(src: &str) -> Result<(bool, String), Box<dyn Error>> {
    let mut result = String::from(src);

    let break_line_tag_re = Regex::new(r"<br>")?;
    let left_curly_bracket_re = Regex::new(r"{")?;
    let left_arrow_bracket_re = Regex::new(r"<(?!https?|/?p>|/?a(\s|>)|c\s|/?img\s|/?br|/?h3)")?;
    let comment_re = Regex::new(r"<!--(.(?!-->))*.-->")?;
    let bare_link_re = Regex::new(r"<(?<url>https?://(.(?!>))*[^>]?)>")?;

    let match_br = break_line_tag_re.is_match(src)?;
    if match_br {
        result = break_line_tag_re.replace_all(&result, "<br/>").to_string();
    }

    let match_left_curly_bracket = left_curly_bracket_re.is_match(&result)?;
    if match_left_curly_bracket {
        result = left_curly_bracket_re
            .replace_all(&result, r"\{")
            .to_string();
    }

    let match_left_arrow_bracket = left_arrow_bracket_re.is_match(&result)?;
    if match_left_arrow_bracket {
        result = left_arrow_bracket_re
            .replace_all(&result, r"\<")
            .to_string();
    }

    let match_comment = comment_re.is_match(&result)?;
    if match_comment {
        result = comment_re.replace_all(&result, r"").to_string();
    }

    let match_bare_link = bare_link_re.is_match(&result)?;
    if match_bare_link {
        let after = bare_link_re.replace_all(&result, |caps: &Captures| {
            let link_url = caps.get(1).map(|m| m.as_str()).unwrap_or("");
            link_url.to_string()
        });

        result = after.to_string();
    }

    Ok((
        match_br
            || match_left_curly_bracket
            || match_left_arrow_bracket
            || match_comment
            || match_bare_link,
        result,
    ))
}

/// Renames `.md` files to `.mdx`.
fn process_md_file() -> Result<(), Box<dyn Error>> {
    for entry in WalkDir::new("../docs/MatrixOne") {
        let entry = entry?;
        if is_md(&entry) {
            let modified = process_markdown_source(&entry)?;
            if modified {
                rename_file(&entry, "mdx")?;
            }
        }
    }

    Ok(())
}

/// Renames `.mdx` files to `.md`.
fn rename_mdx_to_md() -> Result<(), Box<dyn Error>> {
    for entry in WalkDir::new("../docs/MatrixOne") {
        let entry = entry?;
        if is_mdx(&entry) {
            rename_file(&entry, "md")?;
        }
    }

    Ok(())
}

/// Renames a file with the given new extension.
fn rename_file(entry: &DirEntry, new_ext: &str) -> Result<(), Box<dyn Error>> {
    let old_path = entry.path();
    let new_path = old_path.with_extension(new_ext);
    fs::rename(&old_path, &new_path)?;
    Ok(())
}

pub fn run() -> Result<(), Box<dyn Error>> {
    if let Err(err) = process_md_file() {
        return Err(err.into());
    };

    Ok(())
}
