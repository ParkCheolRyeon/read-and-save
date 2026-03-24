export type BookEntry = {
  id: string;
  filename: string;
  title: string;
};

export type BookDocumentMeta = {
  title?: string;
  chapter?: string;
  summary?: string;
  estimatedReadMinutes?: number;
  learningGoals: string[];
  keyQuestions?: string[];
};

export type BookDocument = {
  meta: BookDocumentMeta;
  body: string;
};

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

function isBookEntry(value: unknown): value is BookEntry {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === "string" &&
    typeof entry.filename === "string" &&
    typeof entry.title === "string"
  );
}

export async function fetchBookList(): Promise<BookEntry[]> {
  const res = await fetch("/books/manifest.json");
  if (!res.ok) throw new Error("Failed to load book list");
  const manifest: unknown = await res.json();

  if (!Array.isArray(manifest) || !manifest.every(isBookEntry)) {
    throw new Error("Invalid book manifest");
  }

  return manifest;
}

function stripQuotes(value: string): string {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function parseBookDocument(raw: string): BookDocument {
  const match = raw.match(FRONTMATTER_RE);
  const meta: BookDocumentMeta = { learningGoals: [], keyQuestions: [] };

  if (!match) {
    return {
      meta,
      body: raw.trim(),
    };
  }

  let currentListKey: keyof Pick<BookDocumentMeta, "learningGoals" | "keyQuestions"> | null = null;

  for (const line of match[1].split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    const listItem = trimmed.match(/^-\s+(.*)$/);
    if (listItem && currentListKey) {
      meta[currentListKey]!.push(stripQuotes(listItem[1]));
      continue;
    }

    currentListKey = null;

    const field = trimmed.match(/^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/);
    if (!field) {
      continue;
    }

    const [, key, rawValue] = field;
    const value = rawValue.trim();

    if (key === "learningGoals") {
      meta.learningGoals = [];
      currentListKey = "learningGoals";
      continue;
    }

    if (key === "keyQuestions") {
      meta.keyQuestions = [];
      currentListKey = "keyQuestions";
      continue;
    }

    if (key === "estimatedReadMinutes") {
      const minutes = Number(value);
      if (Number.isFinite(minutes)) {
        meta.estimatedReadMinutes = minutes;
      }
      continue;
    }

    if (key === "title") {
      meta.title = stripQuotes(value);
      continue;
    }

    if (key === "chapter") {
      meta.chapter = stripQuotes(value);
      continue;
    }

    if (key === "summary") {
      meta.summary = stripQuotes(value);
    }
  }

  return {
    meta,
    body: raw.slice(match[0].length).trim(),
  };
}

export async function fetchBookContent(slug: string): Promise<BookDocument> {
  const res = await fetch(`/books/${slug}.mdx`);
  if (!res.ok) throw new Error("Failed to load book");
  return parseBookDocument(await res.text());
}
