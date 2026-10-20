import type { Copy } from "@/lib/i18n";
import { messages } from "@/lib/i18n";
import { changePct } from "./numbers";
import type { CompanyReport, PerformanceDrop, PricePoint, RevenueKey, ScoreReason, Stock } from "./types";
import { groupFactsByCode, type YearFacts } from "./guides";

type Pair = { current: YearFacts; previous: YearFacts | null };

export function pairFacts(facts: YearFacts[]): Map<string, Pair> {
  const pairs = new Map<string, Pair>();
  for (const [code, list] of groupFactsByCode(facts)) {
    const current = list[0];
    if (!current) continue;
    pairs.set(code, { current, previous: list[1] ?? null });
  }
  return pairs;
}

export function buildStock(input: {
  symbol: string;
  code: string;
  name: string;
  nameAr: string;
  sector: string;
  close: number | null;
  dayChangePct: number | null;
  low12: number | null;
  high12: number | null;
  pe: number | null;
  dividendYield: number | null;
  facts: YearFacts[];
  timeline: PricePoint[];
}): Stock {
  const current = input.facts[0] ?? null;
  const previous = input.facts[1] ?? null;
  const profitChangePct = changePct(current?.profit ?? null, previous?.profit ?? null);
  const revenueChangePct = changePct(current?.revenue ?? null, previous?.revenue ?? null);
  const roeDrop =
    current?.roe != null && previous?.roe != null ? current.roe - previous.roe : null;

  let drop: PerformanceDrop | null = null;
  if (current?.profit != null && current.profit < 0 && (previous?.profit == null || previous.profit >= 0)) {
    drop = "loss";
  } else if (profitChangePct != null && profitChangePct <= -10) {
    drop = "profit";
  } else if (revenueChangePct != null && revenueChangePct <= -10) {
    drop = "revenue";
  } else if (roeDrop != null && roeDrop <= -2) {
    drop = "roe";
  }

  const pe = input.pe ?? current?.pe ?? null;
  const { score, reasons } = scoreCompany({
    sector: input.sector,
    profit: current?.profit ?? null,
    profitPrev: previous?.profit ?? null,
    profitChangePct,
    revenue: current?.revenue ?? null,
    revenuePrev: previous?.revenue ?? null,
    revenueChangePct,
    revenueKey: current?.revenueLabel ?? "revenue",
    roe: current?.roe ?? null,
    roePrev: previous?.roe ?? null,
    roa: current?.roa ?? null,
    debt: current?.debt ?? null,
    pe,
    dividendYield: input.dividendYield,
    reportYear: current?.year ?? null,
    priorYear: previous?.year ?? null,
  });

  const timeline = input.timeline;
  const last = timeline.at(-1);
  const year = last?.date.slice(0, 4);
  const inYear = year ? timeline.filter((point) => point.date.startsWith(year)) : timeline;
  const yearChangePct = changePct(inYear.at(-1)?.close ?? null, inYear[0]?.close ?? null);

  return {
    symbol: input.symbol,
    code: input.code,
    name: input.name,
    nameAr: input.nameAr || "",
    sector: input.sector,
    close: input.close ?? timeline.at(-1)?.close ?? null,
    dayChangePct: input.dayChangePct,
    yearChangePct,
    low12: input.low12,
    high12: input.high12,
    pe,
    dividendYield: input.dividendYield,
    reportYear: current?.year ?? null,
    priorYear: previous?.year ?? null,
    revenueKey: current?.revenueLabel ?? "revenue",
    profit: current?.profit ?? null,
    profitPrev: previous?.profit ?? null,
    profitChangePct,
    revenue: current?.revenue ?? null,
    revenuePrev: previous?.revenue ?? null,
    revenueChangePct,
    roe: current?.roe ?? null,
    roePrev: previous?.roe ?? null,
    roa: current?.roa ?? null,
    debt: current?.debt ?? null,
    eps: current?.eps ?? null,
    reports: input.facts.map(toReport),
    performanceDrop: drop != null,
    drop,
    score,
    reasons,
    spark: timeline.slice(-36).map((point) => point.close),
    timeline,
  };
}

