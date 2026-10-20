import AdmZip from "adm-zip";
import * as XLSX from "xlsx";
import type { RevenueKey } from "./types";
import { asCode, normLabel, num } from "./numbers";

export type YearFacts = {
  code: string;
  name: string;
  nameAr: string;
  sector: string;
  year: number;
  profit: number | null;
  revenue: number | null;
  revenueLabel: RevenueKey;
  roe: number | null;
  roa: number | null;
  debt: number | null;
  eps: number | null;
  pe: number | null;
};

const METRICS: Record<string, keyof Pick<YearFacts, "profit" | "revenue" | "roe" | "roa" | "debt" | "eps" | "pe">> = {
  "profit loss": "profit",
  revenue: "revenue",
  "gross income": "revenue",
  "return on equity %": "roe",
  "return on assets %": "roa",
  "debt ratio %": "debt",
  "debit ratio %": "debt",
  "earning per share jd": "eps",
  "earnings per share jd": "eps",
  "price earnings ratio times": "pe",
};

export function groupFactsByCode(facts: YearFacts[]): Map<string, YearFacts[]> {
  const grouped = new Map<string, Map<number, YearFacts>>();
  for (const fact of facts) {
    const years = grouped.get(fact.code) ?? new Map<number, YearFacts>();
    const existing = years.get(fact.year);
    if (!existing || filledFields(fact) >= filledFields(existing)) years.set(fact.year, fact);
    grouped.set(fact.code, years);
  }
  const result = new Map<string, YearFacts[]>();
  for (const [code, years] of grouped) {
    result.set(code, [...years.values()].sort((a, b) => b.year - a.year));
  }
  return result;
}

function filledFields(fact: YearFacts): number {
  return [fact.profit, fact.revenue, fact.roe, fact.roa, fact.debt, fact.eps, fact.pe].filter((value) => value != null)
    .length;
}

export function parseGuideZip(buffer: Buffer): YearFacts[] {
  const zip = new AdmZip(buffer);
  const facts: YearFacts[] = [];
  for (const entry of zip.getEntries()) {
    if (entry.isDirectory) continue;
    const name = entry.entryName.replace(/\\/g, "/");
    if (!name.toLowerCase().endsWith(".xlsx") || name.includes("/~")) continue;
    const book = XLSX.read(entry.getData(), { type: "buffer" });
    facts.push(...parseWorkbook(book, sectorFromPath(name), yearFromName(name)));
  }
  return facts;
}

function sectorFromPath(fileName: string): string {
  const parts = fileName.split("/").filter(Boolean);
  const file = parts[parts.length - 1] ?? "";
  const industry = file
    .replace(/\.xlsx$/i, "")
    .replace(/\s+20\d{2}.*$/, "")
    .replace(/Pharmceutical/gi, "Pharmaceutical")
    .trim();
  const folders = parts.slice(0, -1).filter((part) => !/guide/i.test(part));
  const parent = folders[folders.length - 1] ?? "";
  if (!parent || /sector/i.test(parent)) return industry || "Listed company";
  return `${parent} · ${industry}`;
}

function yearFromName(fileName: string): number | null {
  const base = fileName.split("/").pop() ?? fileName;
  const match = base.match(/(20\d{2})/);
  return match ? Number(match[1]) : null;
}

function parseWorkbook(book: XLSX.WorkBook, sector: string, fallbackYear: number | null): YearFacts[] {
  const discovered = new Map<string, YearFacts>();
  for (const sheetName of book.SheetNames) {
    const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(book.Sheets[sheetName], {
      header: 1,
      raw: true,
      defval: null,
    });
    const codeRow = rows.findIndex(
      (row) => row.filter((cell) => asCode(cell)).length >= 3,
    );
    if (codeRow < 0) continue;
    const year = yearOnSheet(rows) ?? fallbackYear;
    if (!year) continue;
    const names = namesByScript(rows, codeRow, "latin");
    const arabicNames = namesByScript(rows, codeRow, "arabic");
    rows[codeRow].forEach((cell, index) => {
      const code = asCode(cell);
      if (!code || index === 0) return;
      if (!discovered.has(code)) {
        discovered.set(code, blank(code, names[index] ?? code, arabicNames[index] ?? "", sector, year));
      }
    });
    for (const row of rows) {
      const label = normLabel(String(row[0] ?? ""));
      const metric = METRICS[label];
      if (!metric) continue;
      row.forEach((cell, index) => {
        const code = asCode(rows[codeRow][index]);
        if (!code) return;
        const fact = discovered.get(code);
        const value = num(cell);
        if (!fact || value == null || fact[metric] != null) return;
        fact[metric] = value;
        if (metric === "revenue" && label === "gross income") fact.revenueLabel = "gross-income";
      });
    }
  }
  return [...discovered.values()];
}

function yearOnSheet(rows: (string | number | null)[][]): number | null {
  for (const row of rows.slice(0, 6)) {
    const text = row.map((cell) => String(cell ?? "")).join(" ");
    const match = text.match(/Year\s+(20\d{2})/i);
    if (match) return Number(match[1]);
  }
  return null;
}

function namesByScript(
  rows: (string | number | null)[][],
  codeRow: number,
  script: "latin" | "arabic",
): string[] {
  const pattern = script === "arabic" ? /[\u0600-\u06FF]{2,}/ : /[A-Za-z]{3,}/;
  let best: string[] = [];
  let bestScore = 0;
  for (let index = Math.max(0, codeRow - 4); index < codeRow; index += 1) {
    const row = rows[index] ?? [];
    const score = row.filter((cell) => typeof cell === "string" && pattern.test(cell)).length;
    if (score > bestScore) {
      bestScore = score;
      best = row.map((cell) => (typeof cell === "string" ? cell.replace(/\s+/g, " ").trim() : ""));
    }
  }
  return best;
}

function blank(code: string, name: string, nameAr: string, sector: string, year: number): YearFacts {
  return {
    code,
    name,
    nameAr,
    sector,
    year,
    profit: null,
    revenue: null,
    revenueLabel: "revenue",
    roe: null,
    roa: null,
    debt: null,
    eps: null,
    pe: null,
  };
}
