import type { Copy } from "@/lib/i18n";

export type ScoreTone = "good" | "bad" | "neutral";

export type PerformanceDrop = "loss" | "profit" | "revenue" | "roe";

export type RevenueKey = "revenue" | "gross-income";

export type ScoreReason = {
  title: Copy;
  detail: Copy;
  tone: ScoreTone;
};

export type PricePoint = {
  date: string;
  close: number;
};

export type CompanyReport = {
  year: number;
  profit: number | null;
  revenue: number | null;
  revenueKey: RevenueKey;
  roe: number | null;
  roa: number | null;
  debt: number | null;
  eps: number | null;
  pe: number | null;
};

export type Stock = {
  symbol: string;
  code: string;
  name: string;
  nameAr: string;
  sector: string;
  close: number | null;
  dayChangePct: number | null;
  yearChangePct: number | null;
  low12: number | null;
  high12: number | null;
  pe: number | null;
  dividendYield: number | null;
  reportYear: number | null;
  priorYear: number | null;
  revenueKey: RevenueKey;
  profit: number | null;
  profitPrev: number | null;
  profitChangePct: number | null;
  revenue: number | null;
  revenuePrev: number | null;
  revenueChangePct: number | null;
  roe: number | null;
  roePrev: number | null;
  roa: number | null;
  debt: number | null;
  eps: number | null;
  reports: CompanyReport[];
  performanceDrop: boolean;
  drop: PerformanceDrop | null;
  score: number | null;
  reasons: ScoreReason[];
  spark: number[];
  timeline: PricePoint[];
};

export type Market = {
  asOf: string;
  indexName: string | null;
  indexValue: number | null;
  indexChangePct: number | null;
  reportYear: number | null;
  priorYear: number | null;
  stocks: Stock[];
};
