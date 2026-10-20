import { DataError } from "@/components/DataError";
import { StatementsBoard } from "@/components/StatementsBoard";
import { getMarket, getStock } from "@/lib/ase/market";
import { explainError, isLocale, text } from "@/lib/i18n";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  const market = await getMarket();
  return market.stocks.map((stock) => ({ symbol: stock.symbol }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; symbol: string }>;
}): Promise<Metadata> {
  const { locale, symbol } = await params;
  if (!isLocale(locale)) return {};
  return { title: `${symbol.toUpperCase()} · ${text(locale).statementsTitle}` };
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ locale: string; symbol: string }>;
}) {
  const { locale, symbol } = await params;
  if (!isLocale(locale)) notFound();
  const copy = text(locale);

  try {
    const market = await getMarket();
    const stock = getStock(market, symbol);
    if (!stock) notFound();
    return <StatementsBoard stock={stock} statements={[]} locale={locale} />;
  } catch (error) {
    return <DataError title={copy.filesDidNotLoad} message={explainError(error, locale)} note={copy.errorNote} />;
  }
}
