import { DataError } from "@/components/DataError";
import { WatchBoard } from "@/components/WatchBoard";
import { getMarket } from "@/lib/ase/market";
import { explainError, isLocale, text } from "@/lib/i18n";
import { notFound } from "next/navigation";

export const dynamic = "force-static";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = text(locale);

  try {
    const market = await getMarket();
    if (market.stocks.length === 0) {
      return <DataError title={copy.filesDidNotLoad} message={copy.emptyFiles} note={copy.errorNote} />;
    }
    return <WatchBoard market={market} locale={locale} />;
  } catch (error) {
    return <DataError title={copy.filesDidNotLoad} message={explainError(error, locale)} note={copy.errorNote} />;
  }
}
