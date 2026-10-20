import type { Locale } from "@/lib/i18n";
import { aseUrl, fetchText } from "./http";

export type StatementKind = "annual" | "semi" | "quarter";

export type Statement = {
  title: string;
  kind: StatementKind;
  published: string;
  pdfUrl: string | null;
  excelUrl: string | null;
  xbrlUrl: string | null;
};

const CATEGORIES: { id: number; kind: StatementKind }[] = [
  { id: 1, kind: "annual" },
  { id: 2, kind: "semi" },
  { id: 3, kind: "quarter" },
];

type Cache = { expires: number; statements: Statement[] };
const globalCache = globalThis as unknown as { __aseStatements?: Map<string, Cache> };

export async function getStatements(symbol: string, locale: Locale): Promise<Statement[]> {
  const key = `${locale}:${symbol.toUpperCase()}`;
  const cache = (globalCache.__aseStatements ??= new Map());
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.statements;
  const statements = await loadStatements(symbol, locale);
  cache.set(key, { statements, expires: Date.now() + 30 * 60 * 1000 });
  return statements;
}

async function loadStatements(symbol: string, locale: Locale): Promise<Statement[]> {
  const pages = await Promise.all(
    CATEGORIES.map(async ({ id, kind }) => {
      const html = await fetchPages(symbol, locale, id);
      return parseRows(html, kind);
    }),
  );
  const unique = new Map<string, Statement>();
  for (const statement of pages.flat()) {
    unique.set(`${statement.kind}:${statement.title}:${statement.published}`, statement);
  }
  return [...unique.values()].sort((a, b) => b.published.localeCompare(a.published) || a.title.localeCompare(b.title));
}

async function fetchPages(symbol: string, locale: Locale, categoryId: number): Promise<string> {
  const chunks: string[] = [];
  for (let page = 0; page < 5; page += 1) {
    const url = `${aseUrl(`/${locale}/disclosures`)}?symbol=${encodeURIComponent(symbol)}&category_id=${categoryId}&page=${page}`;
    const html = await fetchText(url, "ASE disclosures").catch(() => "");
    if (!html) break;
    chunks.push(html);
    if (!html.includes(`page=${page + 1}`)) break;
  }
  return chunks.join("\n");
}

function parseRows(html: string, kind: StatementKind): Statement[] {
  const rows = [...html.matchAll(/<tr>\s*<td[\s\S]*?<\/tr>/g)].map((match) => match[0]);
  const statements: Statement[] = [];
  for (const row of rows) {
    const title = textField(row, "document-name");
    const published = isoDate(textField(row, "published"));
    if (!title) continue;
    statements.push({
      title,
      kind,
      published,
      pdfUrl: hrefField(row, "filename") ?? hrefField(row, "filename-table-column"),
      excelUrl: hrefField(row, "filename-xls"),
      xbrlUrl: hrefField(row, "filename-html"),
    });
  }
  return statements;
}

function textField(row: string, field: string): string {
  const match = row.match(new RegExp(`views-field-${field}[^>]*>([\\s\\S]*?)</td>`));
  return decode(strip(match?.[1] ?? ""));
}

function hrefField(row: string, field: string): string | null {
  const block = row.match(new RegExp(`views-field-${field}[\\s\\S]*?</td>`));
  const href = block?.[0].match(/href="([^"]+)"/)?.[1];
  if (!href) return null;
  return aseUrl(href);
}

function strip(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function decode(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .trim();
}

function isoDate(value: string): string {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return value;
  return `${match[3]}-${match[2]}-${match[1]}`;
}
