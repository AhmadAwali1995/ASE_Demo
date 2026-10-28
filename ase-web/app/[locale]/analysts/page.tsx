import { AnalystsBoard } from "@/components/community/AnalystsBoard";
import { getAnalysts } from "@/lib/community";
import { isLocale, text } from "@/lib/i18n";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: text(locale).analystsTitle };
}

export default async function AnalystsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <AnalystsBoard locale={locale} analysts={getAnalysts()} />;
}
