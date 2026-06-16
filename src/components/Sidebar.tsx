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
  BrandMark,
} from "./icons";
import NotificationBell from "./NotificationBell";

const nav = [
  { href: "/", label: "Dashboard", Icon: DashboardIcon },
  { href: "/inventory", label: "Inventory", Icon: BoxIcon },
  { href: "/purchases", label: "Purchases", Icon: CartIcon },
  { href: "/sales", label: "Sales", Icon: DollarIcon },
  { href: "/reports", label: "Reports", Icon: ChartIcon },
  { href: "/suppliers", label: "Suppliers", Icon: TruckIcon },
];

function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-300 to-brand-400 text-brand-600 shadow-sm">
        <BrandMark width={24} height={24} />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={`text-base font-bold tracking-tight ${
            light ? "text-white" : "text-brand-600"
          }`}
        >
          Tekton
        </span>
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-brand-400">
          Stock Control
        </span>
      </span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-2.5 backdrop-blur lg:hidden">
        <Logo />
        <div className="flex items-center gap-1">
          <NotificationBell />
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col bg-brand-800 transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center border-b border-white/10 px-6">
          <Logo light />
        </div>

        <nav className="flex-1 space-y-1 p-3">
          <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-white/40">
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
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                {active && (
                  <span className="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-brand-400" />
                )}
                <Icon
                  width={18}
                  height={18}
                  className={active ? "text-brand-400" : "text-white/40"}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-white/10 p-4">
          <Link
            href="/purchases"
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-400 px-3 py-2.5 text-sm font-semibold text-brand-900 shadow-sm transition-colors hover:bg-brand-300"
          >
            <PlusIcon width={16} height={16} />
            New purchase
          </Link>
          <p className="text-center text-xs text-white/40">
            Prices in AUD · 10% GST
          </p>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Spacer so mobile content clears the fixed top bar */}
      <div className="h-14 lg:hidden" />
    </>
  );
}
