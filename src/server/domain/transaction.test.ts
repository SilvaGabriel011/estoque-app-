import { describe, it, expect } from "vitest";
import {
  resolveUnitPrice,
  lineTotals,
  nextQuantity,
  ensureSufficientStock,
  ensureValidQuantity,
  appliesGst,
} from "./transaction";
import { DomainError } from "./errors";

const product = { costPrice: 5.5 };

describe("resolveUnitPrice", () => {
  it("defaults to cost price for both purchase and usage", () => {
    expect(resolveUnitPrice("PURCHASE", product)).toBe(5.5);
    expect(resolveUnitPrice("USAGE", product)).toBe(5.5);
  });

  it("uses an explicit override when provided", () => {
    expect(resolveUnitPrice("PURCHASE", product, 7.25)).toBe(7.25);
    expect(resolveUnitPrice("PURCHASE", product, 0)).toBe(0);
  });

  it("ignores null/negative overrides", () => {
    expect(resolveUnitPrice("PURCHASE", product, null)).toBe(5.5);
    expect(resolveUnitPrice("PURCHASE", product, -3)).toBe(5.5);
  });
});

describe("appliesGst", () => {
  it("applies to purchases but not usage", () => {
    expect(appliesGst("PURCHASE")).toBe(true);
    expect(appliesGst("USAGE")).toBe(false);
  });
});

describe("lineTotals", () => {
  it("adds GST when applicable (purchases)", () => {
    expect(lineTotals(8.7, 1, true)).toEqual({
      unitPrice: 8.7,
      quantity: 1,
      ex: 8.7,
      gst: 0.87,
      total: 9.57,
    });
  });

  it("omits GST for internal usage", () => {
    expect(lineTotals(5.5, 2, false)).toEqual({
      unitPrice: 5.5,
      quantity: 2,
      ex: 11,
      gst: 0,
      total: 11,
    });
  });
});

describe("nextQuantity", () => {
  it("adds on purchase and subtracts on usage", () => {
    expect(nextQuantity("PURCHASE", 10, 5)).toBe(15);
    expect(nextQuantity("USAGE", 10, 4)).toBe(6);
  });
});

describe("ensureSufficientStock", () => {
  it("allows usage within stock", () => {
    expect(() => ensureSufficientStock("USAGE", 10, 10)).not.toThrow();
  });

  it("throws when usage exceeds stock", () => {
    expect(() => ensureSufficientStock("USAGE", 3, 5, "Clear Silicone")).toThrow(
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
