"use client";

import { useState } from "react";
import { formatAUD, formatDate } from "@/lib/money";
import { Badge } from "./ui";
import { Pagination, pageSlice } from "./controls";

type Row = {
  id: number;
  type: string;
  quantity: number;
  unitPrice: number;
  total: number;
  note: string | null;
  createdAt: Date | string;
  product: { name: string; unit: string };
};

export default function TransactionTable({
  rows,
  showType = false,
  emptyLabel = "No transactions yet.",
  pageSize = 8,
}: {
  rows: Row[];
  showType?: boolean;
  emptyLabel?: string;
  pageSize?: number;
}) {
  const [page, setPage] = useState(1);

  if (rows.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-400">{emptyLabel}</p>;
  }

  const { pageItems, pageCount, safePage } = pageSlice(rows, page, pageSize);

  const TypeBadge = ({ type }: { type: string }) => (
    <Badge tone={type === "SALE" ? "green" : "blue"}>
      {type === "SALE" ? "Sale" : "Purchase"}
    </Badge>
  );

  return (
    <div>
      {/* Mobile: stacked cards (no horizontal scroll) */}
      <ul className="space-y-2 sm:hidden">
        {pageItems.map((t) => (
          <li key={t.id} className="rounded-xl border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-800">
                  {t.product.name}
                </p>
                <p className="text-xs text-slate-400">
                  {formatDate(t.createdAt)} · {t.quantity} {t.product.unit}
                  {t.note ? ` · ${t.note}` : ""}
                </p>
              </div>
              <div className="shrink-0 text-right">
                {showType && <TypeBadge type={t.type} />}
                <p className="mt-1 font-semibold text-slate-800">
                  {formatAUD(t.total)}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto sm:block">
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
            {pageItems.map((t) => (
              <tr
                key={t.id}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
              >
                <td className="whitespace-nowrap py-3 pr-4 text-slate-500">
                  {formatDate(t.createdAt)}
                </td>
                {showType && (
                  <td className="py-3 pr-4">
                    <TypeBadge type={t.type} />
                  </td>
                )}
                <td className="py-3 pr-4">
                  <span className="font-medium text-slate-800">
                    {t.product.name}
                  </span>
                  {t.note && (
                    <span className="block text-xs text-slate-400">{t.note}</span>
                  )}
                </td>
                <td className="py-3 pr-4 text-right text-slate-600">
                  {t.quantity}
                </td>
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

      <Pagination page={safePage} pageCount={pageCount} onPage={setPage} />
    </div>
  );
}
