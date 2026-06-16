import { describe, it, expect } from "vitest";
import { gstFor, incGst, round2, formatAUD, GST_RATE } from "./money";

describe("money helpers (AUD, 10% GST)", () => {
  it("uses a 10% GST rate", () => {
    expect(GST_RATE).toBe(0.1);
  });

  it("round2 rounds to two decimals", () => {
    expect(round2(1.234)).toBe(1.23);
    expect(round2(1.236)).toBe(1.24);
    expect(round2(10)).toBe(10);
  });

  it("gstFor computes 10% GST", () => {
    expect(gstFor(10)).toBe(1);
    expect(gstFor(5.5)).toBe(0.55);
    expect(gstFor(8.7)).toBe(0.87);
  });

  it("incGst adds GST to an ex-GST amount", () => {
    expect(incGst(10)).toBe(11);
    expect(incGst(5.5)).toBe(6.05);
    expect(incGst(8.7)).toBe(9.57);
  });

  it("formatAUD formats currency for en-AU", () => {
    expect(formatAUD(1234.5)).toBe("$1,234.50");
    expect(formatAUD(0)).toBe("$0.00");
  });
});
