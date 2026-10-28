import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Market } from "./types";

type Cache = { market: Market };
const globalCache = globalThis as unknown as { __aseMarket?: Cache };

export async function getMarket(): Promise<Market> {
  if (globalCache.__aseMarket) return globalCache.__aseMarket.market;
  const snapshot = await readSnapshot();
  if (!snapshot) throw new Error("The ASE market snapshot is not available.");
  globalCache.__aseMarket = { market: snapshot };
  return snapshot;
}

function readLocalSnapshot(): Market | null {
  try {
    const file = path.join(process.cwd(), "public", "market-snapshot.json");
    if (!existsSync(file)) return null;
    return JSON.parse(readFileSync(file, "utf8")) as Market;
  } catch {
    return null;
  }
}

async function readCloudflareSnapshot(): Promise<Market | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = getCloudflareContext();
    const assets = (env as { ASSETS?: { fetch: (request: Request) => Promise<Response> } }).ASSETS;
    if (!assets) return null;
    const response = await assets.fetch(new Request("https://assets.local/market-snapshot.json"));
    if (!response.ok) return null;
    return (await response.json()) as Market;
  } catch {
    return null;
  }
}

async function readSnapshot(): Promise<Market | null> {
  return readLocalSnapshot() ?? (await readCloudflareSnapshot());
}

export function getStock(market: Market, symbol: string) {
  const needle = symbol.trim().toUpperCase();
  return market.stocks.find((stock) => stock.symbol === needle) ?? null;
}
