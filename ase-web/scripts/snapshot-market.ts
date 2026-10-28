import { writeFileSync } from "node:fs";
import { loadMarket } from "../lib/ase/load-market";
import type { Market, PricePoint, Stock } from "../lib/ase/types";

function downsample(points: PricePoint[], max = 240): PricePoint[] {
  if (points.length <= max) return points;
  const step = (points.length - 1) / (max - 1);
  return Array.from({ length: max }, (_, index) => points[Math.round(index * step)] ?? points[0]);
}

function slim(market: Market): Market {
  return {
    ...market,
    stocks: market.stocks.map(
      (stock): Stock => ({
        ...stock,
        timeline: downsample(stock.timeline),
      }),
    ),
  };
}

async function main() {
  const market = slim(await loadMarket());
  writeFileSync("public/market-snapshot.json", JSON.stringify(market));
  console.log(`Wrote snapshot for ${market.stocks.length} companies.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
