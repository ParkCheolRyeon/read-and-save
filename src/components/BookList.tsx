"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchBookList } from "@/lib/books";
import type { BookEntry } from "@/lib/books";
import Spinner from "./Spinner";
import { BookOpen, LogOut } from "lucide-react";
import { clearAuth } from "@/lib/auth";

export default function BookList() {
  const [books, setBooks] = useState<BookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookList()
      .then(setBooks)
      .catch((e) => setError(e instanceof Error ? e.message : "목록을 불러올 수 없습니다"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-zinc-100 dark:bg-zinc-900">
        <Spinner className="text-zinc-600 dark:text-zinc-400" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">책 목록 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-4 bg-zinc-100 dark:bg-zinc-900">
        <p className="text-center text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-100 dark:bg-zinc-900">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-zinc-700 dark:bg-zinc-800/95">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          이북 리더
        </h1>
        <button
          type="button"
          onClick={() => {
            clearAuth();
            window.location.href = "/";
          }}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
          aria-label="로그아웃"
        >
          <LogOut className="size-4" />
          로그아웃
        </button>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6">
        <ul className="grid gap-3 sm:grid-cols-2">
          {books.map((book) => (
            <li key={book.id}>
              <Link
                href={`/read/${book.id}`}
                className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow dark:border-zinc-600 dark:bg-zinc-800 dark:hover:border-zinc-500"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
                  <BookOpen className="size-6" />
                </div>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {book.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {books.length === 0 && (
          <p className="py-12 text-center text-zinc-500 dark:text-zinc-400">
            등록된 책이 없습니다.
          </p>
        )}
      </main>
    </div>
  );
}
