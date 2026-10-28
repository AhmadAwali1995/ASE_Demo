"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/community/Avatar";
import { analystLatin, analystName, publicCounts } from "@/lib/community";
import { chipClass } from "@/lib/community/ui";
import type { Analyst } from "@/lib/community/types";
import { sectorLabel, text, type Locale } from "@/lib/i18n";

export function AnalystsBoard({ analysts, locale }: { analysts: Analyst[]; locale: Locale }) {
  const copy = text(locale);
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return analysts;
    return analysts.filter((analyst) => {
      const sector = sectorLabel(analyst.sector, locale).toLowerCase();
      return (
        analyst.nameAr.includes(query.trim()) ||
        analyst.nameEn.toLowerCase().includes(needle) ||
        analyst.sector.toLowerCase().includes(needle) ||
        sector.includes(needle)
      );
    });
  }, [analysts, locale, query]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <p className="eyebrow">{copy.analystsEyebrow}</p>
      <h1 className="mt-1 font-serif text-4xl">{copy.analystsTitle}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">{copy.analystsLede}</p>

      <label className="mt-6 block">
        <span className="sr-only">{copy.searchAnalysts}</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={copy.searchAnalystsPlaceholder}
          className="w-full rounded-xl border border-line bg-paper-2 px-4 py-3 text-sm outline-none focus:border-gold"
        />
      </label>

      {visible.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-line bg-paper-2 p-5 text-sm text-muted">
          {copy.noAnalysts}
        </p>
      ) : (
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {visible.map((analyst) => {
            const counts = publicCounts(analyst.id);
            return (
              <li key={analyst.id}>
                <Link
                  href={`/${locale}/analysts/${analyst.id}`}
                  className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-4 hover:border-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  <div className="flex items-start gap-3">
                    <Avatar initials={analyst.initials} />
                    <div className="min-w-0">
                      <p className="font-serif text-2xl leading-tight">{analystName(analyst)}</p>
                      {locale === "en" ? <p className="text-xs text-muted">{analystLatin(analyst)}</p> : null}
                      <p className="mt-1 text-sm text-muted">{sectorLabel(analyst.sector, locale)}</p>
                    </div>
                    {analyst.consulting ? (
                      <span className={`${chipClass(false)} ms-auto shrink-0`}>{copy.paidConsulting}</span>
                    ) : null}
                  </div>
                  <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <dt className="text-xs text-muted">{copy.userRating}</dt>
                      <dd className="numeric mt-0.5">
                        {analyst.rating.toFixed(1)}
                        <span className="ms-1 text-xs text-muted">{copy.reviewsCount(analyst.reviewCount)}</span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">{copy.publicNotes}</dt>
                      <dd className="mt-0.5 text-xs leading-5">
                        {copy.analysesCount(counts.analyses)}
                        <br />
                        {copy.recsCount(counts.recommendations)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">{copy.followers}</dt>
                      <dd className="numeric mt-0.5">{copy.followersCount(analyst.followers)}</dd>
                    </div>
                  </dl>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <footer className="mt-8 text-xs leading-5 text-muted">{copy.communityDisclaimer}</footer>
    </main>
  );
}
