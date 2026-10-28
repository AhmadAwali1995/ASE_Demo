# External integrations

Source of truth for third-party APIs, webhooks, and outbound clients.

## ASE market snapshot

Direction: local file
Used for: Watch, Compare, company pages, and suggested picks
Source: ase-web/public/market-snapshot.json

## ASE daily bulletin

Direction: outbound
Used for: Refresh snapshot session quotes, index, and Arabic names
Source: ase-web/lib/ase/load-market.ts

## ASE closing prices

Direction: outbound
Used for: Refresh snapshot multi-year closing-price timelines
Source: ase-web/lib/ase/load-market.ts

## ASE companies guides

Direction: outbound
Used for: Refresh snapshot yearly guide figures
Source: ase-web/lib/ase/guides.ts

## ASE disclosures

Direction: outbound
Used for: Annual, six-month, and three-month financial statement filings
Source: ase-web/lib/ase/statements.ts

## Cloudflare Workers

Direction: hosting
Used for: Public ASE Desk at https://ase-desk.ahmadawali1995.workers.dev
Source: ase-web/wrangler.jsonc
