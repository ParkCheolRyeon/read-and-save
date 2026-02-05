"use client";

import { useParams } from "next/navigation";
import Reader from "@/components/Reader";

export default function ReadPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";

  if (!slug) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-zinc-100 dark:bg-zinc-900">
        <p className="text-zinc-600 dark:text-zinc-400">잘못된 경로입니다.</p>
      </div>
    );
  }

  return <Reader slug={slug} />;
}
