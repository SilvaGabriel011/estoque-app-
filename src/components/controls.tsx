"use client";

import { ReactNode } from "react";
import { ArrowRightIcon } from "./icons";

export type TabDef = {
  key: string;
  label: string;
  count?: number;
  icon?: ReactNode;
};

/** Segmented control / secondary tabs. Scrolls horizontally on small screens. */
export function SegmentedTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: TabDef[];
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="-mx-1 mb-5 flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
      {tabs.map((t) => {
        const active = t.key === value;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`flex flex-1 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.icon}
            {t.label}
            {t.count != null && t.count > 0 && (
              <span
                className={`rounded-full px-1.5 text-xs ${
                  active ? "bg-brand-100 text-brand-700" : "bg-slate-200 text-slate-600"
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Compact prev/next pager with a page indicator. */
export function Pagination({
  page,
  pageCount,
  onPage,
  className = "",
}: {
  page: number;
  pageCount: number;
  onPage: (page: number) => void;
  className?: string;
}) {
  if (pageCount <= 1) return null;
  return (
    <div className={`flex items-center justify-between gap-3 pt-4 ${className}`}>
      <button
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ArrowRightIcon width={15} height={15} className="rotate-180" />
        Prev
      </button>
      <span className="text-sm text-slate-500">
        Page <span className="font-semibold text-slate-700">{page}</span> of{" "}
        {pageCount}
      </span>
      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= pageCount}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
        <ArrowRightIcon width={15} height={15} />
      </button>
    </div>
  );
}

/** Clamps a page when the underlying list shrinks (e.g. after filtering). */
export function pageSlice<T>(items: T[], page: number, size: number) {
  const pageCount = Math.max(1, Math.ceil(items.length / size));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * size;
  return {
    pageItems: items.slice(start, start + size),
    pageCount,
    safePage,
  };
}
