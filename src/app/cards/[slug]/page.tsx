"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchBookContent } from "@/lib/books";
import { extractCards } from "@/lib/cards";
import type { Flashcard } from "@/lib/cards";
import { isAuthenticated } from "@/lib/auth";
import Spinner from "@/components/Spinner";
import FlashcardDeck from "@/components/FlashcardDeck";
import Link from "next/link";

export default function CardPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === "string" ? params.slug : "";

  const [cards, setCards] = useState<Flashcard[] | null>(null);
  const [title, setTitle] = useState("메모리 카드");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/");
      return;
    }
    if (!slug) return;

    fetchBookContent(slug)
      .then(async (book) => {
        setTitle(book.meta.title ?? "메모리 카드");
        const extracted = await extractCards(slug, book);
        setCards(extracted);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "카드를 불러올 수 없습니다"),
      )
      .finally(() => setLoading(false));
  }, [slug, router]);

  if (!slug) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-zinc-100 dark:bg-zinc-900">
        <p className="text-zinc-600 dark:text-zinc-400">
          잘못된 경로입니다.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-zinc-100 dark:bg-zinc-900">
        <Spinner className="text-zinc-600 dark:text-zinc-400" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          카드를 불러오는 중...
        </p>
      </div>
    );
  }

  if (error || !cards) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-4 bg-zinc-100 dark:bg-zinc-900">
        <p className="text-center text-red-600 dark:text-red-400">
          {error ?? "카드를 불러올 수 없습니다."}
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

  return <FlashcardDeck cards={cards} title={title} />;
}
