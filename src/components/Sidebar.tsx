"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DashboardIcon,
  BoxIcon,
  CartIcon,
  UsageIcon,
  ChartIcon,
  TruckIcon,
  PlusIcon,
  BrandMark,
} from "./icons";
import NotificationBell from "./NotificationBell";

const nav = [
  { href: "/", label: "Dashboard", short: "Home", Icon: DashboardIcon },
  { href: "/inventory", label: "Inventory", short: "Stock", Icon: BoxIcon },
  { href: "/purchases", label: "Purchases", short: "Buy", Icon: CartIcon },
  { href: "/usage", label: "Usage", short: "Use", Icon: UsageIcon },
  { href: "/reports", label: "Reports", short: "Reports", Icon: ChartIcon },
  { href: "/suppliers", label: "Suppliers", short: "Supply", Icon: TruckIcon },
];

function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-300 to-brand-400 text-brand-600 shadow-sm">
        <BrandMark width={22} height={22} />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={`text-base font-bold tracking-tight ${
            light ? "text-white" : "text-brand-600"
          }`}
        >
          Tekton
        </span>
        {!compact && (
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-brand-400">
            Stock Control
          </span>
        )}
      </span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Mobile top bar (logo + notifications) */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
        <Logo compact />
        <NotificationBell />
      </header>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-brand-800 lg:flex">
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

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {nav.map(({ href, short, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                active ? "text-brand-600" : "text-slate-400"
              }`}
            >
              <span
                className={`flex h-7 w-9 items-center justify-center rounded-lg transition-colors ${
                  active ? "bg-brand-50 text-brand-600" : "text-slate-400"
                }`}
              >
                <Icon width={18} height={18} />
              </span>
              {short}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
