import type { Quote } from "@/types/quote";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const taxIdRe = /^[A-Za-z0-9 .-]{5,20}$/;

export function validateQuote(q: Quote) {
  const errors: Record<string, string> = {};
  if (!q.issuer.name.trim()) errors["issuer.name"] = "Introduce tu nombre o empresa.";
  if (!q.client.name.trim()) errors["client.name"] = "Introduce el nombre del cliente.";
  if (q.issuer.email && !emailRe.test(q.issuer.email)) errors["issuer.email"] = "Introduce un email válido.";
  if (q.client.email && !emailRe.test(q.client.email)) errors["client.email"] = "Introduce un email válido.";
  if (q.issuer.taxId && !taxIdRe.test(q.issuer.taxId)) errors["issuer.taxId"] = "Revisa el NIF/CIF.";
  if (q.client.taxId && !q.client.isPrivate && !taxIdRe.test(q.client.taxId)) errors["client.taxId"] = "Revisa el NIF/CIF del cliente.";
  if (!q.number.trim()) errors.number = "Introduce un número de presupuesto.";
  if (!q.date) errors.date = "Introduce una fecha.";
  if (q.validUntil && q.date && q.validUntil < q.date) errors.validUntil = "La validez no puede ser anterior a la fecha del presupuesto.";
  if (!q.lines.length) errors.lines = "Añade al menos una línea.";

  q.lines.forEach((line, index) => {
    if (!line.description.trim()) errors[`line.${index}.description`] = "Describe el servicio o producto.";
    if (!(Number.isFinite(line.quantity) && line.quantity > 0)) errors[`line.${index}.quantity`] = "La cantidad debe ser mayor que 0.";
    if (!(Number.isFinite(line.unitPrice) && line.unitPrice >= 0)) errors[`line.${index}.unitPrice`] = "Introduce un precio válido.";
    if (!(Number.isFinite(line.discount) && line.discount >= 0 && line.discount <= 100)) errors[`line.${index}.discount`] = "El descuento debe estar entre 0 y 100.";
    if (!(Number.isFinite(line.vatRate) && line.vatRate >= 0 && line.vatRate <= 100)) errors[`line.${index}.vatRate`] = "El IVA debe estar entre 0 y 100.";
    if (line.unit === "otra" && !line.customUnit?.trim()) errors[`line.${index}.customUnit`] = "Indica la unidad.";
  });

  if (q.paymentMethod === "otra" && !q.paymentOther.trim()) errors.paymentOther = "Indica la forma de pago.";
  return errors;
}
