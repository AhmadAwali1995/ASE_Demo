"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { Avatar } from "@/components/community/Avatar";
import {
  analystLatin,
  analystName,
  companyLabel,
  getComments,
  personName,
  postBody,
  postTitle,
} from "@/lib/community";
import { chipClass, deltaPct, outcomeClass } from "@/lib/community/ui";
import type { Analyst, Comment, Post } from "@/lib/community/types";
import { pick, text, type Locale } from "@/lib/i18n";
import { signedPercent } from "@/lib/format";

export function PostCard({
  post,
  analyst,
  locale,
}: {
  post: Post;
  analyst: Analyst;
  locale: Locale;
}) {
  const copy = text(locale);
  const seed = useMemo(() => getComments(post.id), [post.id]);
  const [comments, setComments] = useState<Comment[]>(seed);
  const [useful, setUseful] = useState(post.reactions.useful);
  const [agree, setAgree] = useState(post.reactions.agree);
  const [usefulOn, setUsefulOn] = useState(false);
  const [agreeOn, setAgreeOn] = useState(false);
  const [draft, setDraft] = useState("");

  function toggleUseful() {
    setUsefulOn((on) => {
      setUseful((count) => count + (on ? -1 : 1));
      return !on;
    });
  }

  function toggleAgree() {
    setAgreeOn((on) => {
      setAgree((count) => count + (on ? -1 : 1));
      return !on;
    });
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    const now = new Date().toISOString().slice(0, 10);
    setComments((current) => [
      ...current,
      {
        id: `local-${Date.now()}`,
        postId: post.id,
        authorAr: copy.commentGuestAr,
        authorEn: copy.commentGuestEn,
        published: now,
        body: { en: body, ar: body },
      },
    ]);
    setDraft("");
  }

  const outcome = post.outcome;
  const scoreDelta =
    outcome && outcome.scoreThen != null && outcome.scoreNow != null
      ? outcome.scoreNow - outcome.scoreThen
      : null;
  const priceDelta = outcome ? deltaPct(outcome.priceThen, outcome.priceNow) : null;

  return (
    <article className="rounded-2xl border border-line bg-paper-2 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Link href={`/${locale}/analysts/${analyst.id}`} className="flex min-w-0 items-center gap-3">
          <Avatar initials={analyst.initials} size="sm" />
          <span className="min-w-0">
            <span className="block font-serif text-lg leading-tight">{analystName(analyst)}</span>
            {locale === "en" ? <span className="block text-xs text-muted">{analystLatin(analyst)}</span> : null}
          </span>
        </Link>
        <div className="flex flex-wrap gap-1.5">
          <span className={chipClass(false)}>{post.kind === "analysis" ? copy.kindAnalysis : copy.kindRecommendation}</span>
          {outcome ? (
            <span className={`rounded-full px-3 py-2 text-xs ${outcomeClass(outcome.status)}`}>
              {outcome.status === "success"
                ? copy.outcomeSuccess
                : outcome.status === "failed"
                  ? copy.outcomeFailed
                  : copy.outcomeOpen}
            </span>
          ) : null}
        </div>
      </div>

      <p className="mt-4 text-xs tracking-wide text-gold">
        {post.symbol} · {companyLabel(post, locale)}
      </p>
      <h2 className="mt-1 font-serif text-2xl leading-snug">{postTitle(post, locale)}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{postBody(post, locale)}</p>
      <p className="mt-3 text-xs text-muted">
        {copy.publishedOn} <span className="numeric">{post.published}</span>
      </p>

      {outcome ? (
        <dl className="mt-4 grid gap-3 rounded-xl border border-line bg-paper p-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs text-muted">{copy.outcomeProfit}</dt>
            <dd className="numeric mt-0.5">
              {signedPercent(outcome.profitThen == null ? null : outcome.profitThen * 100)}
              {outcome.profitNow != null
                ? ` → ${signedPercent(outcome.profitNow * 100)}`
                : ""}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">{copy.outcomeScore}</dt>
            <dd className="numeric mt-0.5">
              {outcome.scoreThen ?? "—"}
              {outcome.scoreNow != null ? ` → ${outcome.scoreNow}` : ""}
              {scoreDelta != null ? ` (${scoreDelta > 0 ? "+" : ""}${scoreDelta})` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">{copy.outcomePrice}</dt>
            <dd className={`numeric mt-0.5 ${priceDelta != null && priceDelta > 0 ? "up" : priceDelta != null && priceDelta < 0 ? "down" : ""}`}>
              {signedPercent(priceDelta == null ? null : priceDelta * 100)}
            </dd>
          </div>
          <div className="sm:col-span-3 text-xs text-muted">
            {copy.outcomeDue} <span className="numeric">{outcome.due}</span>
            {outcome.judgedOn ? (
              <>
                {" · "}
                {copy.outcomeJudged} <span className="numeric">{outcome.judgedOn}</span>
              </>
            ) : null}
          </div>
        </dl>
      ) : (
        <p className="mt-4 text-xs text-muted">{copy.analysisNotScored}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        <button type="button" aria-pressed={usefulOn} onClick={toggleUseful} className={chipClass(usefulOn)}>
          {copy.useful} <span className="numeric">{useful}</span>
        </button>
        <button type="button" aria-pressed={agreeOn} onClick={toggleAgree} className={chipClass(agreeOn)}>
          {copy.agree} <span className="numeric">{agree}</span>
        </button>
      </div>

      <section className="mt-5 border-t border-line pt-4" aria-label={copy.comments}>
        <h3 className="font-serif text-xl">{copy.comments}</h3>
        {comments.length === 0 ? (
          <p className="mt-2 text-sm text-muted">{copy.noComments}</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {comments.map((comment) => (
              <li key={comment.id} className="rounded-xl bg-paper px-3 py-3">
                <p className="text-sm">
                  <span className="font-medium">{personName(comment.authorAr, comment.authorEn, locale)}</span>
                  <span className="numeric ms-2 text-xs text-muted">{comment.published}</span>
                </p>
                <p className="mt-1 text-sm leading-6 text-muted">{pick(comment.body, locale)}</p>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={submit} className="mt-3 flex flex-col gap-2 sm:flex-row">
          <label className="min-w-0 flex-1">
            <span className="sr-only">{copy.writeComment}</span>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={copy.commentPlaceholder}
              className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-gold"
            />
          </label>
          <button
            type="submit"
            disabled={!draft.trim()}
            className="rounded-full border border-line px-4 py-3 text-sm hover:bg-gold-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copy.sendComment}
          </button>
        </form>
      </section>
    </article>
  );
}
