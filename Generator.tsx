"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown, ArrowUp, BookmarkPlus, Check, Copy, Download, Eye, FilePlus2, History,
  Plus, Printer, RotateCcw, Save, Search, Sparkles, Trash2, X
} from "lucide-react";
import type { Quote, QuoteLine, SavedConcept, Template, QuoteUnit } from "@/types/quote";
import { calculateTotals, lineBase, lineVat } from "@/lib/calc";
import { euro } from "@/lib/format";
import { loadDraft, saveDraft, loadHistory, loadHistoryLogo, saveToHistory, deleteHistory, clearAllLocalData, loadConcepts, saveConcept } from "@/lib/storage";
import { validateQuote } from "@/lib/validation";
import { createQuotePdfBlob } from "@/lib/pdf";
import QuotePreview from "./QuotePreview";
import BrandMark from "./BrandMark";

const pad = (value: number) => String(value).padStart(2, "0");
const localDate = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const plusDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return localDate(date);
};
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const unitLabels: Record<QuoteUnit, string> = {
  unidad: "Unidad", hora: "Hora", día: "Día", mes: "Mes", servicio: "Servicio", kg: "Kg", metro: "Metro", otra: "Otra",
};
const templateChoices: ReadonlyArray<[Template, string, string]> = [
  ["classic", "Clásica", "Equilibrada"],
  ["modern", "Moderna", "Visual"],
  ["minimal", "Minimal", "Limpia"],
  ["elegant", "Elegante", "Sofisticada"],
];
const colorChoices = ["#2563eb", "#0f766e", "#7c3aed", "#c2410c", "#be185d", "#334155"];
const standardVatRates = [0, 4, 10, 21];

function blankLine(): QuoteLine {
  return { id: uid(), description: "", quantity: 1, unit: "unidad", unitPrice: 0, discount: 0, vatRate: 21 };
}

function nextNumber(history: Quote[]) {
  const year = new Date().getFullYear();
  const prefix = `PRES-${year}-`;
  const nums = history
    .map((quote) => Number(quote.number?.replace(prefix, "")))
    .filter((value) => Number.isFinite(value));
  return `${prefix}${String(Math.max(0, ...nums) + 1).padStart(3, "0")}`;
}

function newQuote(history: Quote[] = []): Quote {
  const now = new Date().toISOString();
  return {
    id: uid(),
    issuer: { name: "", taxId: "", address: "", postalCode: "", city: "", province: "", email: "", phone: "" },
    client: { name: "", taxId: "", address: "", postalCode: "", city: "", email: "", phone: "", isPrivate: false },
    number: nextNumber(history),
    date: localDate(),
    validUntil: plusDays(30),
    status: "borrador",
    currency: "EUR",
    lines: [blankLine()],
    paymentMethod: "transferencia",
    paymentOther: "",
    conditions: "Presupuesto válido durante 30 días. Los trabajos comenzarán tras la aceptación del presupuesto.",
    notes: "",
    settings: { showPhone: true, showEmail: true, showAddress: true, color: "#2563eb", template: "classic" },
    createdAt: now,
    updatedAt: now,
  };
}

function normalizeQuote(input: Partial<Quote>, history: Quote[]): Quote {
  const fallback = newQuote(history);
  const lines = Array.isArray(input.lines) && input.lines.length
    ? input.lines.map((line) => ({
        ...blankLine(),
        ...line,
        id: line.id || uid(),
        description: String(line.description ?? ""),
        quantity: Number.isFinite(Number(line.quantity)) ? Number(line.quantity) : 1,
        unitPrice: Number.isFinite(Number(line.unitPrice)) ? Number(line.unitPrice) : 0,
        discount: Number.isFinite(Number(line.discount)) ? Number(line.discount) : 0,
        vatRate: Number.isFinite(Number(line.vatRate)) ? Number(line.vatRate) : 21,
        customVat: Boolean(line.customVat),
        unit: line.unit || "unidad",
      }))
    : [blankLine()];

  const settings = {
    ...fallback.settings,
    ...(input.settings || {}),
    showPhone: input.settings?.showPhone ?? fallback.settings.showPhone,
    showEmail: input.settings?.showEmail ?? fallback.settings.showEmail,
    showAddress: input.settings?.showAddress ?? fallback.settings.showAddress,
    color: input.settings?.color || fallback.settings.color,
    template: input.settings?.template || fallback.settings.template,
  };

  return {
    ...fallback,
    ...input,
    id: input.id || uid(),
    issuer: { ...fallback.issuer, ...(input.issuer || {}) },
    client: { ...fallback.client, ...(input.client || {}), isPrivate: Boolean(input.client?.isPrivate) },
    number: String(input.number || fallback.number),
    date: input.date || fallback.date,
    validUntil: input.validUntil || fallback.validUntil,
    status: input.status || "borrador",
    currency: "EUR",
    lines,
    paymentMethod: input.paymentMethod || fallback.paymentMethod,
    paymentOther: String(input.paymentOther || ""),
    conditions: String(input.conditions ?? fallback.conditions),
    notes: String(input.notes ?? ""),
    settings,
    createdAt: input.createdAt || fallback.createdAt,
    updatedAt: input.updatedAt || fallback.updatedAt,
  };
}

