"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { companyName, sectorLabel, text, type Locale } from "@/lib/i18n";
import type { Statement, StatementKind } from "@/lib/ase/statements";
import type { Stock } from "@/lib/ase/types";
import { price, signedPercent, toneOf } from "@/lib/format";

type KindFilter = "all" | StatementKind;

export function StatementsBoard({
  stock,
  statements,
  locale,
}: {
  stock: Stock;
  statements: Statement[];
  locale: Locale;
}) {
  const copy = text(locale);
  const [kind, setKind] = useState<KindFilter>("all");
  const visible = useMemo(
    () => (kind === "all" ? statements : statements.filter((item) => item.kind === kind)),
    [kind, statements],
  );
  const [selectedKey, setSelectedKey] = useState("");
  const selected =
    visible.find((item) => statementKey(item) === selectedKey) ?? visible[0] ?? null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <p className="eyebrow">{copy.exchange}</p>
      <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-wide text-gold">{stock.symbol}</p>
          <h1 className="font-serif text-4xl text-ink">{companyName(stock, locale)}</h1>
          <p className="mt-1 text-sm text-muted">{sectorLabel(stock.sector, locale)}</p>
        </div>
        <div className="text-end">
          <p className="numeric font-serif text-3xl">{price(stock.close)}</p>
          <p className={`text-sm ${toneOf(stock.dayChangePct)}`}>
            {copy.session} <span className="numeric">{signedPercent(stock.dayChangePct)}</span>
          </p>
        </div>
      </div>
      <p className="mt-4 max-w-2xl text-sm text-muted">{copy.statementsLede}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        <Link href={`/${locale}`} className={chipClass(false)}>
          {copy.backToWatch}
        </Link>
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-line bg-paper-2">
        <div className="border-b border-line px-4 py-3">
          <h2 className="font-serif text-2xl">{copy.statementsTitle}</h2>
          <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label={copy.statementsTitle}>
            {(
              [
                ["all", copy.filterAll],
                ["annual", copy.statementAnnual],
                ["semi", copy.statementSemi],
                ["quarter", copy.statementQuarter],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={kind === value}
                onClick={() => {
                  setKind(value);
                  setSelectedKey("");
                }}
                className={chipClass(kind === value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {visible.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted">{copy.noStatements}</p>
        ) : (
          <div className="grid gap-0 lg:grid-cols-[minmax(280px,420px)_minmax(0,1fr)]">
            <ul className="max-h-[70vh] overflow-auto border-b border-line lg:border-b-0 lg:border-e">
              {visible.map((item) => (
                <li key={`${item.kind}-${item.title}-${item.published}`}>
                  <button
                    type="button"
                    onClick={() => setSelectedKey(statementKey(item))}
                    className={`flex w-full flex-col px-4 py-3 text-start ${
                      selected && statementKey(selected) === statementKey(item)
                        ? "bg-gold-soft"
                        : "hover:bg-paper"
                    }`}
                  >
                    <span className="text-xs text-gold">{kindLabel(item.kind, locale)}</span>
                    <span className="mt-0.5 text-sm text-ink">{item.title}</span>
                    <span className="numeric mt-1 text-xs text-muted">{item.published}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="p-4 sm:p-6">
              {selected ? (
                <StatementView statement={selected} locale={locale} />
              ) : (
                <p className="text-sm text-muted">{copy.noStatements}</p>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function StatementView({ statement, locale }: { statement: Statement; locale: Locale }) {
  const copy = text(locale);
  const links = [
    statement.pdfUrl ? [copy.openPdf, statement.pdfUrl] : null,
    statement.excelUrl ? [copy.openExcel, statement.excelUrl] : null,
    statement.xbrlUrl ? [copy.openXbrl, statement.xbrlUrl] : null,
  ].filter((item): item is [string, string] => item != null);

  return (
    <div>
      <p className="text-xs text-gold">{kindLabel(statement.kind, locale)}</p>
      <h3 className="mt-1 font-serif text-2xl">{statement.title}</h3>
      <p className="mt-1 text-sm text-muted">
        {copy.publishedOn} <span className="numeric">{statement.published}</span>
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {links.map(([label, href]) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noreferrer"
            className={chipClass(false)}
          >
            {label}
          </a>
        ))}
      </div>
      {statement.pdfUrl ? (
        <iframe
          title={statement.title}
          src={statement.pdfUrl}
          className="mt-5 h-[70vh] w-full rounded-xl border border-line bg-paper"
        />
      ) : null}
    </div>
  );
}

function statementKey(statement: Statement): string {
  return `${statement.kind}|${statement.title}|${statement.published}`;
}

function kindLabel(kind: StatementKind, locale: Locale): string {
  const copy = text(locale);
  if (kind === "annual") return copy.statementAnnual;
  if (kind === "semi") return copy.statementSemi;
  return copy.statementQuarter;
}

function chipClass(active: boolean): string {
  return `rounded-full px-3 py-2 text-xs ${
    active ? "bg-ink text-paper-2" : "border border-line text-ink hover:bg-gold-soft"
  }`;
}
