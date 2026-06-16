import { describe, it, expect } from "vitest";
import { summariseFinancials, stockValue, isLowStock } from "./reports";

describe("summariseFinancials", () => {
  const txns = [
    // Sale: 2 units, inc-GST total 11 (ex 10, GST 1)
    { type: "SALE", productId: 1, quantity: 2, gst: 1, total: 11 },
    // Purchase: inc-GST total 22 (ex 20, GST 2)
    { type: "PURCHASE", productId: 2, quantity: 5, gst: 2, total: 22 },
  ];
  const costByProduct = new Map([[1, 3]]); // product 1 costs 3 ex-GST

  const s = summariseFinancials(txns, costByProduct);

  it("splits sales and purchases", () => {
    expect(s.salesEx).toBe(10);
    expect(s.salesGst).toBe(1);
    expect(s.salesInc).toBe(11);
    expect(s.purchasesEx).toBe(20);
    expect(s.purchasesGst).toBe(2);
    expect(s.purchasesInc).toBe(22);
  });

  it("computes COGS and gross profit from cost prices", () => {
    expect(s.cogs).toBe(6); // 3 * 2 units
    expect(s.grossProfit).toBe(4); // salesEx 10 - cogs 6
  });

  it("computes net GST payable and sale count", () => {
    expect(s.gstPayable).toBe(-1); // 1 collected - 2 paid
    expect(s.saleCount).toBe(1);
  });

  it("returns zeros for an empty list", () => {
    const z = summariseFinancials([], new Map());
    expect(z.salesInc).toBe(0);
    expect(z.grossProfit).toBe(0);
    expect(z.saleCount).toBe(0);
  });
});

describe("stockValue", () => {
  it("totals stock at cost and retail", () => {
    const v = stockValue([
      { costPrice: 5, salePrice: 10, quantity: 2 },
      { costPrice: 3, salePrice: 6, quantity: 0 },
    ]);
    expect(v).toEqual({ atCost: 10, atRetail: 20, units: 2, skus: 2 });
  });
});

describe("isLowStock", () => {
  it("flags items at or below the reorder level", () => {
    expect(isLowStock({ quantity: 5, reorderLevel: 5 })).toBe(true);
    expect(isLowStock({ quantity: 0, reorderLevel: 3 })).toBe(true);
    expect(isLowStock({ quantity: 6, reorderLevel: 5 })).toBe(false);
  });
});
