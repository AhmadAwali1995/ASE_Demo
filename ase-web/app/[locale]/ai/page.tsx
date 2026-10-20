import { DataError } from "@/components/DataError";
import { SuggestBoard } from "@/components/SuggestBoard";
import { getMarket } from "@/lib/ase/market";
import { placeholderPicks } from "@/lib/ase/picks";
import { explainError, isLocale, text } from "@/lib/i18n";
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
  return { title: text(locale).aiTitle };
}

export default async function AiPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = text(locale);

  try {
    const market = await getMarket();
    if (market.stocks.length === 0) {
      return <DataError title={copy.filesDidNotLoad} message={copy.emptyFiles} note={copy.errorNote} />;
    }
    return <SuggestBoard locale={locale} groups={placeholderPicks(market.stocks)} />;
  } catch (error) {
    return <DataError title={copy.filesDidNotLoad} message={explainError(error, locale)} note={copy.errorNote} />;
  }
}
