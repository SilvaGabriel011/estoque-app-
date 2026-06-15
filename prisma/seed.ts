import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Australian GST 10%
const GST = 0.1;
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

async function main() {
  // Clean slate (order matters because of FKs)
  await prisma.transaction.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();

  // ---- Suppliers (from the SUPPLIERS sheet) ----
  const suppliers = await Promise.all(
    [
      { name: "Lonsdale Paints", phone: "(08) 8322 0030" },
      {
        name: "Wurth",
        contact: "Travis Van Wolfe",
        phone: "0461 537 722",
        notes: "Silicone supplier",
      },
      { name: "Total Tools Lonsdale", notes: "Tools & blades" },
      {
        name: "Farnese / TQStone",
        contact: "Jason",
        phone: "0428 474 128",
        notes: "Stone care & rags",
      },
      {
        name: "BR Construction Supplies",
        notes: "Prosan & Dowsil silicone, consumables",
      },
      { name: "Propak Industries", notes: "Cloth tape" },
      { name: "Galaxy Products", notes: "Prosil silicone range" },
      { name: "Seal The Deal", notes: "Own brand silicone" },
    ].map((s) => prisma.supplier.create({ data: s }))
  );

  const byName = (n: string) => suppliers.find((s) => s.name === n)!;

  // ---- Products (from SILICONE / PADS / GLUE / QUOTES / SUPPLIERS sheets) ----
  // Prices stored EX-GST in AUD.
  const products = [
    // Silicone range
    {
      name: "Clear Silicone",
      sku: "SIL-CLR",
      category: "Silicone",
      unit: "cartridge",
      costPrice: 5.5,
      salePrice: 9.57,
      quantity: 105,
      reorderLevel: 30,
      supplierId: byName("BR Construction Supplies").id,
    },
    {
      name: "White Silicone",
      sku: "SIL-WHT",
      category: "Silicone",
      unit: "cartridge",
      costPrice: 5.5,
      salePrice: 9.57,
      quantity: 70,
      reorderLevel: 30,
      supplierId: byName("BR Construction Supplies").id,
    },
    {
      name: "Gap Filler",
      sku: "SIL-GAP",
      category: "Silicone",
      unit: "cartridge",
      costPrice: 6.0,
      salePrice: 9.57,
      quantity: 14,
      reorderLevel: 20,
      supplierId: byName("BR Construction Supplies").id,
    },
    // Pads / consumables
    {
      name: "Nozzles 60mm",
      sku: "NOZ-060",
      category: "Consumables",
      unit: "each",
      costPrice: 0.45,
      salePrice: 1.2,
      quantity: 0,
      reorderLevel: 50,
    },
    {
      name: "Nozzles 115mm",
      sku: "NOZ-115",
      category: "Consumables",
      unit: "each",
      costPrice: 0.6,
      salePrice: 1.5,
      quantity: 0,
      reorderLevel: 50,
    },
    {
      name: "Nozzles 260mm",
      sku: "NOZ-260",
      category: "Consumables",
      unit: "each",
      costPrice: 0.9,
      salePrice: 2.2,
      quantity: 0,
      reorderLevel: 30,
    },
    {
      name: "Methylated Spirits 4L",
      sku: "MET-4L",
      category: "Cleaning",
      unit: "bottle",
      costPrice: 12.0,
      salePrice: 18.0,
      quantity: 4,
      reorderLevel: 5,
      supplierId: byName("Lonsdale Paints").id,
    },
    {
      name: "Acetone 20L",
      sku: "ACE-20L",
      category: "Cleaning",
      unit: "drum",
      costPrice: 80.54,
      salePrice: 110.0,
      quantity: 1,
      reorderLevel: 2,
      supplierId: byName("Lonsdale Paints").id,
    },
    {
      name: "Diamond Guard Film 650mm x 100m",
      sku: "DG-650",
      category: "Protection",
      unit: "roll",
      costPrice: 120.0,
      salePrice: 165.0,
      quantity: 2,
      reorderLevel: 3,
      supplierId: byName("Farnese / TQStone").id,
    },
    {
      name: "Tenax Glue",
      sku: "GLUE-TNX",
      category: "Glue",
      unit: "tin",
      costPrice: 28.0,
      salePrice: 42.0,
      quantity: 1,
      reorderLevel: 4,
    },
    {
      name: "Jif Cleaner",
      sku: "CLN-JIF",
      category: "Cleaning",
      unit: "bottle",
      costPrice: 4.5,
      salePrice: 7.5,
      quantity: 1,
      reorderLevel: 3,
    },
    {
      name: "Silicone Guns",
      sku: "TOOL-SG",
      category: "Tools",
      unit: "each",
      costPrice: 54.0,
      salePrice: 79.0,
      quantity: 4,
      reorderLevel: 2,
      supplierId: byName("Total Tools Lonsdale").id,
    },
    {
      name: "Caulking Gun",
      sku: "TOOL-CG",
      category: "Tools",
      unit: "each",
      costPrice: 54.0,
      salePrice: 79.0,
      quantity: 2,
      reorderLevel: 2,
      supplierId: byName("Wurth").id,
    },
    {
      name: "Single Edge Razor Blades 100pk",
      sku: "BLD-100",
      category: "Consumables",
      unit: "pack",
      costPrice: 16.0,
      salePrice: 24.0,
      quantity: 6,
      reorderLevel: 4,
      supplierId: byName("Total Tools Lonsdale").id,
    },
    {
      name: "10Kg Bag of Rags",
      sku: "RAG-10",
      category: "Cleaning",
      unit: "bag",
      costPrice: 54.0,
      salePrice: 79.0,
      quantity: 3,
      reorderLevel: 2,
      supplierId: byName("Farnese / TQStone").id,
    },
    {
      name: "Cloth Tape 48mm x 25m",
      sku: "TAPE-48",
      category: "Consumables",
      unit: "roll",
      costPrice: 5.5,
      salePrice: 9.5,
      quantity: 40,
      reorderLevel: 12,
      supplierId: byName("Propak Industries").id,
    },
    {
      name: "Pearl Impregnator 1L",
      sku: "STN-PI1",
      category: "Stone Care",
      unit: "bottle",
      costPrice: 150.0,
      salePrice: 210.0,
      quantity: 5,
      reorderLevel: 3,
      supplierId: byName("Farnese / TQStone").id,
    },
  ];

  const created = await Promise.all(
    products.map((p) => prisma.product.create({ data: p }))
  );
  const product = (sku: string) => created.find((p) => p.sku === sku)!;

  // ---- Sample transaction history (last ~90 days) for reports ----
  type Tx = {
    sku: string;
    type: "PURCHASE" | "SALE";
    quantity: number;
    daysAgo: number;
    priceKind: "cost" | "sale";
  };

  const history: Tx[] = [
    { sku: "SIL-CLR", type: "SALE", quantity: 24, daysAgo: 80, priceKind: "sale" },
    { sku: "SIL-WHT", type: "SALE", quantity: 18, daysAgo: 78, priceKind: "sale" },
    { sku: "SIL-CLR", type: "PURCHASE", quantity: 52, daysAgo: 70, priceKind: "cost" },
    { sku: "SIL-WHT", type: "PURCHASE", quantity: 56, daysAgo: 70, priceKind: "cost" },
    { sku: "SIL-CLR", type: "SALE", quantity: 30, daysAgo: 60, priceKind: "sale" },
    { sku: "BLD-100", type: "SALE", quantity: 3, daysAgo: 55, priceKind: "sale" },
    { sku: "SIL-GAP", type: "SALE", quantity: 16, daysAgo: 50, priceKind: "sale" },
    { sku: "TAPE-48", type: "SALE", quantity: 22, daysAgo: 45, priceKind: "sale" },
    { sku: "SIL-WHT", type: "SALE", quantity: 40, daysAgo: 40, priceKind: "sale" },
    { sku: "ACE-20L", type: "PURCHASE", quantity: 2, daysAgo: 35, priceKind: "cost" },
    { sku: "DG-650", type: "SALE", quantity: 1, daysAgo: 30, priceKind: "sale" },
    { sku: "SIL-CLR", type: "SALE", quantity: 28, daysAgo: 25, priceKind: "sale" },
    { sku: "RAG-10", type: "SALE", quantity: 2, daysAgo: 20, priceKind: "sale" },
    { sku: "SIL-CLR", type: "SALE", quantity: 20, daysAgo: 14, priceKind: "sale" },
    { sku: "TAPE-48", type: "SALE", quantity: 18, daysAgo: 10, priceKind: "sale" },
    { sku: "SIL-WHT", type: "SALE", quantity: 12, daysAgo: 7, priceKind: "sale" },
    { sku: "STN-PI1", type: "SALE", quantity: 1, daysAgo: 5, priceKind: "sale" },
    { sku: "SIL-GAP", type: "SALE", quantity: 6, daysAgo: 3, priceKind: "sale" },
    { sku: "SIL-CLR", type: "SALE", quantity: 15, daysAgo: 1, priceKind: "sale" },
  ];

  for (const h of history) {
    const p = product(h.sku);
    const unitPrice = h.priceKind === "sale" ? p.salePrice : p.costPrice;
    const lineEx = unitPrice * h.quantity;
    const gst = round2(lineEx * GST);
    const total = round2(lineEx + gst);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - h.daysAgo);

    await prisma.transaction.create({
      data: {
        type: h.type,
        productId: p.id,
        quantity: h.quantity,
        unitPrice,
        gst,
        total,
        createdAt,
        note: "Imported history",
      },
    });
  }

  console.log(
    `Seeded ${suppliers.length} suppliers, ${created.length} products, ${history.length} transactions.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
