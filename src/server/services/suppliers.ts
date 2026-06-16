import { prisma } from "../db";
import type { SupplierInput } from "../validation";

export function listSuppliers() {
  return prisma.supplier.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export function createSupplier(input: SupplierInput) {
  return prisma.supplier.create({
    data: {
      name: input.name,
      contact: input.contact || null,
      phone: input.phone || null,
      email: input.email || null,
      notes: input.notes || null,
    },
  });
}

export async function deleteSupplier(id: number) {
  await prisma.product.updateMany({
    where: { supplierId: id },
    data: { supplierId: null },
  });
  await prisma.supplier.delete({ where: { id } });
}
