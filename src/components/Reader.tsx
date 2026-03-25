"use client";

import { useEffect, useRef, useState, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createHighlighter, type Highlighter } from "shiki";
import { fetchBookContent, fetchBookList } from "@/lib/books";
import type { BookDocument, BookEntry } from "@/lib/books";
import { isAuthenticated } from "@/lib/auth";
import Spinner from "./Spinner";
import { ArrowLeft, ArrowUp, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import Link from "next/link";

type ReaderProps = {
  slug: string;
};

/* ── shiki highlighter singleton ── */

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: [
        "javascript",
        "typescript",
        "jsx",
        "tsx",
        "json",
        "css",
        "html",
        "bash",
        "shell",
        "markdown",
      ],
    });
  }
  return highlighterPromise;
}

/* ── ShikiCodeBlock ── */

const ShikiCodeBlock = memo(function ShikiCodeBlock({
  code,
  lang,
}: {
  code: string;
  lang: string;
}) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    let cancelled = false;
    getHighlighter().then((h) => {
      if (cancelled) return;
      // If the language is not loaded, fall back to plaintext
      const loadedLangs = h.getLoadedLanguages();
      const resolvedLang = loadedLangs.includes(lang) ? lang : "text";

      const result = h.codeToHtml(code, {
        lang: resolvedLang,
        themes: { light: "github-light", dark: "github-dark" },
      });
      setHtml(result);
    });
    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  if (!html) {
    // Fallback while shiki loads
    return (
      <div className="shiki-wrapper">
        <pre className="shiki-fallback">
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  return (
    <div
      className="shiki-wrapper"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});

/* ── MDX preprocessing ── */

function parseSourceMapEntries(content: string): string {
  const entries: {
    modulePath: string;
    symbols: string[];
    whyItMatters: string;
    readHint: string;
  }[] = [];

  const entryRegex =
    /modulePath:\s*"([^"]+)"[\s\S]*?symbols:\s*\[([^\]]*)\][\s\S]*?whyItMatters:\s*"([^"]*)"[\s\S]*?readHint:\s*"([^"]*)"/g;

  let m;
  while ((m = entryRegex.exec(content)) !== null) {
    const symbols = [...m[2].matchAll(/"([^"]+)"/g)].map((s) => s[1]);
    entries.push({
      modulePath: m[1],
      symbols,
      whyItMatters: m[3],
      readHint: m[4],
    });
  }

  if (entries.length === 0) return "";

  let result = "\n#### 📂 Source Map\n\n";
  for (const entry of entries) {
    result += `**\`${entry.modulePath}\`**\n`;
    result += `- 주요 심볼: ${entry.symbols.map((s) => `\`${s}\``).join(", ")}\n`;
    result += `- 중요한 이유: ${entry.whyItMatters}\n`;
    result += `- 읽기 힌트: ${entry.readHint}\n\n`;
  }

  return result;
}

function preprocessMdx(body: string): string {
  let result = body;

  // Remove JSX expression spacers: {" "}
  result = result.replace(/\{"\s*"\}/g, " ");

  // InlineAnnotation → bold term inline + blockquote note below
  result = result.replace(
    /<InlineAnnotation\s+term="([^"]+)">\s*([\s\S]*?)\s*<\/InlineAnnotation>\n?([^\n<]*)/g,
    (_: string, term: string, desc: string, after: string) => {
      const cleanDesc = desc.replace(/\s+/g, " ").trim();
      const afterText = after.trim();
      return `**${term}**${afterText ? " " + afterText : ""}\n\n> 📌 **${term}**: ${cleanDesc}\n`;
    },
  );

  // BlockingVsYieldingTimeline → comparison table
  result = result.replace(
    /<BlockingVsYieldingTimeline\s+frameBudgetMs=\{([\d.]+)\}\s+stackTaskMs=\{([\d.]+)\}\s+fiberSliceMs=\{([\d.]+)\}\s*\/>/g,
    (_: string, frameBudget: string, stackTask: string, fiberSlice: string) => {
      const slices = Math.ceil(Number(stackTask) / Number(fiberSlice));
      return [
        "",
        `| 모델 | 작업 시간 | Frame Budget (${frameBudget}ms) 기준 |`,
        "| --- | --- | --- |",
        `| ⬛ Stack (연속 점유) | ${stackTask}ms 연속 실행 | 초과 ❌ |`,
        `| 🟩 Fiber (slice 분할) | ${fiberSlice}ms × ${slices}회 | slice당 여유 ✅ |`,
        "",
      ].join("\n");
    },
  );

  // SourceMapTable → formatted list
  result = result.replace(
    /<SourceMapTable\s+entries=\{\[([\s\S]*?)\]\}\s*\/>/g,
    (_: string, content: string) => parseSourceMapEntries(content),
  );

  // rf-callout div → blockquote
  result = result.replace(
    /<div\s+className="rf-callout">\s*<strong>([\s\S]*?)<\/strong>\s*<p\s+className="rf-small">\s*([\s\S]*?)\s*<\/p>\s*<\/div>/g,
    (_: string, heading: string, content: string) => {
      const cleanContent = content.replace(/\s+/g, " ").trim();
      return `\n> **${heading.trim()}**\n> ${cleanContent}\n`;
    },
  );

  return result;
}

/* ── Reader ── */

export default function Reader({ slug }: ReaderProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [book, setBook] = useState<BookDocument | null>(null);
  const [manifest, setManifest] = useState<BookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/");
      return;
    }
    Promise.all([fetchBookContent(slug), fetchBookList()])
      .then(([bookData, list]) => {
        setBook(bookData);
        setManifest(list);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "책을 불러올 수 없습니다"),
      )
      .finally(() => setLoading(false));
  }, [slug, router]);

  const processedBody = useMemo(
    () => (book ? preprocessMdx(book.body) : ""),
    [book],
  );

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-zinc-100 dark:bg-zinc-900">
        <Spinner className="text-zinc-600 dark:text-zinc-400" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          책을 불러오는 중...
        </p>
      </div>
    );
  }

  if (error || book === null) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-4 bg-zinc-100 dark:bg-zinc-900">
        <p className="text-center text-red-600 dark:text-red-400">
          {error ?? "내용을 불러올 수 없습니다."}
        </p>
        <Link
          href="/"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          목록으로
        </Link>
      </div>
    );
  }

  const { meta } = book;

  const currentIndex = manifest.findIndex((entry) => entry.id === slug);
  const prevChapter = currentIndex > 0 ? manifest[currentIndex - 1] : null;
  const nextChapter =
    currentIndex >= 0 && currentIndex < manifest.length - 1
      ? manifest[currentIndex + 1]
      : null;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === manifest.length - 1;

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-900">
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-zinc-200 bg-white/95 px-4 py-2 backdrop-blur dark:border-zinc-700 dark:bg-zinc-800/95">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-lg p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
          aria-label="목록으로"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {meta.title ?? "읽기"}
          </p>
          {meta.chapter ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Chapter {meta.chapter}
            </p>
          ) : null}
        </div>
      </header>
      <div
        ref={scrollRef}
        className="reader-content overflow-x-hidden overflow-y-auto overscroll-y-contain px-4 pt-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))]"
        style={{
          height: "calc(100dvh - 52px)",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <article className="mx-auto min-w-0 max-w-3xl break-words [word-break:keep-all]">
          {(meta.summary || meta.estimatedReadMinutes || meta.learningGoals.length > 0) && (
            <section className="mb-8 rounded-3xl border border-zinc-200 bg-white px-5 py-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {meta.chapter ? (
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-700">
                    Chapter {meta.chapter}
                  </span>
                ) : null}
                {meta.estimatedReadMinutes ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-700">
                    <Clock3 className="size-3.5" />
                    약 {meta.estimatedReadMinutes}분
                  </span>
                ) : null}
              </div>
              {meta.summary ? (
                <p className="mt-3 text-sm leading-6 text-zinc-700 dark:text-zinc-200">
                  {meta.summary}
                </p>
              ) : null}
              {meta.learningGoals.length > 0 ? (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                    Reading Goals
                  </p>
                  <ul className="mt-2 space-y-2 text-sm leading-6 text-zinc-700 dark:text-zinc-200">
                    {meta.learningGoals.map((goal) => (
                      <li key={goal} className="flex gap-2">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          )}
          <div className="prose prose-zinc mx-auto max-w-none text-[15px] leading-7 prose-headings:scroll-mt-24 prose-headings:font-semibold prose-h1:text-3xl prose-h1:tracking-tight prose-h2:mt-12 prose-h2:border-b prose-h2:border-zinc-200 prose-h2:pb-3 prose-h2:text-2xl prose-h3:mt-8 prose-h3:text-xl prose-h4:mt-6 prose-h4:text-base prose-p:text-zinc-700 prose-strong:text-zinc-900 prose-pre:my-0 prose-pre:bg-transparent prose-pre:p-0 prose-pre:shadow-none prose-pre:ring-0 prose-code:rounded prose-code:bg-[#f3f4fb] prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.92em] prose-code:text-[#5f6788] prose-code:before:content-none prose-code:after:content-none prose-blockquote:border-l-4 prose-blockquote:border-zinc-300 prose-blockquote:text-zinc-700 prose-li:marker:text-zinc-400 prose-table:block prose-table:overflow-x-auto prose-table:whitespace-nowrap dark:prose-invert dark:prose-p:text-zinc-200 dark:prose-strong:text-zinc-50 dark:prose-blockquote:border-zinc-600">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code: ({ node, className, children, ...props }) => {
                  void node;
                  const match = /language-([\w-]+)/.exec(className ?? "");

                  if (!match) {
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }

                  const code = String(children).replace(/\n$/, "");
                  return <ShikiCodeBlock code={code} lang={match[1]} />;
                },
                table: ({ node, ...props }) => {
                  void node;
                  return (
                    <div className="my-6 overflow-x-auto">
                      <table {...props} />
                    </div>
                  );
                },
              }}
            >
              {processedBody}
            </ReactMarkdown>
          </div>

          {/* Chapter Navigation */}
          {manifest.length > 0 && (
            <nav className="mt-12 mb-8 flex items-stretch gap-3 border-t border-zinc-200 pt-8 dark:border-zinc-700">
              {/* Previous Chapter */}
              {prevChapter ? (
                <Link
                  href={`/read/${prevChapter.id}`}
                  className="group flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-zinc-200 px-4 py-4 transition hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
                >
                  <ChevronLeft className="size-5 shrink-0 text-zinc-400 transition group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                      이전 챕터
                    </p>
                    <p className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {prevChapter.title}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="flex min-w-0 flex-1 cursor-not-allowed items-center gap-2 rounded-2xl border border-zinc-100 px-4 py-4 opacity-40 dark:border-zinc-800">
                  <ChevronLeft className="size-5 shrink-0 text-zinc-300 dark:text-zinc-600" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-zinc-300 dark:text-zinc-600">
                      이전 챕터
                    </p>
                  </div>
                </div>
              )}

              {/* Next Chapter */}
              {nextChapter ? (
                <Link
                  href={`/read/${nextChapter.id}`}
                  className="group flex min-w-0 flex-1 items-center justify-end gap-2 rounded-2xl border border-zinc-200 px-4 py-4 text-right transition hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                      다음 챕터
                    </p>
                    <p className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {nextChapter.title}
                    </p>
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-zinc-400 transition group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                </Link>
              ) : (
                <div className="flex min-w-0 flex-1 cursor-not-allowed items-center justify-end gap-2 rounded-2xl border border-zinc-100 px-4 py-4 opacity-40 dark:border-zinc-800">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-zinc-300 dark:text-zinc-600">
                      다음 챕터
                    </p>
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-zinc-300 dark:text-zinc-600" />
                </div>
              )}
            </nav>
          )}
        </article>
      </div>
      <button
        type="button"
        onClick={scrollToTop}
        className="fixed bottom-4 right-6 z-20 flex size-12 items-center justify-center rounded-full bg-zinc-800 text-white shadow-lg transition hover:bg-zinc-700 active:scale-95 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-100"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
        aria-label="맨 위로"
      >
        <ArrowUp className="size-6" />
      </button>
    </div>
  );
}
