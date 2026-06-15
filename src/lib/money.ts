// Australian GST is a flat 10%.
export const GST_RATE = 0.1;

export function gstFor(exGstAmount: number): number {
  return round2(exGstAmount * GST_RATE);
}

export function incGst(exGstAmount: number): number {
  return round2(exGstAmount * (1 + GST_RATE));
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

const AUD = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
});

export function formatAUD(n: number): string {
  return AUD.format(n ?? 0);
}

export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
