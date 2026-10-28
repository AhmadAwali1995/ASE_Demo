import { parseBulletin } from "./bulletin";
import { groupFactsByCode, parseGuideZip, type YearFacts } from "./guides";
import { fetchBuffer, fetchText } from "./http";
import { mergePriceHistories, parseClosingPrices, type PriceHistory } from "./prices";
import { buildStock } from "./score";
import type { Market, PricePoint } from "./types";

const DAILY_BULLETIN = "https://www.ase.com.jo/en/bulletins/daily/markets";
const DAILY_BULLETIN_AR = "https://www.ase.com.jo/ar/bulletins/daily/markets";
const PRICE_FILES = [
  "https://www.ase.com.jo/sites/default/files/2024-01/closing_prices_2021_0.xlsx",
  "https://www.ase.com.jo/sites/default/files/2024-01/closing_prices_2022_0.xlsx",
  "https://www.ase.com.jo/sites/default/files/2024-01/closing_prices_2023_0.xlsx",
  "https://www.ase.com.jo/sites/default/files/closing_prices_2024.xlsx",
  "https://www.ase.com.jo/sites/default/files/closing_prices_2025.xlsx",
  "https://www.ase.com.jo/sites/default/files/closing_prices_2026.xlsx",
];
const GUIDE_ZIPS = [
  "https://www.ase.com.jo/sites/default/files/2026-08/Companies%27Guide%202026_1.zip",
  "https://www.ase.com.jo/sites/default/files/2026-08/Companies%27Guide%202025_1.zip",
  "https://www.ase.com.jo/sites/default/files/2025-08/Companies%27Guide%202024_3.zip",
  "https://www.ase.com.jo/sites/default/files/2026-08/Companies%27Guide%202023.zip",
  "https://www.ase.com.jo/sites/default/files/2022-12/Companies%27%20Guide%202022_0.zip",
  "https://www.ase.com.jo/sites/default/files/2022-10/Companies%27%20Guide%202021.zip",
  "https://www.ase.com.jo/sites/default/files/2022-10/Companies%27Guide%202020.zip",
];

export async function loadMarket(): Promise<Market> {
  const bulletinResult = await fetchText(DAILY_BULLETIN, "ASE bulletin").then(parseBulletin);
  const arabicBulletin = await fetchText(DAILY_BULLETIN_AR, "ASE bulletin")
    .then(parseBulletin)
    .catch(() => null);
  const priceBatches = await mapSequential(PRICE_FILES, (url) =>
    fetchBuffer(url).then(parseClosingPrices).catch(() => [] as PriceHistory[]),
  );
  const guideResults = await mapSequential(GUIDE_ZIPS, (url) =>
    fetchBuffer(url).then(parseGuideZip).catch(() => [] as YearFacts[]),
  );
  const pricesResult = mergePriceHistories(priceBatches);

  const facts = groupFactsByCode(guideResults.flat());
  const pricesBySymbol = new Map(pricesResult.map((history) => [history.symbol, history]));
  const quotesBySymbol = new Map(bulletinResult.quotes.map((quote) => [quote.symbol, quote]));
  const quotesByCode = new Map(bulletinResult.quotes.map((quote) => [quote.code, quote]));
  const arabicNames = new Map(
    (arabicBulletin?.quotes ?? [])
      .filter((quote) => /[\u0600-\u06FF]/.test(quote.name))
      .map((quote) => [quote.symbol, quote.name]),
  );

  const symbols = new Set<string>([
    ...pricesResult.map((history) => history.symbol),
    ...bulletinResult.quotes.map((quote) => quote.symbol),
  ]);

  const timelines = new Map<string, PricePoint[]>();
  for (const symbol of symbols) {
    const history = pricesBySymbol.get(symbol);
    const quote = quotesBySymbol.get(symbol) ?? (history ? quotesByCode.get(history.code) : undefined);
    timelines.set(symbol, withLatestClose(history?.points ?? [], bulletinResult.asOf, quote?.close ?? null));
  }

  const stocks = [...symbols].map((symbol) => {
    const history = pricesBySymbol.get(symbol);
    const quote = quotesBySymbol.get(symbol) ?? (history ? quotesByCode.get(history.code) : undefined);
    const code = quote?.code ?? history?.code ?? "";
    const years = facts.get(code) ?? [];
    const latest = years[0];
    const name = quote?.name || history?.name || latest?.name || symbol;
    return buildStock({
      symbol,
      code,
      name,
      nameAr: arabicNames.get(symbol) || latest?.nameAr || "",
      sector: latest?.sector || "Listed company",
      close: quote?.close ?? null,
      dayChangePct: quote?.dayChangePct ?? null,
      low12: quote?.low12 ?? null,
      high12: quote?.high12 ?? null,
      pe: quote?.pe ?? null,
      dividendYield: quote?.dividendYield ?? null,
      facts: years,
      timeline: timelines.get(symbol) ?? [],
    });
  });

  stocks.sort((a, b) => {
    const aChange = a.profitChangePct;
    const bChange = b.profitChangePct;
    if (aChange == null && bChange == null) return (b.score ?? -1) - (a.score ?? -1);
    if (aChange == null) return 1;
    if (bChange == null) return -1;
    if (aChange !== bChange) return bChange - aChange;
    return (b.score ?? -1) - (a.score ?? -1);
  });

  const years = stocks.map((stock) => stock.reportYear).filter((year): year is number => year != null);
  const priors = stocks.map((stock) => stock.priorYear).filter((year): year is number => year != null);

  return {
    asOf: bulletinResult.asOf,
    indexName: bulletinResult.indexName,
    indexValue: bulletinResult.indexValue,
    indexChangePct: bulletinResult.indexChangePct,
    reportYear: years.sort((a, b) => b - a)[0] ?? null,
    priorYear: priors.sort((a, b) => b - a)[0] ?? null,
    stocks,
  };
}

function withLatestClose(points: PricePoint[], asOf: string, close: number | null): PricePoint[] {
  if (close == null) return points;
  if (points.some((point) => point.date === asOf)) return points;
  const last = points[points.length - 1];
  if (last && asOf < last.date) return points;
  return [...points, { date: asOf, close }];
}

async function mapSequential<T, R>(items: T[], fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (const item of items) out.push(await fn(item));
  return out;
}
