"use client";

import { useMemo, useState } from "react";
import { companyName, pick, sectorLabel, text, type Locale } from "@/lib/i18n";
import type { Market, Stock } from "@/lib/ase/types";
import { plainPercent, price, signedPercent, toneOf } from "@/lib/format";

export function CompareBoard({ market, locale }: { market: Market; locale: Locale }) {
  const copy = text(locale);
  const ranked = useMemo(
    () => [...market.stocks].sort((a, b) => (b.score ?? -1) - (a.score ?? -1)),
    [market.stocks],
  );
  const [picked, setPicked] = useState<string[]>(
    ranked.filter((stock) => stock.score != null).slice(0, 3).map((stock) => stock.symbol),
  );
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const shown = ranked.filter((stock) => {
    if (!needle) return true;
    return (
      stock.symbol.toLowerCase().includes(needle) ||
      stock.name.toLowerCase().includes(needle) ||
      stock.nameAr.toLowerCase().includes(needle)
    );
  });
  const selected = picked
    .map((symbol) => ranked.find((stock) => stock.symbol === symbol))
    .filter((stock): stock is Stock => stock != null);

  function toggle(symbol: string) {
    setPicked((current) => {
      if (current.includes(symbol)) return current.filter((item) => item !== symbol);
      if (current.length >= 3) return [...current.slice(1), symbol];
      return [...current, symbol];
    });
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <p className="eyebrow">{copy.reportsEyebrow}</p>
      <h1 className="mt-1 font-serif text-4xl">{copy.reportsTitle}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">{copy.reportsLede}</p>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {selected.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-paper-2 p-5 text-sm text-muted md:col-span-3">
            {copy.chooseCompanies}
          </p>
        ) : (
          selected.map((stock) => (
            <ScoreCard key={stock.symbol} stock={stock} locale={locale} onRemove={() => toggle(stock.symbol)} />
          ))
        )}
      </div>

      <label className="mt-8 block">
        <span className="sr-only">{copy.findCompany}</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={copy.findPlaceholder}
          className="w-full rounded-xl border border-line bg-paper-2 px-4 py-3 text-sm outline-none focus:border-gold"
        />
      </label>

      <div className="mt-3 max-h-[32rem] overflow-auto rounded-2xl border border-line bg-paper-2">
        <table className="w-full text-sm">
          <caption className="sr-only">{copy.companyScores}</caption>
          <thead className="text-xs text-muted">
            <tr>
              <th className="px-4 py-3 text-start font-normal">{copy.company}</th>
              <th className="numeric px-3 py-3 text-end font-normal">{copy.score}</th>
              <th className="numeric hidden px-3 py-3 text-end font-normal sm:table-cell">{copy.profit}</th>
              <th className="hidden px-3 py-3 text-start font-normal md:table-cell">{copy.mainReason}</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((stock) => {
              const active = picked.includes(stock.symbol);
              return (
                <tr key={stock.symbol} className="border-t border-line">
                  <td className="px-4 py-3 text-start">
                    <button type="button" onClick={() => toggle(stock.symbol)} className="text-start">
                      <span className="block text-xs text-gold">{stock.symbol}</span>
                      <span className="block text-ink">{companyName(stock, locale)}</span>
                      <span className="text-xs text-muted">
                        {active ? copy.inComparison : sectorLabel(stock.sector, locale)}
                      </span>
                    </button>
                  </td>
                  <td className="numeric px-3 py-3 text-end font-serif text-xl">{stock.score ?? "—"}</td>
                  <td className={`numeric hidden px-3 py-3 text-end sm:table-cell ${toneOf(stock.profitChangePct)}`}>
                    {changeText(stock.profitChangePct)}
                  </td>
                  <td className="hidden px-3 py-3 text-start text-muted md:table-cell">
                    {stock.reasons[0] ? pick(stock.reasons[0].detail, locale) : copy.notEnough}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs leading-5 text-muted">{copy.scoreDisclaimer}</p>
    </main>
  );
}

function changeText(value: number | null): string {
  if (value == null) return "—";
  if (value <= -400) return "≤ −400%";
  if (value >= 400) return "≥ +400%";
  return signedPercent(value, 0);
}

function ScoreCard({ stock, locale, onRemove }: { stock: Stock; locale: Locale; onRemove: () => void }) {
  const copy = text(locale);
  return (
    <article className="flex flex-col rounded-2xl border border-line bg-paper-2 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-gold">{stock.symbol}</p>
          <h2 className="font-serif text-2xl leading-tight">{companyName(stock, locale)}</h2>
          <p className="mt-1 text-xs text-muted">{sectorLabel(stock.sector, locale)}</p>
        </div>
        <p className="numeric font-serif text-4xl leading-none">{stock.score ?? "—"}</p>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-xs text-muted">{copy.price}</dt>
          <dd className="numeric">{price(stock.close)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">{copy.returnOnEquity}</dt>
          <dd className="numeric">{plainPercent(stock.roe)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">{copy.profitChange}</dt>
          <dd className={`numeric ${toneOf(stock.profitChangePct)}`}>{changeText(stock.profitChangePct)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">{copy.dividendYield}</dt>
          <dd className="numeric">{plainPercent(stock.dividendYield)}</dd>
        </div>
      </dl>
      <ul className="mt-4 space-y-3">
        {stock.reasons.length === 0 ? (
          <li className="text-sm text-muted">{copy.notEnoughOne}</li>
        ) : (
          stock.reasons.map((reason) => (
            <li key={reason.title.en} className="text-sm">
              <span
                className={
                  reason.tone === "good" ? "text-forest" : reason.tone === "bad" ? "text-clay" : "text-gold"
                }
              >
                {pick(reason.title, locale)}
              </span>
              <span className="mt-0.5 block text-muted">{pick(reason.detail, locale)}</span>
            </li>
          ))
        )}
      </ul>
      <button type="button" onClick={onRemove} className="mt-4 self-start text-sm text-muted underline">
        {copy.remove}
      </button>
    </article>
  );
}
