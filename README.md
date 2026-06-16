# StockPro — Consumables Inventory & Sales

A web app for managing consumables stock, built from the **CONSUMABLES STOCK**
spreadsheet (silicones, glues, cleaning supplies, tools and protection film for
a stone/benchtop fabrication business). Pricing is in **AUD** with **10% GST**,
aimed at the Australian market.

## Features

- **📦 Inventory** — full product catalogue with category, SKU, supplier, cost
  & sale price, on-hand quantity and reorder level. Search and filter, add,
  edit and delete products.
- **🛒 Purchases** — buy stock from suppliers (stock in). Live ex-GST / GST /
  inc-GST totals as you type.
- **💲 Sales** — sell items to customers (stock out), with stock-on-hand
  validation so you can't oversell.
- **🚨 Low stock alerts** — dashboard flags every product at or below its
  reorder level so you know what to reorder.
- **📈 Best sellers** — see which products sell the most (by units and revenue)
  over 30 / 90 / 365 days or all time.
- **💰 Financial balance** — sales revenue, cost of goods sold, gross profit and
  margin, plus net GST payable (GST collected − GST paid).
- **🏷️ Suppliers** — supplier directory with contacts, linked to products.

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router) + React 19
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Prisma 6](https://www.prisma.io/) ORM with a PostgreSQL database (Neon)
- [Zod](https://zod.dev/) for request validation, [Vitest](https://vitest.dev/) for tests
- TypeScript

## Architecture

The backend (business logic + data access) is fully separated from the UI and
exposed over a REST API. The frontend only talks to the backend over HTTP.

```
src/
  server/                 ← backend (no React)
    domain/               ← pure business logic (GST, stock, reports) — unit tested
    services/             ← use-cases composing domain + Prisma
    validation.ts         ← Zod schemas
    http.ts, db.ts        ← API helpers + Prisma client
  app/api/                ← REST route handlers (controllers) → call services
  lib/api.ts              ← typed fetch client the UI uses
  components/, app/*      ← UI (calls the REST API, never the DB directly)
```

### REST API

| Method & path                | Description                          |
| ---------------------------- | ----------------------------------- |
| `GET    /api/products`       | List products                       |
| `POST   /api/products`       | Create a product                    |
| `GET    /api/products/:id`   | Get one product                     |
| `PATCH  /api/products/:id`   | Update a product                    |
| `DELETE /api/products/:id`   | Delete a product                    |
| `GET    /api/suppliers`      | List suppliers                      |
| `POST   /api/suppliers`      | Create a supplier                   |
| `DELETE /api/suppliers/:id`  | Delete a supplier                   |
| `GET    /api/transactions`   | List movements (`?type=SALE`)       |
| `POST   /api/transactions`   | Record a purchase or sale           |
| `GET    /api/reports`        | Financials + best sellers (`?days`) |

Errors are returned as JSON: validation → `422`, business rules (e.g. selling
more than is in stock) → `400`, not found → `404`.

## Testing

Business logic lives in pure, dependency-free functions, so the test suite runs
without a database (the service layer is tested with an injected fake client).

```bash
npm test          # run once
npm run test:watch
```

## Getting started (local)

```bash
# 1. Install dependencies
npm install

# 2. Create the environment file and paste your Postgres (Neon) connection
#    strings into DATABASE_URL and DATABASE_URL_UNPOOLED.
cp .env.example .env

# 3. Create the database schema
npx prisma migrate deploy   # or: npx prisma migrate dev

# 4. Seed it with the spreadsheet data (products, suppliers, sample history)
npm run seed

# 5. Run the dev server
npm run dev
```

Open <http://localhost:3000>.

## Deploying to Vercel

This app is built for Vercel + [Neon Postgres](https://neon.tech/).

1. Connect the repo to Vercel and set the **Production branch** to `main`.
2. Add the **Neon** integration (Vercel → Storage → Neon). It automatically
   sets `DATABASE_URL` and `DATABASE_URL_UNPOOLED` on the project.
3. Deploy. The `vercel-build` script runs `prisma generate`,
   `prisma migrate deploy` (creates the tables) and seeds the database on the
   first deploy, then builds the app.

> The seed is idempotent — it only runs against an empty database, so your data
> is never wiped on subsequent deploys. Set `FORCE_SEED=1` to reset.

## Useful scripts

| Command            | Description                                 |
| ------------------ | ------------------------------------------- |
| `npm run dev`      | Start the development server                |
| `npm run build`    | Production build                            |
| `npm start`        | Run the production build                    |
| `npm run seed`     | Seed the database with the spreadsheet data |
| `npm run db:reset` | Drop, re-migrate and re-seed the database   |

## Data model

- **Product** — name, SKU, category, unit, `costPrice` & `salePrice` (stored
  **ex-GST** in AUD), `quantity` on hand, `reorderLevel`, optional supplier.
- **Supplier** — name, contact, phone, email, notes.
- **Transaction** — a `PURCHASE` or `SALE` of a product: quantity, unit price
  (ex-GST), GST amount and GST-inclusive total. Purchases increase stock; sales
  decrease it.

> Note: the database is PostgreSQL (Neon) so it works on Vercel's serverless
> runtime. SQLite (a local file) cannot be used on Vercel because the
> filesystem is read-only and ephemeral.

GST is a flat 10% (`src/lib/money.ts`); prices are entered ex-GST and GST is
calculated at the point of each transaction.
