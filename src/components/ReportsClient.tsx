"use client";

import { useEffect, useState } from "react";
import { api, type ReportsResponse } from "@/lib/api";
import { formatAUD } from "@/lib/money";
import { Card, StatCard } from "./ui";
import { CartIcon, DollarIcon, UsageIcon, BoxIcon } from "./icons";

const PERIODS = [
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
  { days: 365, label: "12 months" },
  { days: 0, label: "All time" },
];

export default function ReportsClient() {
  const [days, setDays] = useState(90);
  const [data, setData] = useState<ReportsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api
      .getReports(days)
      .then((res) => {
        if (active) setData(res);
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [days]);

  const fin = data?.financials;
  const stock = data?.stock;
  const mostUsed = data?.mostUsed ?? [];
  const maxUnits = Math.max(1, ...mostUsed.map((b) => b.units));

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <div className="mb-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Reports
          </h1>
          <p className="mt-1 hidden text-sm text-slate-500 sm:block">
            Purchasing spend, GST paid and stock consumed. All figures in AUD.
          </p>
        </div>
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className={`flex-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                p.days === days
                  ? "bg-brand-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">
          {error}
        </p>
      )}

      <div className={loading ? "opacity-50 transition-opacity" : "transition-opacity"}>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Spend &amp; consumption
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            label="Spent on stock (inc. GST)"
            value={formatAUD(fin?.purchasesInc ?? 0)}
            hint={`${fin?.purchaseCount ?? 0} purchases`}
            icon={<CartIcon width={18} height={18} />}
            accent="sky"
            tooltip="Total paid to suppliers for stock, including GST, in this period."
          />
          <StatCard
            label="GST paid (claimable)"
            value={formatAUD(fin?.purchasesGst ?? 0)}
            hint="On purchases"
            icon={<DollarIcon width={18} height={18} />}
            accent="amber"
            tooltip="GST paid on purchases — claimable as a GST credit on your BAS."
          />
          <StatCard
            label="Stock used (at cost)"
            value={formatAUD(fin?.usageCost ?? 0)}
            hint={`${fin?.usageCount ?? 0} usage records`}
            icon={<UsageIcon width={18} height={18} />}
            accent="violet"
            tooltip="Cost value of stock consumed on jobs in this period."
          />
          <StatCard
            label="Stock on hand (at cost)"
            value={formatAUD(stock?.atCost ?? 0)}
            hint={`${stock?.units ?? 0} units · ${stock?.skus ?? 0} items`}
            icon={<BoxIcon width={18} height={18} />}
            accent="emerald"
            tooltip="Current cost value of everything in inventory right now."
          />
        </div>

        <Card className="mt-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">
            Purchasing breakdown
          </h3>
          <div className="space-y-1 text-sm">
            <Row label="Purchases (ex. GST)" value={formatAUD(fin?.purchasesEx ?? 0)} />
            <Row label="GST paid on purchases" value={formatAUD(fin?.purchasesGst ?? 0)} />
            <Row
              label="Total spent (inc. GST)"
              value={formatAUD(fin?.purchasesInc ?? 0)}
              strong
            />
          </div>
        </Card>

        <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Most-used items
        </h2>
        <Card>
          {mostUsed.length === 0 ? (
            <p className="text-sm text-slate-500">
              {loading ? "Loading…" : "No usage recorded in this period."}
            </p>
          ) : (
            <ol className="space-y-4">
              {mostUsed.map((b, i) => (
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
                        {b.units} {b.product.unit} · {formatAUD(b.cost)} used
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-300 to-brand-400"
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
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex justify-between ${
        strong
          ? "border-t border-slate-100 pt-1 font-medium text-slate-800"
          : "text-slate-600"
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
