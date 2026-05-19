#!/usr/bin/env python3
"""
Sync agent-friendly frontmatter from English PR #685 FETCH_HEAD to CN repo.
For each changed doc file in the English PR, add frontmatter + blockquote
to the corresponding CN file, with Chinese summaries extracted from body.

Usage: python3 scripts/sync_frontmatter.py
"""

import os
import re
import sys
import subprocess

CN_REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def git_show_en(rel_path):
    """Read a file from the English PR (FETCH_HEAD)."""
    cmd = f"git -C {CN_REPO} show FETCH_HEAD:'{rel_path}'"
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return r.stdout if r.returncode == 0 else None

def get_files_from_pr():
    """List doc files changed in the English PR (last 4 commits on FETCH_HEAD)."""
    cmd = f"git -C {CN_REPO} diff --name-only FETCH_HEAD~4..FETCH_HEAD -- docs/MatrixOne/Reference/"
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return [f.strip() for f in r.stdout.strip().split('\n') if f.strip()]

def parse_frontmatter(content):
    """Parse frontmatter from content. Returns (fm_dict, body_after_fm)."""
    if not content or not content.startswith('---\n'):
        return None, content
    end = content.find('\n---\n', 4)
    if end == -1:
        return None, content
    fm_text = content[4:end]
    body = content[end+5:]  # after '---\n'
    try:
        fm = __import__('yaml').safe_load(fm_text)
        return fm, body
    except:
        return None, content

def extract_cn_summary(cn_body):
    """Extract a Chinese one-liner from the first description section."""
    patterns = [
        r'##\s+(?:\*\*)?(?:函数|语法|运算符|命令|概述|功能)[说明描述概述述介]*(?:\*\*)?\s*\n\n?((?:.(?!\n##))+)',
        r'##\s+\*\*[^#]*?说明\*\*\s*\n\n?((?:.(?!\n##))+)',
        r'##\s+[^#]*?说明\s*\n\n?((?:.(?!\n##))+)',
    ]

    for pat in patterns:
        m = re.search(pat, cn_body, re.DOTALL)
        if m:
            text = m.group(1).strip()
            lines = []
            in_code = False
            for line in text.split('\n'):
                s = line.strip()
                if s.startswith('```'):
                    in_code = not in_code
                    continue
                if in_code or not s:
                    if lines:
                        break
                    continue
                if s.startswith('!!!') or s.startswith('__Note') or s.startswith('|') or s.startswith('<style'):
                    continue
                if s.startswith('#') or s.startswith('- ') or s.startswith('> ') or s.startswith('['):
                    continue
                # Clean markdown
                cleaned = re.sub(r'\*\*', '', s)
                cleaned = re.sub(r'`([^`]+)`', r'\1', cleaned)
                cleaned = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', cleaned)
                cleaned = re.sub(r'^\d+\.\s*', '', cleaned)
                if cleaned:
                    lines.append(cleaned)
                if sum(len(l) for l in lines) > 150:
                    break
            if lines:
                result = ' '.join(lines)
                return result[:250] + ('...' if len(result) > 250 else '')

    return None

def process_file(rel_path):
    """Add frontmatter+blockquote to a CN file."""
    cn_path = os.path.join(CN_REPO, rel_path)
    if not os.path.exists(cn_path):
        return 'SKIP_NOT_FOUND'

    en_content = git_show_en(rel_path)
    if not en_content:
        return 'SKIP_NO_EN'

    en_fm, en_body = parse_frontmatter(en_content)
    if not en_fm:
        return 'SKIP_NO_EN_FM'

    with open(cn_path, 'r') as f:
        cn_content = f.read()

    # Check if already has frontmatter
    has_fm = cn_content.startswith('---\n')

    # Build CN frontmatter (copy metadata from EN, use CN summary)
    import yaml
    cn_fm = {
        'title': en_fm.get('title', ''),
        'doc_type': en_fm.get('doc_type', 'reference'),
        'mysql_compat': en_fm.get('mysql_compat', 'unknown'),
        'differs_from_mysql': en_fm.get('differs_from_mysql', []),
        'mo_only': en_fm.get('mo_only', []),
        'since': en_fm.get('since', 'unknown'),
        'last_updated': en_fm.get('last_updated', '2026-05-08'),
    }

    # Get CN summary
    cn_body_for_summary = cn_content
    if has_fm:
        end = cn_content.find('\n---\n', 4)
        if end != -1:
            cn_body_for_summary = cn_content[end+5:]

    cn_summary = extract_cn_summary(cn_body_for_summary)
    cn_fm['llms_summary'] = cn_summary or en_fm.get('llms_summary', '')

    # Serialize
    fm_yaml = yaml.dump(cn_fm, default_flow_style=False, allow_unicode=True,
                        sort_keys=False, width=200)
    fm_block = f"---\n{fm_yaml}---\n"

    if has_fm:
        # Replace existing frontmatter
        end = cn_content.find('\n---\n', 4)
        new_content = fm_block + '\n' + cn_content[end+5:].lstrip('\n')
    else:
        new_content = fm_block + '\n' + cn_content

    # Add blockquote after H1
    # Check only the area between H1 and the next ## heading (before code blocks)
    body = new_content.split('---\n', 2)[-1]
    next_section = re.search(r'\n##\s', body)
    check_area = body[:next_section.start()] if next_section else body[:600]
    if cn_summary and not re.search(r'\n> ', check_area):
        # Match H1 line only (not consuming trailing blank lines)
        h1_pat = re.search(r'(#\s+\*\*.*?\*\*)\s*\n', new_content)
        if not h1_pat:
            h1_pat = re.search(r'(#\s+[^\n]+)\n', new_content)
        if h1_pat:
            # Format blockquote - each line prefixed with >
            # Wrap long summaries
            bq_lines = []
            words = cn_summary.split()
            line = ''
            for w in words:
                if len(line) + len(w) + 1 > 70:
                    bq_lines.append(f"> {line.strip()}")
                    line = w
                else:
                    line = line + ' ' + w if line else w
            if line:
                bq_lines.append(f"> {line.strip()}")

            bq = '\n'.join(bq_lines) + '\n'
            insert_pos = h1_pat.end()
            new_content = new_content[:insert_pos] + '\n' + bq + '\n' + new_content[insert_pos:]

    with open(cn_path, 'w') as f:
        f.write(new_content)

    return 'OK'

def main():
    files = get_files_from_pr()
    total = len(files)
    print(f"Processing {total} files...")

    ok = 0
    skipped = 0
    for i, f in enumerate(files):
        result = process_file(f)
        if result == 'OK':
            ok += 1
        else:
            skipped += 1
            if i < 10 or skipped % 50 == 0:
                print(f"  [{i+1}/{total}] {result}: {f}")
        if (i+1) % 50 == 0:
            print(f"  [{i+1}/{total}] Progress: {ok} OK, {skipped} skipped")

    print(f"\nDone! {ok} OK, {skipped} skipped out of {total} total")

if __name__ == '__main__':
    main()
