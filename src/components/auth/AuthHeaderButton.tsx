"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLoginUrl, isReturningUserClient } from "@/lib/auth-redirect";

export default function AuthHeaderButton() {
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    setIsReturning(isReturningUserClient());
  }, []);

  if (isReturning) {
    return (
      <Link
        href={getLoginUrl()}
        className="hidden sm:inline-flex px-3 sm:px-4 py-1.5 sm:py-2 bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Sign In
      </Link>
    );
  }

  return (
    <Link
      href="/register"
      className="hidden sm:inline-flex px-3 sm:px-4 py-1.5 sm:py-2 bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
    >
      Create Account
    </Link>
  );
}
