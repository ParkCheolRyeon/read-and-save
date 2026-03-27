"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createHighlighter, type Highlighter } from "shiki";
import { ArrowLeft, ChevronLeft, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import type { Flashcard } from "@/lib/cards";

/* ── Types ── */

type ChapterNav = {
  slug: string;
  title: string;
};

type FlashcardDeckProps = {
  cards: Flashcard[];
  title: string;
  prevChapter?: ChapterNav | null;
  nextChapter?: ChapterNav | null;
};

/* ── Shiki highlighter singleton ── */

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

/* ── Single Card ── */

function CardItem({ card }: { card: Flashcard }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="flex h-full flex-col"
      onClick={() => setFlipped((f) => !f)}
    >
      {!flipped ? (
        /* ── Front (Question) ── */
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 py-8 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-center text-lg font-semibold leading-relaxed text-zinc-800 [word-break:keep-all] dark:text-zinc-100 sm:text-xl">
            {card.question}
          </p>
          <p className="mt-8 text-xs text-zinc-400 dark:text-zinc-500">
            탭하여 답변 보기
          </p>
        </div>
      ) : (
        /* ── Back (Answer) ── */
        <div
          className="flex flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
          style={{ height: "100%", maxHeight: "100%" }}
        >
          <div
            className="card-answer-scroll overflow-y-auto px-4 py-5"
            style={{ flex: "1 1 0%", minHeight: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="prose prose-zinc max-w-none text-sm leading-7 [word-break:keep-all] prose-headings:font-semibold prose-h2:mt-8 prose-h2:border-b prose-h2:border-zinc-200 prose-h2:pb-2 prose-h2:text-lg prose-h3:mt-6 prose-h3:text-base prose-h4:mt-4 prose-h4:text-sm prose-p:text-zinc-700 prose-strong:text-zinc-900 prose-pre:my-0 prose-pre:bg-transparent prose-pre:p-0 prose-pre:shadow-none prose-pre:ring-0 prose-code:rounded prose-code:bg-[#f3f4fb] prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.85em] prose-code:text-[#5f6788] prose-code:before:content-none prose-code:after:content-none prose-blockquote:border-l-4 prose-blockquote:border-zinc-300 prose-blockquote:text-zinc-600 prose-li:marker:text-zinc-400 prose-table:block prose-table:overflow-x-auto dark:prose-invert dark:prose-p:text-zinc-200 dark:prose-strong:text-zinc-50 dark:prose-blockquote:border-zinc-600">
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
                    const codeStr = String(children).replace(/\n$/, "");
                    return <ShikiCodeBlock code={codeStr} lang={match[1]} />;
                  },
                  table: ({ node, ...props }) => {
                    void node;
                    return (
                      <div className="my-4 overflow-x-auto">
                        <table {...props} />
                      </div>
                    );
                  },
                }}
              >
                {card.answer}
              </ReactMarkdown>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFlipped(false);
            }}
            className="shrink-0 py-3 text-center text-xs text-zinc-400 transition hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            탭하여 질문 보기
          </button>
        </div>
      )}
    </div>
  );
}

/* ── FlashcardDeck ── */

export default function FlashcardDeck({
  cards,
  title,
  prevChapter,
  nextChapter,
}: FlashcardDeckProps) {
  const [deck] = useState<Flashcard[]>(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  /* ── Keyboard navigation ── */

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") {
        swiperRef.current?.slideNext();
      } else if (e.key === "ArrowLeft") {
        swiperRef.current?.slidePrev();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* ── Empty state ── */

  if (cards.length === 0) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-zinc-100 dark:bg-zinc-900">
        <p className="text-zinc-600 dark:text-zinc-400">
          추출된 카드가 없습니다.
        </p>
        <Link
          href="/cards"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-zinc-100 dark:bg-zinc-900">
      {/* ── Header ── */}
      <header className="flex shrink-0 items-center gap-2 border-b border-zinc-200 bg-white/95 px-4 py-2 backdrop-blur dark:border-zinc-700 dark:bg-zinc-800/95">
        <Link
          href="/cards"
          className="flex items-center rounded-lg p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
          aria-label="카드 목록으로"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-700 [word-break:keep-all] dark:text-zinc-300">
          {title}
        </p>
        <span className="shrink-0 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
          {currentIndex + 1} / {deck.length}
        </span>
      </header>

      {/* ── Swiper Card Area ── */}
      <div className="min-h-0 flex-1 px-4 py-4">
        <Swiper
          key={deck.map((c) => c.id).join(",")}
          spaceBetween={16}
          slidesPerView={1}
          onSwiper={(sw) => {
            swiperRef.current = sw;
          }}
          onSlideChange={(sw) => setCurrentIndex(sw.activeIndex)}
          className="h-full"
        >
          {deck.map((card) => (
            <SwiperSlide key={card.id} className="!h-full">
              <CardItem card={card} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ── Bottom chapter navigation ── */}
      <div
        className="flex shrink-0 items-center border-t border-zinc-200 bg-white/95 px-2 py-2 backdrop-blur dark:border-zinc-700 dark:bg-zinc-800/95"
        style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
      >
        {/* Prev chapter */}
        <div className="flex min-w-0 flex-1 justify-start">
          {prevChapter ? (
            <Link
              href={`/cards/${prevChapter.slug}`}
              className="flex min-w-0 items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              <ChevronLeft className="size-4 shrink-0" />
              <span className="truncate">{prevChapter.title}</span>
            </Link>
          ) : null}
        </div>

        {/* Home */}
        <Link
          href="/cards"
          className="flex shrink-0 items-center rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
          aria-label="카드 목록으로"
        >
          <Home className="size-5" />
        </Link>

        {/* Next chapter */}
        <div className="flex min-w-0 flex-1 justify-end">
          {nextChapter ? (
            <Link
              href={`/cards/${nextChapter.slug}`}
              className="flex min-w-0 items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              <span className="truncate">{nextChapter.title}</span>
              <ChevronRight className="size-4 shrink-0" />
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