function toReport(fact: YearFacts): CompanyReport {
  return {
    year: fact.year,
    profit: fact.profit,
    revenue: fact.revenue,
    revenueKey: fact.revenueLabel,
    roe: fact.roe,
    roa: fact.roa,
    debt: fact.debt,
    eps: fact.eps,
    pe: fact.pe,
  };
}

function scoreCompany(input: {
  sector: string;
  profit: number | null;
  profitPrev: number | null;
  profitChangePct: number | null;
  revenue: number | null;
  revenuePrev: number | null;
  revenueChangePct: number | null;
  revenueKey: RevenueKey;
  roe: number | null;
  roePrev: number | null;
  roa: number | null;
  debt: number | null;
  pe: number | null;
  dividendYield: number | null;
  reportYear: number | null;
  priorYear: number | null;
}): { score: number | null; reasons: ScoreReason[] } {
  const factors: { title: Copy; detail: Copy; unit: number; weight: number }[] = [];
  const years = yearsCopy(input.reportYear, input.priorYear);
  const both = { en: messages.en, ar: messages.ar };

  if (input.roe != null) {
    const priorEn = input.roePrev != null ? `, from ${input.roePrev.toFixed(1)}%` : "";
    const priorAr = input.roePrev != null ? `، بعد أن كان ${input.roePrev.toFixed(1)}%` : "";
    factors.push({
      title: pair(both, "returnOnEquity"),
      detail: {
        en: `Shareholders earned ${input.roe.toFixed(1)}% on equity in ${years.en}${priorEn}.`,
        ar: `حقق المساهمون ${input.roe.toFixed(1)}% على حقوق الملكية في ${years.ar}${priorAr}.`,
      },
      unit: scale(input.roe, 0, 16),
      weight: 24,
    });
  }

  if (input.profit != null) {
    factors.push({
      title: pair(both, "profitTrend"),
      detail:
        input.profitChangePct == null
          ? input.profit < 0
            ? {
                en: "Profit in the latest report is a loss, with no earlier guide year to compare.",
                ar: "الربح في أحدث تقرير خسارة، ولا توجد سنة دليل سابقة للمقارنة.",
              }
            : {
                en: "Profit in the latest report is positive, with no earlier guide year to compare.",
                ar: "الربح في أحدث تقرير موجب، ولا توجد سنة دليل سابقة للمقارنة.",
              }
          : seriesDetail(pair(both, "profit"), input.profitChangePct, years, false),
      unit: input.profitChangePct == null ? (input.profit > 0 ? 0.6 : 0.15) : scale(input.profitChangePct, -40, 40),
      weight: 24,
    });
  }

  if (input.revenue != null && input.revenueChangePct != null) {
    const label = revenueCopy(input.revenueKey);
    factors.push({
      title: label,
      detail: seriesDetail(label, input.revenueChangePct, years, input.revenueKey === "revenue"),
      unit: scale(input.revenueChangePct, -30, 30),
      weight: 16,
    });
  }

  if (input.roa != null) {
    factors.push({
      title: pair(both, "returnOnAssets"),
      detail: {
        en: `Assets produced a ${input.roa.toFixed(1)}% return.`,
        ar: `حققت الأصول عائداً بنسبة ${input.roa.toFixed(1)}%.`,
      },
      unit: scale(input.roa, 0, 6),
      weight: 12,
    });
  }

  const bank = /bank/i.test(input.sector);
  if (!bank && input.debt != null) {
    factors.push({
      title: pair(both, "debt"),
      detail: {
        en: `Debt is ${input.debt.toFixed(0)}% of the balance sheet in the latest guide.`,
        ar: `يشكّل الدين ${input.debt.toFixed(0)}% من الميزانية في أحدث دليل.`,
      },
      unit: 1 - scale(input.debt, 25, 85),
      weight: 12,
    });
  }

  if (input.pe != null) {
    factors.push({
      title: pair(both, "valuation"),
      detail:
        input.pe <= 0
          ? {
              en: "The price-to-earnings figure is not meaningful because earnings are not positive.",
              ar: "رقم السعر إلى الربح غير مفيد لأن الأرباح ليست موجبة.",
            }
          : {
              en: `The stock trades at ${input.pe.toFixed(1)} times earnings.`,
              ar: `يُتداول السهم عند ${input.pe.toFixed(1)} ضعف الأرباح.`,
            },
      unit: peUnit(input.pe),
      weight: 12,
    });
  }

  if (input.dividendYield != null) {
    factors.push({
      title: pair(both, "dividend"),
      detail: {
        en: `The bulletin shows a dividend yield of ${input.dividendYield.toFixed(1)}%.`,
        ar: `تُظهر النشرة عائد توزيع بنسبة ${input.dividendYield.toFixed(1)}%.`,
      },
      unit: scale(input.dividendYield, 0, 8),
      weight: 12,
    });
  }

  if (factors.length < 2) return { score: null, reasons: [] };
  const weight = factors.reduce((sum, factor) => sum + factor.weight, 0);
  const score = Math.round(
    (factors.reduce((sum, factor) => sum + factor.unit * factor.weight, 0) / weight) * 100,
  );
  const reasons = factors
    .map((factor) => ({
      title: factor.title,
      detail: factor.detail,
      tone: (factor.unit >= 0.62 ? "good" : factor.unit <= 0.4 ? "bad" : "neutral") as ScoreReason["tone"],
      unit: factor.unit,
    }))
    .sort((a, b) => Math.abs(b.unit - 0.5) - Math.abs(a.unit - 0.5))
    .map(({ title, detail, tone }) => ({ title, detail, tone }));
  return { score, reasons };
}

