import { prisma } from "../db";
import { round2 } from "@/lib/money";
import {
  summariseFinancials,
  stockValue,
  type FinancialSummary,
} from "../domain/reports";

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

export async function getStockValue() {
  const products = await prisma.product.findMany({
    select: { costPrice: true, salePrice: true, quantity: true },
  });
  return stockValue(products);
}

/** Financial balance over a window (`days` = 0 means all time). */
export async function getFinancials(days = 0): Promise<FinancialSummary> {
  const where = days > 0 ? { createdAt: { gte: daysAgo(days) } } : {};
  const txns = await prisma.transaction.findMany({ where });

  const saleProductIds = [
    ...new Set(txns.filter((t) => t.type === "SALE").map((t) => t.productId)),
  ];
  const products = await prisma.product.findMany({
    where: { id: { in: saleProductIds } },
    select: { id: true, costPrice: true },
  });
  const costByProduct = new Map(products.map((p) => [p.id, p.costPrice]));

  return summariseFinancials(txns, costByProduct);
}

/** Best sellers by units sold within the window. */
export async function getBestSellers(days = 0, limit = 8) {
  const where = {
    type: "SALE",
    ...(days > 0 ? { createdAt: { gte: daysAgo(days) } } : {}),
  };
  const grouped = await prisma.transaction.groupBy({
    by: ["productId"],
    where,
    _sum: { quantity: true, total: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });

  const products = await prisma.product.findMany({
    where: { id: { in: grouped.map((g) => g.productId) } },
  });
  const pmap = new Map(products.map((p) => [p.id, p]));

  return grouped
    .filter((g) => pmap.has(g.productId))
    .map((g) => ({
      product: pmap.get(g.productId)!,
      units: g._sum.quantity ?? 0,
      revenue: round2(g._sum.total ?? 0),
    }));
}
