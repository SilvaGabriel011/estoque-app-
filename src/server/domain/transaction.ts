import { GST_RATE, round2 } from "@/lib/money";
import { DomainError } from "./errors";

export type MovementKind = "PURCHASE" | "SALE";

export type PricedProduct = {
  costPrice: number;
  salePrice: number;
};

/**
 * Picks the unit price for a movement: an explicit override when provided
 * (>= 0), otherwise the product's cost (purchase) or sale (sale) price.
 */
export function resolveUnitPrice(
  kind: MovementKind,
  product: PricedProduct,
  provided?: number | null
): number {
  if (provided != null && provided >= 0) return provided;
  return kind === "PURCHASE" ? product.costPrice : product.salePrice;
}

export type LineTotals = {
  unitPrice: number;
  quantity: number;
  ex: number;
  gst: number;
  total: number;
};

/** Computes ex-GST subtotal, GST (10%) and GST-inclusive total for a line. */
export function lineTotals(unitPrice: number, quantity: number): LineTotals {
  const ex = round2(unitPrice * quantity);
  const gst = round2(ex * GST_RATE);
  const total = round2(ex + gst);
  return { unitPrice, quantity, ex, gst, total };
}

/** Stock on hand after applying a movement (purchase adds, sale removes). */
export function nextQuantity(
  kind: MovementKind,
  current: number,
  quantity: number
): number {
  return kind === "PURCHASE" ? current + quantity : current - quantity;
}

/** Throws if a sale would take stock below zero. */
export function ensureSufficientStock(
  kind: MovementKind,
  current: number,
  quantity: number,
  productName = "product"
): void {
  if (kind === "SALE" && quantity > current) {
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
