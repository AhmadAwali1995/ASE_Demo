import { num } from "./numbers";

export type Quote = {
  code: string;
  symbol: string;
  name: string;
  sectorCode: string;
  close: number | null;
  lastClose: number | null;
  change: number | null;
  dayChangePct: number | null;
  low12: number | null;
  high12: number | null;
  pe: number | null;
  dividendYield: number | null;
};

export type Bulletin = {
  asOf: string;
  indexName: string | null;
  indexValue: number | null;
  indexChangePct: number | null;
  quotes: Quote[];
};

function cells(row: string): string[] {
  const values: string[] = [];
  const pattern = /<td\b([^>]*)>([\s\S]*?)<\/td>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(row))) {
    const text = match[2]
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&#039;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    values.push(text);
  }
  return values;
}

export function parseBulletin(html: string): Bulletin {
  const dated = html.match(
    /name="start"[^>]*value="(\d{4}-\d{2}-\d{2})"/,
  );
  const asOf = dated?.[1] ?? new Date().toISOString().slice(0, 10);

  let indexName: string | null = null;
  let indexValue: number | null = null;
  let indexChangePct: number | null = null;
  const quotes: Quote[] = [];

  const rows = html.match(/<tr\b[\s\S]*?<\/tr>/gi) ?? [];
  for (const row of rows) {
    const values = cells(row);
    if (values.length === 0) continue;
    const joined = values.join(" ");
    if (/Index\s*:/i.test(joined) && indexValue == null) {
      indexName = values[0]?.replace(/\s+/g, " ") || null;
      indexValue = num(joined.match(/Index\s*:\s*([\d,.]+)/i)?.[1] ?? null);
      indexChangePct = num(joined.match(/CHG\s*:\s*([+-]?[\d.]+)\s*%/i)?.[1] ?? null);
      continue;
    }
    if (values.length < 16) continue;
    const symbol = values[7]?.trim().toUpperCase();
    const code = values[5]?.trim();
    if (!symbol || !/^[A-Z][A-Z0-9.]{1,11}$/.test(symbol)) continue;
    if (!/^\d{5,7}$/.test(code)) continue;
    const lastClose = num(values[9]);
    const change = num(values[15]);
    const dayChangePct =
      lastClose != null && lastClose !== 0 && change != null
        ? (change / lastClose) * 100
        : null;
    quotes.push({
      code,
      symbol,
      name: values[6]?.trim() || symbol,
      sectorCode: values[8]?.trim() || "",
      close: num(values[14]) ?? lastClose,
      lastClose,
      change,
      dayChangePct,
      low12: num(values[1]),
      high12: num(values[2]),
      pe: num(values[3]),
      dividendYield: num(values[4]),
    });
  }

  return { asOf, indexName, indexValue, indexChangePct, quotes };
}
