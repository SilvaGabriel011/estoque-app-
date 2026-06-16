import { round2 } from "@/lib/money";

export type TxnForFinancials = {
  type: string; // "PURCHASE" | "SALE"
  productId: number;
  quantity: number;
  gst: number;
  total: number; // GST-inclusive
};

export type FinancialSummary = {
  salesEx: number;
  salesGst: number;
  salesInc: number;
  purchasesEx: number;
  purchasesGst: number;
  purchasesInc: number;
  cogs: number;
  grossProfit: number;
  gstPayable: number;
  saleCount: number;
};

/**
 * Aggregates a list of transactions into a financial summary.
 * `costByProduct` maps productId -> current cost price (ex-GST) for COGS.
 * Pure function — no DB access — so it is straightforward to unit test.
 */
export function summariseFinancials(
  txns: TxnForFinancials[],
  costByProduct: Map<number, number>
): FinancialSummary {
  let salesEx = 0;
  let salesGst = 0;
  let purchasesEx = 0;
  let purchasesGst = 0;
  let cogs = 0;
  let saleCount = 0;

  for (const t of txns) {
    const ex = t.total - t.gst;
    if (t.type === "SALE") {
      salesEx += ex;
      salesGst += t.gst;
      cogs += (costByProduct.get(t.productId) ?? 0) * t.quantity;
      saleCount += 1;
    } else {
      purchasesEx += ex;
      purchasesGst += t.gst;
    }
  }

  return {
    salesEx: round2(salesEx),
    salesGst: round2(salesGst),
    salesInc: round2(salesEx + salesGst),
    purchasesEx: round2(purchasesEx),
    purchasesGst: round2(purchasesGst),
    purchasesInc: round2(purchasesEx + purchasesGst),
    cogs: round2(cogs),
    grossProfit: round2(salesEx - cogs),
    gstPayable: round2(salesGst - purchasesGst),
    saleCount,
  };
}

export type StockProduct = {
  costPrice: number;
  salePrice: number;
  quantity: number;
};

export type StockValue = {
  atCost: number;
  atRetail: number;
  units: number;
  skus: number;
};

/** Total value of stock on hand, at cost and at retail (both ex-GST). */
export function stockValue(products: StockProduct[]): StockValue {
  const atCost = products.reduce((s, p) => s + p.costPrice * p.quantity, 0);
  const atRetail = products.reduce((s, p) => s + p.salePrice * p.quantity, 0);
  return {
    atCost: round2(atCost),
    atRetail: round2(atRetail),
    units: products.reduce((s, p) => s + p.quantity, 0),
    skus: products.length,
  };
}

/** Products at or below their reorder level. */
export function isLowStock(p: { quantity: number; reorderLevel: number }): boolean {
  return p.quantity <= p.reorderLevel;
}
