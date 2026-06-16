"use client";

import { useState } from "react";
import { Card } from "./ui";
import { AlertIcon, ArrowRightIcon } from "./icons";
import MovementForm, { ProductLite } from "./MovementForm";

export default function PurchaseWorkspace({
  products,
  lowStock,
  action,
}: {
  products: ProductLite[];
  lowStock: ProductLite[];
  action: (formData: FormData) => Promise<void>;
}) {
  const [requested, setRequested] = useState<number | null>(null);

  // Bump a counter so re-selecting the same product still triggers the effect.
  const [tick, setTick] = useState(0);
  const pick = (id: number) => {
    setRequested(id);
    setTick((t) => t + 1);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">
          Record a purchase
        </h2>
        <p className="mb-5 text-sm text-slate-500">
          Search for a product, set the quantity, and stock is updated
          instantly.
        </p>
        <MovementForm
          products={products}
          action={action}
          kind="PURCHASE"
          requestedProductId={requested}
          key={tick}
        />
      </Card>

      <div className="lg:col-span-1">
        <Card className="bg-amber-50/40">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <AlertIcon width={18} height={18} />
            </span>
            <h3 className="font-semibold text-slate-900">Quick reorder</h3>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nothing needs reordering right now. 🎉
            </p>
          ) : (
            <>
              <p className="mb-3 text-sm text-slate-500">
                Items at or below their reorder level. Click to load one into
                the form.
              </p>
              <ul className="space-y-2">
                {lowStock.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => pick(p.id)}
                      className="group flex w-full items-center justify-between gap-2 rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-left transition-colors hover:border-amber-300 hover:bg-amber-50"
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
        </Card>
      </div>
    </div>
  );
}
