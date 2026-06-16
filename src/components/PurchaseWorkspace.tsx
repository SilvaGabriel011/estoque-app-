"use client";

import { useState } from "react";
import { Card } from "./ui";
import { SegmentedTabs } from "./controls";
import { AlertIcon, ArrowRightIcon, CartIcon, BoxIcon, ChartIcon } from "./icons";
import MovementForm, { ProductLite } from "./MovementForm";
import TransactionTable from "./TransactionTable";

type Row = React.ComponentProps<typeof TransactionTable>["rows"][number];

export default function PurchaseWorkspace({
  products,
  lowStock,
  recent,
}: {
  products: ProductLite[];
  lowStock: ProductLite[];
  recent: Row[];
}) {
  const [tab, setTab] = useState("record");
  const [requested, setRequested] = useState<number | null>(null);
  const [tick, setTick] = useState(0);

  const pick = (id: number) => {
    setRequested(id);
    setTick((t) => t + 1);
    setTab("record");
  };

  return (
    <Card>
      <SegmentedTabs
        value={tab}
        onChange={setTab}
        tabs={[
          { key: "record", label: "Record", icon: <CartIcon width={15} height={15} /> },
          { key: "reorder", label: "Reorder", count: lowStock.length, icon: <AlertIcon width={15} height={15} /> },
          { key: "history", label: "History", icon: <BoxIcon width={15} height={15} /> },
        ]}
      />

      {tab === "record" && (
        <div className="mx-auto max-w-2xl">
          <MovementForm
            products={products}
            kind="PURCHASE"
            requestedProductId={requested}
            key={tick}
          />
        </div>
      )}

      {tab === "reorder" && (
        <div className="mx-auto max-w-2xl">
          {lowStock.length === 0 ? (
            <div className="py-10 text-center">
              <ChartIcon width={28} height={28} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm text-slate-500">
                Nothing needs reordering right now. 🎉
              </p>
            </div>
          ) : (
            <>
              <p className="mb-3 text-sm text-slate-500">
                Items at or below their reorder level. Tap one to load it into the
                purchase form.
              </p>
              <ul className="space-y-2">
                {lowStock.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => pick(p.id)}
                      className="group flex w-full items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50/50 px-3 py-3 text-left transition-colors hover:bg-amber-50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-slate-800">
                          {p.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {p.quantity}/{p.reorderLevel} {p.unit} ·{" "}
                          {p.supplier?.name ?? "No supplier"}
                        </span>
                      </span>
                      <ArrowRightIcon
                        width={16}
                        height={16}
                        className="shrink-0 text-amber-500 transition-transform group-hover:translate-x-0.5"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {tab === "history" && (
        <TransactionTable rows={recent} emptyLabel="No purchases recorded yet." />
      )}
    </Card>
  );
}
