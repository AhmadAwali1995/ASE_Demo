import type { Stock } from "@/lib/ase/types";

export const PICKS_PER_SECTOR = 3;

export type SuggestPick = {
  symbol: string;
  name: string;
  nameAr: string;
  sector: string;
  close: number | null;
  profit: number | null;
  profitChangePct: number | null;
};

export type SectorPicks = {
  sector: string;
  picks: SuggestPick[];
};

function toPick(stock: Stock): SuggestPick {
  return {
    symbol: stock.symbol,
    name: stock.name,
    nameAr: stock.nameAr,
    sector: stock.sector,
    close: stock.close,
    profit: stock.profit,
    profitChangePct: stock.profitChangePct,
  };
}

export function placeholderPicks(stocks: Stock[], perSector = PICKS_PER_SECTOR): SectorPicks[] {
  const groups = new Map<string, Stock[]>();
  for (const stock of stocks) {
    if (stock.profit == null || stock.profit <= 0) continue;
    const list = groups.get(stock.sector) ?? [];
    list.push(stock);
    groups.set(stock.sector, list);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([sector, list]) => ({
      sector,
      picks: [...list]
        .sort((a, b) => {
          const profit = (b.profit ?? Number.NEGATIVE_INFINITY) - (a.profit ?? Number.NEGATIVE_INFINITY);
          if (profit !== 0) return profit;
          return (b.profitChangePct ?? Number.NEGATIVE_INFINITY) - (a.profitChangePct ?? Number.NEGATIVE_INFINITY);
        })
        .slice(0, perSector)
        .map(toPick),
    }))
    .filter((group) => group.picks.length > 0);
}
