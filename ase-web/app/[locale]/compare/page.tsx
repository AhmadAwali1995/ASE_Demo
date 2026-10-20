import { CompareBoard } from "@/components/CompareBoard";
import { DataError } from "@/components/DataError";
import { getMarket } from "@/lib/ase/market";
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
  return { title: text(locale).reportsTitle };
}

export default async function ComparePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = text(locale);

  try {
    const market = await getMarket();
    if (market.stocks.length === 0) {
      return <DataError title={copy.filesDidNotLoad} message={copy.emptyFiles} note={copy.errorNote} />;
    }
    return (
      <CompareBoard
        locale={locale}
        market={{
          ...market,
          stocks: market.stocks.map((stock) => ({ ...stock, timeline: [], spark: [] })),
        }}
      />
    );
  } catch (error) {
    return <DataError title={copy.filesDidNotLoad} message={explainError(error, locale)} note={copy.errorNote} />;
  }
}
