"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/community/Avatar";
import { PostCard } from "@/components/community/PostCard";
import {
  analystLatin,
  analystName,
  outcomeRecord,
  personName,
  publicCounts,
} from "@/lib/community";
import { chipClass, outcomeClass } from "@/lib/community/ui";
import type { Analyst, Post, Review } from "@/lib/community/types";
import { pick, sectorLabel, text, type Locale } from "@/lib/i18n";

export function AnalystProfile({
  analyst,
  posts,
  reviews,
  locale,
}: {
  analyst: Analyst;
  posts: Post[];
  reviews: Review[];
  locale: Locale;
}) {
  const copy = text(locale);
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(analyst.followers);
  const counts = publicCounts(analyst.id);
  const record = outcomeRecord(analyst.id);

  function toggleFollow() {
    setFollowing((on) => {
      setFollowers((count) => count + (on ? -1 : 1));
      return !on;
    });
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <Link href={`/${locale}/analysts`} className={chipClass(false)}>
        {copy.backToAnalysts}
      </Link>

      <section className="mt-6 rounded-2xl border border-line bg-paper-2 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <Avatar initials={analyst.initials} size="lg" />
            <div>
              <p className="eyebrow">{copy.analystsEyebrow}</p>
              <h1 className="mt-1 font-serif text-4xl leading-tight">{analystName(analyst)}</h1>
              {locale === "en" ? <p className="mt-1 text-sm text-muted">{analystLatin(analyst)}</p> : null}
              <p className="mt-2 text-sm text-muted">{sectorLabel(analyst.sector, locale)}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {analyst.consulting ? <span className={chipClass(false)}>{copy.paidConsulting}</span> : null}
            <button type="button" aria-pressed={following} onClick={toggleFollow} className={chipClass(following)}>
              {following ? copy.following : copy.follow}
            </button>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-6">{pick(analyst.bio, locale)}</p>
        {analyst.consulting ? (
          <p className="mt-3 max-w-2xl text-sm text-muted">{pick(analyst.consultingNote, locale)}</p>
        ) : null}

        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Stat label={copy.userRating} value={`${analyst.rating.toFixed(1)} · ${copy.reviewsCount(analyst.reviewCount)}`} />
          <Stat
            label={copy.publicNotes}
            value={`${copy.analysesCount(counts.analyses)} · ${copy.recsCount(counts.recommendations)}`}
          />
          <Stat label={copy.followers} value={copy.followersCount(followers)} />
          <div>
            <dt className="text-xs text-muted">{copy.joinedOn}</dt>
            <dd className="numeric mt-1">{analyst.joined}</dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-wrap gap-1.5 text-xs">
          <span className={`rounded-full px-3 py-2 ${outcomeClass("success")}`}>
            {copy.outcomeSuccess} {record.success}
          </span>
          <span className={`rounded-full px-3 py-2 ${outcomeClass("failed")}`}>
            {copy.outcomeFailed} {record.failed}
          </span>
          <span className={`rounded-full px-3 py-2 ${outcomeClass("open")}`}>
            {copy.outcomeOpen} {record.open}
          </span>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl">{copy.latestPosts}</h2>
        {posts.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-line bg-paper-2 p-5 text-sm text-muted">
            {copy.noAnalystPosts}
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} analyst={analyst} locale={locale} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl">{copy.reviewsTitle}</h2>
        {reviews.length === 0 ? (
          <p className="mt-3 text-sm text-muted">{copy.noReviews}</p>
        ) : (
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {reviews.map((review) => (
              <li key={review.id} className="rounded-2xl border border-line bg-paper-2 p-4">
                <p className="text-sm">
                  <span className="font-medium">{personName(review.authorAr, review.authorEn, locale)}</span>
                  <span className="numeric ms-2 text-gold">{review.rating.toFixed(1)}</span>
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">{pick(review.body, locale)}</p>
                <p className="numeric mt-2 text-xs text-muted">{review.published}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <footer className="mt-8 text-xs leading-5 text-muted">{copy.communityDisclaimer}</footer>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}
