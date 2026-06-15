"use client";

import { useMemo, useState } from "react";
import { formatAUD, GST_RATE } from "@/lib/money";

type ProductLite = {
  id: number;
  name: string;
  unit: string;
  quantity: number;
  costPrice: number;
  salePrice: number;
};

export default function MovementForm({
  products,
  action,
  kind,
}: {
  products: ProductLite[];
  action: (formData: FormData) => Promise<void>;
  kind: "PURCHASE" | "SALE";
}) {
  const [productId, setProductId] = useState<number>(products[0]?.id ?? 0);
  const [quantity, setQuantity] = useState<string>("1");
  const [unitPrice, setUnitPrice] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [pending, setPending] = useState(false);

  const selected = products.find((p) => p.id === productId);
  const defaultPrice = selected
    ? kind === "PURCHASE"
      ? selected.costPrice
      : selected.salePrice
    : 0;

  const effectivePrice =
    unitPrice.trim() === "" ? defaultPrice : parseFloat(unitPrice) || 0;
  const qty = parseInt(quantity) || 0;

  const totals = useMemo(() => {
    const ex = effectivePrice * qty;
    const gst = Math.round(ex * GST_RATE * 100) / 100;
    return { ex, gst, inc: ex + gst };
  }, [effectivePrice, qty]);

  const overSell =
    kind === "SALE" && selected ? qty > selected.quantity : false;

  async function handleSubmit(formData: FormData) {
    setError("");
    setPending(true);
    try {
      await action(formData);
      setQuantity("1");
      setUnitPrice("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  const accent =
    kind === "PURCHASE"
      ? "bg-sky-600 hover:bg-sky-700"
      : "bg-emerald-600 hover:bg-emerald-700";

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Product
        </label>
        <select
          name="productId"
          value={productId}
          onChange={(e) => setProductId(Number(e.target.value))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.quantity} {p.unit} on hand
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Quantity
          </label>
          <input
            name="quantity"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Unit price (ex. GST)
          </label>
          <input
            name="unitPrice"
            type="number"
            step="0.01"
            min={0}
            placeholder={defaultPrice.toFixed(2)}
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <p className="mt-1 text-xs text-slate-400">
            Leave blank to use {formatAUD(defaultPrice)}
          </p>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Note (optional)
        </label>
        <input
          name="note"
          type="text"
          placeholder={
            kind === "PURCHASE" ? "e.g. PO #1234" : "e.g. Job 88, customer name"
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <div className="rounded-lg bg-slate-50 p-4 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal (ex. GST)</span>
          <span>{formatAUD(totals.ex)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>GST (10%)</span>
          <span>{formatAUD(totals.gst)}</span>
        </div>
        <div className="mt-1 flex justify-between border-t border-slate-200 pt-1 font-semibold text-slate-900">
          <span>Total (inc. GST)</span>
          <span>{formatAUD(totals.inc)}</span>
        </div>
      </div>

      {overSell && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          Not enough stock — only {selected?.quantity} {selected?.unit} on hand.
        </p>
      )}
      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || qty <= 0 || overSell || !selected}
        className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${accent}`}
      >
        {pending
          ? "Saving…"
          : kind === "PURCHASE"
            ? "Record purchase (stock in)"
            : "Record sale (stock out)"}
      </button>
    </form>
  );
}
