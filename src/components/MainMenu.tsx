"use client";

import Link from "next/link";
import { BookOpen, Layers, LogOut } from "lucide-react";
import { clearAuth } from "@/lib/auth";

export default function MainMenu() {
  return (
    <div className="min-h-[100dvh] bg-zinc-100 dark:bg-zinc-900">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-zinc-700 dark:bg-zinc-800/95">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          학습 도구
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
      <main className="mx-auto flex max-w-2xl items-center justify-center px-4 py-16">
        <div className="grid w-full gap-6 sm:grid-cols-2">
          <Link
            href="/books"
            className="flex flex-col items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-600 dark:bg-zinc-800 dark:hover:border-zinc-500"
          >
            <div className="flex size-16 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
              <BookOpen className="size-8" />
            </div>
            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              이북 리더
            </span>
          </Link>
          <Link
            href="/cards"
            className="flex flex-col items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-600 dark:bg-zinc-800 dark:hover:border-zinc-500"
          >
            <div className="flex size-16 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
              <Layers className="size-8" />
            </div>
            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              메모리 카드
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
