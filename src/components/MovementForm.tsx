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
  UsageIcon,
  CloseIcon,
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
  supplier?: { name: string } | null;
};

const inputClass =
  "w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

export default function MovementForm({
  products,
  kind,
  requestedProductId,
}: {
  products: ProductLite[];
  kind: "PURCHASE" | "USAGE";
  requestedProductId?: number | null;
}) {
  const router = useRouter();
  const isPurchase = kind === "PURCHASE";

  const [productId, setProductId] = useState<number>(products[0]?.id ?? 0);
  const [search, setSearch] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<string>("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState("");

  // Inline "new item" creation (purchases only)
  const [creating, setCreating] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    unit: "each",
    category: "General",
    costPrice: "",
    reorderLevel: "10",
  });

  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (requestedProductId && requestedProductId !== productId) {
      setCreating(false);
      setProductId(requestedProductId);
      setSearch("");
      summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedProductId]);

  const selected = products.find((p) => p.id === productId) ?? null;
  const defaultPrice = selected ? selected.costPrice : 0;
  // When creating a new item the price comes from the new-item cost field;
  // otherwise it's the override or the selected product's cost.
  const effectivePrice = creating
    ? parseFloat(newItem.costPrice) || 0
    : unitPrice.trim() === ""
      ? defaultPrice
      : parseFloat(unitPrice) || 0;

  function cancelCreating() {
    setCreating(false);
    setError("");
    setNewItem({ name: "", unit: "each", category: "General", costPrice: "", reorderLevel: "10" });
  }

  const totals = useMemo(() => {
    const ex = effectivePrice * quantity;
    const gst = isPurchase ? Math.round(ex * GST_RATE * 100) / 100 : 0;
    return { ex, gst, inc: ex + gst };
  }, [effectivePrice, quantity, isPurchase]);

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

  const overUse = !isPurchase && selected ? quantity > selected.quantity : false;

  function startCreating() {
    setCreating(true);
    setError("");
    setSuccess("");
    setNewItem((n) => ({ ...n, name: search.trim() }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setPending(true);
    try {
      let targetId = selected?.id ?? 0;
      let targetName = selected?.name ?? "";
      let targetUnit = selected?.unit ?? "";

      // Purchase of a brand-new item: create it first.
      if (isPurchase && creating) {
        const cost = parseFloat(newItem.costPrice) || 0;
        if (!newItem.name.trim()) throw new Error("Enter a name for the new item.");
        const created = await api.createProduct({
          name: newItem.name.trim(),
          unit: newItem.unit.trim() || "each",
          category: newItem.category.trim() || "General",
          costPrice: cost,
          reorderLevel: Math.round(parseFloat(newItem.reorderLevel) || 0),
          quantity: 0,
        });
        targetId = created.id;
        targetName = created.name;
        targetUnit = created.unit;
      } else if (!selected) {
        throw new Error("Select an item first.");
      }

      const priceOverride =
        isPurchase && unitPrice.trim() !== "" ? parseFloat(unitPrice) : undefined;

      await api.recordMovement({
        type: kind,
        productId: targetId,
        quantity,
        unitPrice: priceOverride ?? null,
        note: note.trim() || null,
      });

      const baseQty = creating ? 0 : selected?.quantity ?? 0;
      const newStock = isPurchase ? baseQty + quantity : baseQty - quantity;
      setSuccess(
        isPurchase
          ? `Purchased ${quantity} × ${targetName} · stock now ${newStock} ${targetUnit}`
          : `Used ${quantity} × ${targetName} · stock now ${newStock} ${targetUnit}`
      );
      setQuantity(1);
      setUnitPrice("");
      setNote("");
      setCreating(false);
      setNewItem({ name: "", unit: "each", category: "General", costPrice: "", reorderLevel: "10" });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  const accentBtn = isPurchase
    ? "bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500"
    : "bg-brand-400 text-brand-900 hover:bg-brand-500 focus-visible:ring-brand-500";

  const submitDisabled =
    pending ||
    quantity <= 0 ||
    overUse ||
    (isPurchase && creating ? !newItem.name.trim() : !selected);

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <div className="space-y-5">
      {/* Item picker */}
      {!creating && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Item
          </label>
          <div className="relative">
            <SearchIcon
              width={18}
              height={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                isPurchase
                  ? "Search items, or type a new item name…"
                  : "Search the items you have in stock…"
              }
              className={`${inputClass} py-3 pl-10`}
            />
            {search && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                {filtered.length} match{filtered.length === 1 ? "" : "es"}
              </span>
            )}
          </div>

          <div className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-1.5">
            {filtered.map((p) => {
              const active = p.id === productId;
              const low = p.quantity <= p.reorderLevel;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setProductId(p.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    active ? "bg-white shadow-sm ring-2 ring-brand-500" : "hover:bg-white"
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
                    {active && <CheckIcon width={16} height={16} className="text-brand-600" />}
                  </span>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-center text-sm text-slate-400">
                {isPurchase
                  ? `No item called “${search}” yet.`
                  : `No stock matches “${search}”.`}
              </p>
            )}
          </div>

          {isPurchase && (
            <button
              type="button"
              onClick={startCreating}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
            >
              <PlusIcon width={15} height={15} />
              {search.trim() ? `Add “${search.trim()}” as a new item` : "Buy a new item not in the list"}
            </button>
          )}
        </div>
      )}

      {/* New item fields (purchase only) */}
      {creating && (
        <div className="space-y-3 rounded-xl border border-brand-200 bg-brand-50/40 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">New item</h3>
            <button
              type="button"
              onClick={cancelCreating}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <CloseIcon width={13} height={13} />
              Cancel
            </button>
          </div>
          <input
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            placeholder="Item name"
            className={inputClass}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              placeholder="Unit (e.g. each, box)"
              className={inputClass}
            />
            <input
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              placeholder="Category"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
              <input
                type="number"
                step="0.01"
                min={0}
                value={newItem.costPrice}
                onChange={(e) => setNewItem({ ...newItem, costPrice: e.target.value })}
                placeholder="Cost (ex GST)"
                className={`${inputClass} pl-7`}
              />
            </div>
            <input
              type="number"
              min={0}
              value={newItem.reorderLevel}
              onChange={(e) => setNewItem({ ...newItem, reorderLevel: e.target.value })}
              placeholder="Reorder level"
              className={inputClass}
            />
          </div>
        </div>
      )}

      {/* Selected summary */}
      {!creating && selected && (
        <div
          ref={summaryRef}
          className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
        >
          <div>
            <p className="font-semibold text-slate-800">{selected.name}</p>
            <p className="text-xs text-slate-500">
              On hand: {selected.quantity} {selected.unit} · Cost{" "}
              {formatAUD(selected.costPrice)}
            </p>
          </div>
          {selected.quantity <= selected.reorderLevel && (
            <Badge tone={selected.quantity === 0 ? "red" : "amber"}>
              {selected.quantity === 0 ? "Out of stock" : "Low stock"}
            </Badge>
          )}
        </div>
      )}
        </div>

        <div className="space-y-5">
      {/* Quantity + (purchase) price */}
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
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
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
        {isPurchase && !creating && (
          <div>
            <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-slate-700">
              <span>Unit cost (ex. GST)</span>
              {unitPrice.trim() !== "" && (
                <button
                  type="button"
                  onClick={() => setUnitPrice("")}
                  className="text-xs font-normal text-brand-600 hover:underline"
                >
                  Reset
                </button>
              )}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
              <input
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
        )}
      </div>

      {/* Note */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Reference / note <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={isPurchase ? "e.g. PO #1234, supplier invoice" : "e.g. Job 88, site name"}
          className={inputClass}
        />
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
        {isPurchase ? (
          <>
            <div className="flex justify-between text-slate-500">
              <span>{quantity} × {formatAUD(effectivePrice)}</span>
              <span>{formatAUD(totals.ex)}</span>
            </div>
            <div className="mt-1 flex justify-between text-slate-500">
              <span>GST (10%)</span>
              <span>{formatAUD(totals.gst)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-dashed border-slate-200 pt-2 text-base font-bold text-slate-900">
              <span>Total cost (inc. GST)</span>
              <span>{formatAUD(totals.inc)}</span>
            </div>
          </>
        ) : (
          <div className="flex justify-between font-medium text-slate-700">
            <span>Stock value used (at cost)</span>
            <span>{formatAUD(totals.ex)}</span>
          </div>
        )}
      </div>

      {overUse && (
        <p className="rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">
          Not enough stock — only {selected?.quantity} {selected?.unit} on hand.
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">
          {error}
        </p>
      )}
      {success && (
        <p className="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2.5 text-sm font-medium text-brand-700 ring-1 ring-inset ring-brand-200">
          <CheckIcon width={18} height={18} className="shrink-0" />
          {success}
        </p>
      )}

      <div className="flex gap-2">
        {creating && (
          <button
            type="button"
            onClick={cancelCreating}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            <CloseIcon width={16} height={16} />
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitDisabled}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${accentBtn}`}
        >
          {isPurchase ? <CartIcon width={18} height={18} /> : <UsageIcon width={18} height={18} />}
          {pending
            ? "Saving…"
            : isPurchase
              ? `Record purchase · ${formatAUD(totals.inc)}`
              : "Mark as used"}
        </button>
      </div>
        </div>
      </div>
    </form>
  );
}
