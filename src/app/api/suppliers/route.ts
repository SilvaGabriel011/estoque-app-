import { ok, route, readJson } from "@/server/http";
import { listSuppliers, createSupplier } from "@/server/services/suppliers";
import { supplierInputSchema } from "@/server/validation";

export const dynamic = "force-dynamic";

export const GET = route(async () => {
  return ok(await listSuppliers());
});

export const POST = route(async (req: Request) => {
  const input = supplierInputSchema.parse(await readJson(req));
  return ok(await createSupplier(input), 201);
});
