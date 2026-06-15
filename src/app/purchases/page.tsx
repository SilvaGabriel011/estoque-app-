import { getProducts, getTransactionsByType } from "@/lib/data";
import { recordPurchase } from "@/lib/actions";
import { formatAUD, formatDate } from "@/lib/money";
import { PageHeader, Card } from "@/components/ui";
import MovementForm from "@/components/MovementForm";

export const dynamic = "force-dynamic";

export default async function PurchasesPage() {
  const [products, recent] = await Promise.all([
    getProducts(),
    getTransactionsByType("PURCHASE"),
  ]);

  return (
    <div>
      <PageHeader
        title="Purchases"
        subtitle="Buy stock from suppliers. Recording a purchase increases stock on hand."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-semibold text-slate-900">Record a purchase</h2>
          <MovementForm
            products={products}
            action={recordPurchase}
            kind="PURCHASE"
          />
        </Card>

        <Card className="lg:col-span-3">
          <h2 className="mb-4 font-semibold text-slate-900">
            Recent purchases
          </h2>
          {recent.length === 0 ? (
            <p className="text-sm text-slate-500">No purchases yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                    <th className="py-2 pr-4 font-medium">Date</th>
                    <th className="py-2 pr-4 font-medium">Product</th>
                    <th className="py-2 pr-4 text-right font-medium">Qty</th>
                    <th className="py-2 pr-4 text-right font-medium">
                      Unit (ex)
                    </th>
                    <th className="py-2 pl-4 text-right font-medium">
                      Total (inc)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((t) => (
                    <tr key={t.id} className="border-b border-slate-100">
                      <td className="py-2 pr-4 text-slate-500">
                        {formatDate(t.createdAt)}
                      </td>
                      <td className="py-2 pr-4 font-medium text-slate-800">
                        {t.product.name}
                        {t.note && (
                          <span className="block text-xs font-normal text-slate-400">
                            {t.note}
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-right text-slate-600">
                        {t.quantity}
                      </td>
                      <td className="py-2 pr-4 text-right text-slate-600">
                        {formatAUD(t.unitPrice)}
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
    </div>
  );
}
