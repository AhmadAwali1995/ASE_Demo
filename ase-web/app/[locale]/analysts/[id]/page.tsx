import { AnalystProfile } from "@/components/community/AnalystProfile";
import { getAnalyst, getAnalysts, getPostsByAnalyst, getReviews } from "@/lib/community";
import { isLocale, text } from "@/lib/i18n";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAnalysts().map((analyst) => ({ id: analyst.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const analyst = getAnalyst(id);
  if (!isLocale(locale) || !analyst) return {};
  return { title: analyst.nameAr };
}

export default async function AnalystPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const analyst = getAnalyst(id);
  if (!analyst) notFound();
  return (
    <AnalystProfile
      locale={locale}
      analyst={analyst}
      posts={getPostsByAnalyst(analyst.id)}
      reviews={getReviews(analyst.id)}
    />
  );
}
