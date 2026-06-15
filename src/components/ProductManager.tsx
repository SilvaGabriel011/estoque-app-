"use client";

import { useMemo, useState } from "react";
import { formatAUD, incGst } from "@/lib/money";
import { Badge } from "@/components/ui";
import { createProduct, updateProduct, deleteProduct } from "@/lib/actions";

type Supplier = { id: number; name: string };
type Product = {
  id: number;
  name: string;
  sku: string | null;
  category: string;
  unit: string;
  costPrice: number;
  salePrice: number;
  quantity: number;
  reorderLevel: number;
  supplierId: number | null;
  supplier: Supplier | null;
};

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";

function status(p: Product) {
  if (p.quantity === 0)
    return { label: "Out of stock", tone: "red" as const };
  if (p.quantity <= p.reorderLevel)
    return { label: "Low", tone: "amber" as const };
  return { label: "In stock", tone: "green" as const };
}

function ProductFields({
  product,
  suppliers,
  showQuantity,
}: {
  product?: Product;
  suppliers: Supplier[];
  showQuantity: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs font-medium text-slate-600">
          Name
        </label>
        <input
          name="name"
          required
          defaultValue={product?.name}
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">
          SKU
        </label>
        <input name="sku" defaultValue={product?.sku ?? ""} className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">
          Category
        </label>
        <input
          name="category"
          defaultValue={product?.category ?? "General"}
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">
          Unit
        </label>
        <input
          name="unit"
          defaultValue={product?.unit ?? "each"}
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">
          Supplier
        </label>
        <select
          name="supplierId"
          defaultValue={product?.supplierId ?? 0}
          className={inputClass}
        >
          <option value={0}>— None —</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">
          Cost price (ex. GST)
        </label>
        <input
          name="costPrice"
          type="number"
          step="0.01"
          min={0}
          defaultValue={product?.costPrice ?? 0}
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">
          Sale price (ex. GST)
        </label>
        <input
          name="salePrice"
          type="number"
          step="0.01"
          min={0}
          defaultValue={product?.salePrice ?? 0}
          className={inputClass}
        />
      </div>
      {showQuantity && (
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Opening quantity
          </label>
          <input
            name="quantity"
            type="number"
            min={0}
            defaultValue={0}
            className={inputClass}
          />
        </div>
      )}
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">
          Reorder level
        </label>
        <input
          name="reorderLevel"
          type="number"
          min={0}
          defaultValue={product?.reorderLevel ?? 10}
          className={inputClass}
        />
      </div>
    </div>
  );
}

export default function ProductManager({
  products,
  suppliers,
}: {
  products: Product[];
  suppliers: Supplier[];
}) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category))).sort()],
    [products]
  );

  const filtered = products.filter((p) => {
    const matchesCat = category === "All" || p.category === category;
    const matchesQuery =
      query.trim() === "" ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      (p.sku ?? "").toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          placeholder="Search by name or SKU…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`${inputClass} max-w-xs`}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`${inputClass} max-w-[12rem]`}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            setAdding((v) => !v);
            setEditing(null);
          }}
          className="ml-auto rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          {adding ? "Cancel" : "+ Add product"}
        </button>
      </div>

      {adding && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5">
          <h3 className="mb-3 font-semibold text-slate-900">New product</h3>
          <form
            action={async (fd) => {
              await createProduct(fd);
              setAdding(false);
            }}
          >
            <ProductFields suppliers={suppliers} showQuantity />
            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Save product
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 text-right font-medium">On hand</th>
              <th className="px-4 py-3 text-right font-medium">Cost</th>
              <th className="px-4 py-3 text-right font-medium">Sale (inc GST)</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No products match your filters.
                </td>
              </tr>
            )}
            {filtered.map((p) => {
              const st = status(p);
              const isEditing = editing === p.id;
              return (
                <tr key={p.id} className="border-b border-slate-100 align-top">
                  {isEditing ? (
                    <td colSpan={7} className="px-4 py-4">
                      <form
                        action={async (fd) => {
                          await updateProduct(fd);
                          setEditing(null);
                        }}
                      >
                        <input type="hidden" name="id" value={p.id} />
                        <ProductFields
                          product={p}
                          suppliers={suppliers}
                          showQuantity={false}
                        />
                        <p className="mt-2 text-xs text-slate-500">
                          On-hand quantity is adjusted via Purchases and Sales,
                          not here.
                        </p>
                        <div className="mt-3 flex gap-2">
                          <button
                            type="submit"
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                          >
                            Save changes
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditing(null)}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </td>
                  ) : (
                    <>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{p.name}</p>
                        <p className="text-xs text-slate-400">
                          {p.sku ? `${p.sku} · ` : ""}
                          {p.supplier?.name ?? "No supplier"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{p.category}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-800">
                        {p.quantity}{" "}
                        <span className="text-xs font-normal text-slate-400">
                          {p.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {formatAUD(p.costPrice)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {formatAUD(incGst(p.salePrice))}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditing(p.id);
                              setAdding(false);
                            }}
                            className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <form
                            action={deleteProduct}
                            onSubmit={(e) => {
                              if (
                                !confirm(
                                  `Delete "${p.name}"? This removes its transaction history too.`
                                )
                              )
                                e.preventDefault();
                            }}
                          >
                            <input type="hidden" name="id" value={p.id} />
                            <button
                              type="submit"
                              className="rounded-md border border-rose-200 px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
