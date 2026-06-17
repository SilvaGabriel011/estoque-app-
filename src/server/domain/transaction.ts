import { GST_RATE, round2 } from "@/lib/money";
import { DomainError } from "./errors";

// The business buys stock to consume internally — it does not resell.
// Stock moves in via PURCHASE and out via USAGE (consumed on jobs).
export type MovementKind = "PURCHASE" | "USAGE";

export type PricedProduct = {
  costPrice: number;
};

/**
 * Unit price for a movement, in AUD ex-GST. Defaults to the product's cost
 * price (what stock is worth) unless an explicit override is given.
 */
export function resolveUnitPrice(
  _kind: MovementKind,
  product: PricedProduct,
  provided?: number | null
): number {
  if (provided != null && provided >= 0) return provided;
  return product.costPrice;
}

export type LineTotals = {
  unitPrice: number;
  quantity: number;
  ex: number;
  gst: number;
  total: number;
};

/**
 * Line totals in AUD. GST (10%) applies to purchases (it's paid to the
 * supplier and is claimable); internal usage carries no GST.
 */
export function lineTotals(
  unitPrice: number,
  quantity: number,
  applyGst = true
): LineTotals {
  const ex = round2(unitPrice * quantity);
  const gst = applyGst ? round2(ex * GST_RATE) : 0;
  const total = round2(ex + gst);
  return { unitPrice, quantity, ex, gst, total };
}

/** Whether GST applies to a movement. */
export function appliesGst(kind: MovementKind): boolean {
  return kind === "PURCHASE";
}

/** Stock on hand after a movement (purchase adds, usage removes). */
export function nextQuantity(
  kind: MovementKind,
  current: number,
  quantity: number
): number {
  return kind === "PURCHASE" ? current + quantity : current - quantity;
}

/** Throws if usage would take stock below zero. */
export function ensureSufficientStock(
  kind: MovementKind,
  current: number,
  quantity: number,
  productName = "product"
): void {
  if (kind === "USAGE" && quantity > current) {
    throw new DomainError(
      `Not enough stock: only ${current} of ${productName} on hand.`
    );
  }
}

/** Validates the raw quantity for any movement. */
export function ensureValidQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new DomainError("Quantity must be a whole number greater than zero.");
  }
}
