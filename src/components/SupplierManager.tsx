"use client";

import { useState } from "react";
import { Card, Badge, Button } from "@/components/ui";
import { PlusIcon, TrashIcon } from "@/components/icons";
import { createSupplier, deleteSupplier } from "@/lib/actions";

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
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";

export default function SupplierManager({
  suppliers,
}: {
  suppliers: Supplier[];
}) {
  const [adding, setAdding] = useState(false);

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
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5">
          <h3 className="mb-3 font-semibold text-slate-900">New supplier</h3>
          <form
            action={async (fd) => {
              await createSupplier(fd);
              setAdding(false);
            }}
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
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Save supplier
              </button>
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
            <form
              action={deleteSupplier}
              onSubmit={(e) => {
                if (!confirm(`Delete supplier "${s.name}"?`))
                  e.preventDefault();
              }}
              className="mt-4 flex justify-end border-t border-slate-100 pt-3"
            >
              <input type="hidden" name="id" value={s.id} />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
              >
                <TrashIcon width={14} height={14} />
                Delete
              </button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
