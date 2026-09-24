import { jsPDF } from "jspdf";
import type { Quote, QuoteUnit } from "@/types/quote";
import { calculateTotals, lineBase, lineVat } from "./calc";
import { dateEs, euro } from "./format";

const unitLabel = (unit: QuoteUnit | undefined, custom?: string) => {
  const key = unit || "unidad";
  return key === "otra" ? (custom || "Ud.") : ({ unidad: "Ud.", hora: "h", día: "día", mes: "mes", servicio: "serv.", kg: "kg", metro: "m" }[key] || "Ud.");
};

function imageDimensions(dataUrl: string): Promise<{ w: number; h: number }> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth || 1, h: img.naturalHeight || 1 });
    img.onerror = () => resolve({ w: 1, h: 1 });
    img.src = dataUrl;
  });
}

export async function createQuotePdfBlob(q: Quote): Promise<Blob> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const color = q.settings.color || "#2563eb";
  const rgb = hexToRgb(color);
  const pageW = 210, pageH = 297, margin = 16, contentW = pageW - margin * 2;
  let y = 16;
  const isModern = q.settings.template === "modern";
  const isElegant = q.settings.template === "elegant";
  const isMinimal = q.settings.template === "minimal";

  const addFooter = () => {
    const pages = doc.getNumberOfPages();
    for (let p = 1; p <= pages; p++) {
      doc.setPage(p);
      doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(148, 163, 184);
      doc.text(`${q.number}`, margin, pageH - 8);
      doc.text(`${p} / ${pages}`, pageW - margin, pageH - 8, { align: "right" });
    }
  };

  const addNewPage = () => {
    doc.addPage();
    y = margin + 8;
    drawCompactHeader();
  };

  const ensureSpace = (needed: number, withHeader = true) => {
    if (y + needed <= pageH - margin - 10) return;
    addNewPage();
    if (withHeader) y += 8;
  };

  const drawHeaderDetails = async () => {
    if (isModern) {
      doc.setFillColor(rgb.r, rgb.g, rgb.b); doc.rect(0, 0, pageW, 5, "F");
      y = 18;
    }
    doc.setTextColor(30, 41, 59);
    if (q.logoDataUrl) {
      try {
        const dim = await imageDimensions(q.logoDataUrl);
        const maxW = 38, maxH = 20, ratio = dim.w / dim.h;
        let w = maxW, h = w / ratio;
        if (h > maxH) { h = maxH; w = h * ratio; }
        doc.addImage(q.logoDataUrl, "AUTO", margin, y, w, h);
      } catch { /* ignore broken optional logo */ }
    }
    const textX = q.logoDataUrl ? margin + 44 : margin;
    doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(30, 41, 59);
    doc.text(q.issuer.name || "Mi empresa", textX, y + 6);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(100, 116, 139);
    const details = [
      q.issuer.taxId,
      q.settings.showAddress ? [q.issuer.address, q.issuer.postalCode, q.issuer.city, q.issuer.province].filter(Boolean).join(", ") : "",
      q.settings.showEmail ? q.issuer.email : "",
      q.settings.showPhone ? q.issuer.phone : ""
    ].filter(Boolean);
    details.slice(0, 4).forEach((d, i) => doc.text(String(d), textX, y + 11 + i * 4));

    doc.setTextColor(rgb.r, rgb.g, rgb.b); doc.setFont("helvetica", "bold"); doc.setFontSize(15);
    doc.text("PRESUPUESTO", pageW - margin, y + 5, { align: "right" });
    doc.setTextColor(30, 41, 59); doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.text(`#${q.number}`, pageW - margin, y + 11, { align: "right" });
    doc.text(`Fecha: ${dateEs(q.date)}`, pageW - margin, y + 16, { align: "right" });
    doc.text(`Válido hasta: ${dateEs(q.validUntil)}`, pageW - margin, y + 21, { align: "right" });
    y += 36;
    doc.setDrawColor(225, 229, 234); doc.line(margin, y, pageW - margin, y);
  };

  const drawCompactHeader = () => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(30, 41, 59);
    doc.text(q.issuer.name || "Mi empresa", margin, y);
    doc.setTextColor(rgb.r, rgb.g, rgb.b); doc.setFontSize(8); doc.text(`PRESUPUESTO · ${q.number}`, pageW - margin, y, { align: "right" });
    y += 8;
    doc.setDrawColor(225, 229, 234); doc.line(margin, y, pageW - margin, y);
  };

  const drawSectionLabel = (title: string) => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(100, 116, 139); doc.text(title, margin, y);
    y += 4;
  };

  const drawTableHeader = () => {
    const tableY = y;
    if (isModern) doc.setFillColor(Math.min(255, rgb.r + 225), Math.min(255, rgb.g + 225), Math.min(255, rgb.b + 225));
    else if (isElegant) doc.setFillColor(246, 240, 232);
    else doc.setFillColor(246, 248, 250);
    doc.rect(margin, tableY, contentW, 9, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(100, 116, 139);
    doc.text("CONCEPTO", margin + 3, tableY + 6);
    doc.text("CANT.", 114, tableY + 6, { align: "right" });
    doc.text("PRECIO", 143, tableY + 6, { align: "right" });
    doc.text("IVA", 164, tableY + 6, { align: "right" });
    doc.text("TOTAL", pageW - margin - 3, tableY + 6, { align: "right" });
    y += 9;
  };

  await drawHeaderDetails();
  y += 9;
  drawSectionLabel("CLIENTE");
  doc.setTextColor(30, 41, 59); doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.text(q.client.name || "Nombre del cliente", margin, y);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(86, 99, 117);
  const clientDetails = [q.client.taxId, q.client.address, [q.client.postalCode, q.client.city].filter(Boolean).join(", "), q.client.email, q.client.phone].filter(Boolean);
  clientDetails.forEach((d, i) => doc.text(String(d), margin, y + 5 + i * 4));
  y += 9 + Math.min(clientDetails.length, 4) * 4;
  y += 8;

  drawTableHeader();
  doc.setTextColor(30, 41, 59); doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  for (const line of q.lines) {
    const desc = line.description || "Sin descripción";
    const note = line.discount > 0 ? `Descuento ${formatNum(line.discount)}% · ${unitLabel(line.unit, line.customUnit)}` : unitLabel(line.unit, line.customUnit);
    const descLines = doc.splitTextToSize(desc, 80);
    const rowH = Math.max(10, descLines.length * 4 + 7);
    if (y + rowH > pageH - margin - 24) {
      addNewPage();
      drawTableHeader();
      doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(30, 41, 59);
    }
    doc.text(descLines, margin + 3, y + 5);
    doc.setTextColor(115, 125, 139); doc.setFontSize(7.5); doc.text(note, margin + 3, y + 5 + descLines.length * 4);
    doc.setTextColor(30, 41, 59); doc.setFontSize(8.5);
    doc.text(formatNum(line.quantity), 114, y + 5, { align: "right" });
    doc.text(euro(line.unitPrice), 143, y + 5, { align: "right" });
    doc.text(`${formatNum(line.vatRate)}%`, 164, y + 5, { align: "right" });
    doc.setFont("helvetica", "bold"); doc.text(euro(lineBase(line) + lineVat(line)), pageW - margin - 3, y + 5, { align: "right" });
    doc.setFont("helvetica", "normal");
    y += rowH;
    if (!isMinimal) { doc.setDrawColor(237, 240, 242); doc.line(margin, y, pageW - margin, y); }
  }

  const totals = calculateTotals(q);
  if (y + 55 > pageH - margin - 10) addNewPage();
  y += 9;
  const tx = pageW - margin - 3, tl = tx - 65;
  doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(86, 99, 117);
  const totalRows = [
    ["Subtotal", euro(totals.subtotal)],
    ...(totals.discount > 0 ? [["Descuentos", `-${euro(totals.discount)}`]] : []),
    ["Base imponible", euro(totals.taxableBase)],
    ["IVA", euro(totals.vat)]
  ];
  totalRows.forEach(([label, val]) => { doc.text(label, tl, y); doc.text(val, tx, y, { align: "right" }); y += 5; });
  doc.setDrawColor(35, 52, 77); doc.line(tl, y - 2, tx, y - 2);
  doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(25, 38, 58); y += 5;
  doc.text("TOTAL", tl, y); doc.setTextColor(rgb.r, rgb.g, rgb.b); doc.text(euro(totals.total), tx, y, { align: "right" });
  doc.setTextColor(30, 41, 59);

  const blocks: [string, string][] = [
    ["CONDICIONES", q.conditions],
    ["FORMA DE PAGO", q.paymentMethod === "otra" ? q.paymentOther : q.paymentMethod],
    ["NOTAS", q.notes]
  ];
  for (const [title, text] of blocks) {
    if (!text) continue;
    const lines = doc.splitTextToSize(text, contentW);
    const blockHeight = 12 + lines.length * 4;
    if (y + blockHeight > pageH - margin - 12) addNewPage();
    y += 16;
    drawSectionLabel(title);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(70, 83, 101);
    doc.text(lines, margin, y);
    y += lines.length * 4;
  }

  addFooter();
  return doc.output("blob");
}

function hexToRgb(hex: string) {
  const m = hex.replace("#", "").match(/^([0-9a-f]{6})$/i);
  if (!m) return { r: 37, g: 99, b: 235 };
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function formatNum(n: number) { return new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 }).format(n); }
function sanitizeFilename(v: string) { return v.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "") || "presupuesto"; }
