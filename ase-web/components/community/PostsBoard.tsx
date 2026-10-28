"use client";

import { useMemo, useState } from "react";
import { PostCard } from "@/components/community/PostCard";
import { chipClass } from "@/lib/community/ui";
import type { Analyst, Post, PostKind } from "@/lib/community/types";
import { text, type Locale } from "@/lib/i18n";

type KindFilter = "all" | PostKind;

export function PostsBoard({
  posts,
  analysts,
  locale,
}: {
  posts: Post[];
  analysts: Analyst[];
  locale: Locale;
}) {
  const copy = text(locale);
  const [kind, setKind] = useState<KindFilter>("all");
  const byId = useMemo(() => new Map(analysts.map((item) => [item.id, item])), [analysts]);
  const visible = useMemo(
    () => (kind === "all" ? posts : posts.filter((post) => post.kind === kind)),
    [kind, posts],
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <p className="eyebrow">{copy.postsEyebrow}</p>
      <h1 className="mt-1 font-serif text-4xl">{copy.postsTitle}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">{copy.postsLede}</p>

      <div className="mt-6 flex flex-wrap gap-1.5" role="group" aria-label={copy.postsTitle}>
        {(
          [
            ["all", copy.filterAll],
            ["analysis", copy.filterAnalysis],
            ["recommendation", copy.filterRecommendation],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={kind === value}
            onClick={() => setKind(value)}
            className={chipClass(kind === value)}
          >
            {label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-line bg-paper-2 p-5 text-sm text-muted">
          {copy.noPosts}
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {visible.map((post) => {
            const analyst = byId.get(post.analystId);
            if (!analyst) return null;
            return <PostCard key={post.id} post={post} analyst={analyst} locale={locale} />;
          })}
        </div>
      )}
      <footer className="mt-8 text-xs leading-5 text-muted">{copy.communityDisclaimer}</footer>
    </main>
  );
}
