import { prisma, type Db } from "../db";
import { NotFoundError } from "../domain/errors";
import {
  resolveUnitPrice,
  lineTotals,
  nextQuantity,
  ensureSufficientStock,
  ensureValidQuantity,
  appliesGst,
  type MovementKind,
} from "../domain/transaction";
import type { MovementInput } from "../validation";

export function listTransactions(limit = 20) {
  return prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { product: true },
  });
}

export function listTransactionsByType(type: MovementKind, limit = 25) {
  return prisma.transaction.findMany({
    where: { type },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { product: true },
  });
}

/**
 * Records a purchase (stock in) or usage (stock out, consumed internally):
 * validates the request, computes totals (GST on purchases only), writes the
 * transaction and adjusts stock — atomically. `db` is injectable for testing.
 */
export async function recordMovement(input: MovementInput, db: Db = prisma) {
  const kind = input.type as MovementKind;
  ensureValidQuantity(input.quantity);

  const product = await db.product.findUnique({ where: { id: input.productId } });
  if (!product) throw new NotFoundError("Product not found");

  ensureSufficientStock(kind, product.quantity, input.quantity, product.name);

  const unitPrice = resolveUnitPrice(kind, product, input.unitPrice);
  const line = lineTotals(unitPrice, input.quantity, appliesGst(kind));
  const newQuantity = nextQuantity(kind, product.quantity, input.quantity);

  const [transaction] = await db.$transaction([
    db.transaction.create({
      data: {
        type: kind,
        productId: product.id,
        quantity: input.quantity,
        unitPrice: line.unitPrice,
        gst: line.gst,
        total: line.total,
        note: input.note || null,
      },
    }),
    db.product.update({
      where: { id: product.id },
      data: { quantity: newQuantity },
    }),
  ]);

  return { transaction, newQuantity };
}
