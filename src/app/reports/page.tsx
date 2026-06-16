import Link from "next/link";
import { getFinancials, getBestSellers } from "@/server/services/reports";
import { formatAUD } from "@/lib/money";
import { PageHeader, Card, StatCard } from "@/components/ui";
import { DollarIcon, CartIcon, ChartIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

const PERIODS = [
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
  { days: 365, label: "12 months" },
  { days: 0, label: "All time" },
];

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const sp = await searchParams;
  const days = Number(sp.days ?? "90");
  const validDays = PERIODS.some((p) => p.days === days) ? days : 90;

  const [fin, best] = await Promise.all([
    getFinancials(validDays),
    getBestSellers(validDays, 12),
  ]);

  const maxUnits = Math.max(1, ...best.map((b) => b.units));

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Best sellers and financial balance. All figures in AUD."
        action={
          <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
            {PERIODS.map((p) => (
              <Link
                key={p.days}
                href={`/reports?days=${p.days}`}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  p.days === validDays
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {p.label}
              </Link>
            ))}
          </div>
        }
      />

      {/* Financial balance */}
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Financial balance
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Sales revenue (ex. GST)"
          value={formatAUD(fin.salesEx)}
          hint={`${formatAUD(fin.salesInc)} inc. GST`}
          icon={<DollarIcon width={18} height={18} />}
          accent="emerald"
        />
        <StatCard
          label="Cost of goods sold"
          value={formatAUD(fin.cogs)}
          hint="Based on current cost prices"
          icon={<CartIcon width={18} height={18} />}
          accent="sky"
        />
        <StatCard
          label="Gross profit"
          value={formatAUD(fin.grossProfit)}
          hint={
            fin.salesEx > 0
              ? `${Math.round((fin.grossProfit / fin.salesEx) * 100)}% margin`
              : "—"
          }
          icon={<ChartIcon width={18} height={18} />}
          accent="violet"
          valueTone={fin.grossProfit >= 0 ? "good" : "bad"}
        />
        <StatCard
          label="Net GST payable"
          value={formatAUD(fin.gstPayable)}
          hint="GST on sales − GST on purchases"
          icon={<DollarIcon width={18} height={18} />}
          accent="amber"
        />
      </div>

      <Card className="mt-4">
        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div className="space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Sales (ex. GST)</span>
              <span>{formatAUD(fin.salesEx)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST collected on sales</span>
              <span>{formatAUD(fin.salesGst)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-1 font-medium text-slate-800">
              <span>Total sales (inc. GST)</span>
              <span>{formatAUD(fin.salesInc)}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Purchases (ex. GST)</span>
              <span>{formatAUD(fin.purchasesEx)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST paid on purchases</span>
              <span>{formatAUD(fin.purchasesGst)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-1 font-medium text-slate-800">
              <span>Total purchases (inc. GST)</span>
              <span>{formatAUD(fin.purchasesInc)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Best sellers */}
      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Best sellers
      </h2>
      <Card>
        {best.length === 0 ? (
          <p className="text-sm text-slate-500">
            No sales recorded in this period.
          </p>
        ) : (
          <ol className="space-y-4">
            {best.map((b, i) => (
              <li key={b.product.id} className="flex items-center gap-4">
                <span className="w-6 text-right text-sm font-bold text-slate-400">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-800">
                      {b.product.name}
                    </span>
                    <span className="text-slate-500">
                      {b.units} {b.product.unit} · {formatAUD(b.revenue)}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${(b.units / maxUnits) * 100}%` }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
