import { prisma } from "./prisma";
import { round2 } from "./money";

export async function getProducts() {
  return prisma.product.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: { supplier: true },
  });
}

export async function getSuppliers() {
  return prisma.supplier.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function getLowStock() {
  const products = await prisma.product.findMany({
    include: { supplier: true },
    orderBy: { name: "asc" },
  });
  return products.filter((p) => p.quantity <= p.reorderLevel);
}

// Total value of stock on hand, valued at cost (ex-GST).
export async function getStockValue() {
  const products = await prisma.product.findMany();
  const atCost = products.reduce((s, p) => s + p.costPrice * p.quantity, 0);
  const atRetail = products.reduce((s, p) => s + p.salePrice * p.quantity, 0);
  return {
    atCost: round2(atCost),
    atRetail: round2(atRetail),
    units: products.reduce((s, p) => s + p.quantity, 0),
    skus: products.length,
  };
}

// Financial balance: revenue from sales, cost of purchases, gross profit.
// `days` limits the window (0 = all time).
export async function getFinancials(days = 0) {
  const where =
    days > 0
      ? { createdAt: { gte: daysAgo(days) } }
      : {};
  const txns = await prisma.transaction.findMany({ where });

  let salesEx = 0;
  let salesGst = 0;
  let purchasesEx = 0;
  let purchasesGst = 0;

  for (const t of txns) {
    const ex = t.total - t.gst;
    if (t.type === "SALE") {
      salesEx += ex;
      salesGst += t.gst;
    } else {
      purchasesEx += ex;
      purchasesGst += t.gst;
    }
  }

  // Estimate cost of goods sold using current product cost price.
  const sales = txns.filter((t) => t.type === "SALE");
  const productIds = [...new Set(sales.map((t) => t.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });
  const costMap = new Map(products.map((p) => [p.id, p.costPrice]));
  const cogs = sales.reduce(
    (s, t) => s + (costMap.get(t.productId) ?? 0) * t.quantity,
    0
  );

  return {
    salesEx: round2(salesEx),
    salesGst: round2(salesGst),
    salesInc: round2(salesEx + salesGst),
    purchasesEx: round2(purchasesEx),
    purchasesGst: round2(purchasesGst),
    purchasesInc: round2(purchasesEx + purchasesGst),
    cogs: round2(cogs),
    grossProfit: round2(salesEx - cogs),
    // Net GST position: GST collected on sales minus GST paid on purchases.
    gstPayable: round2(salesGst - purchasesGst),
    saleCount: sales.length,
  };
}

// Best sellers by units sold within the window.
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

  return grouped.map((g) => ({
    product: pmap.get(g.productId)!,
    units: g._sum.quantity ?? 0,
    revenue: round2(g._sum.total ?? 0),
  }));
}

export async function getTransactionsByType(
  type: "PURCHASE" | "SALE",
  limit = 25
) {
  return prisma.transaction.findMany({
    where: { type },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { product: true },
  });
}

export async function getRecentTransactions(limit = 20) {
  return prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { product: true },
  });
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}
