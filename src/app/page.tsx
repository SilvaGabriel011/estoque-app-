import Link from "next/link";
import { listLowStock } from "@/server/services/products";
import { listTransactions } from "@/server/services/transactions";
import {
  getStockValue,
  getFinancials,
  getBestSellers,
} from "@/server/services/reports";
import { formatAUD } from "@/lib/money";
import { PageHeader, Card, StatCard, Badge, ButtonLink } from "@/components/ui";
import TransactionTable from "@/components/TransactionTable";
import {
  CartIcon,
  DollarIcon,
  BoxIcon,
  AlertIcon,
  ChartIcon,
  ArrowRightIcon,
} from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stock, lowStock, fin, best, recent] = await Promise.all([
    getStockValue(),
    listLowStock(),
    getFinancials(30),
    getBestSellers(30, 5),
    listTransactions(8),
  ]);

  const maxUnits = Math.max(1, ...best.map((b) => b.units));

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Last 30 days · all figures in AUD (GST inclusive where noted)"
        action={
          <>
            <ButtonLink href="/sales" variant="secondary">
              <DollarIcon width={16} height={16} />
              Record sale
            </ButtonLink>
            <ButtonLink href="/purchases" variant="primary">
              <CartIcon width={16} height={16} />
              New purchase
            </ButtonLink>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Sales (inc. GST)"
          value={formatAUD(fin.salesInc)}
          hint={`${fin.saleCount} sales`}
          icon={<DollarIcon width={18} height={18} />}
          accent="emerald"
        />
        <StatCard
          label="Gross profit"
          value={formatAUD(fin.grossProfit)}
          hint={`COGS ${formatAUD(fin.cogs)}`}
          icon={<ChartIcon width={18} height={18} />}
          accent="violet"
          valueTone={fin.grossProfit >= 0 ? "good" : "bad"}
        />
        <StatCard
          label="Stock value (at cost)"
          value={formatAUD(stock.atCost)}
          hint={`${stock.units} units · ${stock.skus} SKUs`}
          icon={<BoxIcon width={18} height={18} />}
          accent="sky"
        />
        <StatCard
          label="Low stock items"
          value={String(lowStock.length)}
          hint="At or below reorder level"
          icon={<AlertIcon width={18} height={18} />}
          accent={lowStock.length > 0 ? "amber" : "emerald"}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
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

        {/* Best sellers */}
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">
              Top sellers <span className="text-slate-400">(units, 30 days)</span>
            </h2>
            <Link
              href="/reports"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
            >
              Full report <ArrowRightIcon width={14} height={14} />
            </Link>
          </div>
          {best.length === 0 ? (
            <p className="text-sm text-slate-500">No sales recorded yet.</p>
          ) : (
            <ul className="space-y-3.5">
              {best.map((b) => (
                <li key={b.product.id}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      {b.product.name}
                    </span>
                    <span className="text-slate-500">
                      {b.units} {b.product.unit} · {formatAUD(b.revenue)}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-300 to-brand-400"
                      style={{ width: `${(b.units / maxUnits) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Recent activity */}
      <Card className="mt-6">
        <h2 className="mb-2 font-semibold text-slate-900">Recent activity</h2>
        <TransactionTable rows={recent} showType emptyLabel="No transactions yet." />
      </Card>
    </div>
  );
}
