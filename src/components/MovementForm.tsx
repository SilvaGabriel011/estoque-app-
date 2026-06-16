"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatAUD, GST_RATE } from "@/lib/money";
import { api } from "@/lib/api";
import { Badge } from "./ui";
import {
  SearchIcon,
  PlusIcon,
  MinusIcon,
  CheckIcon,
  CartIcon,
  DollarIcon,
} from "./icons";

export type ProductLite = {
  id: number;
  name: string;
  sku: string | null;
  category: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  costPrice: number;
  salePrice: number;
  supplier?: { name: string } | null;
};

export default function MovementForm({
  products,
  kind,
  requestedProductId,
}: {
  products: ProductLite[];
  kind: "PURCHASE" | "SALE";
  requestedProductId?: number | null;
}) {
  const router = useRouter();
  const [productId, setProductId] = useState<number>(products[0]?.id ?? 0);
  const [search, setSearch] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<string>("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState<string>("");
  const summaryRef = useRef<HTMLDivElement>(null);

  // Allow an external trigger (e.g. low-stock chips) to pick a product.
  useEffect(() => {
    if (requestedProductId && requestedProductId !== productId) {
      setProductId(requestedProductId);
      setSearch("");
      summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedProductId]);

  const selected = products.find((p) => p.id === productId) ?? null;
  const defaultPrice = selected
    ? kind === "PURCHASE"
      ? selected.costPrice
      : selected.salePrice
    : 0;

  const effectivePrice =
    unitPrice.trim() === "" ? defaultPrice : parseFloat(unitPrice) || 0;

  const totals = useMemo(() => {
    const ex = effectivePrice * quantity;
    const gst = Math.round(ex * GST_RATE * 100) / 100;
    return { ex, gst, inc: ex + gst };
  }, [effectivePrice, quantity]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku ?? "").toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, search]);

  const overSell = kind === "SALE" && selected ? quantity > selected.quantity : false;
  const isPurchase = kind === "PURCHASE";
  const accentBtn = isPurchase
    ? "bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500"
    : "bg-brand-400 text-brand-900 hover:bg-brand-500 focus-visible:ring-brand-500";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!selected) {
      setError("Select a product first.");
      return;
    }
    setPending(true);
    try {
      await api.recordMovement({
        type: kind,
        productId: selected.id,
        quantity,
        unitPrice: unitPrice.trim() === "" ? null : parseFloat(unitPrice),
        note: note.trim() || null,
      });
      const newStock = isPurchase
        ? selected.quantity + quantity
        : selected.quantity - quantity;
      setSuccess(
        `${isPurchase ? "Purchased" : "Sold"} ${quantity} × ${selected.name} · stock now ${newStock} ${selected.unit}`
      );
      setQuantity(1);
      setUnitPrice("");
      setNote("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Product picker */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Product
        </label>
        <div className="relative">
          <SearchIcon
            width={16}
            height={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU or category…"
            className={`${inputClass} pl-9`}
          />
        </div>
        <div className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-1.5">
          {filtered.length === 0 && (
            <p className="px-3 py-4 text-center text-sm text-slate-400">
              No products match “{search}”.
            </p>
          )}
          {filtered.map((p) => {
            const active = p.id === productId;
            const low = p.quantity <= p.reorderLevel;
            return (
              <button
                type="button"
                key={p.id}
                onClick={() => setProductId(p.id)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  active
                    ? "bg-white shadow-sm ring-2 ring-brand-500"
                    : "hover:bg-white"
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium text-slate-800">
                    {p.name}
                  </span>
                  <span className="block truncate text-xs text-slate-400">
                    {p.category}
                    {p.supplier ? ` · ${p.supplier.name}` : ""}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span
                    className={`text-xs font-medium ${
                      p.quantity === 0
                        ? "text-rose-600"
                        : low
                          ? "text-amber-600"
                          : "text-slate-500"
                    }`}
                  >
                    {p.quantity} {p.unit}
                  </span>
                  {active && (
                    <CheckIcon width={16} height={16} className="text-brand-600" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected summary */}
      {selected && (
        <div
          ref={summaryRef}
          className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
        >
          <div>
            <p className="font-semibold text-slate-800">{selected.name}</p>
            <p className="text-xs text-slate-500">
              On hand: {selected.quantity} {selected.unit} · Default{" "}
              {isPurchase ? "cost" : "price"} {formatAUD(defaultPrice)}
            </p>
          </div>
          {selected.quantity <= selected.reorderLevel && (
            <Badge tone={selected.quantity === 0 ? "red" : "amber"}>
              {selected.quantity === 0 ? "Out of stock" : "Low stock"}
            </Badge>
          )}
        </div>
      )}

      {/* Quantity + price */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Quantity
          </label>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-11 w-11 items-center justify-center rounded-l-xl border border-r-0 border-slate-300 text-slate-500 hover:bg-slate-50"
            >
              <MinusIcon width={16} height={16} />
            </button>
            <input
              name="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="h-11 w-full border-y border-slate-300 px-3 text-center text-sm focus:z-10 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-11 w-11 items-center justify-center rounded-r-xl border border-l-0 border-slate-300 text-slate-500 hover:bg-slate-50"
            >
              <PlusIcon width={16} height={16} />
            </button>
          </div>
        </div>
        <div>
          <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-slate-700">
            <span>Unit price (ex. GST)</span>
            {unitPrice.trim() !== "" && (
              <button
                type="button"
                onClick={() => setUnitPrice("")}
                className="text-xs font-normal text-brand-600 hover:underline"
              >
                Reset to default
              </button>
            )}
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              $
            </span>
            <input
              name="unitPrice"
              type="number"
              step="0.01"
              min={0}
              placeholder={defaultPrice.toFixed(2)}
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              className={`${inputClass} h-11 pl-7`}
            />
          </div>
        </div>
      </div>

      {/* Note */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Reference / note{" "}
          <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <input
          name="note"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={
            isPurchase ? "e.g. PO #1234, invoice ref" : "e.g. Job 88, customer name"
          }
          className={inputClass}
        />
      </div>

      {/* Order summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
        <div className="flex justify-between text-slate-500">
          <span>
            {quantity} × {formatAUD(effectivePrice)}
          </span>
          <span>{formatAUD(totals.ex)}</span>
        </div>
        <div className="mt-1 flex justify-between text-slate-500">
          <span>GST (10%)</span>
          <span>{formatAUD(totals.gst)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-dashed border-slate-200 pt-2 text-base font-bold text-slate-900">
          <span>Total (inc. GST)</span>
          <span>{formatAUD(totals.inc)}</span>
        </div>
      </div>

      {/* Feedback */}
      {overSell && (
        <p className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">
          Not enough stock — only {selected?.quantity} {selected?.unit} on hand.
        </p>
      )}
      {error && (
        <p className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">
          {error}
        </p>
      )}
      {success && (
        <p className="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2.5 text-sm font-medium text-brand-700 ring-1 ring-inset ring-brand-200">
          <CheckIcon width={18} height={18} className="shrink-0" />
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || quantity <= 0 || overSell || !selected}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${accentBtn}`}
      >
        {isPurchase ? (
          <CartIcon width={18} height={18} />
        ) : (
          <DollarIcon width={18} height={18} />
        )}
        {pending
          ? "Saving…"
          : isPurchase
            ? `Record purchase · ${formatAUD(totals.inc)}`
            : `Record sale · ${formatAUD(totals.inc)}`}
      </button>
    </form>
  );
}
