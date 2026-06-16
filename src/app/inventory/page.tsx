import { listProducts } from "@/server/services/products";
import { listSuppliers } from "@/server/services/suppliers";
import { getStockValue } from "@/server/services/reports";
import { formatAUD } from "@/lib/money";
import { PageHeader, StatCard, ButtonLink } from "@/components/ui";
import { BoxIcon, DollarIcon, AlertIcon, CartIcon } from "@/components/icons";
import ProductManager from "@/components/ProductManager";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const [products, suppliers, stock] = await Promise.all([
    listProducts(),
    listSuppliers(),
    getStockValue(),
  ]);

  const lowCount = products.filter((p) => p.quantity <= p.reorderLevel).length;

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle="Manage your product catalogue, pricing and reorder levels."
        action={
          <ButtonLink href="/purchases" variant="secondary">
            <CartIcon width={16} height={16} />
            New purchase
          </ButtonLink>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:mb-6 sm:grid-cols-3 sm:gap-4">
        <StatCard
          label="Total SKUs"
          value={String(stock.skus)}
          hint={`${stock.units} units on hand`}
          icon={<BoxIcon width={18} height={18} />}
          accent="sky"
        />
        <StatCard
          label="Stock value (at cost)"
          value={formatAUD(stock.atCost)}
          hint={`Retail ${formatAUD(stock.atRetail)}`}
          icon={<DollarIcon width={18} height={18} />}
          accent="emerald"
        />
        <StatCard
          label="Needs reordering"
          value={String(lowCount)}
          hint="At or below reorder level"
          icon={<AlertIcon width={18} height={18} />}
          accent={lowCount > 0 ? "amber" : "emerald"}
        />
      </div>

      <ProductManager
        products={products}
        suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}
