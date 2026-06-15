import { getSuppliers } from "@/lib/data";
import { PageHeader } from "@/components/ui";
import SupplierManager from "@/components/SupplierManager";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();

  return (
    <div>
      <PageHeader
        title="Suppliers"
        subtitle="Your supplier directory — link products to suppliers for quick reordering."
      />
      <SupplierManager suppliers={suppliers} />
    </div>
  );
}
