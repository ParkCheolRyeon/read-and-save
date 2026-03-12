"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { fetchBookContent } from "@/lib/books";
import type { BookDocument } from "@/lib/books";
import { isAuthenticated } from "@/lib/auth";
import Spinner from "./Spinner";
import { ArrowLeft, ArrowUp, Clock3 } from "lucide-react";
import Link from "next/link";

type ReaderProps = {
  slug: string;
};

const codeBlockTheme: Record<string, CSSProperties> = {
  'code[class*="language-"]': {
    color: "#4d5b7c",
    background: "#fafafa",
    fontFamily:
      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    fontSize: "0.9rem",
    lineHeight: "1.75",
    textShadow: "none",
    whiteSpace: "pre",
  },
  'pre[class*="language-"]': {
    color: "#4d5b7c",
    background: "#fafafa",
    fontFamily:
      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    fontSize: "0.9rem",
    lineHeight: "1.75",
    textShadow: "none",
    margin: 0,
    padding: "1rem 1.125rem",
    overflow: "auto",
    borderRadius: "1rem",
    border: "1px solid #e7eaf3",
  },
  comment: { color: "#8f96ad", fontStyle: "italic" },
  prolog: { color: "#8f96ad" },
  doctype: { color: "#8f96ad" },
  cdata: { color: "#8f96ad" },
  punctuation: { color: "#7a86a6" },
  namespace: { color: "#7a86a6" },
  property: { color: "#5d74a8" },
  tag: { color: "#5d74a8" },
  boolean: { color: "#7667a8" },
  number: { color: "#7667a8" },
  constant: { color: "#6c79b0" },
  symbol: { color: "#6c79b0" },
  selector: { color: "#5a73a6" },
  "attr-name": { color: "#5a73a6" },
  string: { color: "#6675af" },
  char: { color: "#6675af" },
  builtin: { color: "#6675af" },
  inserted: { color: "#6675af" },
  operator: { color: "#6f7794" },
  entity: { color: "#6f7794" },
  url: { color: "#6f7794" },
  atrule: { color: "#7d69a8" },
  "attr-value": { color: "#7d69a8" },
  keyword: { color: "#7d69a8" },
  function: { color: "#5a6d9f" },
  "class-name": { color: "#58659a" },
  regex: { color: "#5d7aaa" },
  variable: { color: "#5f6788" },
  important: { color: "#7d69a8", fontWeight: "600" },
  bold: { fontWeight: "600" },
  italic: { fontStyle: "italic" },
};

export default function Reader({ slug }: ReaderProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [book, setBook] = useState<BookDocument | null>(null);
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
    fetchBookContent(slug)
      .then(setBook)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "책을 불러올 수 없습니다"),
      )
      .finally(() => setLoading(false));
  }, [slug, router]);

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

  const { meta, body } = book;

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

                  return (
                    <SyntaxHighlighter
                      language={match[1]}
                      style={codeBlockTheme}
                      PreTag="div"
                      customStyle={{
                        background: "#fafafa",
                        margin: "1.5rem 0",
                        padding: "1rem 1.125rem",
                        borderRadius: "1rem",
                        border: "1px solid #e7eaf3",
                        boxShadow: "0 1px 2px rgba(74, 85, 120, 0.04)",
                      }}
                      codeTagProps={{
                        style: {
                          fontFamily:
                            'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                        },
                      }}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  );
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
              {body}
            </ReactMarkdown>
          </div>
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
