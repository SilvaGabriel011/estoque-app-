"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Badge, Button } from "@/components/ui";
import { PlusIcon, TrashIcon } from "@/components/icons";
import { api } from "@/lib/api";

type Supplier = {
  id: number;
  name: string;
  contact: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  _count: { products: number };
};

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

export default function SupplierManager({
  suppliers,
}: {
  suppliers: Supplier[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      await api.createSupplier({
        name: String(fd.get("name") ?? "").trim(),
        contact: String(fd.get("contact") ?? "").trim() || null,
        phone: String(fd.get("phone") ?? "").trim() || null,
        email: String(fd.get("email") ?? "").trim() || null,
        notes: String(fd.get("notes") ?? "").trim() || null,
      });
      setAdding(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add supplier.");
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete supplier "${name}"?`)) return;
    try {
      await api.deleteSupplier(id);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not delete supplier.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant={adding ? "secondary" : "primary"}
          onClick={() => setAdding((v) => !v)}
        >
          {adding ? "Cancel" : (
            <>
              <PlusIcon width={16} height={16} />
              Add supplier
            </>
          )}
        </Button>
      </div>

      {adding && (
        <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-5">
          <h3 className="mb-3 font-semibold text-slate-900">New supplier</h3>
          <form
            onSubmit={handleCreate}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Name
              </label>
              <input name="name" required className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Contact person
              </label>
              <input name="contact" className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Phone
              </label>
              <input name="phone" className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Email
              </label>
              <input name="email" type="email" className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Notes
              </label>
              <input name="notes" className={inputClass} />
            </div>
            {error && (
              <p className="rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700 ring-1 ring-inset ring-rose-200 sm:col-span-2">
                {error}
              </p>
            )}
            <div className="sm:col-span-2">
              <Button type="submit">Save supplier</Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((s) => (
          <Card key={s.id} className="flex flex-col transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-sm font-bold text-white">
                  {s.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-slate-900">{s.name}</h3>
                  {s.contact && (
                    <p className="truncate text-sm text-slate-600">{s.contact}</p>
                  )}
                </div>
              </div>
              <Badge tone="blue">{s._count.products}</Badge>
            </div>
            <div className="mt-3 flex-1 space-y-1 text-sm text-slate-600">
              {s.phone && (
                <p>
                  <span className="text-slate-400">Phone:</span> {s.phone}
                </p>
              )}
              {s.email && (
                <p>
                  <span className="text-slate-400">Email:</span> {s.email}
                </p>
              )}
              {s.notes && <p className="text-slate-500">{s.notes}</p>}
            </div>
            <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
              <button
                onClick={() => handleDelete(s.id, s.name)}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
              >
                <TrashIcon width={14} height={14} />
                Delete
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