export default function Generator() {
  const [quote, setQuote] = useState<Quote>(() => newQuote());
  const [history, setHistory] = useState<Quote[]>([]);
  const [concepts, setConcepts] = useState<SavedConcept[]>([]);
  const [ready, setReady] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pdfBusy, setPdfBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [saveState, setSaveState] = useState<"saving" | "saved">("saved");
  const saveTimerRef = useRef<number | null>(null);
  const [historyQuery, setHistoryQuery] = useState("");
  const [conceptQuery, setConceptQuery] = useState("");
  const [previewScale, setPreviewScale] = useState(0.86);
  const [previewZoom, setPreviewZoom] = useState(0.86);
  const previewWrapRef = useRef<HTMLDivElement>(null);
  const formPanelRef = useRef<HTMLElement>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    datos: true,
    cliente: true,
    presupuesto: false,
    servicios: true,
    condiciones: false,
    diseño: true,
    historial: false,
  });

  useEffect(() => {
    const savedHistory = loadHistory().map((item) => normalizeQuote(item, []));
    const draft = loadDraft();
    const historyLogo = loadHistoryLogo();
    const hydratedHistory = historyLogo ? savedHistory.map((item) => item.logoDataUrl ? item : { ...item, logoDataUrl: historyLogo }) : savedHistory;
    setHistory(hydratedHistory);
    setConcepts(loadConcepts());
    setQuote(draft ? normalizeQuote(draft, hydratedHistory) : newQuote(hydratedHistory));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    setSaveState("saving");
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveDraft(quote);
    saveTimerRef.current = window.setTimeout(() => setSaveState("saved"), 450);
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [quote, ready]);

  const totals = useMemo(() => calculateTotals(quote), [quote]);
  const filteredHistory = useMemo(() => history.filter((item) => `${item.number} ${item.client.name} ${item.issuer.name}`.toLowerCase().includes(historyQuery.trim().toLowerCase())).slice(0, 30), [history, historyQuery]);
  const filteredConcepts = useMemo(() => concepts.filter((item) => item.description.toLowerCase().includes(conceptQuery.trim().toLowerCase())).slice(0, 10), [concepts, conceptQuery]);

  useEffect(() => {
    const updateScale = () => {
      const element = previewWrapRef.current;
      if (!element) return;
      const width = Math.max(280, element.clientWidth - 28);
      const height = Math.max(360, element.clientHeight - 24);
      const fitScale = Math.min(width / 794, height / 1123);
      const compact = window.innerWidth <= 920;
      const next = compact
        ? fitScale
        : Math.min(1.12, Math.max(0.62, previewZoom));
      setPreviewScale(Math.max(0.4, Math.min(1.12, next)));
    };
    const raf = window.requestAnimationFrame(updateScale);
    const observer = typeof ResizeObserver !== "undefined" && previewWrapRef.current ? new ResizeObserver(updateScale) : null;
    if (observer && previewWrapRef.current) observer.observe(previewWrapRef.current);
    window.addEventListener("resize", updateScale);
    return () => {
      window.cancelAnimationFrame(raf);
      observer?.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [previewZoom]);

  const update = (patch: Partial<Quote>) => setQuote((current) => ({ ...current, ...patch, updatedAt: new Date().toISOString() }));
  const updateIssuer = (patch: Partial<Quote["issuer"]>) => update({ issuer: { ...quote.issuer, ...patch } });
  const updateClient = (patch: Partial<Quote["client"]>) => update({ client: { ...quote.client, ...patch } });
  const updateSettings = (patch: Partial<Quote["settings"]>) => update({ settings: { ...quote.settings, ...patch } });
  const updateLine = (id: string, patch: Partial<QuoteLine>) => update({ lines: quote.lines.map((line) => line.id === id ? { ...line, ...patch } : line) });
  const addLine = () => update({ lines: [...quote.lines, blankLine()] });
  const duplicateLine = (line: QuoteLine) => update({ lines: [...quote.lines, { ...line, id: uid() }] });
  const removeLine = (id: string) => update({ lines: quote.lines.length > 1 ? quote.lines.filter((line) => line.id !== id) : [blankLine()] });
  const moveLine = (index: number, direction: -1 | 1) => {
    const next = [...quote.lines];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    update({ lines: next });
  };

  function validateAndSet(action: "guardar" | "descargar" | "imprimir") {
    const nextErrors = validateQuote(quote);
    setErrors(nextErrors);
    const hasErrors = Object.keys(nextErrors).length > 0;

    if (hasErrors) {
      const firstKey = Object.keys(nextErrors)[0];
      const firstField = document.querySelector<HTMLElement>(`[data-error-key="${CSS.escape(firstKey)}"]`);
      firstField?.focus();

      if (action === "guardar") {
        setMessage("Hay campos pendientes. Revisa los avisos antes de guardar en el historial.");
        return false;
      }

      setMessage(
        action === "descargar"
          ? "El PDF se generará aunque falten datos. Revisa los campos marcados cuando quieras completarlo."
          : "La impresión continuará aunque falten datos. Revisa los campos marcados cuando quieras completarlo."
      );
    }

    return true;
  }

  async function createPdf() {
    if (!validateAndSet("descargar")) return;
    setPdfBusy(true);
    try {
      saveDraft(quote);
      setHistory(saveToHistory(quote));
      const pdfBlob = await createQuotePdfBlob(quote);
      const url = URL.createObjectURL(pdfBlob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${quote.number || "presupuesto"}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage("PDF generado correctamente.");
    } catch {
      setMessage("No hemos podido generar el PDF. Inténtalo de nuevo.");
    } finally {
      setPdfBusy(false);
    }
  }

  function printQuote() {
    if (!validateAndSet("imprimir")) return;
    const hasWarnings = Object.keys(validateQuote(quote)).length > 0;
    saveDraft(quote);
    setHistory(saveToHistory(quote));
    window.print();
    if (hasWarnings) {
      window.setTimeout(() => setMessage("Impresión enviada. Hay campos sin completar en el documento; puedes volver y completarlos cuando quieras."), 500);
    }
  }

  function saveCurrent() {
    if (!validateAndSet("guardar")) return;
    saveDraft(quote);
    setHistory(saveToHistory(quote));
    setMessage("Presupuesto guardado en el historial local.");
  }

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveCurrent();
      }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  });

  function reset() {
    if (!window.confirm("¿Borrar el presupuesto actual y empezar uno nuevo? El historial no se borrará.")) return;
    setQuote(newQuote(history));
    setErrors({});
    setMessage("Nuevo presupuesto listo.");
  }

  function clearData() {
    if (!window.confirm("¿Borrar todos los datos locales, incluido el historial y los conceptos guardados? Esta acción no se puede deshacer.")) return;
    clearAllLocalData();
    setQuote(newQuote([]));
    setHistory([]);
    setConcepts([]);
    setErrors({});
    setMessage("Datos locales borrados.");
  }

  function loadHistoryQuote(item: Quote) {
    setQuote(normalizeQuote({ ...item, logoDataUrl: item.logoDataUrl || loadHistoryLogo(), updatedAt: new Date().toISOString() }, history));
    setErrors({});
    setMessage(`${item.number} cargado en el editor.`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function duplicateHistoryQuote(item: Quote) {
    const copy = normalizeQuote({ ...item, logoDataUrl: item.logoDataUrl || loadHistoryLogo(), id: uid(), number: nextNumber(history), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, history);
    setQuote(copy);
    setErrors({});
    setMessage(`Copia de ${item.number} creada.`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveLineConcept(line: QuoteLine) {
    if (!line.description.trim()) {
      setMessage("Escribe una descripción antes de guardar el concepto.");
      return;
    }
    setConcepts(saveConcept({ id: uid(), description: line.description.trim(), unit: line.unit, customUnit: line.customUnit, unitPrice: line.unitPrice, vatRate: line.vatRate, customVat: line.customVat }));
    setMessage("Concepto guardado para reutilizarlo más adelante.");
  }

  const toggleSection = (id: string) => {
    setOpenSections((current) => ({ ...current, [id]: !current[id] }));
  };

  const scrollToSection = (id: string) => {
    setOpenSections((current) => ({ ...current, [id]: true }));
    window.requestAnimationFrame(() => {
      const section = document.getElementById(id);
      if (!section) return;
      const headerOffset = window.innerWidth <= 680 ? 118 : 92;
      const top = section.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    });
  };

  return (
    <div className="generator-shell">
      <div className="generator-header">
        <div className="container generator-header-inner">
          <div className="generator-brand">
            <BrandMark withName={false} compact />
            <span className="muted">/ Crear presupuesto</span>
            <span className={`status-pill status-${quote.status}`}>{statusLabel(quote.status)}</span>
            <span className={`save-state ${saveState === "saving" ? "is-saving" : ""}`}><i /> {saveState === "saving" ? "Guardando…" : "Guardado automáticamente"}</span>
          </div>
          <div className="generator-actions">
            <button type="button" className="btn btn-secondary hide-mobile" onClick={() => scrollToSection("historial")}><History size={16}/> Historial</button>
            <button type="button" className="btn btn-secondary" onClick={reset}><RotateCcw size={16}/><span className="hide-mobile">Nuevo</span></button>
            <button type="button" className="btn btn-secondary hide-mobile" onClick={saveCurrent}><Save size={16}/> Guardar</button>
            <button type="button" className="btn btn-primary" onClick={createPdf} disabled={pdfBusy}><Download size={16}/>{pdfBusy ? "Generando…" : "Descargar PDF"}</button>
          </div>
        </div>
      </div>

      <main id="main" className="container">
        {message && <div className="notice" role="status"><span>{message}</span><button type="button" className="notice-close" onClick={() => setMessage("")} aria-label="Cerrar mensaje"><X size={15}/></button></div>}
        <div className="generator-layout">
          <section ref={formPanelRef} className="form-panel" aria-label="Formulario de presupuesto">
            <nav className="editor-steps" aria-label="Secciones del presupuesto">
              <button type="button" onClick={() => scrollToSection("datos")}>1&nbsp; Negocio</button>
              <button type="button" onClick={() => scrollToSection("cliente")}>2&nbsp; Cliente</button>
              <button type="button" onClick={() => scrollToSection("presupuesto")}>3&nbsp; Datos</button>
              <button type="button" onClick={() => scrollToSection("servicios")}>4&nbsp; Servicios</button>
              <button type="button" onClick={() => scrollToSection("condiciones")}>5&nbsp; Pago</button>
              <button type="button" onClick={() => scrollToSection("diseño")}>6&nbsp; Diseño</button>
            </nav>

            <FormSection id="datos" title="Mis datos" eyebrow="Tu negocio" open={!!openSections.datos} onToggle={() => toggleSection("datos")} complete={Boolean(quote.issuer.name.trim())}>
              <div className="section-intro">Estos datos aparecerán como emisor en el presupuesto.</div>
              <div className="grid-2">
                <Field label="Nombre / empresa" value={quote.issuer.name} onChange={(value) => updateIssuer({ name: value })} error={errors["issuer.name"]} errorKey="issuer.name" required placeholder="Tu nombre o empresa" />
                <Field label="NIF/CIF" value={quote.issuer.taxId} onChange={(value) => updateIssuer({ taxId: value })} error={errors["issuer.taxId"]} errorKey="issuer.taxId" placeholder="B12345678" />
              </div>
              <Field label="Dirección" value={quote.issuer.address} onChange={(value) => updateIssuer({ address: value })} placeholder="Calle, número, piso…" />
              <div className="grid-3"><Field label="Código postal" value={quote.issuer.postalCode} onChange={(value) => updateIssuer({ postalCode: value })} placeholder="35001"/><Field label="Ciudad" value={quote.issuer.city} onChange={(value) => updateIssuer({ city: value })} placeholder="Las Palmas"/><Field label="Provincia" value={quote.issuer.province || ""} onChange={(value) => updateIssuer({ province: value })} placeholder="Las Palmas"/></div>
              <div className="grid-2"><Field label="Email" type="email" value={quote.issuer.email} onChange={(value) => updateIssuer({ email: value })} error={errors["issuer.email"]} errorKey="issuer.email" placeholder="hola@empresa.com"/><Field label="Teléfono" value={quote.issuer.phone} onChange={(value) => updateIssuer({ phone: value })} placeholder="600 000 000"/></div>
              <LogoField quote={quote} update={update} setMessage={setMessage}/>
            </FormSection>

            <FormSection id="cliente" title="Cliente" eyebrow="A quién va dirigido" open={!!openSections.cliente} onToggle={() => toggleSection("cliente")} complete={Boolean(quote.client.name.trim())}>
              <label className="checkbox-row"><input type="checkbox" checked={quote.client.isPrivate} onChange={(event) => updateClient({ isPrivate: event.target.checked })}/><span>Cliente particular</span></label>
              <div className="grid-2">
                <Field label="Nombre / empresa" value={quote.client.name} onChange={(value) => updateClient({ name: value })} error={errors["client.name"]} errorKey="client.name" required placeholder="Nombre del cliente"/>
                {!quote.client.isPrivate && <Field label="NIF/CIF" value={quote.client.taxId} onChange={(value) => updateClient({ taxId: value })} error={errors["client.taxId"]} errorKey="client.taxId" placeholder="12345678A"/>}
              </div>
              <Field label="Dirección" value={quote.client.address} onChange={(value) => updateClient({ address: value })} placeholder="Dirección del cliente"/>
              <div className="grid-2"><Field label="Código postal" value={quote.client.postalCode} onChange={(value) => updateClient({ postalCode: value })}/><Field label="Ciudad" value={quote.client.city} onChange={(value) => updateClient({ city: value })}/></div>
              <div className="grid-2"><Field label="Email" type="email" value={quote.client.email} onChange={(value) => updateClient({ email: value })} error={errors["client.email"]} errorKey="client.email" placeholder="cliente@email.com"/><Field label="Teléfono" value={quote.client.phone} onChange={(value) => updateClient({ phone: value })}/></div>
            </FormSection>

            <FormSection id="presupuesto" title="Datos del presupuesto" eyebrow="Número y fechas" open={!!openSections.presupuesto} onToggle={() => toggleSection("presupuesto")}>
              <div className="grid-3"><Field label="Número" value={quote.number} onChange={(value) => update({ number: value })} error={errors.number} errorKey="number" required/><Field label="Fecha" type="date" value={quote.date} onChange={(value) => update({ date: value })} error={errors.date} errorKey="date"/><Field label="Válido hasta" type="date" value={quote.validUntil} onChange={(value) => update({ validUntil: value })} error={errors.validUntil} errorKey="validUntil"/></div>
              <div className="grid-2"><div className="field"><label>Estado</label><select value={quote.status} onChange={(event) => update({ status: event.target.value as Quote["status"] })}><option value="borrador">Borrador</option><option value="enviado">Enviado</option><option value="aceptado">Aceptado</option><option value="rechazado">Rechazado</option></select></div><div className="field"><label>Moneda</label><select value="EUR" disabled><option value="EUR">Euro (€)</option></select></div></div>
            </FormSection>

            <FormSection id="servicios" title="Servicios y productos" eyebrow={`${quote.lines.length} ${quote.lines.length === 1 ? "línea" : "líneas"}`} open={!!openSections.servicios} onToggle={() => toggleSection("servicios")}>
              {errors.lines && <div className="error-banner" role="alert">{errors.lines}</div>}
              <div className="concept-toolbar">
                <div className="concept-search"><Search size={15}/><input value={conceptQuery} onChange={(event) => setConceptQuery(event.target.value)} placeholder="Buscar conceptos guardados" aria-label="Buscar conceptos guardados"/></div>
                <button type="button" className="btn btn-secondary" onClick={addLine}><Plus size={16}/> Añadir línea</button>
              </div>
              {filteredConcepts.length > 0 && <div className="saved-concepts"><span className="saved-concepts-label">Mis conceptos</span>{filteredConcepts.map((concept) => <button key={concept.id} type="button" className="concept-chip" onClick={() => update({ lines: [...quote.lines, conceptToLine(concept)] })}><span>{concept.description}</span><strong>{euro(concept.unitPrice)}</strong></button>)}</div>}
              <div className="line-table">
                {quote.lines.map((line, index) => <LineEditor key={line.id} line={line} index={index} lineCount={quote.lines.length} errorMap={errors} updateLine={updateLine} duplicateLine={duplicateLine} removeLine={removeLine} moveLine={moveLine} onSaveConcept={() => saveLineConcept(line)} />)}
              </div>
              <div className="mobile-add-line"><button type="button" className="btn btn-secondary btn-full" onClick={addLine}><Plus size={16}/> Añadir otra línea</button></div>
              <div className="totals-card">
                <div className="total-row"><span>Subtotal</span><strong>{euro(totals.subtotal)}</strong></div>
                {totals.discount > 0 && <div className="total-row discount-row"><span>Descuentos</span><strong>-{euro(totals.discount)}</strong></div>}
                <div className="total-row"><span>Base imponible</span><strong>{euro(totals.taxableBase)}</strong></div>
                <div className="total-row"><span>IVA</span><strong>{euro(totals.vat)}</strong></div>
                <div className="total-row grand"><span>Total</span><span>{euro(totals.total)}</span></div>
              </div>
              <p className="helper">El IVA se calcula por línea. Es una herramienta de cálculo, no asesoramiento fiscal.</p>
            </FormSection>

            <FormSection id="condiciones" title="Condiciones y pago" eyebrow="Información final" open={!!openSections.condiciones} onToggle={() => toggleSection("condiciones")}>
              <div className="field"><label>Condiciones del presupuesto</label><textarea value={quote.conditions} onChange={(event) => update({ conditions: event.target.value })} placeholder="Plazos, validez, alcance…"/></div>
              <div className="grid-2"><div className="field"><label>Forma de pago</label><select value={quote.paymentMethod} onChange={(event) => update({ paymentMethod: event.target.value as Quote["paymentMethod"] })}><option value="transferencia">Transferencia</option><option value="efectivo">Efectivo</option><option value="tarjeta">Tarjeta</option><option value="otra">Otra</option></select></div>{quote.paymentMethod === "otra" && <Field label="Forma de pago personalizada" value={quote.paymentOther} onChange={(value) => update({ paymentOther: value })} error={errors.paymentOther} errorKey="paymentOther" placeholder="Ej. 50% al aceptar"/>}</div>
              <div className="field"><label>Notas adicionales</label><textarea value={quote.notes} onChange={(event) => update({ notes: event.target.value })} placeholder="Información adicional que quieras incluir."/></div>
            </FormSection>

            <FormSection id="diseño" title="Diseño y personalización" eyebrow="Cómo se verá" open={!!openSections.diseño} onToggle={() => toggleSection("diseño")}>
              <div className="theme-picker" aria-label="Elegir plantilla">
                {templateChoices.map(([value, title, desc]) => <button key={value} type="button" className={`theme-choice ${quote.settings.template === value ? "active" : ""}`} onClick={() => updateSettings({ template: value })} aria-pressed={quote.settings.template === value}><span className={`theme-mini theme-mini-${value}`}><i/><i/><b/></span><span><strong>{title}</strong><small>{desc}</small></span>{quote.settings.template === value && <CheckMark/>}</button>)}
              </div>
              <div className="customization-controls">
                <div className="field"><label>Color principal</label><div className="color-row"><input id="primary-color" type="color" value={quote.settings.color} onChange={(event) => updateSettings({ color: event.target.value })}/><div className="color-presets" aria-label="Colores sugeridos">{colorChoices.map((color) => <button key={color} type="button" aria-label={`Usar color ${color}`} className={`color-swatch ${quote.settings.color.toLowerCase() === color.toLowerCase() ? "active" : ""}`} style={{ background: color }} onClick={() => updateSettings({ color })}/>)}</div><span className="helper">{quote.settings.color}</span></div></div>
                <div className="visibility-box"><span className="visibility-title">Información visible</span><label className="checkbox-row"><input type="checkbox" checked={quote.settings.showPhone} onChange={(event) => updateSettings({ showPhone: event.target.checked })}/> Mostrar teléfono</label><label className="checkbox-row"><input type="checkbox" checked={quote.settings.showEmail} onChange={(event) => updateSettings({ showEmail: event.target.checked })}/> Mostrar email</label><label className="checkbox-row"><input type="checkbox" checked={quote.settings.showAddress} onChange={(event) => updateSettings({ showAddress: event.target.checked })}/> Mostrar dirección</label></div>
              </div>
              <div className="customization-tip"><Sparkles size={15}/><span>La vista previa se actualiza al instante y el mismo estilo se utiliza al imprimir o generar el PDF.</span></div>
            </FormSection>

            <FormSection title="Historial local" eyebrow={`${history.length} guardados`} id="historial" open={!!openSections.historial} onToggle={() => toggleSection("historial")}>
              <div className="history-toolbar"><div className="concept-search"><Search size={15}/><input value={historyQuery} onChange={(event) => setHistoryQuery(event.target.value)} placeholder="Buscar por número o cliente" aria-label="Buscar historial"/></div><span className="helper">Solo en este navegador</span></div>
              {history.length === 0 ? <div className="empty"><FilePlus2 size={20}/><strong>Tu historial aparecerá aquí</strong><span>Al guardar o descargar un presupuesto, quedará disponible en este dispositivo.</span></div> : filteredHistory.length === 0 ? <div className="empty">No hemos encontrado presupuestos con esa búsqueda.</div> : <div className="history">{filteredHistory.map((item) => <div className="history-item" key={item.id}><div className="history-main"><div className="history-title-row"><strong>{item.number}</strong><span className={`status-pill status-${item.status}`}>{statusLabel(item.status)}</span></div><div className="muted">{item.client.name || "Sin cliente"} · {euro(calculateTotals(item).total)} · {item.date}</div></div><div className="history-actions"><button type="button" className="btn btn-secondary" onClick={() => loadHistoryQuote(item)}><Eye size={14}/> Ver</button><button type="button" className="btn btn-secondary" onClick={() => duplicateHistoryQuote(item)}><Copy size={14}/> Duplicar</button><button type="button" className="icon-btn danger-icon" onClick={() => setHistory(deleteHistory(item.id))} title="Eliminar" aria-label={`Eliminar ${item.number}`}><Trash2 size={15}/></button></div></div>)}</div>}
              <button type="button" className="btn btn-danger" onClick={clearData} style={{ marginTop: 12 }}>Borrar todos los datos locales</button>
            </FormSection>
          </section>

          <aside className="preview-sticky" aria-label="Vista previa del presupuesto">
            <div className="preview-toolbar">
              <div><strong>Vista previa</strong><span className="preview-status"><i/> A4 · En tiempo real</span></div>
              <div className="preview-toolbar-controls preview-zoom-control" aria-label="Tamaño de vista previa">
                <button type="button" className="zoom-step" onClick={() => setPreviewZoom((value) => Math.max(0.62, Number((value - 0.05).toFixed(2))))} aria-label="Reducir tamaño de la vista previa">−</button>
                <input className="zoom-range" type="range" min="0.62" max="1.12" step="0.01" value={previewZoom} onChange={(event) => setPreviewZoom(Number(event.target.value))} aria-label="Tamaño de la vista previa" />
                <button type="button" className="zoom-step" onClick={() => setPreviewZoom((value) => Math.min(1.12, Number((value + 0.05).toFixed(2))))} aria-label="Aumentar tamaño de la vista previa">+</button>
                <span className="zoom-value">{Math.round(previewZoom * 100)}%</span>
              </div>
            </div>
            <div className="preview-wrap" ref={previewWrapRef}>
              <div className="preview-stage" style={{ width: 794 * previewScale, height: 1123 * previewScale }}>
                <div className="preview-scaled" style={{ transform: `scale(${previewScale})` }}><QuotePreview quote={quote}/></div>
              </div>
            </div>
            <div className="preview-actions"><button type="button" className="btn btn-primary" onClick={createPdf} disabled={pdfBusy}><Download size={16}/>{pdfBusy ? "Generando…" : "Descargar PDF"}</button><button type="button" className="btn btn-secondary" onClick={printQuote}><Printer size={16}/> Imprimir</button><button type="button" className="btn btn-secondary preview-save" onClick={saveCurrent}><Save size={16}/> Guardar</button></div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function conceptToLine(concept: SavedConcept): QuoteLine {
  return { id: uid(), description: concept.description, unit: concept.unit, customUnit: concept.customUnit, quantity: 1, unitPrice: concept.unitPrice, discount: 0, vatRate: concept.vatRate, customVat: concept.customVat };
}

function statusLabel(status: Quote["status"]) {
  return { borrador: "Borrador", enviado: "Enviado", aceptado: "Aceptado", rechazado: "Rechazado" }[status];
}

function LogoField({ quote, update, setMessage }: { quote: Quote; update: (patch: Partial<Quote>) => void; setMessage: (value: string) => void }) {
  async function handleLogo(file: File) {
    if (file.size > 1024 * 1024) {
      setMessage("El logo debe ocupar menos de 1 MB.");
      return;
    }
    if (file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = () => update({ logoDataUrl: String(reader.result) });
      reader.onerror = () => setMessage("No hemos podido leer el logo. Prueba con otra imagen.");
      reader.readAsDataURL(file);
      return;
    }
    try {
      const objectUrl = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        const maxSize = 1200;
        const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext("2d");
        if (!context) { URL.revokeObjectURL(objectUrl); setMessage("No hemos podido procesar el logo."); return; }
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const result = canvas.toDataURL("image/webp", .88);
        URL.revokeObjectURL(objectUrl);
        update({ logoDataUrl: result });
      };
      image.onerror = () => { URL.revokeObjectURL(objectUrl); setMessage("No hemos podido procesar el logo. Prueba con otra imagen."); };
      image.src = objectUrl;
    } catch {
      const reader = new FileReader();
      reader.onload = () => update({ logoDataUrl: String(reader.result) });
      reader.onerror = () => setMessage("No hemos podido leer el logo. Prueba con otra imagen.");
      reader.readAsDataURL(file);
    }
  }

  return <div className="field"><label>Logo</label><div className="logo-upload-v2">{quote.logoDataUrl ? <div className="logo-preview-wrap"><img className="logo-thumb" src={quote.logoDataUrl} alt="Vista previa del logo"/><button type="button" className="logo-remove" onClick={() => update({ logoDataUrl: undefined })} aria-label="Quitar logo"><X size={14}/></button></div> : <div className="logo-thumb logo-placeholder"><span>Logo</span></div>}<label className="file-drop"><span>{quote.logoDataUrl ? "Cambiar logo" : "Subir logo"}</span><small>PNG, JPG, WEBP o SVG · hasta 1 MB</small><input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleLogo(file); event.currentTarget.value = ""; }}/></label></div></div>;
}

function LineEditor({ line, index, lineCount, errorMap, updateLine, duplicateLine, removeLine, moveLine, onSaveConcept }: { line: QuoteLine; index: number; lineCount: number; errorMap: Record<string, string>; updateLine: (id: string, patch: Partial<QuoteLine>) => void; duplicateLine: (line: QuoteLine) => void; removeLine: (id: string) => void; moveLine: (index: number, direction: -1 | 1) => void; onSaveConcept: () => void }) {
  const total = lineBase(line) + lineVat(line);
  const isStandardVat = !line.customVat && standardVatRates.includes(line.vatRate);
  return <div className="line-card">
    <div className="line-card-heading"><span className="line-index">{index + 1}</span><strong>{line.description.trim() || `Servicio ${index + 1}`}</strong><span className="line-live-total">{euro(total)}</span></div>
    <div className="line-main-grid">
      <div className="field line-description"><label>Descripción</label><input value={line.description} onChange={(event) => updateLine(line.id, { description: event.target.value })} placeholder="Ej. Diseño de página web" data-error-key={`line.${index}.description`} aria-label={`Descripción de línea ${index + 1}`} />{errorMap[`line.${index}.description`] && <span className="error-text">{errorMap[`line.${index}.description`]}</span>}</div>
      <div className="field compact-field"><label>Cantidad</label><input type="number" min="0" step="0.01" inputMode="decimal" value={line.quantity} onChange={(event) => updateLine(line.id, { quantity: event.target.value === "" ? 0 : Number(event.target.value) })} data-error-key={`line.${index}.quantity`} aria-label={`Cantidad de línea ${index + 1}`}/>{errorMap[`line.${index}.quantity`] && <span className="error-text">{errorMap[`line.${index}.quantity`]}</span>}</div>
      <div className="field compact-field"><label>Unidad</label><select value={line.unit || "unidad"} onChange={(event) => updateLine(line.id, { unit: event.target.value as QuoteUnit })} aria-label={`Unidad de línea ${index + 1}`}>{Object.entries(unitLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      {line.unit === "otra" && <div className="field compact-field"><label>Unidad personalizada</label><input value={line.customUnit || ""} onChange={(event) => updateLine(line.id, { customUnit: event.target.value })} placeholder="Ud." data-error-key={`line.${index}.customUnit`}/>{errorMap[`line.${index}.customUnit`] && <span className="error-text">{errorMap[`line.${index}.customUnit`]}</span>}</div>}
      <div className="field compact-field"><label>Precio</label><input type="number" min="0" step="0.01" inputMode="decimal" value={line.unitPrice} onChange={(event) => updateLine(line.id, { unitPrice: event.target.value === "" ? 0 : Number(event.target.value) })} data-error-key={`line.${index}.unitPrice`} aria-label={`Precio de línea ${index + 1}`}/>{errorMap[`line.${index}.unitPrice`] && <span className="error-text">{errorMap[`line.${index}.unitPrice`]}</span>}</div>
      <div className="field compact-field"><label>Dto. %</label><input type="number" min="0" max="100" step="0.01" inputMode="decimal" value={line.discount} onChange={(event) => updateLine(line.id, { discount: event.target.value === "" ? 0 : Number(event.target.value) })} data-error-key={`line.${index}.discount`} aria-label={`Descuento de línea ${index + 1}`}/>{errorMap[`line.${index}.discount`] && <span className="error-text">{errorMap[`line.${index}.discount`]}</span>}</div>
      <div className="field compact-field"><label>IVA</label><select value={line.customVat ? "custom" : String(line.vatRate)} onChange={(event) => updateLine(line.id, event.target.value === "custom" ? { customVat: true, vatRate: line.customVat ? line.vatRate : 0 } : { customVat: false, vatRate: Number(event.target.value) })} aria-label={`IVA de línea ${index + 1}`}><option value="0">0%</option><option value="4">4%</option><option value="10">10%</option><option value="21">21%</option><option value="custom">Personalizado</option></select>{line.customVat && <input className="vat-custom-input" type="number" min="0" max="100" step="0.01" value={line.vatRate} onChange={(event) => updateLine(line.id, { customVat: true, vatRate: event.target.value === "" ? 0 : Number(event.target.value) })} placeholder="%" aria-label={`IVA personalizado de línea ${index + 1}`} data-error-key={`line.${index}.vatRate`}/>} {errorMap[`line.${index}.vatRate`] && <span className="error-text">{errorMap[`line.${index}.vatRate`]}</span>}</div>
      <div className="line-total-cell"><span>Total línea</span><strong>{euro(total)}</strong></div>
    </div>
    <div className="line-row-actions"><button type="button" className="inline-action" onClick={onSaveConcept}><BookmarkPlus size={14}/> Guardar concepto</button><div className="inline-actions-right"><button type="button" className="icon-btn" title="Subir línea" aria-label="Subir línea" onClick={() => moveLine(index, -1)} disabled={index === 0}><ArrowUp size={14}/></button><button type="button" className="icon-btn" title="Bajar línea" aria-label="Bajar línea" onClick={() => moveLine(index, 1)}>{/* actual disabled state is updated by parent ordering */}<ArrowDown size={14}/></button><button type="button" className="icon-btn" title="Duplicar línea" aria-label="Duplicar línea" onClick={() => duplicateLine(line)}><Copy size={14}/></button><button type="button" className="icon-btn danger-icon" title="Eliminar línea" aria-label={`Eliminar línea ${index + 1}`} onClick={() => removeLine(line.id)}><Trash2 size={14}/></button></div></div>
  </div>;
}

function FormSection({ title, eyebrow, children, id, complete, open, onToggle }: { title: string; eyebrow?: string; children: React.ReactNode; id: string; complete?: boolean; open: boolean; onToggle: () => void }) {
  const bodyId = `${id}-body`;
  return (
    <section className={`form-card${open ? " is-open" : ""}`} id={id}>
      <button
        type="button"
        className="form-card-toggle"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={onToggle}
      >
        <span className="form-card-title">
          <strong>{title}</strong>
          {eyebrow && <small>{eyebrow}</small>}
        </span>
        <span className="section-summary-actions">
          {complete && <span className="section-complete"><Check size={12}/> Listo</span>}
          <span className="section-chevron" aria-hidden="true"><ArrowDown size={16}/></span>
        </span>
      </button>
      <div
        id={bodyId}
        className={`form-body${open ? " form-body-open" : " form-body-closed"}`}
        aria-hidden={!open}
      >
        {children}
      </div>
    </section>
  );
}

function Field({ label, value, onChange, type = "text", error, errorKey, required, placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; error?: string; errorKey?: string; required?: boolean; placeholder?: string }) {
  return <div className="field"><label>{label}{required ? " *" : ""}</label><input type={type} value={value} required={required} aria-invalid={!!error} placeholder={placeholder} data-error-key={errorKey} onChange={(event) => onChange(event.target.value)}/>{error && <span className="error-text" role="alert">{error}</span>}</div>;
}

function CheckMark() { return <span className="theme-check" aria-hidden="true"><Check size={12}/></span>; }
