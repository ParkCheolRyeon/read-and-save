"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { fetchBookContent } from "@/lib/books";
import { isAuthenticated } from "@/lib/auth";
import Spinner from "./Spinner";
import { ArrowLeft, ArrowUp } from "lucide-react";
import Link from "next/link";

type ReaderProps = {
  slug: string;
};

export default function Reader({ slug }: ReaderProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<string | null>(null);
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
      .then(setContent)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "책을 불러올 수 없습니다")
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

  if (error || content === null) {
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
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          읽기
        </span>
      </header>
      <div
        ref={scrollRef}
        className="reader-content overflow-x-hidden overflow-y-auto overscroll-y-contain px-4 pt-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))]"
        style={{
          height: "calc(100dvh - 52px)",
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <article
          className="reader-prose mx-auto min-w-0 max-w-xl break-words prose prose-zinc max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:break-words prose-headings:[word-break:keep-all] prose-p:leading-relaxed prose-li:my-0.5 [word-break:keep-all]"
          style={{
            scrollSnapAlign: "start",
            scrollSnapStop: "always",
            minHeight: "min(100%, calc(100dvh - 52px - 3rem))",
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>
      </div>
      <button
        type="button"
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-20 flex size-12 items-center justify-center rounded-full bg-zinc-800 text-white shadow-lg transition hover:bg-zinc-700 active:scale-95 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-100"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
        aria-label="맨 위로"
      >
        <ArrowUp className="size-6" />
      </button>
    </div>
  );
}
