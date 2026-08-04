# U Logix

Freight aggregator for SME shippers across Central Asia and CIS. Price a shipment
across six carriers, compare all-in costs against a market benchmark, and book in
one click.

This repository is the Phase 1 web MVP.

## What it does

- **Rate calculator** — a five-step wizard collects route, mode, cargo type, and
  dimensions, then prices the shipment across AIR, LTL, FTL, and FCL.
- **Guided freight classification** — freight class is derived from measured
  density and cargo type. Users never look it up.
- **Market benchmark** — every quote is flagged above or below market, and the
  lowest all-in option is highlighted.
- **One-click booking** — book the selected carrier without leaving the platform.
- **Customer cabinet** — quote history, booking and shipment status, CSV export.

Available in English, Uzbek, and Russian.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Prisma · Postgres · next-intl · Vercel

