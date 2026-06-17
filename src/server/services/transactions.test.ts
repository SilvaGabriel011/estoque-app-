import { describe, it, expect } from "vitest";
import { recordMovement } from "./transactions";
import { DomainError, NotFoundError } from "../domain/errors";
import type { Db } from "../db";

type FakeProduct = {
  id: number;
  name: string;
  quantity: number;
  costPrice: number;
};

/**
 * Minimal in-memory stand-in for the Prisma client covering the subset
 * `recordMovement` uses — lets us test the business logic without a database.
 */
function fakeDb(product: FakeProduct | null) {
  const calls = {
    transactionCreate: undefined as any,
    productUpdate: undefined as any,
  };
  const db = {
    product: {
      findUnique: async () => product,
      update: async (args: any) => {
        calls.productUpdate = args;
        return { ...(product as FakeProduct), ...args.data };
      },
    },
    transaction: {
      create: async (args: any) => {
        calls.transactionCreate = args;
        return { id: 1, ...args.data };
      },
    },
    $transaction: async (ops: Promise<unknown>[]) => Promise.all(ops),
  } as unknown as Db;
  return { db, calls };
}

const product: FakeProduct = {
  id: 7,
  name: "Clear Silicone",
  quantity: 100,
  costPrice: 5.5,
};

describe("recordMovement", () => {
  it("increments stock on a purchase and adds GST", async () => {
    const { db, calls } = fakeDb({ ...product, quantity: 100 });
    const result = await recordMovement(
      { type: "PURCHASE", productId: 7, quantity: 10 },
      db
    );

    expect(result.newQuantity).toBe(110);
    expect(calls.productUpdate.data.quantity).toBe(110);
    // cost 5.5 * 10 = 55 ex, GST 5.5, total 60.5
    expect(calls.transactionCreate.data.gst).toBe(5.5);
    expect(calls.transactionCreate.data.total).toBe(60.5);
    expect(calls.transactionCreate.data.type).toBe("PURCHASE");
  });

  it("decrements stock on usage with no GST, valued at cost", async () => {
    const { db, calls } = fakeDb({ ...product, quantity: 100 });
    const result = await recordMovement(
      { type: "USAGE", productId: 7, quantity: 4 },
      db
    );

    expect(result.newQuantity).toBe(96);
    expect(calls.transactionCreate.data.unitPrice).toBe(5.5);
    expect(calls.transactionCreate.data.gst).toBe(0);
    expect(calls.transactionCreate.data.total).toBe(22); // 5.5 * 4, no GST
  });

  it("honours an explicit unit price override on a purchase", async () => {
    const { db, calls } = fakeDb({ ...product, quantity: 100 });
    await recordMovement(
      { type: "PURCHASE", productId: 7, quantity: 2, unitPrice: 10 },
      db
    );
    expect(calls.transactionCreate.data.total).toBe(22); // 10*2 +10% GST
  });

  it("rejects using more than is in stock", async () => {
    const { db } = fakeDb({ ...product, quantity: 3 });
    await expect(
      recordMovement({ type: "USAGE", productId: 7, quantity: 5 }, db)
    ).rejects.toBeInstanceOf(DomainError);
  });

  it("rejects an invalid quantity", async () => {
    const { db } = fakeDb({ ...product, quantity: 100 });
    await expect(
      recordMovement({ type: "PURCHASE", productId: 7, quantity: 0 }, db)
    ).rejects.toBeInstanceOf(DomainError);
  });

  it("throws NotFound when the product does not exist", async () => {
    const { db } = fakeDb(null);
    await expect(
      recordMovement({ type: "USAGE", productId: 999, quantity: 1 }, db)
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
