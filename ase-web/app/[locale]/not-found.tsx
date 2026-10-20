"use client";

import { localeFromPath, text } from "@/lib/i18n";
import { usePathname } from "next/navigation";

export default function NotFound() {
  const locale = localeFromPath(usePathname());
  const copy = text(locale);
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="font-serif text-3xl text-ink">{locale === "ar" ? "الصفحة غير موجودة." : "This page is not here."}</p>
      <p className="mt-3 text-sm text-muted">{copy.exchange}</p>
    </main>
  );
}
