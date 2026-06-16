// Thin client-side wrapper around the REST API. The UI only talks to the
// backend through these HTTP calls — no business logic or DB access here.

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* ignore non-JSON error bodies */
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export type MovementPayload = {
  type: "PURCHASE" | "SALE";
  productId: number;
  quantity: number;
  unitPrice?: number | null;
  note?: string | null;
};

export type ProductPayload = {
  name: string;
  sku?: string | null;
  category?: string;
  unit?: string;
  costPrice?: number;
  salePrice?: number;
  quantity?: number;
  reorderLevel?: number;
  supplierId?: number | null;
};

export type SupplierPayload = {
  name: string;
  contact?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
};

export const api = {
  recordMovement: (payload: MovementPayload) =>
    request("/api/transactions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  createProduct: (payload: ProductPayload) =>
    request("/api/products", { method: "POST", body: JSON.stringify(payload) }),

  updateProduct: (id: number, payload: Partial<ProductPayload>) =>
    request(`/api/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteProduct: (id: number) =>
    request(`/api/products/${id}`, { method: "DELETE" }),

  createSupplier: (payload: SupplierPayload) =>
    request("/api/suppliers", { method: "POST", body: JSON.stringify(payload) }),

  deleteSupplier: (id: number) =>
    request(`/api/suppliers/${id}`, { method: "DELETE" }),
};
