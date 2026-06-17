import { round2 } from "@/lib/money";

export type TxnForFinancials = {
  type: string; // "PURCHASE" | "USAGE"
  productId: number;
  quantity: number;
  gst: number;
  total: number; // GST-inclusive for purchases; cost (ex-GST) for usage
};

export type FinancialSummary = {
  // Buying stock from suppliers
  purchasesEx: number;
  purchasesGst: number; // GST paid (claimable)
  purchasesInc: number;
  purchaseCount: number;
  // Stock consumed internally, valued at cost (ex-GST)
  usageCost: number;
  usageCount: number;
};

/**
 * Aggregates transactions into a spend/consumption summary.
 * Pure function — easy to unit test.
 */
export function summariseFinancials(txns: TxnForFinancials[]): FinancialSummary {
  let purchasesEx = 0;
  let purchasesGst = 0;
  let purchaseCount = 0;
  let usageCost = 0;
  let usageCount = 0;

  for (const t of txns) {
    if (t.type === "PURCHASE") {
      purchasesEx += t.total - t.gst;
      purchasesGst += t.gst;
      purchaseCount += 1;
    } else if (t.type === "USAGE") {
      usageCost += t.total - t.gst; // usage has no GST, but keep the formula safe
      usageCount += 1;
    }
  }

  return {
    purchasesEx: round2(purchasesEx),
    purchasesGst: round2(purchasesGst),
    purchasesInc: round2(purchasesEx + purchasesGst),
    purchaseCount,
    usageCost: round2(usageCost),
    usageCount,
  };
}

export type StockProduct = {
  costPrice: number;
  quantity: number;
};

export type StockValue = {
  atCost: number;
  units: number;
  skus: number;
};

/** Total value of stock on hand, at cost (ex-GST). */
export function stockValue(products: StockProduct[]): StockValue {
  const atCost = products.reduce((s, p) => s + p.costPrice * p.quantity, 0);
  return {
    atCost: round2(atCost),
    units: products.reduce((s, p) => s + p.quantity, 0),
    skus: products.length,
  };
}

/** Products at or below their reorder level. */
export function isLowStock(p: { quantity: number; reorderLevel: number }): boolean {
  return p.quantity <= p.reorderLevel;
}
