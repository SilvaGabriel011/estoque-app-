"use client";

import { useEffect, useState } from "react";
import { api, type ReportsResponse } from "@/lib/api";
import { formatAUD } from "@/lib/money";
import { Card, StatCard } from "./ui";
import { DollarIcon, CartIcon, ChartIcon } from "./icons";

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
  const best = data?.bestSellers ?? [];
  const maxUnits = Math.max(1, ...best.map((b) => b.units));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Reports
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Best sellers and financial balance, served from{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
              /api/reports
            </code>
            . All figures in AUD.
          </p>
        </div>
        <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                p.days === days
                  ? "bg-emerald-600 text-white"
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
        {/* Financial balance */}
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Financial balance
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Sales revenue (ex. GST)"
            value={formatAUD(fin?.salesEx ?? 0)}
            hint={`${formatAUD(fin?.salesInc ?? 0)} inc. GST`}
            icon={<DollarIcon width={18} height={18} />}
            accent="emerald"
          />
          <StatCard
            label="Cost of goods sold"
            value={formatAUD(fin?.cogs ?? 0)}
            hint="Based on current cost prices"
            icon={<CartIcon width={18} height={18} />}
            accent="sky"
          />
          <StatCard
            label="Gross profit"
            value={formatAUD(fin?.grossProfit ?? 0)}
            hint={
              fin && fin.salesEx > 0
                ? `${Math.round((fin.grossProfit / fin.salesEx) * 100)}% margin`
                : "—"
            }
            icon={<ChartIcon width={18} height={18} />}
            accent="violet"
            valueTone={(fin?.grossProfit ?? 0) >= 0 ? "good" : "bad"}
          />
          <StatCard
            label="Net GST payable"
            value={formatAUD(fin?.gstPayable ?? 0)}
            hint="GST on sales − GST on purchases"
            icon={<DollarIcon width={18} height={18} />}
            accent="amber"
          />
        </div>

        <Card className="mt-4">
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div className="space-y-1">
              <Row label="Sales (ex. GST)" value={formatAUD(fin?.salesEx ?? 0)} />
              <Row
                label="GST collected on sales"
                value={formatAUD(fin?.salesGst ?? 0)}
              />
              <Row
                label="Total sales (inc. GST)"
                value={formatAUD(fin?.salesInc ?? 0)}
                strong
              />
            </div>
            <div className="space-y-1">
              <Row
                label="Purchases (ex. GST)"
                value={formatAUD(fin?.purchasesEx ?? 0)}
              />
              <Row
                label="GST paid on purchases"
                value={formatAUD(fin?.purchasesGst ?? 0)}
              />
              <Row
                label="Total purchases (inc. GST)"
                value={formatAUD(fin?.purchasesInc ?? 0)}
                strong
              />
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
              {loading ? "Loading…" : "No sales recorded in this period."}
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
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
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
