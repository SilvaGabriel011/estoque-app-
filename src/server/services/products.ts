import { prisma } from "../db";
import { NotFoundError } from "../domain/errors";
import { isLowStock } from "../domain/reports";
import type { ProductInput } from "../validation";

export function listProducts() {
  return prisma.product.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: { supplier: true },
  });
}

export async function listLowStock() {
  const products = await prisma.product.findMany({
    include: { supplier: true },
    orderBy: { name: "asc" },
  });
  return products.filter(isLowStock);
}

export function getProduct(id: number) {
  return prisma.product.findUnique({ where: { id }, include: { supplier: true } });
}

export function createProduct(input: ProductInput) {
  return prisma.product.create({
    data: {
      name: input.name,
      sku: input.sku || null,
      category: input.category,
      unit: input.unit,
      costPrice: input.costPrice,
      quantity: input.quantity,
      reorderLevel: input.reorderLevel,
      supplierId: input.supplierId ?? null,
    },
  });
}

export async function updateProduct(id: number, input: Partial<ProductInput>) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Product not found");

  return prisma.product.update({
    where: { id },
    data: {
      name: input.name ?? undefined,
      sku: input.sku === undefined ? undefined : input.sku || null,
      category: input.category ?? undefined,
      unit: input.unit ?? undefined,
      costPrice: input.costPrice ?? undefined,
      reorderLevel: input.reorderLevel ?? undefined,
      supplierId:
        input.supplierId === undefined ? undefined : input.supplierId ?? null,
    },
  });
}

export async function deleteProduct(id: number) {
  await prisma.transaction.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });
}
