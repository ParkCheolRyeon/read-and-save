#!/usr/bin/env python3
"""
Extract card data from chapter MDX files.
Pulls question titles, 면접 압축 답변, and first code block from 상세 해설.
Generates JSON override files for memory cards.
"""
import json
import os
import re
import glob

BOOKS_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'books')
CARDS_DIR = os.path.join(BOOKS_DIR, 'cards')


def extract_sections(mdx_content: str) -> list[dict]:
    """Extract numbered sections with their sub-content."""
    # Split by ## {number}. headings
    pattern = r'^## (\d+)\.\s+(.+)$'
    sections = []
    current = None

    for line in mdx_content.split('\n'):
        match = re.match(pattern, line)
        if match:
            if current:
                sections.append(current)
            current = {
                'num': int(match.group(1)),
                'title': match.group(2).strip(),
                'content': '',
            }
        elif current:
            current['content'] += line + '\n'

    if current:
        sections.append(current)

    return sections


def extract_answer(content: str) -> str:
    """Extract 면접 압축 답변 section from content."""
    # Find ### 면접 압축 답변
    pattern = r'###\s*면접\s*압축\s*답변\s*\n(.*?)(?=\n###|\n##|\n---|\Z)'
    match = re.search(pattern, content, re.DOTALL)
    if match:
        answer = match.group(1).strip()
        # Remove trailing bridge (> 이제... lines)
        lines = answer.split('\n')
        cleaned = []
        for line in lines:
            if line.startswith('> 이제') or line.startswith('> 여기서부터') or line.startswith('> 그런데'):
                break
            cleaned.append(line)
        return '\n'.join(cleaned).strip()
    return ''


def extract_first_code_block(content: str) -> str:
    """Extract the first meaningful code block from content."""
    pattern = r'```(\w+)?\n(.*?)```'
    matches = re.findall(pattern, content, re.DOTALL)
    for lang, code in matches:
        code = code.strip()
        # Skip very short or diagram-like blocks
        if len(code) > 30 and not code.startswith('실행') and not code.startswith('Layer'):
            lang_str = lang if lang else 'ts'
            return f'```{lang_str}\n{code}\n```'
    return ''


def extract_key_points(content: str) -> str:
    """Extract 핵심 요약 or 핵심 비교 section."""
    for heading in ['핵심 요약', '핵심 비교', '핵심 개념']:
        pattern = rf'>\s*\*\*{heading}\*\*\s*[—–-]\s*(.*?)(?=\n\n|\n###|\n##|\Z)'
        match = re.search(pattern, content, re.DOTALL)
        if match:
            return match.group(1).strip()
    return ''


def extract_misconceptions(content: str) -> str:
    """Extract 자주 하는 오해 section."""
    pattern = r'###\s*자주 하는 오해\s*\n(.*?)(?=\n###|\n##|\n---|\Z)'
    match = re.search(pattern, content, re.DOTALL)
    if match:
        text = match.group(1).strip()
        # Take first 2-3 misconceptions
        lines = [l for l in text.split('\n') if l.strip().startswith('-')][:3]
        return '\n'.join(lines)
    return ''


def build_card_answer(section: dict) -> str:
    """Build a rich card answer from section content."""
    content = section['content']

    # 1. Start with 면접 압축 답변
    answer = extract_answer(content)
    if not answer:
        # Fallback: use 핵심 요약
        key_point = extract_key_points(content)
        if key_point:
            answer = key_point
        else:
            # Last resort: first paragraph of content after any heading
            paragraphs = [p.strip() for p in content.split('\n\n') if p.strip() and not p.strip().startswith('#') and not p.strip().startswith('>') and not p.strip().startswith('|') and not p.strip().startswith('```')]
            if paragraphs:
                answer = paragraphs[0]

    if not answer:
        return ''

    # 2. Add first code block if available
    code = extract_first_code_block(content)
    if code:
        answer += f'\n\n{code}'

    # 3. Add misconceptions if available
    misconceptions = extract_misconceptions(content)
    if misconceptions:
        answer += f'\n\n---\n\n**⚠️ 자주 하는 오해**\n\n{misconceptions}'

    return answer


def process_chapter(filename: str) -> list[dict]:
    """Process a chapter MDX file and return card data."""
    filepath = os.path.join(BOOKS_DIR, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    sections = extract_sections(content)
    cards = []

    for section in sections:
        answer = build_card_answer(section)
        if answer and len(answer) > 50:  # Skip too-short answers
            cards.append({
                'question': f"{section['num']}. {section['title']}",
                'answer': answer,
            })

    return cards


def main():
    # Skip chapter1 (already manually created)
    chapter_files = sorted(glob.glob(os.path.join(BOOKS_DIR, 'chapter*.mdx')))

    for filepath in chapter_files:
        filename = os.path.basename(filepath)
        slug = filename.replace('.mdx', '')
        json_path = os.path.join(CARDS_DIR, f'{slug}.json')

        # Skip if already exists (chapter1)
        if slug == 'chapter1' and os.path.exists(json_path):
            print(f"  ⏭️  {slug}: already exists, skipping")
            continue

        cards = process_chapter(filename)

        if cards:
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(cards, f, ensure_ascii=False, indent=2)
            print(f"  ✅ {slug}: {len(cards)} cards generated")
        else:
            print(f"  ⚠️  {slug}: no cards extracted")


if __name__ == '__main__':
    print("Extracting chapter cards from MDX files...\n")
    main()
    print("\nDone!")
