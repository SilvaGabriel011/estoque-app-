"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  DashboardIcon,
  BoxIcon,
  CartIcon,
  DollarIcon,
  ChartIcon,
  TruckIcon,
  PlusIcon,
} from "./icons";

const nav = [
  { href: "/", label: "Dashboard", Icon: DashboardIcon },
  { href: "/inventory", label: "Inventory", Icon: BoxIcon },
  { href: "/purchases", label: "Purchases", Icon: CartIcon },
  { href: "/sales", label: "Sales", Icon: DollarIcon },
  { href: "/reports", label: "Reports", Icon: ChartIcon },
  { href: "/suppliers", label: "Suppliers", Icon: TruckIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const Logo = () => (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
        <BoxIcon width={20} height={20} />
      </span>
      <span className="text-xl font-bold tracking-tight text-slate-900">
        Stock<span className="text-emerald-600">Pro</span>
      </span>
    </Link>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center border-b border-slate-100 px-6">
          <Logo />
        </div>

        <nav className="flex-1 space-y-1 p-3">
          <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Menu
          </p>
          {nav.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {active && (
                  <span className="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-emerald-500" />
                )}
                <Icon
                  width={18}
                  height={18}
                  className={active ? "text-emerald-600" : "text-slate-400"}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-slate-100 p-4">
          <Link
            href="/purchases"
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
          >
            <PlusIcon width={16} height={16} />
            New purchase
          </Link>
          <p className="text-center text-xs text-slate-400">
            Prices in AUD · 10% GST
          </p>
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
