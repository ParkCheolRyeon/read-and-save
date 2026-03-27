import type { BookDocument } from "./books";

export type Flashcard = {
  id: number;
  question: string;
  answer: string; // raw markdown string
};

type Format = "qa20" | "chapter" | "fiber" | "coxwave";

export function detectFormat(slug: string): Format {
  if (slug.endsWith("-20")) return "qa20";
  if (slug === "coxwave") return "coxwave";
  if (/^\d{2}-/.test(slug)) return "fiber";
  return "chapter";
}

/* ── Helpers ── */

const NUMBERED_H2_RE = /^(\d+)\.\s+/;

/**
 * Extract a specific subsection from answer markdown.
 * e.g., extractSubSection(answer, "### 합격 답변 예시") returns the content
 * between that heading and the next ### or ## heading.
 */
function extractSubSection(md: string, heading: string): string | null {
  const idx = md.indexOf(heading);
  if (idx === -1) return null;

  const start = idx + heading.length;
  // Find next heading (### or ##)
  const rest = md.slice(start);
  const nextH = rest.search(/\n#{2,3}\s/);
  const content = nextH === -1 ? rest : rest.slice(0, nextH);
  return content.trim() || null;
}

/**
 * For qa20 answers: extract "합격 답변 예시" + "가산점 포인트" as the spoken answer.
 * Falls back to full content if those sections don't exist.
 */
function extractSpokenAnswer(rawAnswer: string): string {
  const passing = extractSubSection(rawAnswer, "### 합격 답변 예시");
  if (!passing) return rawAnswer;

  const bonus = extractSubSection(rawAnswer, "### 가산점 포인트");
  if (bonus) {
    return `${passing}\n\n**가산점:** ${bonus}`;
  }
  return passing;
}

/**
 * For coxwave answers: extract "#### 모범 답변" section.
 */
function extractCoxwaveAnswer(rawAnswer: string): string {
  const model = extractSubSection(rawAnswer, "#### 모범 답변");
  return model || rawAnswer;
}

/**
 * For chapter answers: extract interview-compressed answer sections.
 * Looks for "### 면접 압축 답변", "### 30초 답변", "### 1분 답변", etc.
 */
function extractChapterAnswer(rawAnswer: string): string {
  // Try various interview-style answer headings, prefer longer ones
  const candidates = [
    "### 1분 답변",
    "### 면접 압축 답변",
    "### 30초 답변",
    "### 10초 답변",
  ];

  for (const heading of candidates) {
    const found = extractSubSection(rawAnswer, heading);
    if (found) return found;
  }

  // Fallback: return full answer
  return rawAnswer;
}

/* ── Splitting ── */

/**
 * Splits body by ## headings, tracking expected question numbers
 * so sub-H2s within an answer get merged back.
 * We keep raw answers separate so answerTransform always operates on the full raw.
 */
function splitIntoNumberedCards(
  body: string,
  answerTransform: (raw: string) => string,
): Flashcard[] {
  const sections = body.split("\n## ");
  const cards: { question: string; raw: string }[] = [];
  let expectedNum: number | null = null; // auto-detect first number

  for (let i = 1; i < sections.length; i++) {
    const trimmed = sections[i].trim();
    if (!trimmed) continue;

    const match = trimmed.match(NUMBERED_H2_RE);
    const num = match ? parseInt(match[1], 10) : null;

    // Auto-detect starting number from the first numbered H2
    if (expectedNum === null && num !== null) {
      expectedNum = num;
    }

    if (num !== null && num === expectedNum) {
      const newlineIdx = trimmed.indexOf("\n");
      const question =
        newlineIdx === -1 ? trimmed : trimmed.slice(0, newlineIdx).trim();
      const rawAnswer =
        newlineIdx === -1 ? "" : trimmed.slice(newlineIdx + 1).trim();

      cards.push({ question, raw: rawAnswer });
      expectedNum = num + 1;
    } else if (cards.length > 0) {
      // Sub-H2 inside previous answer — merge into raw
      cards[cards.length - 1].raw += `\n\n## ${trimmed}`;
    }
  }

  // Transform raw → spoken answer
  return cards.map((c, i) => ({
    id: i,
    question: c.question,
    answer: answerTransform(c.raw),
  }));
}

/* ── Format-specific extractors ── */

function extractQa20(body: string): Flashcard[] {
  return splitIntoNumberedCards(body, extractSpokenAnswer);
}

function extractChapter(body: string): Flashcard[] {
  const raw = splitIntoNumberedCards(body, extractChapterAnswer);

  return raw.map((card) => ({
    ...card,
    question: card.question.endsWith("?")
      ? card.question
      : `Q. ${card.question}`,
  }));
}

function extractFiber(doc: BookDocument): Flashcard[] {
  const cards: Flashcard[] = [];

  const keyQuestions = doc.meta.keyQuestions;
  if (keyQuestions && keyQuestions.length > 0) {
    for (const kq of keyQuestions) {
      cards.push({ id: cards.length, question: kq, answer: doc.body });
    }
  }

  const sectionCards = extractChapter(doc.body);
  for (const sc of sectionCards) {
    cards.push({ ...sc, id: cards.length });
  }

  return cards;
}

function extractCoxwave(body: string): Flashcard[] {
  const sections = body.split("\n### Q");
  return sections.slice(1).reduce<Flashcard[]>((cards, section) => {
    const trimmed = section.trim();
    if (!trimmed) return cards;

    const newlineIdx = trimmed.indexOf("\n");
    const question =
      newlineIdx === -1
        ? `Q${trimmed}`
        : `Q${trimmed.slice(0, newlineIdx).trim()}`;
    const rawAnswer =
      newlineIdx === -1 ? "" : trimmed.slice(newlineIdx + 1).trim();

    if (question) {
      cards.push({
        id: cards.length,
        question,
        answer: extractCoxwaveAnswer(rawAnswer),
      });
    }
    return cards;
  }, []);
}

/* ── JSON override loader ── */

/**
 * Try to load pre-written card answers from /books/cards/{slug}.json.
 * These are hand-crafted interview answers that take priority over MDX extraction.
 */
async function fetchCardOverrides(slug: string): Promise<Flashcard[] | null> {
  try {
    const res = await fetch(`/books/cards/${slug}.json`);
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return null;
    return data.map((item: { question?: string; answer?: string }, i: number) => ({
      id: i,
      question: String(item.question ?? ""),
      answer: String(item.answer ?? ""),
    }));
  } catch {
    return null;
  }
}

/* ── Main ── */

/**
 * Extract cards: first tries JSON override, then falls back to MDX parsing.
 */
export async function extractCards(slug: string, doc: BookDocument): Promise<Flashcard[]> {
  const format = detectFormat(slug);

  // Try JSON overrides for any format
  const overrides = await fetchCardOverrides(slug);
  if (overrides && overrides.length > 0) {
    return overrides;
  }

  switch (format) {
    case "qa20":
      return extractQa20(doc.body);
    case "chapter":
      return extractChapter(doc.body);
    case "fiber":
      return extractFiber(doc);
    case "coxwave":
      return extractCoxwave(doc.body);
  }
}
