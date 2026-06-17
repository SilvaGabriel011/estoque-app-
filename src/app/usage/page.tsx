import { listProducts } from "@/server/services/products";
import { listTransactionsByType } from "@/server/services/transactions";
import { getMostUsed } from "@/server/services/reports";
import { PageHeader, ButtonLink } from "@/components/ui";
import { CartIcon } from "@/components/icons";
import UsageWorkspace from "@/components/UsageWorkspace";

export const dynamic = "force-dynamic";

export default async function UsagePage() {
  const [products, recent, mostUsed] = await Promise.all([
    listProducts(),
    listTransactionsByType("USAGE", 50),
    getMostUsed(30, 8),
  ]);

  return (
    <div>
      <PageHeader
        title="Usage"
        subtitle="Mark stock as used on jobs — this draws items down from inventory."
        action={
          <ButtonLink href="/purchases" variant="secondary">
            <CartIcon width={16} height={16} />
            Record a purchase
          </ButtonLink>
        }
      />

      <UsageWorkspace products={products} mostUsed={mostUsed} recent={recent} />
    </div>
  );
}
