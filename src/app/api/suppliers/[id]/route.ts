import { ok, route } from "@/server/http";
import { deleteSupplier } from "@/server/services/suppliers";

type Ctx = { params: Promise<{ id: string }> };

export const DELETE = route(async (_req: Request, ctx: Ctx) => {
  const { id } = await ctx.params;
  await deleteSupplier(Number(id));
  return ok({ ok: true });
});
