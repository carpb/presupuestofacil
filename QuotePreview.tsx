import type { Quote } from "@/types/quote";
import { calculateTotals, lineBase, lineVat } from "@/lib/calc";
import { dateEs, euro } from "@/lib/format";

const unitLabel = (unit: Quote["lines"][number]["unit"], custom?: string) => {
  const key = unit || "unidad";
  return key === "otra" ? (custom || "Ud.") : ({ unidad: "Ud.", hora: "h", día: "día", mes: "mes", servicio: "serv.", kg: "kg", metro: "m" }[key] || "Ud.");
};

export default function QuotePreview({ quote }: { quote: Quote }) {
  const totals = calculateTotals(quote);
  const s = quote.settings;
  const clientAddress = [quote.client.address, quote.client.postalCode, quote.client.city].filter(Boolean).join(", ");
  const issuerAddress = [quote.issuer.address, quote.issuer.postalCode, quote.issuer.city, quote.issuer.province].filter(Boolean).join(", ");
  return <div className={`a4-page template-${s.template}`} style={{ "--pdf-color": s.color } as React.CSSProperties}>
    <div className="pdf-accent" aria-hidden="true" />
    <div className="pdf-header">
      <div className="pdf-company-block">
        {quote.logoDataUrl && <img src={quote.logoDataUrl} className="pdf-logo" alt="" />}
        <div className="pdf-company">{quote.issuer.name || "Mi empresa"}</div>
        {quote.issuer.taxId && <div className="pdf-muted">{quote.issuer.taxId}</div>}
        {s.showAddress && issuerAddress && <div className="pdf-muted pdf-address">{issuerAddress}</div>}
        {s.showEmail && quote.issuer.email && <div className="pdf-muted">{quote.issuer.email}</div>}
        {s.showPhone && quote.issuer.phone && <div className="pdf-muted">{quote.issuer.phone}</div>}
      </div>
      <div className="pdf-meta">
        <div className="pdf-doc-title">PRESUPUESTO</div>
        <div className="pdf-number">#{quote.number || "PRES-2026-001"}</div>
        <div>Fecha: {dateEs(quote.date)}</div>
        <div>Válido hasta: {dateEs(quote.validUntil)}</div>
      </div>
    </div>

    <div className="pdf-divider" />

    <div className="pdf-section client-block">
      <div className="pdf-section-title">PARA</div>
      <div className="pdf-client">
        <strong>{quote.client.name || "Nombre del cliente"}</strong>
        {quote.client.taxId && <span>{quote.client.taxId}</span>}
        {clientAddress && <span>{clientAddress}</span>}
        {(quote.client.email || quote.client.phone) && <span>{[quote.client.email, quote.client.phone].filter(Boolean).join(" · ")}</span>}
      </div>
    </div>

    <div className="pdf-section">
      <table className="pdf-table">
        <thead><tr><th>Concepto</th><th className="right">Cant.</th><th className="right">Precio</th><th className="right">IVA</th><th className="right">Total</th></tr></thead>
        <tbody>{quote.lines.map(l => <tr key={l.id}>
          <td><strong>{l.description || "Sin descripción"}</strong>{l.discount > 0 && <div className="pdf-line-note">{l.discount}% de descuento</div>}<div className="pdf-line-unit">{unitLabel(l.unit, l.customUnit)}</div></td>
          <td className="right">{l.quantity}</td>
          <td className="right">{euro(l.unitPrice)}</td>
          <td className="right">{l.vatRate}%</td>
          <td className="right"><strong>{euro(lineBase(l) + lineVat(l))}</strong></td>
        </tr>)}</tbody>
      </table>
    </div>

    <div className="pdf-bottom-grid">
      <div></div>
      <div className="pdf-totals">
        <div className="pdf-total"><span>Subtotal</span><span>{euro(totals.subtotal)}</span></div>
        {totals.discount > 0 && <div className="pdf-total"><span>Descuentos</span><span>-{euro(totals.discount)}</span></div>}
        <div className="pdf-total"><span>Base imponible</span><span>{euro(totals.taxableBase)}</span></div>
        <div className="pdf-total"><span>IVA</span><span>{euro(totals.vat)}</span></div>
        <div className="pdf-total final"><span>TOTAL</span><span>{euro(totals.total)}</span></div>
      </div>
    </div>

    {quote.conditions && <div className="pdf-section pdf-note-section"><div className="pdf-section-title">CONDICIONES</div><div className="pdf-notes">{quote.conditions}</div></div>}
    {(quote.paymentMethod || quote.paymentOther) && <div className="pdf-section pdf-note-section"><div className="pdf-section-title">FORMA DE PAGO</div><div className="pdf-notes">{quote.paymentMethod === "otra" ? quote.paymentOther : quote.paymentMethod}</div></div>}
    {quote.notes && <div className="pdf-section pdf-note-section"><div className="pdf-section-title">NOTAS</div><div className="pdf-notes">{quote.notes}</div></div>}

  </div>;
}
