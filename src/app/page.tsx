import Link from "next/link";
import {
  getStockValue,
  getLowStock,
  getFinancials,
  getBestSellers,
  getRecentTransactions,
} from "@/lib/data";
import { formatAUD, formatDate } from "@/lib/money";
import { PageHeader, Card, StatCard, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stock, lowStock, fin, best, recent] = await Promise.all([
    getStockValue(),
    getLowStock(),
    getFinancials(30),
    getBestSellers(30, 5),
    getRecentTransactions(8),
  ]);

  const maxUnits = Math.max(1, ...best.map((b) => b.units));

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Last 30 days · all figures in AUD (GST inclusive where noted)"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Sales (inc. GST)"
          value={formatAUD(fin.salesInc)}
          hint={`${fin.saleCount} sales`}
          tone="good"
        />
        <StatCard
          label="Gross profit"
          value={formatAUD(fin.grossProfit)}
          hint={`COGS ${formatAUD(fin.cogs)}`}
          tone={fin.grossProfit >= 0 ? "good" : "bad"}
        />
        <StatCard
          label="Stock value (at cost)"
          value={formatAUD(stock.atCost)}
          hint={`${stock.units} units · ${stock.skus} SKUs`}
        />
        <StatCard
          label="Low stock items"
          value={String(lowStock.length)}
          hint="At or below reorder level"
          tone={lowStock.length > 0 ? "warn" : "good"}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Low stock alerts */}
        <Card className="lg:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Low stock alerts</h2>
            <Link
              href="/purchases"
              className="text-sm font-medium text-emerald-600 hover:underline"
            >
              Reorder →
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
                  className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {p.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {p.supplier?.name ?? "No supplier"}
                    </p>
                  </div>
                  <Badge tone={p.quantity === 0 ? "red" : "amber"}>
                    {p.quantity} / {p.reorderLevel} {p.unit}
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
              Top sellers (units, 30 days)
            </h2>
            <Link
              href="/reports"
              className="text-sm font-medium text-emerald-600 hover:underline"
            >
              Full report →
            </Link>
          </div>
          {best.length === 0 ? (
            <p className="text-sm text-slate-500">No sales recorded yet.</p>
          ) : (
            <ul className="space-y-3">
              {best.map((b) => (
                <li key={b.product.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      {b.product.name}
                    </span>
                    <span className="text-slate-500">
                      {b.units} {b.product.unit} · {formatAUD(b.revenue)}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
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
        <h2 className="mb-3 font-semibold text-slate-900">Recent activity</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-slate-500">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">Product</th>
                  <th className="py-2 pr-4 text-right font-medium">Qty</th>
                  <th className="py-2 pl-4 text-right font-medium">
                    Total (inc. GST)
                  </th>
                </tr>
              </thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100">
                    <td className="py-2 pr-4 text-slate-500">
                      {formatDate(t.createdAt)}
                    </td>
                    <td className="py-2 pr-4">
                      <Badge tone={t.type === "SALE" ? "green" : "blue"}>
                        {t.type === "SALE" ? "Sale" : "Purchase"}
                      </Badge>
                    </td>
                    <td className="py-2 pr-4 font-medium text-slate-800">
                      {t.product.name}
                    </td>
                    <td className="py-2 pr-4 text-right text-slate-600">
                      {t.quantity}
                    </td>
                    <td className="py-2 pl-4 text-right font-medium text-slate-800">
                      {formatAUD(t.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
