import { getProducts, getTransactionsByType, getBestSellers } from "@/lib/data";
import { recordSale } from "@/lib/actions";
import { formatAUD } from "@/lib/money";
import { PageHeader, Card, ButtonLink } from "@/components/ui";
import { CartIcon, ChartIcon } from "@/components/icons";
import MovementForm from "@/components/MovementForm";
import TransactionTable from "@/components/TransactionTable";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const [products, recent, best] = await Promise.all([
    getProducts(),
    getTransactionsByType("SALE"),
    getBestSellers(30, 5),
  ]);

  return (
    <div>
      <PageHeader
        title="Sales"
        subtitle="Sell items to customers — recording a sale reduces stock on hand."
        action={
          <ButtonLink href="/purchases" variant="secondary">
            <CartIcon width={16} height={16} />
            Record a purchase
          </ButtonLink>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-1 text-lg font-semibold text-slate-900">
            Record a sale
          </h2>
          <p className="mb-5 text-sm text-slate-500">
            Search for a product, set the quantity, and stock is updated
            instantly.
          </p>
          <MovementForm products={products} action={recordSale} kind="SALE" />
        </Card>

        <div className="lg:col-span-1">
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <ChartIcon width={18} height={18} />
              </span>
              <h3 className="font-semibold text-slate-900">Top sellers (30d)</h3>
            </div>
            {best.length === 0 ? (
              <p className="text-sm text-slate-500">No sales recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {best.map((b, i) => (
                  <li
                    key={b.product.id}
                    className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                        {i + 1}
                      </span>
                      <span className="truncate text-sm font-medium text-slate-800">
                        {b.product.name}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-slate-500">
                      {b.units} {b.product.unit} · {formatAUD(b.revenue)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <h2 className="mb-4 font-semibold text-slate-900">Recent sales</h2>
        <TransactionTable rows={recent} emptyLabel="No sales recorded yet." />
      </Card>
    </div>
  );
}
