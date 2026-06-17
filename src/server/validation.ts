import { z } from "zod";

export const productInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  sku: z.string().trim().optional().nullable(),
  category: z.string().trim().min(1).default("General"),
  unit: z.string().trim().min(1).default("each"),
  costPrice: z.coerce.number().min(0).default(0),
  quantity: z.coerce.number().int().min(0).default(0),
  reorderLevel: z.coerce.number().int().min(0).default(10),
  supplierId: z.coerce.number().int().positive().nullable().optional(),
});

export const productUpdateSchema = productInputSchema.partial().extend({
  name: z.string().trim().min(1).optional(),
});

export const supplierInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  contact: z.string().trim().optional().nullable(),
  phone: z.string().trim().optional().nullable(),
  email: z.string().trim().email().optional().or(z.literal("")).nullable(),
  notes: z.string().trim().optional().nullable(),
});

export const movementInputSchema = z.object({
  type: z.enum(["PURCHASE", "USAGE"]),
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive(),
  unitPrice: z.coerce.number().min(0).nullable().optional(),
  note: z.string().trim().optional().nullable(),
});

export type ProductInput = z.infer<typeof productInputSchema>;
export type SupplierInput = z.infer<typeof supplierInputSchema>;
export type MovementInput = z.infer<typeof movementInputSchema>;
