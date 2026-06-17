import { ok, route, readJson } from "@/server/http";
import {
  recordMovement,
  listTransactions,
  listTransactionsByType,
} from "@/server/services/transactions";
import { movementInputSchema } from "@/server/validation";

export const dynamic = "force-dynamic";

export const GET = route(async (req: Request) => {
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const limit = Number(url.searchParams.get("limit") ?? "20");
  if (type === "PURCHASE" || type === "USAGE") {
    return ok(await listTransactionsByType(type, limit));
  }
  return ok(await listTransactions(limit));
});

export const POST = route(async (req: Request) => {
  const input = movementInputSchema.parse(await readJson(req));
  return ok(await recordMovement(input), 201);
});
