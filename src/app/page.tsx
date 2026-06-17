import Link from "next/link";
import { listLowStock } from "@/server/services/products";
import { listTransactions } from "@/server/services/transactions";
import { getStockValue, getMostUsed } from "@/server/services/reports";
import { formatAUD } from "@/lib/money";
import { PageHeader, Card, StatCard, Badge, ButtonLink } from "@/components/ui";
import TransactionTable from "@/components/TransactionTable";
import TopSellersChart from "@/components/TopSellersChart";
import {
  CartIcon,
  UsageIcon,
  BoxIcon,
  AlertIcon,
  ArrowRightIcon,
} from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stock, lowStock, mostUsed, recent] = await Promise.all([
    getStockValue(),
    listLowStock(),
    getMostUsed(30, 5),
    listTransactions(8),
  ]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Inventory at a glance · financial figures live in Reports"
        action={
          <>
            <ButtonLink href="/usage" variant="secondary">
              <UsageIcon width={16} height={16} />
              Mark used
            </ButtonLink>
            <ButtonLink href="/purchases" variant="primary">
              <CartIcon width={16} height={16} />
              New purchase
            </ButtonLink>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Stock value (at cost)"
          value={formatAUD(stock.atCost)}
          hint="Inventory on hand"
          icon={<BoxIcon width={18} height={18} />}
          accent="sky"
          tooltip="Total cost-price value (ex-GST) of all stock currently on hand."
        />
        <StatCard
          label="Units on hand"
          value={String(stock.units)}
          hint={`Across ${stock.skus} products`}
          icon={<BoxIcon width={18} height={18} />}
          accent="violet"
          tooltip="Sum of the quantities in stock across every product."
        />
        <StatCard
          label="Products (SKUs)"
          value={String(stock.skus)}
          hint="In the catalogue"
          icon={<CartIcon width={18} height={18} />}
          accent="slate"
          tooltip="Number of distinct products (SKUs) in your catalogue."
        />
        <StatCard
          label="Low stock items"
          value={String(lowStock.length)}
          hint="At or below reorder level"
          icon={<AlertIcon width={18} height={18} />}
          accent={lowStock.length > 0 ? "amber" : "emerald"}
          tooltip="Products at or below their reorder level — reorder these soon."
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-3">
        {/* Low stock alerts */}
        <Card className="lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Low stock alerts</h2>
            <Link
              href="/purchases"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
            >
              Reorder <ArrowRightIcon width={14} height={14} />
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-slate-500">
              All products are above their reorder level. 🎉
            </p>
          ) : (
            <ul className="space-y-2">
              {lowStock.slice(0, 8).map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded-xl bg-amber-50 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {p.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {p.supplier?.name ?? "No supplier"}
                    </p>
                  </div>
                  <Badge tone={p.quantity === 0 ? "red" : "amber"}>
                    {p.quantity}/{p.reorderLevel} {p.unit}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Most-used items (units, 30 days) */}
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">
              Most used <span className="text-slate-400">(units, 30 days)</span>
            </h2>
            <Link
              href="/reports"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
            >
              Full report <ArrowRightIcon width={14} height={14} />
            </Link>
          </div>
          {mostUsed.length === 0 ? (
            <p className="text-sm text-slate-500">No usage recorded yet.</p>
          ) : (
            <TopSellersChart
              items={mostUsed.map((b) => ({
                id: b.product.id,
                name: b.product.name,
                unit: b.product.unit,
                units: b.units,
              }))}
            />
          )}
        </Card>
      </div>

      {/* Recent activity */}
      <Card className="mt-4 sm:mt-6">
        <h2 className="mb-2 font-semibold text-slate-900">Recent activity</h2>
        <TransactionTable rows={recent} showType emptyLabel="No transactions yet." />
      </Card>
    </div>
  );
}
