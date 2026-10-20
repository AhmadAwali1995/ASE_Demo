"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { PriceChart } from "@/components/PriceChart";
import { companyName, indexLabel, revenueText, sectorLabel, text, type Locale } from "@/lib/i18n";
import { changePct } from "@/lib/ase/numbers";
import type { CompanyReport, Market, Stock } from "@/lib/ase/types";
import { money, plainPercent, price, signedPercent, toneOf } from "@/lib/format";

type ResultFilter = "all" | "down" | "up";
type PriceFilter = "all" | "up" | "down";
type SortKey = "profit" | "year" | "score";

export function WatchBoard({ market, locale }: { market: Market; locale: Locale }) {
  const copy = text(locale);
  const [query, setQuery] = useState("");
  const [resultFilter, setResultFilter] = useState<ResultFilter>("all");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [dividendOnly, setDividendOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("profit");
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const sectors = useMemo(
    () => Array.from(new Set(market.stocks.map((stock) => stock.sector))).sort(),
    [market.stocks],
  );
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = market.stocks.filter((stock) => {
      if (resultFilter === "down" && (stock.profitChangePct == null || stock.profitChangePct >= 0)) return false;
      if (resultFilter === "up" && (stock.profitChangePct == null || stock.profitChangePct <= 0)) return false;
      if (selectedSectors.length > 0 && !selectedSectors.includes(stock.sector)) return false;
      if (priceFilter === "up" && (stock.yearChangePct == null || stock.yearChangePct <= 0.05)) return false;
      if (priceFilter === "down" && (stock.yearChangePct == null || stock.yearChangePct >= -0.05)) return false;
      if (dividendOnly && !(stock.dividendYield != null && stock.dividendYield > 0)) return false;
      if (!needle) return true;
      return (
        stock.symbol.toLowerCase().includes(needle) ||
        stock.name.toLowerCase().includes(needle) ||
        stock.nameAr.toLowerCase().includes(needle)
      );
    });
    return [...filtered].sort((a, b) => compareStocks(a, b, sortKey));
  }, [dividendOnly, market.stocks, priceFilter, query, resultFilter, selectedSectors, sortKey]);
  const [selectedSymbol, setSelectedSymbol] = useState(visible[0]?.symbol ?? market.stocks[0]?.symbol ?? "");
  const selected = visible.find((stock) => stock.symbol === selectedSymbol) ?? visible[0] ?? null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">{copy.performanceEyebrow}</p>
          <h1 className="mt-1 font-serif text-4xl text-ink">{copy.performanceTitle}</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">{copy.performanceLede}</p>
        </div>
        <IndexChip market={market} locale={locale} />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <label className="min-w-0">
          <span className="sr-only">{copy.searchCompanies}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.searchPlaceholder}
            className="w-full rounded-xl border border-line bg-paper-2 px-4 py-3 text-sm outline-none focus:border-gold"
          />
        </label>
        <SectorFilter sectors={sectors} selected={selectedSectors} onChange={setSelectedSectors} locale={locale} />
      </div>

      <div className="mt-6 grid items-start gap-4 lg:grid-cols-[minmax(280px,400px)_minmax(0,1fr)]">
        <section className="overflow-hidden rounded-2xl border border-line bg-paper-2">
          <div className="border-b border-line px-3 py-3">
            <p className="text-xs text-muted">
              {copy.companyCount(visible.length)}
              {market.reportYear ? copy.yearSpan(market.priorYear, market.reportYear) : ""}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label={copy.publishedResults}>
              {(
                [
                  ["all", copy.filterAll],
                  ["down", copy.filterProfitDown],
                  ["up", copy.filterProfitUp],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={resultFilter === value}
                  onClick={() => setResultFilter(value)}
                  className={chipClass(resultFilter === value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <label>
                <span className="sr-only">{copy.filterPrice}</span>
                <select
                  value={priceFilter}
                  onChange={(event) => setPriceFilter(event.target.value as PriceFilter)}
                  className="w-full rounded-full border border-line bg-paper px-3 py-2 text-xs outline-none focus:border-gold"
                >
                  <option value="all">{copy.filterPriceAll}</option>
                  <option value="up">{copy.filterPriceUp}</option>
                  <option value="down">{copy.filterPriceDown}</option>
                </select>
              </label>
              <label>
                <span className="sr-only">{copy.filterSort}</span>
                <select
                  value={sortKey}
                  onChange={(event) => setSortKey(event.target.value as SortKey)}
                  className="w-full rounded-full border border-line bg-paper px-3 py-2 text-xs outline-none focus:border-gold"
                >
                  <option value="profit">{copy.sortProfit}</option>
                  <option value="year">{copy.sortYear}</option>
                  <option value="score">{copy.sortScore}</option>
                </select>
              </label>
            </div>
            <button
              type="button"
              aria-pressed={dividendOnly}
              onClick={() => setDividendOnly((value) => !value)}
              className={`mt-2 ${chipClass(dividendOnly)}`}
            >
              {copy.filterDividend}
            </button>
          </div>
          {visible.length === 0 ? (
            <p className="px-4 py-8 text-sm text-muted">{copy.noFilterMatch}</p>
          ) : (
            <ul className="max-h-[70vh] overflow-auto">
              {visible.map((stock) => (
                <li key={stock.symbol}>
                  <button
                    type="button"
                    onClick={() => setSelectedSymbol(stock.symbol)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-start ${
                      selected?.symbol === stock.symbol ? "bg-gold-soft" : "hover:bg-paper"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-medium tracking-wide text-gold">{stock.symbol}</span>
                      <span className="block truncate text-sm text-ink">{companyName(stock, locale)}</span>
                      <span className="mt-1 block text-xs text-muted">{sectorLabel(stock.sector, locale)}</span>
                    </span>
                    <span className={`numeric text-sm ${toneOf(listValue(stock, sortKey))}`}>
                      {sortKey === "score" ? (stock.score ?? "—") : changeText(listValue(stock, sortKey))}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-paper-2 p-4 sm:p-6">
          {selected ? (
            <StockDetail stock={selected} locale={locale} />
          ) : (
            <p className="text-sm text-muted">{copy.selectCompany}</p>
          )}
        </section>
      </div>
      <footer className="mt-8 text-xs leading-5 text-muted">{copy.watchDisclaimer}</footer>
    </main>
  );
}

function chipClass(active: boolean): string {
  return `rounded-full px-3 py-2 text-xs ${
    active ? "bg-ink text-paper-2" : "border border-line text-ink hover:bg-gold-soft"
  }`;
}

function SectorFilter({
  sectors,
  selected,
  onChange,
  locale,
}: {
  sectors: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  locale: Locale;
}) {
  const copy = text(locale);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const label =
    selected.length === 0
      ? copy.allSectors
      : selected.length === 1
        ? sectorLabel(selected[0], locale)
        : copy.sectorPicked(selected.length);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={copy.sector}
        onClick={() => setOpen((value) => !value)}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border bg-paper-2 px-4 py-3 text-sm outline-none focus:border-gold ${
          selected.length > 0 ? "border-ink" : "border-line"
        }`}
      >
        <span className="truncate">{label}</span>
        <svg
          viewBox="0 0 12 8"
          className={`size-3 shrink-0 text-muted transition ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M1 1.5 6 6.5 11 1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      {open ? (
        <div
          role="group"
          aria-label={copy.sector}
          className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-line bg-paper-2 py-1 shadow-sm"
        >
          {selected.length > 0 ? (
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full px-3 py-2 text-start text-xs text-muted hover:bg-gold-soft hover:text-ink"
            >
              {copy.clearSectors}
            </button>
          ) : null}
          {sectors.map((item) => {
            const checked = selected.includes(item);
            return (
              <label
                key={item}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-gold-soft"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    onChange(checked ? selected.filter((sector) => sector !== item) : [...selected, item])
                  }
                  className="size-4 shrink-0 accent-gold"
                />
                <span>{sectorLabel(item, locale)}</span>
              </label>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function listValue(stock: Stock, sortKey: SortKey): number | null {
  if (sortKey === "year") return stock.yearChangePct;
  if (sortKey === "score") return stock.score;
  return stock.profitChangePct;
}

function compareStocks(a: Stock, b: Stock, sortKey: SortKey): number {
  const aValue = listValue(a, sortKey);
  const bValue = listValue(b, sortKey);
  if (aValue == null && bValue == null) return 0;
  if (aValue == null) return 1;
  if (bValue == null) return -1;
  return bValue - aValue;
}

function changeText(value: number | null): string {
  if (value == null) return "—";
  if (value <= -400) return "≤ −400%";
  if (value >= 400) return "≥ +400%";
  return signedPercent(value, 0);
}

function absPercent(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 400) return "400%";
  return `${abs.toFixed(0)}%`;
}

function ProfitBanner({ stock, locale }: { stock: Stock; locale: Locale }) {
  const copy = text(locale);
  if (stock.profitChangePct == null) {
    return (
      <p className="mt-4 rounded-xl border border-line bg-paper px-3 py-2 text-sm text-muted">
        {copy.noProfitChangeGuide}
      </p>
    );
  }
  if (stock.profitChangePct > 0) {
    return (
      <p className="mt-4 rounded-xl bg-forest-soft px-3 py-2 text-sm text-forest">
        {copy.profitUpGuide(absPercent(stock.profitChangePct))}
      </p>
    );
  }
  if (stock.profitChangePct < 0) {
    return (
      <p className="mt-4 rounded-xl bg-clay-soft px-3 py-2 text-sm text-clay">
        {copy.profitDownGuide(absPercent(stock.profitChangePct))}
      </p>
    );
  }
  return (
    <p className="mt-4 rounded-xl border border-line bg-paper px-3 py-2 text-sm text-muted">
      {copy.profitUnchangedGuide}
    </p>
  );
}

function IndexChip({ market, locale }: { market: Market; locale: Locale }) {
  return (
    <div className="rounded-2xl border border-line bg-paper-2 px-4 py-3">
      <p className="text-xs text-muted">
        {indexLabel(market.indexName, locale)} · <span className="numeric">{market.asOf}</span>
      </p>
      <p className="mt-1 font-serif text-2xl">
        <span className="numeric">
          {market.indexValue?.toLocaleString("en-US", { maximumFractionDigits: 2 }) ?? "—"}
        </span>
        <span className={`numeric ms-2 text-base ${toneOf(market.indexChangePct)}`}>
          {signedPercent(market.indexChangePct)}
        </span>
      </p>
    </div>
  );
}

function StockDetail({ stock, locale }: { stock: Stock; locale: Locale }) {
  const copy = text(locale);
  const [showReports, setShowReports] = useState(false);
  const latestYear = stock.reports[0]?.year ?? null;
  const [reportYear, setReportYear] = useState(latestYear);

  useEffect(() => {
    setReportYear(latestYear);
  }, [stock.symbol, latestYear]);

  const rows = [
    {
      key: "profit",
      cells: [copy.profit, money(stock.profit, locale), stock.profitPrev == null ? "—" : money(stock.profitPrev, locale), changeText(stock.profitChangePct)],
    },
    {
      key: "revenue",
      cells: [
        revenueText(stock.revenueKey, locale),
        money(stock.revenue, locale),
        stock.revenuePrev == null ? "—" : money(stock.revenuePrev, locale),
        changeText(stock.revenueChangePct),
      ],
    },
    {
      key: "roe",
      cells: [
        copy.returnOnEquity,
        plainPercent(stock.roe),
        plainPercent(stock.roePrev),
        stock.roe != null && stock.roePrev != null ? signedPercent(stock.roe - stock.roePrev) : "—",
      ],
    },
    {
      key: "yield",
      cells: [copy.dividendYield, plainPercent(stock.dividendYield), "—", "—"],
    },
    {
      key: "pe",
      cells: [copy.priceEarnings, stock.pe?.toFixed(1) ?? "—", "—", "—"],
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-wide text-gold">{stock.symbol}</p>
          <h2 className="font-serif text-3xl">{companyName(stock, locale)}</h2>
          <p className="mt-1 text-sm text-muted">{sectorLabel(stock.sector, locale)}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Link href={`/${locale}/company/${stock.symbol}`} className={chipClass(false)}>
              {copy.details}
            </Link>
            <button
              type="button"
              aria-expanded={showReports}
              onClick={() => setShowReports((value) => !value)}
              className={chipClass(showReports)}
            >
              {showReports ? copy.hideLegacy : copy.legacyData}
            </button>
          </div>
        </div>
        <div className="text-end">
          <p className="numeric font-serif text-3xl">{price(stock.close)}</p>
          <p className={`text-sm ${toneOf(stock.dayChangePct)}`}>
            {copy.session} <span className="numeric">{signedPercent(stock.dayChangePct)}</span>
          </p>
          <p className={`text-sm ${toneOf(stock.yearChangePct)}`}>
            {copy.thisYear} <span className="numeric">{signedPercent(stock.yearChangePct, 0)}</span>
          </p>
        </div>
      </div>

      <ProfitBanner stock={stock} locale={locale} />

      <div className="mt-5">
        <PriceChart points={stock.timeline} locale={locale} />
      </div>

      {showReports ? (
        <CompanyReports stock={stock} year={reportYear} onYear={setReportYear} locale={locale} />
      ) : (
        <table className="mt-6 w-full table-fixed text-sm">
          <caption className="sr-only">{copy.publishedResults}</caption>
          <colgroup>
            <col className="w-[34%]" />
            <col className="w-[22%]" />
            <col className="w-[22%]" />
            <col className="w-[22%]" />
          </colgroup>
          <thead className="text-xs text-muted">
            <tr>
              <th className="py-2 pe-3 text-start font-normal">{copy.guideFigure}</th>
              <th className="numeric py-2 pe-3 text-end font-normal">{stock.reportYear ?? copy.latest}</th>
              <th className="numeric py-2 pe-3 text-end font-normal">{stock.priorYear ?? copy.prior}</th>
              <th className="numeric py-2 text-end font-normal">{copy.change}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t border-line">
                {row.cells.map((cell, index) => (
                  <td
                    key={`${row.key}-${index}`}
                    className={`py-2 ${index === 0 ? "pe-3 text-start" : index === 3 ? "numeric text-end" : "numeric pe-3 text-end"}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function CompanyReports({
  stock,
  year,
  onYear,
  locale,
}: {
  stock: Stock;
  year: number | null;
  onYear: (year: number) => void;
  locale: Locale;
}) {
  const copy = text(locale);
  const reports = stock.reports;
  if (reports.length === 0) {
    return <p className="mt-6 text-sm text-muted">{copy.noReports}</p>;
  }
  const index = Math.max(0, reports.findIndex((report) => report.year === year));
  const current = reports[index];
  const previous = reports[index + 1] ?? null;
  const rows = reportRows(current, previous, locale);

  return (
    <div className="mt-6">
      <p className="text-xs text-muted">{copy.financialReports}</p>
      <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label={copy.earlierYears}>
        {reports.map((report, reportIndex) => (
          <button
            key={report.year}
            type="button"
            aria-pressed={report.year === current.year}
            onClick={() => onYear(report.year)}
            className={chipClass(report.year === current.year)}
          >
            <span className="numeric">{report.year}</span>
            {reportIndex === 0 ? ` · ${copy.latest}` : ""}
          </button>
        ))}
      </div>
      <table className="mt-4 w-full table-fixed text-sm">
        <caption className="sr-only">{copy.financialReports}</caption>
        <colgroup>
          <col className="w-[34%]" />
          <col className="w-[22%]" />
          <col className="w-[22%]" />
          <col className="w-[22%]" />
        </colgroup>
        <thead className="text-xs text-muted">
          <tr>
            <th className="py-2 pe-3 text-start font-normal">{copy.guideFigure}</th>
            <th className="numeric py-2 pe-3 text-end font-normal">{current.year}</th>
            <th className="numeric py-2 pe-3 text-end font-normal">{previous?.year ?? copy.prior}</th>
            <th className="numeric py-2 text-end font-normal">{copy.change}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-t border-line">
              {row.cells.map((cell, cellIndex) => (
                <td
                  key={`${row.key}-${cellIndex}`}
                  className={`py-2 ${cellIndex === 0 ? "pe-3 text-start" : cellIndex === 3 ? "numeric text-end" : "numeric pe-3 text-end"}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function reportRows(current: CompanyReport, previous: CompanyReport | null, locale: Locale) {
  const copy = text(locale);
  return [
    {
      key: "profit",
      cells: [
        copy.profit,
        money(current.profit, locale),
        previous?.profit == null ? "—" : money(previous.profit, locale),
        changeText(changePct(current.profit, previous?.profit ?? null)),
      ],
    },
    {
      key: "revenue",
      cells: [
        revenueText(current.revenueKey, locale),
        money(current.revenue, locale),
        previous?.revenue == null ? "—" : money(previous.revenue, locale),
        changeText(changePct(current.revenue, previous?.revenue ?? null)),
      ],
    },
    {
      key: "roe",
      cells: [
        copy.returnOnEquity,
        plainPercent(current.roe),
        plainPercent(previous?.roe ?? null),
        current.roe != null && previous?.roe != null ? signedPercent(current.roe - previous.roe) : "—",
      ],
    },
    {
      key: "roa",
      cells: [
        copy.returnOnAssets,
        plainPercent(current.roa),
        plainPercent(previous?.roa ?? null),
        current.roa != null && previous?.roa != null ? signedPercent(current.roa - previous.roa) : "—",
      ],
    },
    {
      key: "debt",
      cells: [
        copy.debt,
        plainPercent(current.debt),
        plainPercent(previous?.debt ?? null),
        current.debt != null && previous?.debt != null ? signedPercent(current.debt - previous.debt) : "—",
      ],
    },
    {
      key: "eps",
      cells: [
        copy.earningsPerShare,
        money(current.eps, locale),
        previous?.eps == null ? "—" : money(previous.eps, locale),
        changeText(changePct(current.eps, previous?.eps ?? null)),
      ],
    },
    {
      key: "pe",
      cells: [
        copy.priceEarnings,
        current.pe?.toFixed(1) ?? "—",
        previous?.pe?.toFixed(1) ?? "—",
        changeText(changePct(current.pe, previous?.pe ?? null)),
      ],
    },
  ];
}
