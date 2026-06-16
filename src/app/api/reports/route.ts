import { ok, route } from "@/server/http";
import {
  getFinancials,
  getBestSellers,
  getStockValue,
} from "@/server/services/reports";

export const dynamic = "force-dynamic";

export const GET = route(async (req: Request) => {
  const url = new URL(req.url);
  const days = Number(url.searchParams.get("days") ?? "0");
  const limit = Number(url.searchParams.get("limit") ?? "8");

  const [financials, bestSellers, stock] = await Promise.all([
    getFinancials(days),
    getBestSellers(days, limit),
    getStockValue(),
  ]);

  return ok({ days, financials, bestSellers, stock });
});
