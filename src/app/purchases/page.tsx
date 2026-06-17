import { listProducts, listLowStock } from "@/server/services/products";
import { listTransactionsByType } from "@/server/services/transactions";
import { PageHeader, ButtonLink } from "@/components/ui";
import { UsageIcon } from "@/components/icons";
import PurchaseWorkspace from "@/components/PurchaseWorkspace";

export const dynamic = "force-dynamic";

export default async function PurchasesPage() {
  const [products, lowStock, recent] = await Promise.all([
    listProducts(),
    listLowStock(),
    listTransactionsByType("PURCHASE", 50),
  ]);

  return (
    <div>
      <PageHeader
        title="Purchases"
        subtitle="Buy stock from suppliers — recording a purchase increases stock on hand."
        action={
          <ButtonLink href="/usage" variant="secondary">
            <UsageIcon width={16} height={16} />
            Mark used
          </ButtonLink>
        }
      />

      <PurchaseWorkspace products={products} lowStock={lowStock} recent={recent} />
    </div>
  );
}
