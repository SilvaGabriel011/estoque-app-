import { listProducts, listLowStock } from "@/server/services/products";
import { listTransactionsByType } from "@/server/services/transactions";
import { PageHeader, Card, ButtonLink } from "@/components/ui";
import { DollarIcon } from "@/components/icons";
import PurchaseWorkspace from "@/components/PurchaseWorkspace";
import TransactionTable from "@/components/TransactionTable";

export const dynamic = "force-dynamic";

export default async function PurchasesPage() {
  const [products, lowStock, recent] = await Promise.all([
    listProducts(),
    listLowStock(),
    listTransactionsByType("PURCHASE"),
  ]);

  return (
    <div>
      <PageHeader
        title="Purchases"
        subtitle="Buy stock from suppliers — recording a purchase increases stock on hand."
        action={
          <ButtonLink href="/sales" variant="secondary">
            <DollarIcon width={16} height={16} />
            Record a sale
          </ButtonLink>
        }
      />

      <PurchaseWorkspace products={products} lowStock={lowStock} />

      <Card className="mt-6">
        <h2 className="mb-4 font-semibold text-slate-900">Recent purchases</h2>
        <TransactionTable rows={recent} emptyLabel="No purchases recorded yet." />
      </Card>
    </div>
  );
}
