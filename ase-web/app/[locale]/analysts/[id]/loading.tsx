"use client";

import { localeFromPath, text } from "@/lib/i18n";
import { usePathname } from "next/navigation";

export default function ProfileLoading() {
  const copy = text(localeFromPath(usePathname()));
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="font-serif text-3xl">{copy.loadingProfileTitle}</p>
      <p className="mt-2 text-sm text-muted">{copy.loadingProfileBody}</p>
    </main>
  );
}
