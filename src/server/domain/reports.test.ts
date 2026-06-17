import { describe, it, expect } from "vitest";
import { summariseFinancials, stockValue, isLowStock } from "./reports";

describe("summariseFinancials", () => {
  const txns = [
    // Purchase: inc-GST total 22 (ex 20, GST 2)
    { type: "PURCHASE", productId: 2, quantity: 5, gst: 2, total: 22 },
    // Usage: 2 units consumed, cost 10 (no GST)
    { type: "USAGE", productId: 1, quantity: 2, gst: 0, total: 10 },
  ];

  const s = summariseFinancials(txns);

  it("summarises purchasing spend and GST paid", () => {
    expect(s.purchasesEx).toBe(20);
    expect(s.purchasesGst).toBe(2);
    expect(s.purchasesInc).toBe(22);
    expect(s.purchaseCount).toBe(1);
  });

  it("summarises stock consumed at cost", () => {
    expect(s.usageCost).toBe(10);
    expect(s.usageCount).toBe(1);
  });

  it("returns zeros for an empty list", () => {
    const z = summariseFinancials([]);
    expect(z.purchasesInc).toBe(0);
    expect(z.usageCost).toBe(0);
    expect(z.purchaseCount).toBe(0);
  });
});

describe("stockValue", () => {
  it("totals stock at cost", () => {
    const v = stockValue([
      { costPrice: 5, quantity: 2 },
      { costPrice: 3, quantity: 0 },
    ]);
    expect(v).toEqual({ atCost: 10, units: 2, skus: 2 });
  });
});

describe("isLowStock", () => {
  it("flags items at or below the reorder level", () => {
    expect(isLowStock({ quantity: 5, reorderLevel: 5 })).toBe(true);
    expect(isLowStock({ quantity: 0, reorderLevel: 3 })).toBe(true);
    expect(isLowStock({ quantity: 6, reorderLevel: 5 })).toBe(false);
  });
});
