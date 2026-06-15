"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const nav = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/inventory", label: "Inventory", icon: "📦" },
  { href: "/purchases", label: "Purchases", icon: "🛒" },
  { href: "/sales", label: "Sales", icon: "💲" },
  { href: "/reports", label: "Reports", icon: "📈" },
  { href: "/suppliers", label: "Suppliers", icon: "🏷️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <span className="text-lg font-bold text-slate-900">
          Stock<span className="text-emerald-600">Pro</span>
        </span>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
          <span className="text-2xl">🧱</span>
          <span className="text-xl font-bold text-slate-900">
            Stock<span className="text-emerald-600">Pro</span>
          </span>
        </div>
        <nav className="space-y-1 p-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute inset-x-0 bottom-0 border-t border-slate-200 p-4 text-xs text-slate-400">
          Prices in AUD · 10% GST
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Spacer so mobile content clears the fixed top bar */}
      <div className="h-14 lg:hidden" />
    </>
  );
}
