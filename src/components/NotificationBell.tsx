"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api, type AlertItem } from "@/lib/api";
import { BellIcon, AlertIcon, ArrowRightIcon } from "./icons";

const POLL_MS = 60_000;

export default function NotificationBell() {
  const [items, setItems] = useState<AlertItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const load = useCallback(async () => {
    try {
      const res = await api.getAlerts();
      setItems(res.items);
    } catch {
      /* ignore transient fetch errors */
    } finally {
      setLoaded(true);
    }
  }, []);

  // Initial load + polling.
  useEffect(() => {
    load();
    const t = setInterval(load, POLL_MS);
    return () => clearInterval(t);
  }, [load]);

  // Refresh when the route changes (e.g. after recording a sale).
  useEffect(() => {
    load();
  }, [pathname, load]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const count = items.length;
  const outCount = items.filter((i) => i.outOfStock).length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        aria-label={`Notifications${count ? `: ${count} low-stock items` : ""}`}
      >
        <BellIcon width={20} height={20} />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold leading-[18px] text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <AlertIcon width={16} height={16} />
              </span>
              <h3 className="text-sm font-semibold text-slate-900">
                Stock alerts
              </h3>
            </div>
            {count > 0 && (
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-600 ring-1 ring-inset ring-rose-200">
                {count} low{outCount ? ` · ${outCount} out` : ""}
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {!loaded ? (
              <p className="px-4 py-6 text-center text-sm text-slate-400">Loading…</p>
            ) : count === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">
                Everything is well stocked. 🎉
              </p>
            ) : (
              <ul className="divide-y divide-slate-50">
                {items.map((i) => (
                  <li key={i.id}>
                    <Link
                      href="/purchases"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between gap-2 px-4 py-3 transition-colors hover:bg-slate-50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-slate-800">
                          {i.name}
                        </span>
                        <span className="block truncate text-xs text-slate-400">
                          {i.supplier ?? "No supplier"}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                          i.outOfStock
                            ? "bg-rose-50 text-rose-700 ring-rose-200"
                            : "bg-amber-50 text-amber-700 ring-amber-200"
                        }`}
                      >
                        {i.quantity}/{i.reorderLevel} {i.unit}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {count > 0 && (
            <Link
              href="/purchases"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-slate-100"
            >
              Reorder now
              <ArrowRightIcon width={15} height={15} />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
