"use client";

import { useEffect, useState } from "react";
import LoginForm from "@/components/LoginForm";
import BookList from "@/components/BookList";
import { isAuthenticated } from "@/lib/auth";
import Spinner from "@/components/Spinner";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    setAuth(isAuthenticated());
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-zinc-100 dark:bg-zinc-900">
        <Spinner className="text-zinc-600 dark:text-zinc-400" />
      </div>
    );
  }

  if (!auth) {
    return <LoginForm />;
  }

  return <BookList />;
}
