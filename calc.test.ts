import { describe, expect, it } from "vitest";
import { calculateTotals, lineBase, lineDiscount, lineVat, roundMoney } from "@/lib/calc";

const q = (lines:any) => ({lines});

describe("cálculos de presupuesto", () => {
  it("calcula 100 + IVA 21% = 121", () => {
    const t = calculateTotals(q([{id:"1",description:"x",quantity:1,unitPrice:100,discount:0,vatRate:21}]));
    expect(t.taxableBase).toBe(100);
    expect(t.vat).toBe(21);
    expect(t.total).toBe(121);
  });
  it("calcula IVA 0%", () => {
    expect(calculateTotals(q([{id:"1",description:"x",quantity:1,unitPrice:100,discount:0,vatRate:0}])).total).toBe(100);
  });
  it("calcula IVA 4%", () => {
    expect(calculateTotals(q([{id:"1",description:"x",quantity:1,unitPrice:100,discount:0,vatRate:4}])).total).toBe(104);
  });
  it("calcula IVA 10%", () => {
    expect(calculateTotals(q([{id:"1",description:"x",quantity:1,unitPrice:100,discount:0,vatRate:10}])).total).toBe(110);
  });
  it("calcula IVA 21%", () => {
    expect(calculateTotals(q([{id:"1",description:"x",quantity:1,unitPrice:100,discount:0,vatRate:21}])).total).toBe(121);
  });
  it("aplica descuento antes del IVA", () => {
    const l={id:"1",description:"x",quantity:2,unitPrice:100,discount:10,vatRate:21};
    expect(lineDiscount(l)).toBe(20);
    expect(lineBase(l)).toBe(180);
    expect(lineVat(l)).toBe(37.8);
    expect(calculateTotals(q([l])).total).toBe(217.8);
  });
  it("soporta cantidades y precios decimales", () => {
    const t=calculateTotals(q([{id:"1",description:"x",quantity:1.5,unitPrice:19.99,discount:0,vatRate:21}]));
    expect(t.subtotal).toBe(29.99);
    expect(t.vat).toBe(6.3);
    expect(t.total).toBe(36.29);
  });
  it("suma múltiples líneas", () => {
    const t=calculateTotals(q([
      {id:"1",description:"a",quantity:1,unitPrice:800,discount:0,vatRate:21},
      {id:"2",description:"b",quantity:2,unitPrice:50,discount:0,vatRate:21}
    ]));
    expect(t.subtotal).toBe(900);
    expect(t.vat).toBe(189);
    expect(t.total).toBe(1089);
  });
  it("redondea consistentemente", () => {
    expect(roundMoney(0.1+0.2)).toBe(0.3);
  });
});

it("calcula un IVA personalizado", () => {
  const t = calculateTotals(q([{id:"custom",description:"x",quantity:1,unitPrice:200,discount:0,vatRate:13.5,customVat:true}]));
  expect(t.vat).toBe(27);
  expect(t.total).toBe(227);
});
