import { formatAUD, formatDate } from "@/lib/money";
import { Badge } from "./ui";

type Row = {
  id: number;
  type: string;
  quantity: number;
  unitPrice: number;
  total: number;
  note: string | null;
  createdAt: Date;
  product: { name: string; unit: string };
};

export default function TransactionTable({
  rows,
  showType = false,
  emptyLabel = "No transactions yet.",
}: {
  rows: Row[];
  showType?: boolean;
  emptyLabel?: string;
}) {
  if (rows.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-400">{emptyLabel}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
            <th className="py-2.5 pr-4 font-medium">Date</th>
            {showType && <th className="py-2.5 pr-4 font-medium">Type</th>}
            <th className="py-2.5 pr-4 font-medium">Product</th>
            <th className="py-2.5 pr-4 text-right font-medium">Qty</th>
            <th className="py-2.5 pr-4 text-right font-medium">Unit (ex)</th>
            <th className="py-2.5 pl-4 text-right font-medium">Total (inc)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr
              key={t.id}
              className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
            >
              <td className="whitespace-nowrap py-3 pr-4 text-slate-500">
                {formatDate(t.createdAt)}
              </td>
              {showType && (
                <td className="py-3 pr-4">
                  <Badge tone={t.type === "SALE" ? "green" : "blue"}>
                    {t.type === "SALE" ? "Sale" : "Purchase"}
                  </Badge>
                </td>
              )}
              <td className="py-3 pr-4">
                <span className="font-medium text-slate-800">{t.product.name}</span>
                {t.note && (
                  <span className="block text-xs text-slate-400">{t.note}</span>
                )}
              </td>
              <td className="py-3 pr-4 text-right text-slate-600">{t.quantity}</td>
              <td className="py-3 pr-4 text-right text-slate-600">
                {formatAUD(t.unitPrice)}
              </td>
              <td className="py-3 pl-4 text-right font-semibold text-slate-800">
                {formatAUD(t.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
