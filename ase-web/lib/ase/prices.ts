import * as XLSX from "xlsx";
import { asCode, num } from "./numbers";
import type { PricePoint } from "./types";

export type PriceHistory = {
  symbol: string;
  code: string;
  name: string;
  points: PricePoint[];
};

export function mergePriceHistories(batches: PriceHistory[][]): PriceHistory[] {
  const bySymbol = new Map<string, { code: string; name: string; dates: Map<string, number> }>();
  for (const batch of batches) {
    for (const history of batch) {
      const current = bySymbol.get(history.symbol) ?? {
        code: history.code,
        name: history.name,
        dates: new Map<string, number>(),
      };
      if (history.code) current.code = history.code;
      if (history.name) current.name = history.name;
      for (const point of history.points) current.dates.set(point.date, point.close);
      bySymbol.set(history.symbol, current);
    }
  }
  return [...bySymbol.entries()].map(([symbol, value]) => ({
    symbol,
    code: value.code,
    name: value.name,
    points: [...value.dates.entries()]
      .sort((left, right) => left[0].localeCompare(right[0]))
      .map(([date, close]) => ({ date, close })),
  }));
}

export function parseClosingPrices(buffer: Buffer): PriceHistory[] {
  const book = XLSX.read(buffer, { type: "buffer" });
  const sheet = book.Sheets[book.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    raw: true,
    defval: null,
  });
  const header = rows[0] ?? [];
  const dates = header
    .map((cell, index) => ({ index, date: asDate(cell) }))
    .filter((column): column is { index: number; date: string } => column.index >= 3 && column.date != null);

  const histories: PriceHistory[] = [];
  for (const row of rows.slice(1)) {
    const symbol = String(row[0] ?? "").trim().toUpperCase();
    const code = asCode(row[1]);
    if (!symbol || !code) continue;
    const points: PricePoint[] = [];
    for (const column of dates) {
      const close = num(row[column.index]);
      if (close == null || close <= 0) continue;
      points.push({ date: column.date, close });
    }
    histories.push({
      symbol,
      code,
      name: String(row[2] ?? symbol).replace(/\s+/g, " ").trim(),
      points,
    });
  }
  return histories;
}

function asDate(value: unknown): string | null {
  if (typeof value === "string") {
    const match = value.match(/\d{4}-\d{2}-\d{2}/);
    return match?.[0] ?? null;
  }
  if (typeof value === "number" && value > 20000 && value < 80000) {
    const utc = new Date(Date.UTC(1899, 11, 30) + Math.round(value) * 86400000);
    return utc.toISOString().slice(0, 10);
  }
  return null;
}
