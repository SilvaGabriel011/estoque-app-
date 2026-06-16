import { listProducts } from "@/server/services/products";
import { listTransactionsByType } from "@/server/services/transactions";
import { getBestSellers } from "@/server/services/reports";
import { PageHeader, ButtonLink } from "@/components/ui";
import { CartIcon } from "@/components/icons";
import SalesWorkspace from "@/components/SalesWorkspace";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const [products, recent, best] = await Promise.all([
    listProducts(),
    listTransactionsByType("SALE", 50),
    getBestSellers(30, 8),
  ]);

  return (
    <div>
      <PageHeader
        title="Sales"
        subtitle="Sell items to customers — recording a sale reduces stock on hand."
        action={
          <ButtonLink href="/purchases" variant="secondary">
            <CartIcon width={16} height={16} />
            Record a purchase
          </ButtonLink>
        }
      />

      <SalesWorkspace products={products} best={best} recent={recent} />
    </div>
  );
}
