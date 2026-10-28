"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { swapLocale, text, type Locale } from "@/lib/i18n";

export function SiteHeader({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const copy = text(locale);
  const home = `/${locale}`;
  const compare = `/${locale}/compare`;
  const ai = `/${locale}/ai`;
  const analysts = `/${locale}/analysts`;
  const posts = `/${locale}/posts`;
  const links = [
    { href: home, label: copy.watch },
    { href: compare, label: copy.compare },
    { href: ai, label: copy.ai },
    { href: analysts, label: copy.analysts },
    { href: posts, label: copy.postsNav },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href={home} className="min-w-0">
          <span className="block font-serif text-xl leading-none text-ink">{copy.brand}</span>
          <span className="mt-1 block text-xs text-muted">{copy.exchange}</span>
        </Link>
        <div className="flex items-center gap-2">
          <nav aria-label={copy.pages} className="flex max-w-full overflow-x-auto rounded-full border border-line bg-paper-2 p-1">
            {links.map((link) => {
              const active =
                link.href === home
                  ? pathname === home || pathname === `${home}/`
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`whitespace-nowrap rounded-full px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                    active ? "bg-ink text-paper-2" : "text-ink hover:bg-gold-soft"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <nav aria-label={copy.language} className="flex rounded-full border border-line bg-paper-2 p-1">
            {(["en", "ar"] as const).map((item) => {
              const active = item === locale;
              return (
                <Link
                  key={item}
                  href={swapLocale(pathname, item)}
                  hrefLang={item}
                  lang={item}
                  aria-current={active ? "true" : undefined}
                  className={`rounded-full px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                    active ? "bg-ink text-paper-2" : "text-ink hover:bg-gold-soft"
                  }`}
                >
                  {item === "en" ? copy.english : copy.arabic}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
