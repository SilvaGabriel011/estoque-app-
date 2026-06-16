"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatAUD, incGst } from "@/lib/money";
import { api, type ProductPayload } from "@/lib/api";
import { Badge, Button } from "./ui";
import Modal from "./Modal";
import { SearchIcon, PlusIcon, EditIcon, TrashIcon, BoxIcon } from "./icons";
import { Pagination, pageSlice } from "./controls";

function formToProductPayload(form: HTMLFormElement): ProductPayload {
  const fd = new FormData(form);
  const supplierId = Number(fd.get("supplierId") ?? 0);
  const numberOr = (v: FormDataEntryValue | null, d = 0) => {
    const n = parseFloat(String(v ?? ""));
    return Number.isFinite(n) ? n : d;
  };
  return {
    name: String(fd.get("name") ?? "").trim(),
    sku: String(fd.get("sku") ?? "").trim() || null,
    category: String(fd.get("category") ?? "").trim() || "General",
    unit: String(fd.get("unit") ?? "").trim() || "each",
    costPrice: numberOr(fd.get("costPrice")),
    salePrice: numberOr(fd.get("salePrice")),
    quantity: Math.round(numberOr(fd.get("quantity"))),
    reorderLevel: Math.round(numberOr(fd.get("reorderLevel"), 10)),
    supplierId: supplierId > 0 ? supplierId : null,
  };
}

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
  "w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

function statusOf(p: Product) {
  if (p.quantity === 0) return { label: "Out of stock", tone: "red" as const };
  if (p.quantity <= p.reorderLevel) return { label: "Low", tone: "amber" as const };
  return { label: "In stock", tone: "green" as const };
}

function StockBar({ p }: { p: Product }) {
  // Fill relative to twice the reorder level, so "healthy" sits around the middle.
  const target = Math.max(p.reorderLevel * 2, 1);
  const pct = Math.min(100, Math.round((p.quantity / target) * 100));
  const color =
    p.quantity === 0
      ? "bg-rose-400"
      : p.quantity <= p.reorderLevel
        ? "bg-amber-400"
        : "bg-brand-500";
  return (
    <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
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
  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="mb-1 block text-xs font-medium text-slate-600">
      {children}
    </label>
  );
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label>Name</Label>
        <input name="name" required defaultValue={product?.name} className={inputClass} />
      </div>
      <div>
        <Label>SKU</Label>
        <input name="sku" defaultValue={product?.sku ?? ""} className={inputClass} />
      </div>
      <div>
        <Label>Category</Label>
        <input
          name="category"
          defaultValue={product?.category ?? "General"}
          className={inputClass}
        />
      </div>
      <div>
        <Label>Unit</Label>
        <input name="unit" defaultValue={product?.unit ?? "each"} className={inputClass} />
      </div>
      <div>
        <Label>Supplier</Label>
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
        <Label>Cost price (ex. GST)</Label>
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
        <Label>Sale price (ex. GST)</Label>
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
          <Label>Opening quantity</Label>
          <input name="quantity" type="number" min={0} defaultValue={0} className={inputClass} />
        </div>
      )}
      <div>
        <Label>Reorder level</Label>
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

type SortKey = "name" | "stock" | "value";

