# External integrations

Source of truth for third-party APIs, webhooks, and outbound clients.

## ASE daily bulletin

Direction: outbound
Used for: Session quotes, index, Arabic names
Source: ase-web/lib/ase/market.ts

## ASE closing prices

Direction: outbound
Used for: Multi-year closing-price timelines
Source: ase-web/lib/ase/market.ts

## ASE companies guides

Direction: outbound
Used for: Yearly guide figures on Watch and Compare
Source: ase-web/lib/ase/guides.ts

## ASE disclosures

Direction: outbound
Used for: Annual, six-month, and three-month financial statement filings
Source: ase-web/lib/ase/statements.ts

## Cloudflare Workers

Direction: hosting
Used for: Public ASE Desk at https://ase-desk.ahmadawali1995.workers.dev
Source: ase-web/wrangler.jsonc
