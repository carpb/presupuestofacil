import type { Quote, QuoteLine, QuoteTotals } from "@/types/quote";

export const roundMoney = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function lineGross(line: QuoteLine): number {
  return roundMoney(Math.max(0, line.quantity || 0) * Math.max(0, line.unitPrice || 0));
}

export function lineDiscount(line: QuoteLine): number {
  return roundMoney(lineGross(line) * Math.min(Math.max(0, line.discount || 0), 100) / 100);
}

export function lineBase(line: QuoteLine): number {
  return roundMoney(lineGross(line) - lineDiscount(line));
}

export function lineVat(line: QuoteLine): number {
  return roundMoney(lineBase(line) * Math.max(0, line.vatRate || 0) / 100);
}

export function calculateTotals(quote: Pick<Quote, "lines">): QuoteTotals {
  const subtotal = roundMoney(quote.lines.reduce((sum, line) => sum + lineGross(line), 0));
  const discount = roundMoney(quote.lines.reduce((sum, line) => sum + lineDiscount(line), 0));
  const taxableBase = roundMoney(quote.lines.reduce((sum, line) => sum + lineBase(line), 0));
  const vat = roundMoney(quote.lines.reduce((sum, line) => sum + lineVat(line), 0));
  return { subtotal, discount, taxableBase, vat, total: roundMoney(taxableBase + vat) };
}
