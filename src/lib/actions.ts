"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { GST_RATE, round2 } from "./money";

function num(v: FormDataEntryValue | null, fallback = 0): number {
  const n = parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : fallback;
}

function str(v: FormDataEntryValue | null): string {
  return String(v ?? "").trim();
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/inventory");
  revalidatePath("/purchases");
  revalidatePath("/sales");
  revalidatePath("/reports");
  revalidatePath("/suppliers");
}

// ---- Products ----
export async function createProduct(formData: FormData) {
  const supplierId = num(formData.get("supplierId"), 0);
  await prisma.product.create({
    data: {
      name: str(formData.get("name")),
      sku: str(formData.get("sku")) || null,
      category: str(formData.get("category")) || "General",
      unit: str(formData.get("unit")) || "each",
      costPrice: num(formData.get("costPrice")),
      salePrice: num(formData.get("salePrice")),
      quantity: Math.round(num(formData.get("quantity"))),
      reorderLevel: Math.round(num(formData.get("reorderLevel"), 10)),
      supplierId: supplierId > 0 ? supplierId : null,
    },
  });
  revalidateAll();
}

export async function updateProduct(formData: FormData) {
  const id = num(formData.get("id"));
  const supplierId = num(formData.get("supplierId"), 0);
  await prisma.product.update({
    where: { id },
    data: {
      name: str(formData.get("name")),
      sku: str(formData.get("sku")) || null,
      category: str(formData.get("category")) || "General",
      unit: str(formData.get("unit")) || "each",
      costPrice: num(formData.get("costPrice")),
      salePrice: num(formData.get("salePrice")),
      reorderLevel: Math.round(num(formData.get("reorderLevel"), 10)),
      supplierId: supplierId > 0 ? supplierId : null,
    },
  });
  revalidateAll();
}

export async function deleteProduct(formData: FormData) {
  const id = num(formData.get("id"));
  await prisma.transaction.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });
  revalidateAll();
}

// ---- Stock movements ----
async function recordMovement(
  type: "PURCHASE" | "SALE",
  formData: FormData
) {
  const productId = num(formData.get("productId"));
  const quantity = Math.round(num(formData.get("quantity")));
  if (productId <= 0 || quantity <= 0) {
    throw new Error("Select a product and a quantity greater than zero.");
  }

  const product = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
  });

  // Default unit price: cost for purchases, sale for sales — but allow override.
  const provided = num(formData.get("unitPrice"), -1);
  const unitPrice =
    provided >= 0
      ? provided
      : type === "PURCHASE"
        ? product.costPrice
        : product.salePrice;

  if (type === "SALE" && quantity > product.quantity) {
    throw new Error(
      `Not enough stock: only ${product.quantity} ${product.unit} of ${product.name} on hand.`
    );
  }

  const lineEx = unitPrice * quantity;
  const gst = round2(lineEx * GST_RATE);
  const total = round2(lineEx + gst);

  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        type,
        productId,
        quantity,
        unitPrice,
        gst,
        total,
        note: str(formData.get("note")) || null,
      },
    }),
    prisma.product.update({
      where: { id: productId },
      data: {
        quantity:
          type === "PURCHASE"
            ? product.quantity + quantity
            : product.quantity - quantity,
      },
    }),
  ]);

  revalidateAll();
}

export async function recordPurchase(formData: FormData) {
  await recordMovement("PURCHASE", formData);
}

export async function recordSale(formData: FormData) {
  await recordMovement("SALE", formData);
}

// ---- Suppliers ----
export async function createSupplier(formData: FormData) {
  await prisma.supplier.create({
    data: {
      name: str(formData.get("name")),
      contact: str(formData.get("contact")) || null,
      phone: str(formData.get("phone")) || null,
      email: str(formData.get("email")) || null,
      notes: str(formData.get("notes")) || null,
    },
  });
  revalidateAll();
}

export async function deleteSupplier(formData: FormData) {
  const id = num(formData.get("id"));
  await prisma.product.updateMany({
    where: { supplierId: id },
    data: { supplierId: null },
  });
  await prisma.supplier.delete({ where: { id } });
  revalidateAll();
}
