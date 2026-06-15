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

- [Next.js 16](https://nextjs.org/) (App Router, server actions) + React 19
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Prisma 6](https://www.prisma.io/) ORM with a SQLite database
- TypeScript

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Create the environment file (SQLite connection string)
cp .env.example .env

# 3. Create the database schema
npx prisma migrate dev

# 4. Seed it with the spreadsheet data (products, suppliers, sample history)
npm run seed

# 5. Run the dev server
npm run dev
```

Open <http://localhost:3000>.

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

GST is a flat 10% (`src/lib/money.ts`); prices are entered ex-GST and GST is
calculated at the point of each transaction.
