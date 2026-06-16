"use client";

import { useState } from "react";

export type ChartItem = {
  id: number;
  name: string;
  unit: string;
  units: number;
};

export default function TopSellersChart({ items }: { items: ChartItem[] }) {
  const [hover, setHover] = useState<number | null>(null);

  if (items.length === 0) {
    return <p className="text-sm text-slate-500">No sales recorded yet.</p>;
  }

  const maxUnits = Math.max(1, ...items.map((i) => i.units));
  const totalUnits = items.reduce((s, i) => s + i.units, 0) || 1;

  return (
    <ul className="space-y-3.5">
      {items.map((item, idx) => {
        const pctOfMax = (item.units / maxUnits) * 100;
        const share = Math.round((item.units / totalUnits) * 100);
        const isHover = hover === item.id;
        return (
          <li
            key={item.id}
            className="relative"
            onMouseEnter={() => setHover(item.id)}
            onMouseLeave={() => setHover(null)}
          >
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{item.name}</span>
              <span className="text-slate-500">
                {item.units} {item.unit}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full bg-gradient-to-r from-brand-300 to-brand-400 transition-all ${
                  isHover ? "brightness-95" : ""
                }`}
                style={{ width: `${pctOfMax}%` }}
              />
            </div>

            {/* Hover tooltip */}
            {isHover && (
              <div className="pointer-events-none absolute -top-1 left-0 z-20 -translate-y-full rounded-xl bg-brand-800 px-3 py-2 text-xs text-white shadow-lg">
                <p className="font-semibold">{item.name}</p>
                <p className="mt-0.5 text-white/80">
                  #{idx + 1} top seller · {item.units} {item.unit} sold
                </p>
                <p className="text-brand-300">{share}% of listed sales</p>
                <span className="absolute -bottom-1 left-5 h-2 w-2 rotate-45 bg-brand-800" />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
