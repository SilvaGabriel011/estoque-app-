import { describe, it, expect } from "vitest";
import {
  resolveUnitPrice,
  lineTotals,
  nextQuantity,
  ensureSufficientStock,
  ensureValidQuantity,
} from "./transaction";
import { DomainError } from "./errors";

const product = { costPrice: 5.5, salePrice: 8.7 };

describe("resolveUnitPrice", () => {
  it("defaults to cost price for purchases", () => {
    expect(resolveUnitPrice("PURCHASE", product)).toBe(5.5);
  });

  it("defaults to sale price for sales", () => {
    expect(resolveUnitPrice("SALE", product)).toBe(8.7);
  });

  it("uses an explicit override when provided", () => {
    expect(resolveUnitPrice("SALE", product, 7.25)).toBe(7.25);
    expect(resolveUnitPrice("PURCHASE", product, 0)).toBe(0);
  });

  it("ignores null/negative overrides", () => {
    expect(resolveUnitPrice("SALE", product, null)).toBe(8.7);
    expect(resolveUnitPrice("SALE", product, -3)).toBe(8.7);
  });
});

describe("lineTotals", () => {
  it("computes ex, GST (10%) and inclusive total", () => {
    expect(lineTotals(8.7, 1)).toEqual({
      unitPrice: 8.7,
      quantity: 1,
      ex: 8.7,
      gst: 0.87,
      total: 9.57,
    });
  });

  it("scales with quantity", () => {
    expect(lineTotals(5.5, 10)).toEqual({
      unitPrice: 5.5,
      quantity: 10,
      ex: 55,
      gst: 5.5,
      total: 60.5,
    });
  });
});

describe("nextQuantity", () => {
  it("adds on purchase and subtracts on sale", () => {
    expect(nextQuantity("PURCHASE", 10, 5)).toBe(15);
    expect(nextQuantity("SALE", 10, 4)).toBe(6);
  });
});

describe("ensureSufficientStock", () => {
  it("allows a sale within stock", () => {
    expect(() => ensureSufficientStock("SALE", 10, 10)).not.toThrow();
  });

  it("throws a DomainError when a sale exceeds stock", () => {
    expect(() => ensureSufficientStock("SALE", 3, 5, "Clear Silicone")).toThrow(
      DomainError
    );
  });

  it("never blocks purchases", () => {
    expect(() => ensureSufficientStock("PURCHASE", 0, 9999)).not.toThrow();
  });
});

describe("ensureValidQuantity", () => {
  it("rejects zero, negatives and fractions", () => {
    expect(() => ensureValidQuantity(0)).toThrow(DomainError);
    expect(() => ensureValidQuantity(-2)).toThrow(DomainError);
    expect(() => ensureValidQuantity(1.5)).toThrow(DomainError);
  });

  it("accepts positive integers", () => {
    expect(() => ensureValidQuantity(1)).not.toThrow();
  });
});