export default function ProductManager({
  products,
  suppliers,
}: {
  products: Product[];
  suppliers: Supplier[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<SortKey>("name");
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<{ mode: "add" | "edit"; product?: Product } | null>(
    null
  );

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!modal) return;
    setError("");
    setSaving(true);
    try {
      const payload = formToProductPayload(e.currentTarget);
      if (modal.mode === "edit") await api.updateProduct(modal.product!.id, payload);
      else await api.createProduct(payload);
      setModal(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save product.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: Product) {
    if (
      !confirm(
        `Delete "${product.name}"? This removes its transaction history too.`
      )
    )
      return;
    try {
      await api.deleteProduct(product.id);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not delete product.");
    }
  }

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    return [
      { name: "All", count: products.length },
      ...Array.from(counts.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([name, count]) => ({ name, count })),
    ];
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((p) => {
      const matchesCat = category === "All" || p.category === category;
      const matchesQuery =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        (p.sku ?? "").toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
    list.sort((a, b) => {
      if (sort === "stock") return a.quantity - b.quantity;
      if (sort === "value") return b.costPrice * b.quantity - a.costPrice * a.quantity;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [products, query, category, sort]);

  const { pageItems, pageCount, safePage } = pageSlice(filtered, page, 8);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon
            width={16}
            height={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            placeholder="Search by name or SKU…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className={`${inputClass} pl-9`}
          />
        </div>
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value as SortKey);
            setPage(1);
          }}
          className={`${inputClass} sm:w-48`}
        >
          <option value="name">Sort: Name (A–Z)</option>
          <option value="stock">Sort: Stock (low first)</option>
          <option value="value">Sort: Stock value (high first)</option>
        </select>
        <Button onClick={() => setModal({ mode: "add" })}>
          <PlusIcon width={16} height={16} />
          Add product
        </Button>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.name}
            onClick={() => {
              setCategory(c.name);
              setPage(1);
            }}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              category === c.name
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {c.name}
            <span
              className={`rounded-full px-1.5 text-xs ${
                category === c.name ? "bg-white/20" : "bg-slate-100 text-slate-500"
              }`}
            >
              {c.count}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center shadow-sm">
          <BoxIcon width={28} height={28} className="mx-auto mb-2 text-slate-300" />
          <p className="text-sm text-slate-400">No products match your filters.</p>
        </div>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <ul className="space-y-3 sm:hidden">
            {pageItems.map((p) => {
              const st = statusOf(p);
              return (
                <li
                  key={p.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-800">
                        {p.name}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {p.sku ? `${p.sku} · ` : ""}
                        {p.supplier?.name ?? "No supplier"}
                      </p>
                    </div>
                    <Badge tone={st.tone}>{st.label}</Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-800">
                      {p.quantity} {p.unit}
                    </span>
                    <StockBar p={p} />
                  </div>
                  <div className="mt-3 flex items-end justify-between border-t border-slate-100 pt-3">
                    <dl className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <dt className="text-slate-400">Cost</dt>
                        <dd className="font-medium text-slate-700">
                          {formatAUD(p.costPrice)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-400">Sale inc.</dt>
                        <dd className="font-medium text-slate-700">
                          {formatAUD(incGst(p.salePrice))}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-400">Value</dt>
                        <dd className="font-medium text-slate-700">
                          {formatAUD(p.costPrice * p.quantity)}
                        </dd>
                      </div>
                    </dl>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setModal({ mode: "edit", product: p })}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                        aria-label="Edit"
                      >
                        <EditIcon width={16} height={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                        aria-label="Delete"
                      >
                        <TrashIcon width={16} height={16} />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Desktop: table */}
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Stock</th>
                    <th className="px-4 py-3 text-right font-medium">Cost</th>
                    <th className="px-4 py-3 text-right font-medium">Sale (inc GST)</th>
                    <th className="px-4 py-3 text-right font-medium">Stock value</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((p) => {
                    const st = statusOf(p);
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-800">{p.name}</p>
                          <p className="text-xs text-slate-400">
                            {p.sku ? `${p.sku} · ` : ""}
                            {p.supplier?.name ?? "No supplier"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone="slate">{p.category}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-800">
                              {p.quantity}
                            </span>
                            <span className="text-xs text-slate-400">{p.unit}</span>
                            <Badge tone={st.tone}>{st.label}</Badge>
                          </div>
                          <StockBar p={p} />
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600">
                          {formatAUD(p.costPrice)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600">
                          {formatAUD(incGst(p.salePrice))}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-700">
                          {formatAUD(p.costPrice * p.quantity)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => setModal({ mode: "edit", product: p })}
                              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                              aria-label="Edit"
                            >
                              <EditIcon width={16} height={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(p)}
                              className="rounded-lg p-2 text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-700"
                              aria-label="Delete"
                            >
                              <TrashIcon width={16} height={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination page={safePage} pageCount={pageCount} onPage={setPage} />
        </>
      )}

      {/* Add / Edit modal */}
      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.mode === "edit" ? "Edit product" : "New product"}
        description={
          modal?.mode === "edit"
            ? "On-hand quantity is changed via Purchases and Sales, not here."
            : "Add a product to your catalogue."
        }
      >
        {modal && (
          <form onSubmit={handleSave}>
            <ProductFields
              product={modal.product}
              suppliers={suppliers}
              showQuantity={modal.mode === "add"}
            />
            {error && (
              <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">
                {error}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setModal(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving
                  ? "Saving…"
                  : modal.mode === "edit"
                    ? "Save changes"
                    : "Save product"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
