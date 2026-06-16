import { ok, route, readJson } from "@/server/http";
import { updateProduct, deleteProduct, getProduct } from "@/server/services/products";
import { productUpdateSchema } from "@/server/validation";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route(async (_req: Request, ctx: Ctx) => {
  const { id } = await ctx.params;
  return ok(await getProduct(Number(id)));
});

export const PATCH = route(async (req: Request, ctx: Ctx) => {
  const { id } = await ctx.params;
  const input = productUpdateSchema.parse(await readJson(req));
  return ok(await updateProduct(Number(id), input));
});

export const DELETE = route(async (_req: Request, ctx: Ctx) => {
  const { id } = await ctx.params;
  await deleteProduct(Number(id));
  return ok({ ok: true });
});
