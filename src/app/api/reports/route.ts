import { ok, route } from "@/server/http";
import {
  getFinancials,
  getMostUsed,
  getStockValue,
} from "@/server/services/reports";

export const dynamic = "force-dynamic";

export const GET = route(async (req: Request) => {
  const url = new URL(req.url);
  const days = Number(url.searchParams.get("days") ?? "0");
  const limit = Number(url.searchParams.get("limit") ?? "8");

  const [financials, mostUsed, stock] = await Promise.all([
    getFinancials(days),
    getMostUsed(days, limit),
    getStockValue(),
  ]);

  return ok({ days, financials, mostUsed, stock });
});
