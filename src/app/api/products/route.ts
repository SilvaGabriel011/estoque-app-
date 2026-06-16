import { ok, route, readJson } from "@/server/http";
import { listProducts, createProduct } from "@/server/services/products";
import { productInputSchema } from "@/server/validation";

export const dynamic = "force-dynamic";

export const GET = route(async () => {
  return ok(await listProducts());
});

export const POST = route(async (req: Request) => {
  const input = productInputSchema.parse(await readJson(req));
  return ok(await createProduct(input), 201);
});
