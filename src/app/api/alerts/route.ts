import { ok, route } from "@/server/http";
import { listLowStock } from "@/server/services/products";

export const dynamic = "force-dynamic";

// Items that are running low (at or below their reorder level).
export const GET = route(async () => {
  const products = await listLowStock();
  const items = products.map((p) => ({
    id: p.id,
    name: p.name,
    unit: p.unit,
    quantity: p.quantity,
    reorderLevel: p.reorderLevel,
    supplier: p.supplier?.name ?? null,
    outOfStock: p.quantity === 0,
  }));
  return ok({ count: items.length, items });
});
