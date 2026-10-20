import Link from "next/link";
import { companyName, sectorLabel, text, type Locale } from "@/lib/i18n";
import type { SectorPicks } from "@/lib/ase/picks";
import { money, price, signedPercent, toneOf } from "@/lib/format";

export function SuggestBoard({
  groups,
  locale,
}: {
  groups: SectorPicks[];
  locale: Locale;
}) {
  const copy = text(locale);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <p className="eyebrow">{copy.aiEyebrow}</p>
      <h1 className="mt-1 font-serif text-4xl">{copy.aiTitle}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">{copy.aiLede}</p>

      {groups.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-line bg-paper-2 p-5 text-sm text-muted">
          {copy.aiNoPicks}
        </p>
      ) : (
        <div className="mt-8 space-y-8">
          {groups.map((group) => (
            <section key={group.sector} aria-labelledby={`sector-${group.sector}`}>
              <h2 id={`sector-${group.sector}`} className="font-serif text-2xl">
                {sectorLabel(group.sector, locale)}
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {group.picks.map((stock, index) => (
                  <article
                    key={stock.symbol}
                    className="flex flex-col rounded-2xl border border-line bg-paper-2 p-4"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-serif text-3xl text-gold">{index + 1}</p>
                      <p className="rounded-full bg-gold-soft px-2.5 py-1 text-[11px] text-gold">{copy.aiBadge}</p>
                    </div>
                    <p className="mt-3 font-mono text-sm tracking-wide">{stock.symbol}</p>
                    <h3 className="mt-1 font-serif text-xl leading-snug">{companyName(stock, locale)}</h3>
                    <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                      <div>
                        <dt className="text-xs text-muted">{copy.profit}</dt>
                        <dd className="numeric mt-0.5">{money(stock.profit, locale)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted">{copy.profitChange}</dt>
                        <dd className={`numeric mt-0.5 ${toneOf(stock.profitChangePct)}`}>
                          {signedPercent(stock.profitChangePct)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted">{copy.price}</dt>
                        <dd className="numeric mt-0.5">{price(stock.close)}</dd>
                      </div>
                    </dl>
                    <Link
                      href={`/${locale}/company/${stock.symbol}`}
                      className="mt-4 inline-flex w-fit rounded-full border border-line px-3 py-2 text-xs text-ink hover:bg-gold-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                    >
                      {copy.details}
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <footer className="mt-8 text-xs leading-5 text-muted">{copy.aiDisclaimer}</footer>
    </main>
  );
}
