"use client";

import { useState } from "react";
import { Card } from "./ui";
import { SegmentedTabs } from "./controls";
import { UsageIcon, ChartIcon, BoxIcon } from "./icons";
import MovementForm, { ProductLite } from "./MovementForm";
import TransactionTable from "./TransactionTable";

type Row = React.ComponentProps<typeof TransactionTable>["rows"][number];
type MostUsed = {
  product: { id: number; name: string; unit: string };
  units: number;
};

export default function UsageWorkspace({
  products,
  mostUsed,
  recent,
}: {
  products: ProductLite[];
  mostUsed: MostUsed[];
  recent: Row[];
}) {
  const [tab, setTab] = useState("record");
  const maxUnits = Math.max(1, ...mostUsed.map((b) => b.units));

  return (
    <Card>
      <SegmentedTabs
        value={tab}
        onChange={setTab}
        tabs={[
          { key: "record", label: "Use", icon: <UsageIcon width={15} height={15} /> },
          { key: "top", label: "Most used", icon: <ChartIcon width={15} height={15} /> },
          { key: "history", label: "History", icon: <BoxIcon width={15} height={15} /> },
        ]}
      />

      {tab === "record" && (
        <div>
          <p className="mb-4 text-sm text-slate-500">
            Pick an item you have in stock and record how much you used on a job.
            This reduces the quantity on hand.
          </p>
          <MovementForm products={products} kind="USAGE" />
        </div>
      )}

      {tab === "top" && (
        <div>
          {mostUsed.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">
              No usage recorded yet.
            </p>
          ) : (
            <ul className="grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
              {mostUsed.map((b, i) => (
                <li key={b.product.id} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-800">
                        {b.product.name}
                      </span>
                      <span className="text-slate-500">
                        {b.units} {b.product.unit}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-300 to-brand-400"
                        style={{ width: `${(b.units / maxUnits) * 100}%` }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "history" && (
        <TransactionTable rows={recent} emptyLabel="No usage recorded yet." />
      )}
    </Card>
  );
}
