import { pick, type Locale } from "@/lib/i18n";
import { community } from "./snapshot";
import type { Analyst, Comment, Post, Review } from "./types";

export function getAnalysts(): Analyst[] {
  return community.analysts;
}

export function getAnalyst(id: string): Analyst | null {
  const needle = id.trim().toLowerCase();
  return community.analysts.find((item) => item.id === needle) ?? null;
}

export function getPosts(): Post[] {
  return [...community.posts].sort((a, b) => b.published.localeCompare(a.published));
}

export function getPostsByAnalyst(id: string): Post[] {
  return getPosts().filter((post) => post.analystId === id);
}

export function getComments(postId: string): Comment[] {
  return community.comments
    .filter((comment) => comment.postId === postId)
    .sort((a, b) => a.published.localeCompare(b.published));
}

export function getReviews(analystId: string): Review[] {
  return community.reviews
    .filter((review) => review.analystId === analystId)
    .sort((a, b) => b.published.localeCompare(a.published));
}

export function publicCounts(analystId: string): { analyses: number; recommendations: number } {
  const posts = community.posts.filter((post) => post.analystId === analystId);
  return {
    analyses: posts.filter((post) => post.kind === "analysis").length,
    recommendations: posts.filter((post) => post.kind === "recommendation").length,
  };
}

export function outcomeRecord(analystId: string): { success: number; failed: number; open: number } {
  const recs = community.posts.filter(
    (post) => post.analystId === analystId && post.kind === "recommendation" && post.outcome,
  );
  const tally = { success: 0, failed: 0, open: 0 };
  for (const post of recs) {
    const status = post.outcome?.status ?? "open";
    tally[status] += 1;
  }
  return tally;
}

export function analystName(analyst: Analyst): string {
  return analyst.nameAr;
}

export function analystLatin(analyst: Analyst): string {
  return analyst.nameEn;
}

export function personName(ar: string, en: string, locale: Locale): string {
  return locale === "ar" ? ar : `${ar} · ${en}`;
}

export function companyLabel(post: Post, locale: Locale): string {
  return locale === "ar" ? post.companyAr : post.companyEn;
}

export function postTitle(post: Post, locale: Locale): string {
  return pick(post.title, locale);
}

export function postBody(post: Post, locale: Locale): string {
  return pick(post.body, locale);
}
