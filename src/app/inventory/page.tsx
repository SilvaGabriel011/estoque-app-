import { getProducts, getSuppliers, getStockValue } from "@/lib/data";
import { formatAUD } from "@/lib/money";
import { PageHeader, StatCard } from "@/components/ui";
import ProductManager from "@/components/ProductManager";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const [products, suppliers, stock] = await Promise.all([
    getProducts(),
    getSuppliers(),
    getStockValue(),
  ]);

  const lowCount = products.filter((p) => p.quantity <= p.reorderLevel).length;

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle="Manage your product catalogue, pricing and reorder levels."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total SKUs" value={String(stock.skus)} />
        <StatCard
          label="Units on hand"
          value={String(stock.units)}
          hint={`Valued at ${formatAUD(stock.atCost)} (cost)`}
        />
        <StatCard
          label="Needs reordering"
          value={String(lowCount)}
          tone={lowCount > 0 ? "warn" : "good"}
        />
      </div>

      <ProductManager
        products={products}
        suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}