function pair(
  both: { en: (typeof messages)["en"]; ar: (typeof messages)["ar"] },
  key: "returnOnEquity" | "profitTrend" | "returnOnAssets" | "debt" | "valuation" | "dividend" | "profit" | "revenue" | "grossIncome",
): Copy {
  return { en: both.en[key], ar: both.ar[key] };
}

function revenueCopy(key: RevenueKey): Copy {
  return key === "gross-income"
    ? { en: messages.en.grossIncome, ar: messages.ar.grossIncome }
    : { en: messages.en.revenue, ar: messages.ar.revenue };
}

function yearsCopy(reportYear: number | null, priorYear: number | null): Copy {
  if (reportYear && priorYear) {
    return {
      en: `${reportYear} versus ${priorYear}`,
      ar: `${reportYear} مقارنة بعام ${priorYear}`,
    };
  }
  if (reportYear) return { en: String(reportYear), ar: String(reportYear) };
  return { en: "the latest report", ar: "أحدث تقرير" };
}

function seriesDetail(label: Copy, changePct: number, years: Copy, feminine: boolean): Copy {
  const pct = Math.abs(changePct).toFixed(0);
  const up = changePct >= 0;
  if (Math.abs(changePct) >= 400) {
    if (up) {
      return {
        en: `${label.en} jumped in ${years.en} from a very small base.`,
        ar: feminine
          ? `قفزت ${label.ar} في ${years.ar} من قاعدة صغيرة جداً.`
          : `قفز ${label.ar} في ${years.ar} من قاعدة صغيرة جداً.`,
      };
    }
    return {
      en: `${label.en} collapsed in ${years.en} from a very small base.`,
      ar: feminine
        ? `انهارت ${label.ar} في ${years.ar} من قاعدة صغيرة جداً.`
        : `انهار ${label.ar} في ${years.ar} من قاعدة صغيرة جداً.`,
    };
  }
  if (up) {
    return {
      en: `${label.en} rose ${pct}% in ${years.en}.`,
      ar: feminine
        ? `ارتفعت ${label.ar} بنسبة ${pct}% في ${years.ar}.`
        : `ارتفع ${label.ar} بنسبة ${pct}% في ${years.ar}.`,
    };
  }
  return {
    en: `${label.en} fell ${pct}% in ${years.en}.`,
    ar: feminine
      ? `انخفضت ${label.ar} بنسبة ${pct}% في ${years.ar}.`
      : `انخفض ${label.ar} بنسبة ${pct}% في ${years.ar}.`,
  };
}

function scale(value: number, low: number, high: number): number {
  return Math.min(1, Math.max(0, (value - low) / (high - low)));
}

function peUnit(pe: number): number {
  if (pe <= 0) return 0.15;
  if (pe < 5) return 0.55;
  if (pe <= 16) return 1 - Math.abs(pe - 10) / 24;
  if (pe <= 28) return 0.4;
  return 0.2;
}

